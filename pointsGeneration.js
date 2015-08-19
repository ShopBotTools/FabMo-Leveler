/*jslint todo: true, browser: true, continue: true, white: true*/
/*global Triangulation*/

// var triangulation = require("delaunay-triangulate");
var leveler = require("./leveler");
var fs = require("fs");

/*
 * File file is here only to test the module.
 */

//I don't test if min > max or the sign (I assume it's positive)
function generatePoints(xMin, yMin, zMin, xMax, yMax, zMax, number) {
    var i = 0, x = 0, y = 0, z = 0;
    var xRand = xMax - xMin, yRand = yMax - yMin, zRand = zMax - zMin;
    var points = [];
    for(i = 1; i <= number; i++) {
        x = Math.random() * xRand + xMin;
        y = Math.random() * yRand + yMin;
        z = Math.random() * zRand + zMin;
        points.push([ x, y, z ]);
    }

    return points;
}

//pHeight include in [0, 1]. 0 = blue, 1 = red
function getColor(pHeight) {
    var red = Math.floor(255 * pHeight);
    var blue = 255 - red;
    return "rgb(" + red + ",0," + blue + ")";
}

//pHeight = percentage height use for the color: 0 is blue, 1 is red
function drawDot(context, x, y, pHeight, radius) {
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI, true);
    context.fillStyle = getColor(pHeight);
    context.fill();
    context.closePath();
}

function drawLine(context, pointA, pointB) {
    context.beginPath();
    context.moveTo(pointA[0], pointA[1]);
    context.lineTo(pointB[0], pointB[1]);
    context.closePath();
    context.stroke();
}

function fillTriangle(context, pointA, pointB, pointC) {
    context.beginPath();
    context.moveTo(pointA[0], pointA[1]);
    context.lineTo(pointB[0], pointB[1]);
    context.lineTo(pointC[0], pointC[1]);
    context.closePath();
    context.fillStyle = "rgb(200,0,0)";
    context.fill();
}

function drawPoints(context, points, zMin, zMax, clear) {
    var i = 0, zTotal = Math.abs(zMax - zMin), pHeight = 0;

    if(clear === true) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    }
    for(i = 0; i < points.length; i++) {
        if(zTotal === 0) {
            pHeight = 1;
        } else {
            pHeight = Math.abs(points[i][2] - zMin) / zTotal;
        }
        drawDot(context, points[i][0], points[i][1], pHeight, 2);
    }

}

function drawTriangles(context, triangles, points, zMin, zMax) {
    //triangles store the index of the points in points
    var i = 0;
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    for(i = 0; i < triangles.length; i++) {
        drawLine(context, points[triangles[i][0]], points[triangles[i][1]]);
        drawLine(context, points[triangles[i][1]], points[triangles[i][2]]);
        drawLine(context, points[triangles[i][2]], points[triangles[i][0]]);
    }

    drawPoints(context, points, zMin, zMax, false);
}

function convertForTriangulate(points) {
    var pts = [], point = [];
    var i = 0;
    for(i=0; i < points.length; i++) {
        point = [];
        point.push(points[i][0]);
        point.push(points[i][1]);
        point.push(points[i][2]);
        pts.push(point);
    }

    return pts;
}

function convertForDrawing(triangles) {
    var pts = [], point = {}, tr = [];
    var i = 0;
    for(i=0; i < triangles.length; i++) {
        point = {};
        tr = [];
        point[0] = triangles[i][0][0];
        point[1] = triangles[i][0][1];
        tr.push(point);
        point = {};
        point[0] = triangles[i][1][0];
        point[1] = triangles[i][1][1];
        tr.push(point);
        point = {};
        point[0] = triangles[i][2][0];
        point[1] = triangles[i][2][1];
        tr.push(point);
        pts.push(tr);
    }

    return pts;
}

function colorTriangle(context, triangle, points) {
    fillTriangle(context, points[triangle[0]], points[triangle[1]],
            points[triangle[2]]);
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function callbackWrite(error) {
    if(error) {
        console.error(error);
        return;
    }

    level = new leveler.Leveler("test.txt");
    //Time to read the file because asynchronous
    setTimeout(function() {
        triangles = level.triangles;
        points = level.points;

        drawTriangles(context, triangles, points, zMin, zMax);
        // drawPoints(context, points, zMin, zMax, true);
    }, 3000);
}

function writePoints(points) {
    var str = "[\n";
    var i = 0;

    for(i=0; i < points.length; i++) {
            str += '{ "x" : ' + points[i][0] + ', "y" : ' + points[i][1] + ', ';
            str += '"z" : ' + points[i][2] + ' },\n';
    }
    str = str.substring(0, str.length-2);
    str += "\n]";
    fs.writeFile("test.txt", str, "utf8", callbackWrite);
}

// Initialization
var canvas = document.getElementById("canvas");
var width = canvas.width, height = canvas.height, zMin = 0, zMax = 10;
var context = canvas.getContext("2d");
var numberPoints = 10;
var points, convertPoints, triangles;
var level;

document.getElementById("test").onclick = function() {
    points = generatePoints(0, 0, zMin, width, height, zMax, numberPoints);
    //Just for testing we put a point equal to the first one
    points.push([ points[0][0], points[0][1], 99999 ]);
    writePoints(points);
};

canvas.addEventListener('mouseup', function(evt) {
    if(points === undefined) {
        return;
    }
    var mousePos = getMousePos(canvas, evt);
    var convertPos = [mousePos.x, mousePos.y];
    var result = level.findTriangle(convertPos);
    var height = level.findHeight(convertPos);

    drawTriangles(context, triangles, points, zMin, zMax);
    console.log(result);
    if(result !== false) {
        colorTriangle(context, result.triangle, points);
    }

}, false);
