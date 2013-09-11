/* jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
          strict:true, undef:true, unused:true, curly:true, browser:true,
          devel:true, jquery:true, indent:4, maxerr:50 */

/* global THREE, requestAnimationFrame, Stats */

(function() {

    "use strict";

    var world = {};

    function newCamera() {

        var viewAngle = 75; // from bottom to top of view, in degrees
        var aspectRatio = window.innerWidth / window.innerHeight;
        var nearPlane = 1;
        var farPlane = 10000;

        var camera = new THREE.PerspectiveCamera(viewAngle, aspectRatio, nearPlane, farPlane);

        camera.position.z = 1000;

        return camera;
    }

    function newObjects() {

        var objs = {};

        objs.axes = new THREE.AxisHelper();
        objs.axes.scale.set(100, 100, 100);

        var geometry = new THREE.CubeGeometry(200, 200, 200);
        var material = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true});
        objs.cube = new THREE.Mesh(geometry, material);

        return objs;
    }

    function newScene(objects) {

        var scene = new THREE.Scene();

        for (var obj in objects) {
            if (objects.hasOwnProperty(obj)) {
                scene.add(objects[obj]);
            }
        }

        return scene;
    }

    function newRenderer() {

        var renderer;

        if (window.WebGLRenderingContext) {
            renderer = new THREE.WebGLRenderer();
        } else {
            renderer = new THREE.CanvasRenderer();
        }

        renderer.setClearColor(new THREE.Color(0x000000));
        renderer.setSize(window.innerWidth, window.innerHeight);

        return renderer;
    }

    function newStats() {

        var stats = new Stats();

        stats.setMode(1);
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';

        return stats;
    }

    function initWorld() {

        world.camera = newCamera();
        world.objects = newObjects();
        world.scene = newScene(world.objects);
        world.renderer = newRenderer();
        world.stats = newStats();

        world.viewPort = {
            width:  window.innerWidth,
            height: window.innerHeight,
            tanFOV: Math.tan(world.camera.fov * Math.PI / 360)
        };

        document.body.appendChild(world.renderer.domElement);
        document.body.appendChild(world.stats.domElement);
    }

    function animate() {

        world.stats.begin();

        requestAnimationFrame(animate);

        world.objects.cube.rotation.x += 0.01;
        world.objects.cube.rotation.y += 0.02;

        world.renderer.render(world.scene, world.camera);

        world.stats.end();
    }

    $(document).ready(function() {

        initWorld();
        animate();
    });

    $(window).resize(function() {

        var tanFOV = world.viewPort.tanFOV * window.innerHeight / world.viewPort.height;

        world.camera.aspect = window.innerWidth / window.innerHeight;
        world.camera.fov = Math.atan(tanFOV) * 360 / Math.PI;
        world.camera.updateProjectionMatrix();

        world.renderer.setSize( window.innerWidth, window.innerHeight );
        world.renderer.render( world.scene, world.camera );
    });

})();

