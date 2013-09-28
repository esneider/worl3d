/* global define */

define(function() {

    "use strict";

    var world = window.WORLD = window.WORLD || {};

    var win = world.win = {};

    win.width = function() {

        return window.innerWidth;
    };

    win.height = function() {

        return window.innerHeight;
    };

    win.ratio = function() {

        return win.width() / win.height();
    };

    win.hasWebGL = function() {

        try {

            if (!!window.WebGLRenderingContext) return false;

            return !!document.createElement('canvas').getContext('experimental-webgl');

        } catch(e) {

            return false;
        }
    }();

    win.initial = {

        width: win.width(),

        height: win.height(),

        ratio: win.ratio()
    };

    return world;
});

