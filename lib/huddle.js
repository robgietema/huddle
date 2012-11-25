var htmlparser = require('htmlparser'),
    parserlib = require('parserlib'),
    fs = require('fs');

function Huddle(options) {
    var self = this;

    this._options = options ? options : {};
    this._data = '';

    Huddle.prototype.readFromFile = function (input) {
        self.read(fs.readFileSync(input, 'utf8'));
    }

    Huddle.prototype.read = function (data) {
        var handler = new htmlparser.DefaultHandler(function (error, dom) {
                if (error) {
                    console.log('error');
                } else {
                    self._data = self.readChunk(dom);
                }
            }),
            parser = new htmlparser.Parser(handler);

        parser.parseComplete(data);
    }

    Huddle.prototype.readChunk = function (data) {
        var string = '',
            i;
        for (i = 0; i < data.length; i++) {
            switch(data[i].type) {
            case 'tag':
                string += '|' + data[i].raw + '|';
                break;
            default:
                // console.log('unknown type: ', data[i]);
            }
            if (data[i].children) {
                string += self.readChunk(data[i].children);
            }
        }
        return string;
    }

    Huddle.prototype.write = function () {
        return self._data;
    }
}

exports.Huddle = Huddle;
