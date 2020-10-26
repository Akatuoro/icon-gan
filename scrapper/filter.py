import os
import json
import re
import imagehash
from io import BytesIO
from PIL import Image
import cairosvg
from tqdm import tqdm

target_size = 32

file_name = re.compile(r"^.*/(\w+)$")

known_hashes = set()

def save(image, path, downscale = False):
    if downscale:
        image = image.resize((target_size, target_size))

    img_hash = imagehash.average_hash(image)
    if img_hash in known_hashes:
        return

    known_hashes.add(img_hash)
    image.save(os.path.join("scraped/filtered/", path + '.png'))


if __name__ == "__main__":
    i = 0
    for i, line in tqdm(enumerate(open("scraped/info.jsonl").readlines())):
        if line == '':
            continue
        entries = json.loads(line)

        biggest_image = None
        biggest_size = None

        for entry in entries:
            path = entry['path']

            if path.endswith('.svg'):
                try:
                    bytestring = cairosvg.svg2png(url=os.path.join("scraped", path), parent_width=target_size, parent_height=target_size)
                    image = Image.open(BytesIO(bytestring)).convert('RGBA')
                except:
                    continue

            else:
                try:
                    image = Image.open(os.path.join("scraped", path)).convert('RGBA')
                except:
                    continue

            width, height = image.size

            if width != height or width < target_size:
                continue


            if width == target_size:
                biggest_image = None

                save(image, str(i))
                break

            if biggest_size is None or width > biggest_size:
                biggest_size = width
                biggest_image = image
        
        if biggest_image is not None:
            save(biggest_image, str(i), downscale=True)

        # i += 1
        # if i > 100:
        #     break

    # for (dirpath, dirnames, filenames) in os.walk("scraped/full"):
    #     for filename in filenames:
    #         if i > 10:
    #             break

    #         i += 1
    #         print(filename)
    #         image = Image.open(os.path.join(dirpath, filename))
    #         width, height = image.size
    #         print(width, height)
    #     break

    # print(i)
