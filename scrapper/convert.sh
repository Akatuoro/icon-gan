#!/bin/bash

echo "" > convertlist.txt
# list files to convert. this is because the index of the icon needs to be named and also some files are corrupt.
for filename in favicons2/*.ico; do
	identify -format '%f[%p]\n' $filename >> convertlist.txt
done



while read i; do
	convert "favicons2/$i" -thumbnail 32x32 -alpha on -background none -flatten -set filename:f 'faviconpngs2/%t.png' '%[filename:f]'
#echo "$i"
done <convertlist.txt


