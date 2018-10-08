var request = require('request');
var unzip   = require('unzip');
var csv2    = require('csv2');
var fs		= require('fs');
var async	= require('async');

function getFaviconFromIndexHtml() {
	var regexp = /<link\s*rel="icon"\s*type="image\/\S*"\s*href="(\S*\/favicon\.\S*)"/im;
	if (!body) return;
	var match = body.match(regexp);
	if (match) {
		return match[0];
	}
}

var hosts = [];
var max = 0;
process.setMaxListeners(0);

/*request.get('http://s3.amazonaws.com/alexa-static/top-1m.csv.zip')
	.pipe(fs.createWriteStream('top-1m.csv.zip'))*/
fs.createReadStream('top-1m.csv.zip')
	.pipe(unzip.Parse())
	.on('entry', function (entry) {
		entry.pipe(csv2()).on('data', (data) => {
			if (!max || data[0] < max) {
				console.log(data);
				hosts.push(data[1]);
			}
		});
	}).on('finish', function() {
		console.log("all read");
		getUrls();
	});

function getUrls() {
	var i = 0;
	async.mapLimit(hosts, 10, function(host, callback) {
		var faviconUrl = 'http://www.' + host + '/favicon.ico';
		console.log('getting', faviconUrl);
		request({
			url: faviconUrl,
			encoding: null,
			timeout: 1000
		}, function (error, response, body) {
			if (error || !response) {
				console.log(++i, error);
				callback();
				return;
			}
			console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
			fs.writeFile('favicons2/' + host + '.ico', body, 'binary', e => {
				if (e) console.log(++i, e);
				else console.log(++i, 'written ' + host);
				callback();
			});
		});
	}, function(err, results) {
		console.log('finished');
	});
}

//setInterval(() => {}, 1 << 30);
