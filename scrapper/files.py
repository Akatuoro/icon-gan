import json
import scrapy
from scrapy.pipelines.files import FilesPipeline

class ExtendedFilePipeline(FilesPipeline):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.info_file = open('scraped/info.jsonl', 'w')

    def process_item(self, item, spider):
        super().process_item(item, spider)

    def item_completed(self, results, item, info):
        super().item_completed(results, item, info)

        json.dump(list(map(lambda x: x[1], filter(lambda x: x[0], results))), self.info_file)
        self.info_file.write('\n')
