# Blocks intended to work with the Keras functional API

from tensorflow.keras.layers import Input, Dense, Reshape, Flatten, Dropout, Add, Lambda
from tensorflow.keras.layers import BatchNormalization, Activation, ZeroPadding2D, GlobalAveragePooling2D, AveragePooling2D
from tensorflow.keras.layers import UpSampling2D, Conv2D

def ResidualBlock(output_dim, kernel_size, resample=None):
    
    conv = lambda x: Conv2D(output_dim, kernel_size=kernel_size, padding='same')(x)
    conv_same = lambda x: Conv2D(output_dim, kernel_size=1, padding='same')(x)
    up = lambda x: UpSampling2D()(x)
    down = lambda x: AveragePooling2D()(x)
    
    if resample=='down':
        conv_shortcut = lambda x: down(conv_same(x))
        conv_1        = conv
        conv_2        = lambda x: down(conv(x))
    elif resample=='up':
        conv_shortcut = lambda x: up(conv_same(x))
        conv_1        = lambda x: up(conv(x))
        conv_2        = conv
    elif resample==None:
        conv_shortcut = lambda x: x # Identity skip-connection
        conv_1        = conv
        conv_2        = conv
    else:
        raise Exception('invalid resample value')

    def build(x):
        shortcut = conv_shortcut(x)
        
        o = BatchNormalization()(x)
        o = Activation("relu")(x)
        o = conv_1(o)
        o = BatchNormalization()(o)
        o = Activation("relu")(o)
        output = conv_2(o)
        
        return Add()([shortcut, output])
    
    return build

def OptimizedResBlockDisc1(output_dim, kernel_size=3):
    conv_shortcut = lambda x: Conv2D(output_dim, kernel_size=1, padding="same")(AveragePooling2D()(x))
    conv_1 = lambda x: Conv2D(output_dim, kernel_size=kernel_size, padding="same")(x)
    conv_2 = lambda x: AveragePooling2D()(Conv2D(output_dim, kernel_size=kernel_size, padding="same")(x))
    
    def build(x):
        shortcut = conv_shortcut(x)
        
        o = conv_1(x)
        o = Activation("relu")(o)
        output = conv_2(o)
        
        return Add()([shortcut, output])
    
    return build
