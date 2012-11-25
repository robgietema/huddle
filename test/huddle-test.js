/*global assert: false, refute: false */
var buster = require("buster"),
    huddle = require("../lib/huddle.js"),
    resources;

buster.testCase('huddle', {
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
        assert.equals(resources.getStylesheets()['app.css']['a.css'], 'text/css');
    },

    "Multiple stylesheet link tags": function () {
        resources.read('<link href="a.css" rel="stylesheet" type="text/css"/><link href="b.less" rel="stylesheet" type="text/less"/>');
        assert.equals(resources.write(), '<link href="app.css" rel="stylesheet" type="text/css"/>');
        assert.equals(resources.getStylesheets()['app.css']['a.css'], 'text/css');
        assert.equals(resources.getStylesheets()['app.css']['b.less'], 'text/less');
    },

});
