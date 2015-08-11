/*jslint todo: true, browser: true, continue: true, white: true*/
/*global define*/
var triangulate = require("delaunay-triangulate");

var Leveler = function(file) {
    "use strict";
    var that = this;

    function pointOutsideBoundary(triangle, point) {
        return ((point[0] > triangle[0][0] && point[0] > triangle[1][0] &&
                point[0] > triangle[2][0]) || (point[0] < triangle[0][0] &&
                point[0] < triangle[1][0] && point[0] < triangle[2][0]) ||
               (point[1] > triangle[0][1] && point[1] > triangle[1][1] &&
                point[1] > triangle[2][1]) || (point[1] < triangle[0][1] &&
                point[1] < triangle[1][1] && point[1] < triangle[2][1]));
    }

    function dotProduct(v1, v2) {
        return v1[0] * v2[0] + v1[1] * v2[1];
    }

    //Return false if not in triangle, else { triangle, u, v }
    //u and v are the coefficient of the barycenter from the point 0 of
    // the triangle
    function pointInTriangle(triangle, point) {
        if(pointOutsideBoundary(triangle, point) === true) {
            return false;
        }

        //Algorithm from http://www.blackpawn.com/texts/pointinpoly/

        // 0 is A, 1 is B, 2 is C
        var vAC = [triangle[2][0] - triangle[0][0], triangle[2][1] - triangle[0][1]];
        var vAB = [triangle[1][0] - triangle[0][0], triangle[1][1] - triangle[0][1]];
        var vAP = [point[0] - triangle[0][0], point[1] - triangle[0][1]];

        var dotACAC = dotProduct(vAC, vAC), dotACAB = dotProduct(vAC, vAB);
        var dotACAP = dotProduct(vAC, vAP), dotABAB = dotProduct(vAB, vAB);
        var dotABAP = dotProduct(vAB, vAP);

        //Find barycenter coefficients
        var invDenominator = 1 / (dotACAC * dotABAB - dotACAB * dotACAB);
        var u = (dotABAB * dotACAP - dotACAB * dotABAP) * invDenominator;
        var v = (dotACAC * dotABAP - dotACAB * dotACAP) * invDenominator;

        if(u < 0 || v < 0 || (u + v > 1)) {
            return false;
        }

        return { triangle : triangle, u : u, v : v };
    }

    //triangle is the triangle with the coordinates of each point
    that.findTriangle = function(coordinate) {
        var i = 0;
        var result, triangle;
        for(i = 0; i < that.triangles.length; i++) {
            triangle = [
                that.points[that.triangles[i][0]],
                that.points[that.triangles[i][1]],
                that.points[that.triangles[i][2]]
            ];
            result = pointInTriangle(triangle, coordinate);
            if(result !== false) {
                // console.log(triangle);
                // console.log(result.triangle);
                // Have to return the indexes because miss a dimension here
                result.triangle = that.triangles[i];
                return result;
            }
        }
        return false;
    };

    that.findHeight = function(coordinate) {
        var triangle = that.findTriangle(coordinate);
        if(triangle === false) {
            return false;
        }
        //Recuperate the true points and calculate the height
        var tr = triangle.triangle, u = triangle.u, v = triangle.v;
        var a = that.realPoints[tr[0]],  b = that.realPoints[tr[1]];
        var c = that.realPoints[tr[2]];
        var height = a[2] + u * (c[2] - a[2]) + v * (b[2] - a[2]);
        console.log("[" + a[2] + ", " + b[2] + ", " + c[2] + "]");
        console.log(height);
        return height;
    };

    function convertPointsForTriangulation(points) {
        that.points = [];
        var i = 0;
        for(i=0; i < points.length; i++) {
            that.points.push([points[i][0], points[i][1]]);
        }
    }

    //Compare the two points, returns negative if a < b, 0 if a == b else positive
    function comparePosition(a, b) {
        return a[0] - b[0];
    }

    function pointsEqual(a, b) {
        return (a[0] === b[0] && a[1] === b[1]);
    }

    //XXX: later, it must be the file which is parse. For the moment this is
    //the points
    function parseFile(file) {
        var i = 0, hightest = 0;
        //XXX: file will be a file, not an array of points as now
        // file.sort(comparePosition);
        that.realPoints = file;  //TODO: change this is really the file here
        console.log(that.realPoints[0][0]);
        console.log(that.realPoints);

        // //Remove the points in the same place
        // for(i = 0; i < that.realPoints.length; i++) {
        //     while(i < that.realPoints.length - 1 &&
        //             pointsEqual(that.realPoints[i], that.realPoints[i+1]))
        //     {
        //         if(that.realPoints[i][2] !== that.realPoints[i+1][2]) {
        //             hightest = Math.max(that.realPoints[i][2],
        //                     that.realPoints[i+1][2]);
        //         }
        //         that.realPoints.splice(i+1, 0);
        //         that.realPoints[i][2] = hightest;
        //     }
        // }
        convertPointsForTriangulation(that.realPoints);
        console.log(that.points);
        return file;
    }

    parseFile(file);
    // that.points = parseFile(file);
    that.triangles = triangulate(that.points);

    for (var i=0; i < that.points.length; i++) {
        console.log("("+that.realPoints[i][0]+", "+that.realPoints[i][1]+", "+that.realPoints[i][2]+") ("+that.points[i][0]+", "+that.realPoints[i][1]+", "+that.points[i][2]+")");
    }
};

exports.Leveler = Leveler;
