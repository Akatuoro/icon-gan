from importlib import reload
from IPython.display import clear_output
from os import walk
from PIL import Image
import h5py
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
def load_data(path, desired_shape=(32, 32, 3)):
    if path.find('.hdf5', -5) > -1:
        with h5py.File(path, 'r') as f:
            data = f[list(f.keys())[0]][()]

        s = data.shape
        return data.transpose((0,2,3,1)), (s[2], s[3], s[1])

    f = []
    for (dirpath, dirnames, filenames) in walk(path):
        f.extend(filenames)
        break
    
    imgs = []
    couldnt_load = []

    mode = desired_shape[2]
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
    
    print('num images before: ' + str(len(imgs)))
    imgs = [img for img in imgs if img.shape == desired_shape]
    print('num images after: ' + str(len(imgs)))

    return np.asarray(imgs), desired_shape


def interpolation(gan, n, steps):
    if hasattr(gan, 'g1') and hasattr(gan, 'g2'):
        n = n/2

    r_vector = np.random.normal(0,1,(n, 100))
    m_vector = np.random.normal(0,1,(n, 100))
    interpol_vector = [r_vector + t/(1 * steps) * m_vector for t in range(0, int(steps)) ]

    if hasattr(gan, 'g1') and hasattr(gan, 'g2'):
        gen_imgs1 = [gan.g1.predict(v) for v in interpol_vector]
        gen_imgs2 = [gan.g2.predict(v) for v in interpol_vector]
        gen_imgs = [np.concatenate([gen_imgs1[i], gen_imgs2[i]]) for i in range(0, int(steps))]
    else:
        gen_imgs = [gan.generator.predict(v) for v in interpol_vector]

    gen_imgs = [0.5 * imgs + 0.5 for imgs in gen_imgs]
    return gen_imgs


def animation(imgs, mode, r, c, steps, interval=50):
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
                if mode < 3:
                    axs[i,j].imshow(imgs[t][cnt, :,:,0], cmap='gray')
                else:
                    axs[i,j].imshow(imgs[t][cnt])
                cnt += 1

    ani = matplotlib.animation.FuncAnimation(fig, animate, frames=steps, interval=interval)
    return ani

def random_samples(imgs, mode, r=4, c=6):
    if isinstance(imgs, list):
        j = np.random.randint(0, len(imgs)-1, size=r*c+1)
        plot([imgs[k] for k in j], mode, r, c)
    elif isinstance(imgs, np.ndarray):
        j = np.random.randint(0, imgs.shape[0]-1, size=r*c+1)
        plot(imgs[j], mode, r, c)

def plot(imgs, mode, r=4, c=6):
    for i in range(1,r*c+1):
        plt.subplot(r, c, i)
        plt.axis('off')
        try:
            img = imgs[i]
            if mode == 1:
                plt.imshow(img[:,:,0], cmap='gray') # if grayscale, the shape has to be (w,h)
            else:
                plt.imshow(img)
        except Exception:
            print('Failed to display img ' + str(i))

