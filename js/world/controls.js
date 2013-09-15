/* jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
          strict:true, undef:true, unused:true, curly:true, browser:true,
          devel:true, jquery:true, indent:4, maxerr:50 */

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

