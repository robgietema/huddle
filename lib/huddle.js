var htmlparser = require('htmlparser'),
    parserlib = require('parserlib'),
    fs = require('fs');

function huddle(input, output) {
    fs.readFile(input, 'utf8', function (err, data) {
        if (err) {
            throw err;
        }
        console.log(data);
    });
}

exports.huddle = huddle;
