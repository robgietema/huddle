/*global assert: false, refute: false */
var buster = require("buster"),
    huddle = require("../lib/huddle.js"),
    resources;

buster.testCase('Huddle', {
    setUp: function () {
        resources = new huddle.Huddle();
    },

    "Empty input": function () {
        resources.read('');
        assert.equals(resources.write(), '');
    },

    "Doctype should be preserved": function () {
        resources.read('<!DOCTYPE html>');
        assert.equals(resources.write(), '<!DOCTYPE html>');
    },

    "Multi line doctype": function () {
        resources.read('<!DOCTYPE html line1\nline2>');
        assert.equals(resources.write(), '<!DOCTYPE html line1\nline2>');
    },

    "Singleton tag": function () {
        resources.read('<div/>');
        assert.equals(resources.write(), '<div/>');
    },

    "Strip whitespace": function () {
        resources.read('  <div/>');
        assert.equals(resources.write(), '<div/>');
    },

    "Preserve whitespace": function () {
        resources = new huddle.Huddle({ignoreWhitespace: false});
        resources.read('  <div/>');
        assert.equals(resources.write(), '  <div/>');
    },

    "Open/Close tag without body": function () {
        resources.read('<div></div>');
        assert.equals(resources.write(), '<div/>');
    },

    "Open/Close tag with body": function () {
        resources.read('<div>Test</div>');
        assert.equals(resources.write(), '<div>Test</div>');
    },

    "Tag with attributes": function () {
        resources.read('<div a1="v1" a2="v2"/>');
        assert.equals(resources.write(), '<div a1="v1" a2="v2"/>');
    },

    "Stylesheet link tag": function () {
        resources.read('<link href="a.css" rel="stylesheet" type="text/css"/>');
        assert.equals(resources.write(), '<link href="app.css" rel="stylesheet" type="text/css"/>');
        assert.equals(resources.getStylesheets()['app']['a.css'], 'text/css');
    },

    "Multiple stylesheet link tags": function () {
        resources.read('<link href="a.css" rel="stylesheet" type="text/css"/><link href="b.less" rel="stylesheet/less" type="text/css"/>');
        assert.equals(resources.write(), '<link href="app.css" rel="stylesheet" type="text/css"/>');
        assert.equals(resources.getStylesheets()['app']['a.css'], 'text/css');
        assert.equals(resources.getStylesheets()['app']['b.less'], 'text/less');
    },

    "Stylesheet with module": function () {
        resources.read('<link href="a.css" rel="stylesheet" type="text/css" data-module="mymod"/>');
        assert.equals(resources.write(), '<link href="mymod.css" rel="stylesheet" type="text/css"/>');
        assert.equals(resources.getStylesheets()['mymod']['a.css'], 'text/css');
        refute(resources.getStylesheets()['app']);
    },

    "Multiple stylesheet link tags with modules": function () {
        resources.read('<link href="a.css" rel="stylesheet" type="text/css" data-module="mylib"/><link href="b.less" rel="stylesheet/less" type="text/css"/>');
        assert.equals(resources.write(), '<link href="mylib.css" rel="stylesheet" type="text/css"/><link href="app.css" rel="stylesheet" type="text/css"/>');
        assert.equals(resources.getStylesheets()['mylib']['a.css'], 'text/css');
        assert.equals(resources.getStylesheets()['app']['b.less'], 'text/less');
    },

    "Drop stylesheet link tag": function () {
        resources.read('<link href="a.css" rel="stylesheet" type="text/css" data-drop=""/>');
        assert.equals(resources.write(), '');
        refute(resources.getStylesheets()['app']);
    },

    "Include remote stylesheet": function () {
        resources.read('<link href="a.css" rel="stylesheet" type="text/css" data-remote="b.css"/>');
        assert.equals(resources.write(), '<link href="b.css" rel="stylesheet" type="text/css"/>');
        refute(resources.getStylesheets()['app']);
    },

    "Script tag": function () {
        resources.read('<script type="text/javascript" src="a.js"></script>');
        assert.equals(resources.write(), '<script type="text/javascript" src="app.js"></script>');
        assert.equals(resources.getScripts()['app']['a.js'], 'text/javascript');
    },

    "Multiple script tags with modules": function () {
        resources.read('<script type="text/javascript" src="a.js"></script><script type="text/javascript" src="b.js" data-module="mylib"></script>');
        assert.equals(resources.write(), '<script type="text/javascript" src="app.js"></script><script type="text/javascript" src="mylib.js"></script>');
        assert.equals(resources.getScripts()['app']['a.js'], 'text/javascript');
        assert.equals(resources.getScripts()['mylib']['b.js'], 'text/javascript');
    },

    "Drop script tag": function () {
        resources.read('<script type="text/javascript" src="a.js" data-drop=""/>');
        assert.equals(resources.write(), '');
        refute(resources.getScripts()['app']);
    },

    "Include remote scripts": function () {
        resources.read('<script type="text/javascript" src="a.js" data-remote="b.js"/>');
        assert.equals(resources.write(), '<script type="text/javascript" src="b.js"></script>');
        refute(resources.getScripts()['app']);
    }
});
