/* global define */

define(['./window', 'three', 'domReady'], function(world, THREE, domReady) {

    "use strict";

    world.camera = function() {

        var camera = new THREE.PerspectiveCamera(75, world.win.ratio(), 1, 10000);

        camera.position.set(-1000, 0, 0);

        return camera;
    }();

    world.scene = function() {

        return new THREE.Scene();
    }();

    world.renderer = function () {

        var renderer;

        if (world.win.hasWebGL) {
            renderer = new THREE.WebGLRenderer({antialias: true});
        } else {
            renderer = new THREE.CanvasRenderer();
        }

        renderer.setClearColor(new THREE.Color(0x000000));
        renderer.setSize(world.win.width(), world.win.height());

        return renderer;
    }();

    world.clock = function() {

        return new THREE.Clock();
    }();

    domReady(function() {

        document.body.appendChild(world.renderer.domElement);
    });

    return world;
});

