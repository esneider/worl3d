/* global define */

define(
    [
        './world/window',
        './world/renderer',
        './world/terrain',
        './world/controls'
    ],
    function(world) {

        "use strict";

        world.render = function() {

            world.controls.update(world.clock.getDelta());
            world.renderer.render(world.scene, world.camera);
        };

        var iniTanFOV = Math.tan(world.camera.fov * Math.PI / 360);

        world.win.resize = function() {

            var tanFOV = iniTanFOV * world.win.height() / world.win.initial.height;

            world.camera.aspect = world.win.ratio;
            world.camera.fov = Math.atan(tanFOV) * 360 / Math.PI;
            world.camera.updateProjectionMatrix();
            world.renderer.setSize(world.win.width(), world.win.height());
            world.controls.handleResize();
            world.render();
        };

        return world;
    }
);

