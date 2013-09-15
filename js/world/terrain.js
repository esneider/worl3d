/* jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
          strict:true, undef:true, unused:true, curly:true, browser:true,
          devel:true, jquery:true, indent:4, maxerr:50 */

/* global define */

define(['./renderer', 'three'], function(world, THREE) {

    "use strict";

    var side = 2000;
    var tile_side = 20;
    var tiles = side / tile_side;
    var scale = 8;

    var geometry = new THREE.PlaneGeometry(side, side, tiles, tiles);
    var material = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true});

    for (var x = 0, i = 0; x <= tiles; x++) {
        for (var y = 0; y <= tiles; y++, i++) {
            geometry.vertices[i].z = 100 * Math.sin(x / scale) * Math.sin(y / scale);
        }
    }

    world.terrain = new THREE.Mesh(geometry, material);
    world.terrain.lookAt(new THREE.Vector3(-0.2, 1, 0));

    world.scene.add(world.terrain);

    return world;
});

