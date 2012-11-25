var htmlparser = require('htmlparser'),
    parserlib = require('parserlib'),
    fs = require('fs'),
    extend = require('xtend');

function Huddle(options) {
    var self = this;

    this._options = extend({
        ignoreWhitespace: true
    }, options ? options : {});
    this._data = '';
    this._stylesheets = {};

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
            }, { ignoreWhitespace: self._options.ignoreWhitespace }),
            parser = new htmlparser.Parser(handler);

        parser.parseComplete(data);
    }

    Huddle.prototype.readChunk = function (data) {
        var string = '',
            i,
            j,
            newss,
            attribs,
            singleton,
            module,
            closingtag;

        for (i = 0; i < data.length; i++) {
            singleton = !data[i].children;
            closingtag = '';
            switch(data[i].type) {
            case 'tag':
                attribs = data[i].attribs ? data[i].attribs : {};
                if (data[i].name === 'link' &&
                    attribs['rel'] &&
                    attribs['rel'] === 'stylesheet') {
                    if ('data-module' in attribs) {
                        module = attribs['data-module'];
                        delete attribs['data-module'];
                    } else {
                        module = 'app';
                    }
                    newss = !(module in self._stylesheets);
                    if (newss) {
                        self._stylesheets[module] = {};
                    }
                    self._stylesheets[module][attribs['href']] =
                        attribs['type'];
                    if (newss) {
                        attribs['type'] = 'text/css';
                        attribs['href'] = module + '.css';
                    } else {
                        break;
                    }
                }
                string += '<' + data[i].name;
                for (j in attribs) {
                    string += ' ' + j + '="' + attribs[j] + '"';
                }
                string += (singleton ? '/' : '') + '>';
                if (!singleton) {
                    closingtag = '</' + data[i].name + '>';
                }
                break;
            case 'text':
                string += data[i].data;
                break;
            case 'directive':
                string += '<' + data[i].data + '>';
                break;
            default:
                console.log('unknown type: ', data[i]);
            }
            if (data[i].children) {
                string += self.readChunk(data[i].children);
            }
            string += closingtag;
        }
        return string;
    }

    Huddle.prototype.write = function () {
        return self._data;
    }

    Huddle.prototype.getStylesheets = function () {
        return self._stylesheets;
    }
}

exports.Huddle = Huddle;
