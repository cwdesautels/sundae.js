/*
 Copyright (C) 2007 Apple Inc.  All rights reserved.
 Copyright (C) 2010 Mozilla Foundation

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions
 are met:
 1. Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
 2. Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.

 THIS SOFTWARE IS PROVIDED BY APPLE COMPUTER, INC. ``AS IS'' AND ANY
 EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE COMPUTER, INC. OR
 CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 
*/
onerror = function (event) {
    throw event.message;
};
onmessage = function (event) {
    postMessage(event.data);
};
/*var sigma = 10; // radius
var kernel, kernelSize, kernelSum;
buildKernel();

try {
// Opera createImageData fix
if (!("createImageData" in CanvasRenderingContext2D.prototype)) {
    CanvasRenderingContext2D.prototype.createImageData = function(sw,sh) { return this.getImageData(0,0,sw,sh); }
}
} catch(e) {}

function buildKernel() {
var ss = sigma * sigma;
var factor = 2 * Math.PI * ss;
kernel = [];
kernel.push([]);
var i = 0, j;
do {
    var g = Math.exp(-(i * i) / (2 * ss)) / factor;
    if (g < 1e-3) break;
    kernel[0].push(g);
    ++i;
} while (i < 7);
kernelSize = i;
for (j = 1; j < kernelSize; ++j) {
    kernel.push([]);
    for (i = 0; i < kernelSize; ++i) {
        var g = Math.exp(-(i * i + j * j) / (2 * ss)) / factor;
        kernel[j].push(g);
    }
}
kernelSum = 0;
for (j = 1 - kernelSize; j < kernelSize; ++j) {
    for (i = 1 - kernelSize; i < kernelSize; ++i) {
        kernelSum += kernel[Math.abs(j)][Math.abs(i)];
    }
}
}

function blurTest() {
var results = document.getElementById('blur-result');
results.innerHTML = "Running test...";

window.setTimeout(function() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var img = document.getElementById('image')
    ctx.drawImage(img, 0, 0, img.width, img.height);

    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var width = imgData.width, height = imgData.height;
    var data = imgData.data;

    var len = data.length;
    var startTime = (new Date()).getTime();

    for (var y = 0; y < height; ++y) {
    for (var x = 0; x < width; ++x) {
        var r = 0, g = 0, b = 0, a = 0;
        for (j = 1 - kernelSize; j < kernelSize; ++j) {
        if (y + j < 0 || y + j >= height) continue;
        for (i = 1 - kernelSize; i < kernelSize; ++i) {
            if (x + i < 0 || x + i >= width) continue;
            r += data[4 * ((y + j) * width + (x + i)) + 0] * kernel[Math.abs(j)][Math.abs(i)];
            g += data[4 * ((y + j) * width + (x + i)) + 1] * kernel[Math.abs(j)][Math.abs(i)];
            b += data[4 * ((y + j) * width + (x + i)) + 2] * kernel[Math.abs(j)][Math.abs(i)];
            a += data[4 * ((y + j) * width + (x + i)) + 3] * kernel[Math.abs(j)][Math.abs(i)];
        }
        }
        data[4 * (y * width + x) + 0] = r / kernelSum;
        data[4 * (y * width + x) + 1] = g / kernelSum;
        data[4 * (y * width + x) + 2] = b / kernelSum;
        data[4 * (y * width + x) + 3] = a / kernelSum;
    }
    }
    var finishTime = Date.now() - startTime;
    for (var i = 0; i < data.length; i++) {
        imgData.data[i] = data[i];
    }
    //imgData.data = data;
    ctx.putImageData(imgData, 0, 0);
    results.innerHTML = "Finished: " + finishTime + "ms";
}, 10);
}*/