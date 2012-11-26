# huddle - Pack and compress css and javascript #

[![Build status](https://secure.travis-ci.org/robgietema/huddle.png?branch=master)](http://travis-ci.org/robgietema/huddle/)

**huddle** is a tool to retrieve css and javascript references from an html file and pack and compress those files.

## Usage

    huddle [ options... ]

Supported options:

- `-i filename` or `--input` - Use `filename` as the input html file (default: index.html)
- `-o filename` or `--output` - Use `filename` as the output html file (default: index-min.html)
- `-h` or `--help` - Show help message

Input should be an html document. All script and css tags should be parsed
and the files from it merged and compressed. The output html should be stripped
from whitespace and contain the path to the merged and compressed files.

## Supported formats

Huddle can handle CSS and Javascript files by default. Huddle will also compile
less files into CSS and merge the result with the other CSS files. You can
specify a less stylesheet with the following tag:

    <link href="example.less" rel="stylesheet/less" type="text/css"/>

## Modules

By default all CSS files will be added to `app.css` and all Javascript files to
`app.js`. You can specify a module per tag to change this behavior. For
example:

    <script data-module="libs" type="text/javascript" src="jquery.js"></script>

will add `jquery.js` to to `libs.js` and not to `app.js`.

## Drop files

If you don't want to have a certain CSS or Javascript in your compressed code
but you do want to use it in the non-compressed version you can use the
`data-drop` option.

    <script data-drop="" type="text/javascript" src="less.js"></script>

This example will allow you to use `less.js` in development mode to render
less stylesheets on the client and not include `less.js` in production code
since it will be converted to CSS.

## Remote includes

When you want to use local files for development but want to use remote files
in production you can use the `data-remote` attribute. This will allow you to
use a CDN for example in your production environment.

    <script data-remote="http://code.jquery.com/jquery-1.8.3.js" type="text/javascript" src="jquery.js"></script>

## Obviel templates

[Obviel](http://obviel.org) is a client-side web framework for jQuery. When
using an Obviel view with `jsonUrl` or `obvtUrl` parameters they will be
converted to `json` and `obvt` and the template will be rendered inline with
all newlines and leading and trailing whitespace stripped.
