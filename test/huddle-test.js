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

});
