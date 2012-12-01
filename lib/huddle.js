var htmlparser = require('htmlparser'),
    fs = require('fs'),
    extend = require('xtend'),
    parser = require('uglify-js').parser;
    uglifyjs = require('uglify-js'),
    cleancss = require('clean-css'),
    less = require('less');

/**
 * A library to retrieve CSS and Javascript references from an HTML file and
 * pack and compress those files.
 *
 * @class Huddle
 * @param {Object} options OPtions used by the packer and compressor
 * @constructor
 */
function Huddle(options) {
    var self = this;

    /**
     * Options used by the packer and compressor.
     *
     * @property _options
     * @type Object
     * @writeOnce
     * @private
     */
    this._options = extend({
        ignoreWhitespace: true
    }, options ? options : {});

    /**
     * Used for the parsed HTML data.
     *
     * @property _data
     * @type String
     * @default ''
     * @private
     */
    this._data = '';

    /**
     * Object for storing all stylesheets of different modules.
     *
     * @property _stylesheets
     * @type Object
     * @default {}
     * @private
     */
    this._stylesheets = {};

    /**
     * Object for storing all scripts of different modules.
     *
     * @property _scripts
     * @type Object
     * @default {}
     * @private
     */
    this._scripts = {};

    /**
     * Read HTML file from the filesystem and pass the data to the read method.
     *
     * @method readFromFile
     * @param {String} input
     */
    Huddle.prototype.readFromFile = function (input) {
        self.read(fs.readFileSync(input, 'utf8'));
    }

    /**
     * Read HTML and parse the separate chunks of the DOM
     *
     * @method read
     * @param {String} data HTML data to be read and parsed
     */
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

    /**
     * Recursivly read the DOM and parse CSS and Javascript links.
     *
     * @method readChunk
     * @param {String} data DOM data to be read and processed
     */
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
            case 'comment':
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

    /**
     * Write the processed HTML
     *
     * @method write
     * @return {String} Processed HTML
     */
    Huddle.prototype.write = function () {
        return self._data;
    }

    /**
     * Write the processed HTML to the specified file
     *
     * @method writeToFile
     * @param {String} output Filename of the output file
     */
    Huddle.prototype.writeToFile = function (output) {
        fs.writeFileSync(output, self._data, 'utf8');
    }

    /**
     * Return all the stylesheets in the HTML file
     *
     * @method getStylesheets
     * @return {Object} Object with all the stylesheets in the HTML file
     */
    Huddle.prototype.getStylesheets = function () {
        return self._stylesheets;
    }

    /**
     * Return all the scripts in the HTML file
     *
     * @method getScripts
     * @return {Object} Object with all the scripts in the HTML file
     */
    Huddle.prototype.getScripts = function () {
        return self._scripts;
    }

    /**
     * Read all script files specified in the HTML file, merge and compress
     * them and write them to the output files.
     *
     * @method writeScripts
     */
    Huddle.prototype.writeScripts = function () {
        var i,
            j,
            k,
            l,
            data,
            lines,
            template_lines,
            parts;
        for (i in self._scripts) {
            data = '';
            for (j in self._scripts[i]) {
                lines = fs.readFileSync(j, 'utf8').toString().split("\n");
                for (k in lines) {
                    parts = lines[k].match(/^(.*)obvtUrl([^\'\"]*)[\'\"]([^\'\"]*)[\'\"](.*)$/);
                    if (parts) {
                        data += parts[1] + 'obvt' + parts[2] + "'";
                        if (parts[3].charAt(0) === '/') {
                            parts[3] = '.' + parts[3];
                        }
                        template_lines = fs.readFileSync(
                            parts[3], 'utf8').toString().split("\n");
                        for (l in template_lines) {
                            data += template_lines[l].replace(/^\s+|\s+$/g,'');
                        }
                        data += "'" + parts[4] + "\n";
                    } else {
                        data += lines[k] + "\n";
                    }
                }
            }

            data = uglifyjs.parse(data);
            data.figure_out_scope();
            data = data.transform(uglifyjs.Compressor({warnings: false}));
            data.figure_out_scope();
            data.compute_char_frequency();
            data.mangle_names();
            fs.writeFileSync(i + '.js', data.print_to_string(), 'utf8');
        }
    }

    /**
     * Read all CSS files specified in the HTML file, merge and compress them
     * and write them to the output files.
     *
     * @method writeStypesheets
     */
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
