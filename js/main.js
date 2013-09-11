/* jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
          strict:true, undef:true, unused:true, curly:true, browser:true,
          devel:true, jquery:true, indent:4, maxerr:50 */

/* global THREE, requestAnimationFrame, Stats */

(function() {

    "use strict";

    var world = {};

    function newCamera() {

        var aspectRatio = window.innerWidth / window.innerHeight;
        var camera = new THREE.PerspectiveCamera(75, aspectRatio, 1, 10000);

        camera.position.set(-1000, 0, 0);

        return camera;
    }

    function newObjects() {

        var objs = {};

        objs.axes = new THREE.AxisHelper();
        objs.axes.scale.set(100, 100, 100);

        var c_geometry = new THREE.CubeGeometry(200, 200, 200);
        var c_material = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true});
        objs.cube = new THREE.Mesh(c_geometry, c_material);

        var side = 100, scale = 8.0;
        var t_geometry = new THREE.PlaneGeometry(2000, 2000, side, side);
        var t_material = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true});

        for (var x = 0, i = 0; x <= side; x++) {
            for (var y = 0; y <= side; y++, i++) {
                t_geometry.vertices[i].z = 100 * Math.sin(x / scale) * Math.sin(y / scale);
            }
        }

        objs.terrain = new THREE.Mesh(t_geometry, t_material);
        objs.terrain.lookAt(new THREE.Vector3(-0.2, 1, 0));

        console.log(objs.terrain);

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
            renderer = new THREE.WebGLRenderer({antialias: true});
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

    function newControls(camera) {

        var controls = new THREE.FirstPersonControls(camera);

        controls.movementSpeed = 500;
        controls.lookSpeed = 0.15;
        controls.lookVertical = true;
        controls.mouseInactiveWindow = 0.3;

        return controls;
    }

    function initWorld() {

        world.camera = newCamera();
        world.controls = newControls(world.camera);
        world.objects = newObjects();
        world.scene = newScene(world.objects);
        world.renderer = newRenderer();
        world.stats = newStats();
        world.clock = new THREE.Clock();

        world.viewPort = {
            width:  window.innerWidth,
            height: window.innerHeight,
            tanFOV: Math.tan(world.camera.fov * Math.PI / 360)
        };

        document.body.appendChild(world.renderer.domElement);
        document.body.appendChild(world.stats.domElement);
    }

    function render() {

        world.controls.update(world.clock.getDelta());
        world.renderer.render(world.scene, world.camera);
    }

    function animate() {

        world.stats.begin();

        requestAnimationFrame(animate);

        world.objects.cube.rotation.x += 0.01;
        world.objects.cube.rotation.y += 0.02;

        render();

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

        world.controls.handleResize();

        render();
    });

})();

