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
onmessage = function (event) {
    kernelBuilder(event.data);
};
function kernelBuilder(pix){
    //Globals
    var kernel, kernelSize, kernelSum;
    //Utility Functions
    function buildKernel() {
        var ss = pix.sig * pix.sig;
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
    //Build kernel
    if(pix.sig){
        buildKernel();
        pix.kernel = kernel;
        pix.kernelSize = kernelSize;
        pix.kernelSum = kernelSum;
    }
    //Throw the work somewhere else
    postMessage(pix);
}