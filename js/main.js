/* jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
          strict:true, undef:true, unused:true, curly:true, browser:true,
          devel:true, jquery:true, indent:4, maxerr:50 */

/* global require, requestAnimationFrame */

require.config({

    baseUrl: 'js/lib',

    paths: {
        app: '..'
    },

    shim: {
        jquery: {
            exports: '$'
        },
        underscore: {
            exports: '_'
        },
        three: {
            exports: 'THREE'
        },
        stats: {
            exports: 'Stats'
        },
        FirstPersonControls: {
            deps: ['three'],
            exports: 'THREE.FirstPersonControls'
        },
        dat: {
            exports: 'dat'
        }
    }
});

require(['app/world', 'jquery', 'three', 'stats'], function(world, $, THREE, Stats) {

    "use strict";

    var stats = function() {

        var stats = new Stats();

        stats.setMode(1);
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';

        return stats;
    }();

    function animate() {

        stats.begin();

        requestAnimationFrame(animate);

        world.render();

        stats.end();
    }

    $(document).ready(function() {

        document.body.appendChild(stats.domElement);

        animate();
    });

    $(window).resize(world.win.resize);
});

