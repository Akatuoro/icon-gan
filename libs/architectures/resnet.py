from keras.layers import Input, Dense, Reshape, Flatten, Dropout, Add, Lambda
from keras.layers import BatchNormalization, Activation, ZeroPadding2D, GlobalAveragePooling2D, AveragePooling2D
from keras.layers.advanced_activations import LeakyReLU
from keras.layers.convolutional import UpSampling2D, Conv2D
from keras.models import Sequential, Model

import numpy as np

from libs.blocks import ResidualBlock, OptimizedResBlockDisc1

def generator(latent_dim, img_shape):

    noise = Input(shape=(latent_dim,))

    x = Dense(128 * 4 * 4)(noise)
    x = Reshape((4, 4, 128))(x)
    x = ResidualBlock(128, 3, 'up')(x)
    x = ResidualBlock(128, 3, 'up')(x)
    x = ResidualBlock(128, 3, 'up')(x)
    x = BatchNormalization()(x)
    x = Activation("relu")(x)
    x = Conv2D(img_shape[2], kernel_size=3, padding="same")(x)
    img = Activation("tanh")(x)


    model = Model(noise, img)
    model.summary()

    return model


def discriminator(img_shape):
    img = Input(shape=img_shape)
    
    x = Reshape(img_shape)(img)
    x = OptimizedResBlockDisc1(128)(x)
    x = ResidualBlock(128, 3, resample='down')(x)
    x = ResidualBlock(128, 3, resample=None)(x)
    x = ResidualBlock(128, 3, resample=None)(x)
    x = Activation("relu")(x)
    x = GlobalAveragePooling2D()(x)
    validity = Dense(1)(x)

    model = Model(img, validity)
    model.summary()
    
    return model
	