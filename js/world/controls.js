/* global define */

define(['./renderer', 'three', 'FirstPersonControls'], function(world, THREE) {

    "use strict";

    world.controls = function() {

        var controls = new THREE.FirstPersonControls(world.camera);

        controls.movementSpeed = 500;
        controls.lookSpeed = 0.15;
        controls.lookVertical = true;
        controls.mouseInactiveWindow = 0.3;

        return controls;
    }();

    return world;
});

