Command for jupyter docker container with gpu support and connected drive:
'''
docker run --runtime=nvidia -v ~/aml:/notebooks/own -it -p 8888:8888 tensorflow/tensorflow:latest-gpu-py3
'''
