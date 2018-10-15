# Large amount of credit goes to:
# https://github.com/eriklindernoren/Keras-GAN/blob/master/gan/gan.py
# which I've used as a reference for this implementation

from __future__ import print_function, division

from keras.datasets import mnist
from keras.layers import Input, Dense, Reshape, Flatten, Dropout
from keras.layers import BatchNormalization, Activation, ZeroPadding2D
from keras.layers.advanced_activations import LeakyReLU
from keras.layers.convolutional import UpSampling2D, Conv2D
from keras.models import Sequential, Model
from keras.optimizers import Adam
from libs.architectures import build_generator, build_discriminator

from PIL import Image
import matplotlib.pyplot as plt

import sys

import numpy as np

class GAN():
    def __init__(self, shape, architecture='dense', save_path='images/'):
        self.img_rows = shape[0]
        self.img_cols = shape[1]
        self.channels = shape[2]
        self.img_shape = (self.img_rows, self.img_cols, self.channels)
        self.latent_dim = 100

        self.save_path = save_path

        self.architecture = architecture
        self.compile()

    def compile(self):
        optimizer = Adam(0.0002, 0.5)

        # Build and compile the discriminator
        self.discriminator = build_discriminator(self.architecture, self.img_shape)
        self.discriminator.compile(loss='binary_crossentropy',
            optimizer=optimizer,
            metrics=['accuracy'])

        # Build the generator
        self.generator = build_generator(self.architecture, self.latent_dim, self.img_shape)

        # The generator takes noise as input and generates imgs
        z = Input(shape=(self.latent_dim,))
        img = self.generator(z)

        # For the combined model we will only train the generator
        self.discriminator.trainable = False

        # The discriminator takes generated images as input and determines validity
        validity = self.discriminator(img)

        # The combined model  (stacked generator and discriminator)
        # Trains the generator to fool the discriminator
        self.combined = Model(z, validity)
        self.combined.compile(loss='binary_crossentropy', optimizer=optimizer)

    def train(self, X_train, epochs, batch_size=128, sample_interval=50):

        # Rescale -1 to 1
        X_train = X_train / 127.5 - 1.
        #X_train = np.expand_dims(X_train, axis=3)

        # Adversarial ground truths
        valid = np.ones((batch_size, 1))
        fake = np.zeros((batch_size, 1))

        d_losses = []
        d_acc = []
        g_losses = []

        for epoch in range(epochs):

            # ---------------------
            #  Train Discriminator
            # ---------------------

            # Select a random batch of images
            idx = np.random.randint(0, X_train.shape[0], batch_size)
            imgs = X_train[idx]

            noise = np.random.normal(0, 1, (batch_size, self.latent_dim))

            # Generate a batch of new images
            gen_imgs = self.generator.predict(noise)

            # Train the discriminator
            d_loss_real = self.discriminator.train_on_batch(imgs, valid)
            d_loss_fake = self.discriminator.train_on_batch(gen_imgs, fake)
            d_loss = 0.5 * np.add(d_loss_real, d_loss_fake)

            # ---------------------
            #  Train Generator
            # ---------------------

            noise = np.random.normal(0, 1, (batch_size, self.latent_dim))

            # Train the generator (to have the discriminator label samples as valid)
            g_loss = self.combined.train_on_batch(noise, valid)

            # Plot the progress
            print ("%d [D loss: %f, acc.: %.2f%%] [G loss: %f]" % (epoch, d_loss[0], 100*d_loss[1], g_loss))
            d_losses.append(d_loss[0])
            d_acc.append(100*d_loss[1])
            g_losses.append(g_loss)

            # If at save interval => save generated image samples
            if epoch % sample_interval == 0:
                self.sample_images(epoch)

        return d_losses, d_acc, g_losses

    def sample_images(self, epoch):
        r, c = 5, 5
        noise = np.random.normal(0, 1, (r * c, self.latent_dim))
        gen_imgs = self.generator.predict(noise)

        # Rescale images 0 - 1
        gen_imgs = 0.5 * gen_imgs + 0.5

        fig, axs = plt.subplots(r, c)
        cnt = 0
        for i in range(r):
            for j in range(c):
                if gen_imgs.shape[3] < 3:
                    axs[i,j].imshow(gen_imgs[cnt, :,:,0], cmap='gray')      # grayscale
                else:
                    axs[i,j].imshow(gen_imgs[cnt])   # color with or without alpha
                axs[i,j].axis('off')
                cnt += 1
        fig.savefig(self.save_path + "%d.png" % epoch)
        plt.close()


if __name__ == '__main__':
    (X_train,_), (_,_) = mnist.load_data()
    gan = GAN(shape=X_train[0].shape)
    gan.train(X_train=X_train, epochs=30000, batch_size=32, sample_interval=200)

