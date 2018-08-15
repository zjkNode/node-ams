var http = require('http');
var https = require('https');
var config = require('../config/config');

function post(url, data, callback) {
    let params = JSON.stringify(data);
    let options = {
        host: config.loanApiConfig.host,
        method: 'POST',
        path: url,
        headers: {
            "Content-type": "application/json;charset=UTF-8",
            "Content-Length": Buffer.byteLength(params)
        }
    };
    let req = https.request(options, function (res) {
        res.setEncoding('utf-8');

        let resData = '';
        res.on('data', function (chunk) {
            resData += chunk;
        });

        res.on('end', function () {
            return callback(null, JSON.parse(resData));
        });

        console.log(res.statusCode)
    });

    req.on('error', function (err) {
        return callback(err);
    });

    req.write(params);
    req.end();
}


exports.post = post;