var htmlparser = require('htmlparser'),
    parserlib = require('parserlib'),
    fs = require('fs'),
    extend = require('xtend'),
    parser = require('uglify-js').parser;
    uglifyjs = require('uglify-js'),
    cleancss = require('clean-css'),
    less = require('less');

function Huddle(options) {
    var self = this;

    this._options = extend({
        ignoreWhitespace: true
    }, options ? options : {});
    this._data = '';
    this._stylesheets = {};
    this._scripts = {};

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
            newresource,
            resourcelist,
            attribs,
            singleton,
            module,
            closingtag;

        for (i = 0; i < data.length; i++) {
            singleton = !data[i].children && data[i].type !== 'script';
            closingtag = '';
            switch(data[i].type) {
            case 'tag':
            case 'script':
            case 'style':
                attribs = data[i].attribs ? data[i].attribs : {};
                if ('data-drop' in attribs) {
                    break;
                }
                if ((data[i].name === 'link' &&
                     attribs['rel'] &&
                     attribs['rel'].indexOf('stylesheet') != -1) ||
                    (data[i].name === 'script')) {
                    if ('data-remote' in attribs) {
                        if (data[i].name === 'link') {
                            attribs['href'] = attribs['data-remote'];
                        } else {
                            attribs['src'] = attribs['data-remote'];
                        }
                        delete attribs['data-remote'];
                    } else {
                        if ('data-module' in attribs) {
                            module = attribs['data-module'];
                            delete attribs['data-module'];
                        } else {
                            module = 'app';
                        }
                        if (data[i].name === 'link') {
                            resourcelist = self._stylesheets;
                        } else {
                            resourcelist = self._scripts;
                        }
                        newresource = !(module in resourcelist);
                        if (newresource) {
                            resourcelist[module] = {};
                        }
                        if (data[i].name === 'link') {
                            resourcelist[module][attribs['href']] =
                                attribs['rel'] === 'stylesheet/less' ?
                                'text/less' : 'text/css';
                        } else {
                            resourcelist[module][attribs['src']] =
                                attribs['type'];
                        }
                        if (newresource) {
                            if (data[i].name === 'link') {
                                attribs['rel'] = 'stylesheet';
                                attribs['type'] = 'text/css';
                                attribs['href'] = module + '.css';
                            } else {
                                attribs['type'] = 'text/javascript';
                                attribs['src'] = module + '.js';
                            }
                        } else {
                            break;
                        }
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

    Huddle.prototype.writeToFile = function (output) {
        fs.writeFileSync(output, self._data, 'utf8');
    }

    Huddle.prototype.getStylesheets = function () {
        return self._stylesheets;
    }

    Huddle.prototype.getScripts = function () {
        return self._scripts;
    }

    Huddle.prototype.writeScripts = function () {
        var i,
            j,
            files,
            output;
        for (i in self._scripts) {
            files = [];
            for (j in self._scripts[i]) {
                files.push(j);
            }
            output = uglifyjs.minify(files);
            fs.writeFileSync(i + '.js', output.code, 'utf8');
        }
    }

    Huddle.prototype.writeStylesheets = function () {
        var i,
            j,
            data;
        for (i in self._stylesheets) {
            data = '';
            for (j in self._stylesheets[i]) {
                if (self._stylesheets[i][j] === 'text/less') {
                    less.render(fs.readFileSync(j, 'utf8'), function (e, css) {
                        data += css;
                    });
                } else {
                    data += fs.readFileSync(j, 'utf8');
                }
            }
            fs.writeFileSync(i + '.css',
                             cleancss.process(data, {
                                 keepSpecialComments: 0,
                                 removeEmpty: true
                             }),
                             'utf8');
        }
    }
}

exports.Huddle = Huddle;
