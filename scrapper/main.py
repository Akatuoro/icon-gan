import csv
import re
from urllib.parse import urljoin, urlparse
import scrapy
from scrapy.crawler import CrawlerProcess



linkTagRe = re.compile(r'<link ([^>]+)>')

propRe = re.compile(r'(?P<prop>\w+)=(?P<quote>[""\'])(?P<value>([^""\']*))(?P=quote)')


class FavLink:
    def __init__(self):
        self.is_icon = False
        self.rel = None
        self.href = None
        self.sizes = None

    def __str__(self):
        return '<link rel="{}" href="{}" sizes="{}">'.format(self.rel, self.href, self.sizes)

    @classmethod
    def parse(cls, tag):
        favLink = cls()

        for match in propRe.finditer(tag):
            prop = match.group('prop')
            value = match.group('value')

            if prop == 'rel':
                favLink.rel = value
                if value == 'icon' or value == 'mask-icon' or 'icon' in value.split(' '):
                    favLink.is_icon = True

            if prop == 'href':
                favLink.href = value
            
            if prop == 'sizes':
                favLink.sizes = value
        
        return favLink


class IconItem(scrapy.Item):
    file_urls = scrapy.Field()
    files = scrapy.Field()

class IconSpider(scrapy.Spider):
    name="icon-gan"
    #download_delay=5.0

    def start_requests(self):

        with open("top-1m.csv", "r") as csv_file:
            reader = csv.reader(csv_file)
            for i, domain in reader:
                # if int(i) > 200:
                #     break

                yield scrapy.Request("https://{}".format(domain), self.parse)


    def parse(self, response):
        url = response.url

        item = IconItem()
        item['file_urls'] = [urljoin(url, 'favicon.ico')]

        for tag in response.xpath('//link[contains(@rel, "icon")]').getall():
            match = linkTagRe.match(tag)

            if match is None:
                continue

            linkTag = FavLink.parse(match.group(1))

            if linkTag.is_icon:
                item['file_urls'].append(urljoin(url, linkTag.href))

        return item

if __name__ == "__main__":
    process = CrawlerProcess(settings={
        'ROBOTSTXT_OBEY': True,
        'USER_AGENT': 'Icon GAN',
        'ROBOTSTXT_USER_AGENT': 'Icon GAN',
        'ITEM_PIPELINES': {
            'files.ExtendedFilePipeline': 1
        },
        'FILES_STORE': 'scraped',
        'MEDIA_ALLOW_REDIRECTS': True,
        'AUTOTHROTTLE_ENABLED': True,

        'LOG_LEVEL': 'CRITICAL',

        # speedup
        'CONCURRENT_REQUESTS': 256,
        'DOWNLOAD_DELAY': 0,
        'DOWNLOAD_TIMEOUT': 15,
        'RANDOMIZE_DOWNLOAD_DELAY': True,
        'RETRY_ENABLED': False,

        #'HTTPCACHE_ENABLED': True
        })
    process.crawl(IconSpider)
    process.start()
