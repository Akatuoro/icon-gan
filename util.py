from importlib import reload
from IPython.display import clear_output
from os import walk
from PIL import Image
import random
import numpy as np
import tensorflow as tf
from tensorflow.keras.layers import Input, Flatten, Dense, Dropout, Reshape
from tensorflow.keras.datasets import mnist

import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec


# mode: 1 - grayscale
#       2 - grayscale with alpha
#       3 - rgb
#       4 - rgb with alpha
def load_data(path, mode):
    f = []
    for (dirpath, dirnames, filenames) in walk(path):
        f.extend(filenames)
        break
    
    imgs = []
    couldnt_load = []
    for file in f:
        try:
            img = Image.open(path + file)
            if mode < 3:
                img = img.convert('LA')
            if mode == 3:
                img = img.convert('RGB')
            if mode == 4:
                img = img.convert('RGBA')
            
            if mode == 1:
                img = img.convert('L')  # RBGA needs conversion to LA before conversion to L
                img = np.array(img)     # grayscale image ends up with shape (w,h) instead of (w,h,c)
                img = img.reshape(img.shape + (1,))  # so an extra dim needs to be added
                imgs.append(img)
            else:
                imgs.append(np.array(img))
            
        except Exception:
            couldnt_load.append(file)
    
    return imgs


def interpolation(gan, r, c, steps):
    r_vector = np.random.normal(0,1,(r * int(c/2), 100))
    m_vector = np.random.normal(0,1,(r * int(c/2), 100))
    interpol_vector = [r_vector + t/(1 * steps) * m_vector for t in range(0, int(steps)) ]

    gen_imgs1 = [gan.g1.predict(v) for v in interpol_vector]
    gen_imgs2 = [gan.g2.predict(v) for v in interpol_vector]
    gen_imgs = [np.concatenate([gen_imgs1[i], gen_imgs2[i]]) for i in range(0, int(steps))]
    return gen_imgs

def animation(imgs, r, c, steps):
    import matplotlib.animation
    
    fig, axs = plt.subplots(r, c)
    gs1 = gridspec.GridSpec(r, c)
    gs1.update(wspace=0.025, hspace=0.05) # set the spacing between axes. 
    
    cnt = 0
    for i in range(r):
        for j in range(c):
            axs[i,j].axis('off')
            cnt += 1

    def animate(t):
        cnt = 0
        for i in range(r):
            for j in range(c):
                axs[i,j].imshow(imgs[t][cnt, :,:,0], cmap='gray')
                cnt += 1

    ani = matplotlib.animation.FuncAnimation(fig, animate, frames=steps)
    return ani

def random_samples(imgs, mode):
    for i in range(1,25):
        plt.subplot(4, 6, i)
        plt.axis('off')
        j = np.random.randint(0, len(imgs)-1)
        try:
            img = imgs[j]
            if mode == 1:
                plt.imshow(img[:,:,0], cmap='gray') # if grayscale, the shape has to be (w,h)
            else:
                plt.imshow(Image.fromarray(img))
        except Exception:
            print('Failed to display img ' + str(j))
