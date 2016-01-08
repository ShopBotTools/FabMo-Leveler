/*jslint todo: true, browser: true, continue: true, white: true*/
/*global THREE*/

var Leveler = require("./leveler").Leveler;
var fs = require("fs");

var point = { x : 0, y : 0, z : 0 };
var pointMesh;

var controls;
var renderer;
var scene;
var camera;

var leveler;
var triangles;
var points;

var trianglesMeshes = [];

function animate() {
    window.requestAnimationFrame(animate);
    controls.update();
}

//Renders the screen
function render() {
    renderer.render(scene, camera);
}

function refreshDisplay() {
    render();
    animate();
}

function setCombinedCamera() {
    var width = renderer.domElement.width/2; // Camera frustum width.
    var height = renderer.domElement.height/2; // Camera frustum height.
    var fov = 75; // Camera frustum vertical field of view in perspective view.
    var near = 0.1; // Camera frustum near plane in perspective view.
    var far = 1000; // Camera frustum far plane in perspective view.
    var orthoNear = -100; // Camera frustum near plane in orthographic view.
    var orthoFar = 100; // Camera frustum far plane in orthographic view.
    camera = new THREE.CombinedCamera(width, height, fov, near,
            far, orthoNear, orthoFar);
    camera.up.set(0, 0, 1);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.damping = 0.2;
    controls.addEventListener('change', render);
}

function drawTriangles(triangles, points) {
    console.log(triangles);
    console.log(points);

    var material = new THREE.MeshLambertMaterial({color: 0xF07530,
        transparent: false, opacity: 0.5, side: THREE.DoubleSide});
        // transparent: false, opacity: 0.5, wireframe: true});
    var geometry;
    var mesh;
    var i = 0;
    var a = { x : 0, y : 0, z : 0 };
    var b = { x : 0, y : 0, z : 0 };
    var c = { x : 0, y : 0, z : 0 };

    for(i = triangles.length - 1; i >= 0; i--) {
        a.x = points[triangles[i][0]][0];
        a.y = points[triangles[i][0]][1];
        a.z = points[triangles[i][0]][2];

        b.x = points[triangles[i][1]][0];
        b.y = points[triangles[i][1]][1];
        b.z = points[triangles[i][1]][2];

        c.x = points[triangles[i][2]][0];
        c.y = points[triangles[i][2]][1];
        c.z = points[triangles[i][2]][2];

        geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(a.x, a.y, a.z));
        geometry.vertices.push(new THREE.Vector3(b.x, b.y, b.z));
        geometry.vertices.push(new THREE.Vector3(c.x, c.y, c.z));

        geometry.faces.push(new THREE.Face3(0, 1, 2));
        geometry.computeFaceNormals();

        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        trianglesMeshes.push(mesh);
    }

    refreshDisplay();
}

function setLeveler(filename) {
    var makeTriangles = function() {
        triangles = leveler.triangles;
        points = leveler.points;

        drawTriangles(triangles, points);
    };

    leveler = new Leveler(filename, makeTriangles);
}

var container = document.getElementById("container");

renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(600, 600);
renderer.domElement.style.zIndex = 1;
container.appendChild(renderer.domElement);

renderer.setClearColor(0xebebeb);
renderer.setPixelRatio(window.devicePixelRatio);

scene = new THREE.Scene();
setCombinedCamera();
camera.position.z = 2;
camera.lookAt(0, 0, 0);

var light1 = new THREE.PointLight(0xffffff, 1, 100);
light1.position.set(0, 0, -10);
scene.add(light1);

var light2 = new THREE.PointLight(0xffffff, 1, 100);
light2.position.set(0, 0, 10);
scene.add(light2);

scene.add(new THREE.AxisHelper(5));


var geometry = new THREE.SphereGeometry(0.01, 32, 32);
var material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
pointMesh = new THREE.Mesh(geometry, material);
scene.add(pointMesh);

refreshDisplay();

document.getElementById("test").onclick = function() {
    setLeveler("pente.txt");
};

document.getElementById("test_point").onclick = function() {
    point.x = parseFloat(document.getElementById("x").value, 10);
    point.y = parseFloat(document.getElementById("y").value, 10);
    point.z = leveler.findHeight([point.x, point.y]);

    pointMesh.position.set(point.x, point.y, point.z);

    console.log("point");
    console.log(point);

    refreshDisplay();
};
