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
    }
});
