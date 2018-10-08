var express = require('express');
var request = require('request');

var app = express();



var headers = {
	'Accept':'application/json, text/javascript, */*; q=0.01',
	'X-DevTools-Emulate-Network-Conditions-Client-Id':'AE08E18B6020CDF6D64007AB633193E0',
	'X-Requested-With':'XMLHttpRequest',
	'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36',
	'Referer':'https://dnpedia.com/tlds/topm.php',
	'Accept-Encoding':'gzip, deflate, br',
	'Accept-Language':'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
	'Cookie':'PHPSESSID=9p8nek56b8rjn825g9ptf81q00; _pk_ref.5.7fde=%5B%22%22%2C%22%22%2C1538558271%2C%22https%3A%2F%2Fwww.google.de%2F%22%5D; _pk_ses.5.7fde=*; _pk_id.5.7fde=010ad31361cb7f2d.1538558271.1.1538559532.1538558271.'
};

var cur;
var max = 10000
var rows = 100

var result;

function getPage() {
	if (cur > max) {
		return;
	}

	var options = {
		url: 'https://dnpedia.com/tlds/ajax.php?cmd=alexa&columns=id,domain,rank,tld,site,&_search=false&nd=1538559841122&rows='+rows+'&page='+cur+'&sidx=active_in_zone&sord=asc',
		headers: headers
	};
	request(options, callback);
}


function callback(error, response, body) {
	if (!error && response.statusCode == 200) {
		var info = JSON.parse(body);
		console.log(info.stargazers_count + " Stars");
		console.log(info.forks_count + " Forks");
	}
	cur++;
	result.push(JSON.parse(body));

	var delay = 60 + Math.floor(Math.random() * Math.floor(60));
	setTimeout(getPage, delay);
}


app.get('/', function (req, res) {
	if (!cur) {
		cur = 1;
		retulst = [];
		getPage();
		res.send('Starting');
	}
	else if (cur <= max) {
		res.send(cur + '/' + max);
	}
	res.send('Hello World!');
});

app.listen(3000, function () {
	console.log('Example app listening on port 3000!');
});
