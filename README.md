
# &nbsp; ![icon](/generated_icon.png) &nbsp; Icon Generator



### How to use:

Open `IconGenerator.ipynb` with Jupyter Notebook.

Tensorflow and Keras should be installed, as well as a range of standard libraries like numpy. The tensorflow docker container already contains all the necessary libraries.

#### Training Dataset

The easiest way to get a dataset for training is to download the LLD dataset: https://data.vision.ee.ethz.ch/sagea/lld/

Alternatively, icons can be downloaded seperately and loaded from a folder, the process is described in the iPython notebook.


#### Pre-Trained Weights




### Commands for the Tensorflow Docker Container 

Command for jupyter docker container with gpu support and connected drive. The below command assumes, that the `icon-gan` repository is placed in the users home directory, but could be altered by replacing `~/icon-gan` with `<dir>/icon-gan`.
'''
docker run -v ~/icon-gan:/notebooks/icon-gan -it -p 8888:8888 tensorflow/tensorflow:latest-py3
'''

With Nvidia GPU enabled, recommended for training.
'''
docker run --runtime=nvidia -v ~/icon-gan:/notebooks/icon-gan -it -p 8888:8888 tensorflow/tensorflow:latest-gpu-py3
'''
