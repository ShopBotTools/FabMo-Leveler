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

    that.findTriangle = function(/* triangles, points, */ coordinate) {
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
                result.triangle = that.triangles[i];
                return result;
            }
        }
        return false;
    };

    //XXX: later, it must be the file which is parse. For the moment this is
    //the points
    function parseFile(file) {
        return file;
    }

    that.points = parseFile(file);
    that.triangles = triangulate(that.points);
};

exports.Leveler = Leveler;
