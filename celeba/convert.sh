#!/bin/bash

for filename in img_align_celeba/*.jpg; do
	convert $filename -set filename:f 'resized/%t.png' -crop 178x178+0+20 -resize 32x32 '%[filename:f]'
done
