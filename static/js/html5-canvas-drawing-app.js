
// Copyright 2010 William Malone (www.williammalone.com)
// Heavily modified for use by Patrick Ng and Clif Jordan
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/*jslint browser: true */
/*global G_vmlCanvasManager */

var drawingApp = (function () {

    "use strict";

    var canvas,
        context,
        canvaso,
        contexto,
        canvasWidth = 690,
        canvasHeight = 410,
        colorPink = "#EA3692",
        colorGreen = "#75C044",
        colorYellow = "#F6F243",
        colorBlue = "#00B5EF",
        colorRed = "#ED1848",
        colorBlack = "#000000",
        crayonTexturePink = new Image(),
        crayonTextureGreen = new Image(),
        crayonTextureYellow = new Image(),
        crayonTextureBlue = new Image(),
        crayonTextureRed = new Image(),
        crayonTextureBlack = new Image(),
        points = [],
        clickColor = [],
        clickTool = [],
        clickSize = [],
        clickDrag = [],
        paint = false,
        curColor = colorBlack,
        curTool = "crayon",
        curSize = "normal",
        mediumStartX = 18,
        mediumStartY = 19,
        mediumImageWidth = 93,
        mediumImageHeight = 46,
        drawingAreaX = 210,
        drawingAreaY = 72,
        drawingAreaWidth = 266,
        drawingAreaHeight = 266,
        totalLoadResources = 6,
        curLoadResNum = 0,

        // Clears the canvas.
        clearCanvas = function () {
            contexto.clearRect(0, 0, canvasWidth, canvasHeight);
        },

        // Redraws the canvas.
        redraw = function () {

            var radius,
                i;

            // Make sure required resources are loaded before redrawing
            if (curLoadResNum < totalLoadResources) {
                return;
            }

            // Set the drawing path
            context.beginPath();
            context.lineCap = "round";
            context.lineJoin = "round";

            // For each point drawn
            for (i = 0; i < points.length - 1; i++) {
                // Set the drawing radius
                switch (clickSize[i]) {
                case "small":
                    radius = 2;
                    break;
                case "normal":
                    radius = 5;
                    break;
                case "large":
                    radius = 10;
                    break;
                case "huge":
                    radius = 20;
                    break;
                default:
                    break;
                }

                context.lineWidth = radius;

                // If dragging then draw a line between the two points
                if (clickDrag[i] && i) {
                    context.moveTo(points[i - 1].x, points[i - 1].y);
                    var xc = (points[i - 1].x + points[i].x) / 2;
                    var yc = (points[i - 1].y + points[i].y) / 2;
                    context.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
                } else {
                    context.moveTo(points[i].x, points[i].y);
                    var xc = (points[i].x + points[i + 1].x) / 2;
                    var yc = (points[i].y + points[i + 1].y) / 2;
                    context.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
                }
                context.lineTo(points[i].x, points[i].y);

                // Set the drawing color
                if (curTool === "eraser") {
                    //context.globalCompositeOperation = "source-over";// To erase instead of draw over with white
                    context.restore();
                    //context.globalCompositeOperation = "destination-out"; // To erase instead of draw over with white
                    context.strokeStyle = 'white';
                } else if (curTool === "crayon") {
                    var texture;
                    switch(curColor) {
                        case colorPink:
                            texture = context.createPattern(crayonTexturePink, "repeat");
                            break;
                        case colorGreen:
                            texture = context.createPattern(crayonTextureGreen, "repeat");
                            break;
                        case colorYellow:
                            texture = context.createPattern(crayonTextureYellow, "repeat");
                            break;
                        case colorBlue:
                            texture = context.createPattern(crayonTextureBlue, "repeat");
                            break;
                        case colorRed:
                            texture = context.createPattern(crayonTextureRed, "repeat");
                            break;
                        default:
                            texture = context.createPattern(crayonTextureBlack, "repeat");
                    }
                    context.strokeStyle = texture;
                } else {
                    //context.globalCompositeOperation = "source-over";    // To erase instead of draw over with white
                    context.strokeStyle = clickColor[i];
                }
            }
            context.stroke();
            context.closePath();
        },

        // Adds a point to the drawing array.
        // @param x
        // @param y
        // @param dragging
        addClick = function (x, y, dragging) {
            points.push({
                x: x,
                y: y
            });
            clickTool.push(curTool);
            clickColor.push(curColor);
            clickSize.push(curSize);
            clickDrag.push(dragging);
        },

        clearClick = function() {
            points.length = 0;
            clickDrag.length = 0;
            clickColor.length = 0;
            clickSize.length = 0;
        },

        // Add mouse and touch event listeners to the canvas
        createUserEvents = function () {

            var press = function (e) {
                    var mouseX = e.pageX - this.offsetLeft,
                        mouseY = e.pageY - this.offsetTop;
                    paint = true;
                    addClick(mouseX, mouseY, false);
                    redraw();
                },

                drag = function (e) {
                    if (paint) {
                        addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
                        redraw();
                    }
                    // Prevent the whole page from dragging if on mobile
                    e.preventDefault();
                },

                release = function () {
                    paint = false;
                    update();
                };

            // Add mouse event listeners to canvas element
            canvas.addEventListener("mousedown", press, false);
            canvas.addEventListener("mousemove", drag, false);
            canvas.addEventListener("mouseup", release);

            if (Modernizr.touch) {
                // Add touch event listeners to canvas element
                canvas.addEventListener("touchstart", press, false);
                canvas.addEventListener("touchmove", drag, false);
                canvas.addEventListener("touchend", release, false);
            }

            // Add pointer events to canvas element
            if (window.navigator.msPointerEnabled) {
                canvas.addEventListener("MSPointerDown", press, false);
                canvas.addEventListener("MSPointerMove", drag, false);
                canvas.addEventListener("MSPointerUp", release, false);
            }

        },

        // Calls the redraw function after all neccessary resources are loaded.
        resourceLoaded = function () {
            curLoadResNum += 1;
            if (curLoadResNum === totalLoadResources) {
                redraw();
                createUserEvents();
            }
        },

        colorChooser = function() {
            switch(curColor) {
                case colorPink:
                    $('.active-tool').click().attr('class', 'active-tool').addClass('pink');
                    break;
                case colorGreen:
                    $('.active-tool').click().attr('class', 'active-tool').addClass('green');
                    break;
                case colorYellow:
                    $('.active-tool').click().attr('class', 'active-tool').addClass('yellow');
                    break;
                case colorBlue:
                    $('.active-tool').click().attr('class', 'active-tool').addClass('blue');
                    break;
                case colorRed:
                    $('.active-tool').click().attr('class', 'active-tool').addClass('red');
                    break;
                default:
                    $('.active-tool').click().attr('class', 'active-tool').addClass('black');
            }
        },

        update = function() {
            contexto.drawImage(canvas, 0, 0);
            context.clearRect(0, 0, canvasWidth, canvasHeight);
            clearClick();
        },

        // Creates a canvas element, loads images, adds events, and draws the canvas for the first time.
        init = function () {

            // Create the canvas (Neccessary for IE because it doesn't know what a canvas element is)
            canvas = document.createElement('canvas');
            canvas.setAttribute('width', canvasWidth);
            canvas.setAttribute('height', canvasHeight);
            canvas.setAttribute('id', 'canvas');
            canvas.style.border=('1px solid #333');
            // Create temp canvas to record the values to send to the background canvas
            canvaso = document.createElement('canvas');
            canvaso.setAttribute('width', canvasWidth);
            canvaso.setAttribute('height', canvasHeight);
            canvaso.setAttribute('id', 'canvas-view');
            canvaso.style.border=('1px solid #333');

            document.getElementById('canvasDiv').appendChild(canvas);
            document.getElementById('canvasDiv').appendChild(canvaso);
            if (typeof G_vmlCanvasManager !== "undefined") {
                canvas = G_vmlCanvasManager.initElement(canvas);
            }
            context = canvas.getContext("2d"); // Grab the 2d canvas context
            contexto = canvaso.getContext("2d");
            // Note: The above code is a workaround for IE 8 and lower. Otherwise we could have used:
            //     context = document.getElementById('canvas').getContext("2d");

            // Load images

            crayonTexturePink.onload = resourceLoaded;
            crayonTexturePink.src = "static/images/crayon-texture-pink.png";

            crayonTextureGreen.onload = resourceLoaded;
            crayonTextureGreen.src = "static/images/crayon-texture-green.png";

            crayonTextureYellow.onload = resourceLoaded;
            crayonTextureYellow.src = "static/images/crayon-texture-yellow.png";
            
            crayonTextureBlue.onload = resourceLoaded;
            crayonTextureBlue.src = "static/images/crayon-texture-blue.png";

            crayonTextureRed.onload = resourceLoaded;
            crayonTextureRed.src = "static/images/crayon-texture-red.png";
            
            crayonTextureBlack.onload = resourceLoaded;
            crayonTextureBlack.src = "static/images/crayon-texture-black.png";

            // Mouse Events for toolbox
            
            $('#pink').mousedown(function(e){
                curColor = colorPink;
                $('.active-tool').click().attr('class', 'active-tool').addClass('pink');
            });
            $('#green').mousedown(function(e){
                curColor = colorGreen;
                $('.active-tool').click().attr('class', 'active-tool').addClass('green');
                });
            $('#yellow').mousedown(function(e){
                curColor = colorYellow;
                $('.active-tool').click().attr('class', 'active-tool').addClass('yellow');
            });
            $('#blue').mousedown(function(e){
                curColor = colorBlue;
                $('.active-tool').click().attr('class', 'active-tool').addClass('blue');
            });
            $('#red').mousedown(function(e){
                curColor = colorRed;
                $('.active-tool').click().attr('class', 'active-tool').addClass('red');
            });
            $('#black').mousedown(function(e){
                curColor = colorBlack;
                $('.active-tool').click().attr('class', 'active-tool').addClass('black');
            });
            $('#small').mousedown(function(e){
                curSize = 'small';
                $(this).click().addClass('active-size').siblings().removeClass();
            });
            $('#normal').mousedown(function(e){
                curSize = 'normal';
                $(this).click().addClass('active-size').siblings().removeClass();
            });
            $('#large').mousedown(function(e){
                curSize = 'large';
                $(this).click().addClass('active-size').siblings().removeClass();
            });
            $('#huge').mousedown(function(e){
                curSize = 'huge';
                $(this).click().addClass('active-size').siblings().removeClass();
            });
            $('#crayon').mousedown(function(e){
                curTool = 'crayon';
                redraw();
                $('#crayon').click().addClass('crayon active-tool').siblings().removeClass();
                colorChooser();
            });
            $('#marker').mousedown(function(e){
                curTool = 'marker';
                redraw();
                $('#marker').click().addClass('marker active-tool').siblings().removeClass();
                colorChooser();
            });
            
            $('#eraser').mousedown(function(e){
                curTool = 'eraser';
                $('#eraser').click().addClass('eraser active-tool').siblings().removeClass();
            });
            
            $('#clear').mousedown(function(e){
                clearClick();
                clearCanvas();
            });           
        };

    return {
        init: init
    };
}());