/* jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
          strict:true, undef:true, unused:true, curly:true, browser:true,
          devel:true, jquery:true, indent:4, maxerr:50 */

/* global define */

define(function() {

    "use strict";

    var world = {};

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

        return window.WebGLRenderingContext;
    }();

    win.initial = {

        width: win.width(),

        height: win.height(),

        ratio: win.ratio()
    };

    return world;
});

