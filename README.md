# huddle - Pack and compress css and javascript #

[![Build status](https://secure.travis-ci.org/robgietema/huddle.png?branch=master)](http://travis-ci.org/robgietema/huddle/)

**huddle** is a tool to retrieve css and javascript references from an html file and pack and compress those files.

Input should be an html document. All script and css tags should be parsed
and the files from it merged and compressed. The output html should be stripped
from whitespace and contain the path to the merged and compressed files.


Drop a file which should not be included in the output.

<script data-drop="" type="text/javascript" src="../libs/less/1.3.0/less.js"></script>


Less files should be converted to css using the nodejs less compiler

<link href="./css/myapp.less" rel="stylesheet/less" type="text/css"/>


Set a remote file to be included and not merged/compressed

<script data-remote="//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js" type="text/javascript" src="libs/jquery/1.8.2/jquery.js"></script>


When a module is specified it will be added to <module>.js in this case
libs.js. If no module is specified it will default to app.js and app.css

<script data-module="libs" type="text/javascript" src="libs/obviel/1.0a1/obviel.js"></script>


When javascript files contain jsonUrl or obvtUrl the parameter should be converted
to json and obvt and the template should be rendered inline with all newlines and
leading and trailing whitespace stripped.

## Usage


    huddle [ options... ]

Supported options:

- `-i filename` or `--input` --- use `filename` as the input html file (default: index.html)
- `-o filename` or `--outpyt` --- use `filename` as the output html file (default: index-min.html)
- `-h` or `--help` --- show help message
