# Large amount of credit goes to:
# https://github.com/eriklindernoren/Keras-GAN/blob/master/wgan_gp/wgan_gp.py
# which I've used as a reference for this implementation
# 
# Hyperparameters are modeled after:
# https://github.com/alex-sage/logo-gen/blob/master/wgan/logo_wgan.py

from __future__ import print_function, division

from tensorflow.keras.datasets import mnist
from tensorflow.keras.layers import Input, Dense, Reshape, Flatten, Dropout, Add, Lambda
from tensorflow.keras.layers import BatchNormalization, Activation, ZeroPadding2D, GlobalAveragePooling2D, AveragePooling2D
from tensorflow.keras.layers import LeakyReLU
from tensorflow.keras.layers import UpSampling2D, Conv2D
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.optimizers import RMSprop, Adam
from functools import partial

from libs.blocks import ResidualBlock, OptimizedResBlockDisc1
from libs.architectures import build_generator, build_discriminator
from gan import GAN

import tensorflow.keras.backend as K

import matplotlib.pyplot as plt

import sys

import numpy as np


def randomWeightedAverage(inputs):
    """Provides a (random) weighted average between real and generated image samples"""
    alpha = K.random_uniform((32, 1, 1, 1))
    return (alpha * inputs[0]) + ((1 - alpha) * inputs[1])

class WGANGP(GAN):
    def __init__(self, *args, **kwargs):
        GAN.__init__(self, *args, **kwargs)

    def compile(self):
        # Following parameter and optimizer set as recommended in paper
        self.n_critic = 5
        optimizer = Adam(lr=2e-4, beta_1=0., beta_2=0.9, decay=1/100000)

        # Build the generator and critic
        self.generator = build_generator(self.architecture, self.latent_dim, self.img_shape)
        self.critic = build_discriminator(self.architecture, self.img_shape)

        #-------------------------------
        # Construct Computational Graph
        #       for the Critic
        #-------------------------------

        # Freeze generator's layers while training critic
        self.generator.trainable = False

        # Image input (real sample)
        real_img = Input(shape=self.img_shape)

        # Noise input
        z_disc = Input(shape=(self.latent_dim,))
        # Generate image based of noise (fake sample)
        fake_img = self.generator(z_disc)

        # Discriminator determines validity of the real and fake images
        fake = self.critic(fake_img)
        valid = self.critic(real_img)

        # Construct weighted average between real and fake images
        interpolated_img = Lambda(randomWeightedAverage, output_shape=lambda x: x[0])([real_img, fake_img])
        # Determine validity of weighted sample
        validity_interpolated = self.critic(interpolated_img)

        # Use Python partial to provide loss function with additional
        # 'averaged_samples' argument
        partial_gp_loss = partial(self.gradient_penalty_loss,
                          averaged_samples=interpolated_img)
        partial_gp_loss.__name__ = 'gradient_penalty' # Keras requires function names

        self.critic_model = Model(inputs=[real_img, z_disc],
                            outputs=[valid, fake, validity_interpolated])
        self.critic_model.compile(loss=[self.wasserstein_loss,
                                              self.wasserstein_loss,
                                              partial_gp_loss],
                                        optimizer=optimizer,
                                        loss_weights=[1, 1, 10])
        #-------------------------------
        # Construct Computational Graph
        #         for Generator
        #-------------------------------

        # For the generator we freeze the critic's layers
        self.critic.trainable = False
        self.generator.trainable = True

        # Sampled noise for input to generator
        z_gen = Input(shape=(100,))
        # Generate images based of noise
        img = self.generator(z_gen)
        # Discriminator determines validity
        valid = self.critic(img)
        # Defines generator model
        self.generator_model = Model(z_gen, valid)
        self.generator_model.compile(loss=self.wasserstein_loss, optimizer=optimizer)


    def gradient_penalty_loss(self, y_true, y_pred, averaged_samples):
        """
        Computes gradient penalty based on prediction and weighted real / fake samples
        """
        gradients = K.gradients(y_pred, [averaged_samples])[0]
        # compute the euclidean norm by squaring ...
        gradients_sqr = K.square(gradients)
        #   ... summing over the rows ...
        gradients_sqr_sum = K.sum(gradients_sqr,
                                  axis=np.arange(1, len(gradients_sqr.shape)))
        #   ... and sqrt
        gradient_l2_norm = K.sqrt(gradients_sqr_sum)
        # compute lambda * (1 - ||grad||)^2 still for each single sample
        gradient_penalty = K.square(1 - gradient_l2_norm)
        # return the mean as loss over all the batch samples
        return K.mean(gradient_penalty)


    def wasserstein_loss(self, y_true, y_pred):
        return K.mean(y_true * y_pred)


    def train(self, X_train, epochs, batch_size, sample_interval=50):

        # Rescale -1 to 1
        X_train = (X_train.astype(np.float32) - 127.5) / 127.5
        #X_train = np.expand_dims(X_train, axis=3)

        # Adversarial ground truths
        valid = -np.ones((batch_size, 1))
        fake =  np.ones((batch_size, 1))
        dummy = np.zeros((batch_size, 1)) # Dummy gt for gradient penalty

        d_losses = []
        d_acc = []
        g_losses = []
        
        for epoch in range(epochs):

            for _ in range(self.n_critic):

                # ---------------------
                #  Train Discriminator
                # ---------------------

                # Select a random batch of images
                idx = np.random.randint(0, X_train.shape[0], batch_size)
                imgs = X_train[idx]
                # Sample generator input
                noise = np.random.normal(0, 1, (batch_size, self.latent_dim))
                # Train the critic
                d_loss = self.critic_model.train_on_batch([imgs, noise],
                                                                [valid, fake, dummy])

            # ---------------------
            #  Train Generator
            # ---------------------

            g_loss = self.generator_model.train_on_batch(noise, valid)

            # Plot the progress
            print ("%d [D loss: %f] [G loss: %f]" % (epoch, d_loss[0], g_loss))
            d_losses.append(d_loss[0])
            d_acc.append(100*d_loss[1])
            g_losses.append(g_loss)

            # If at save interval => save generated image samples
            if epoch % sample_interval == 0:
                self.sample_images(epoch)
        
        return d_losses, d_acc, g_losses

    def load_weights(self, g_weights, d_weights):
        self.generator_model.load_weights(g_weights)
        self.critic_model.load_weights(d_weights)

    def save_weights(self, g_weights, d_weights):
        self.generator_model.save_weights(g_weights)
        self.critic_model.save_weights(d_weights)


if __name__ == '__main__':
    wgan = WGANGP()
    (X_train,_), (_,_) = mnist.load_data()
    wgan.train(X_train=X_train, epochs=30000, batch_size=32, sample_interval=100)
