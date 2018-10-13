Command for jupyter docker container with gpu support and connected drive:
'''
docker run --runtime=nvidia -v ~/aml:/notebooks/own -it -p 8888:8888 tensorflow/tensorflow:latest-gpu-py3
'''

CelebA
Ziwei Liu, Ping Luo, Xiaogang Wang, and Xiaoou Tang. Deep learning face attributes in the wild. In
ICCV, 2015.
RGB-D
Kevin Lai, Liefeng Bo, Xiaofeng Ren, and Dieter Fox. A large-scale hierarchical multi-view rgb-d object
dataset. In ICRA, 2011.
NYU (Indoor Scenes)
Nathan Silberman, Derek Hoiem, Pushmeet Kohli, and Rob Fergus. Indoor segmentation and support
inference from rgbd images. In ECCV, 2012.
