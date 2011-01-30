/*!
 * Sundae Javascript Library v0.4
 * http://http://sundae.lighthouseapp.com/projects/68207-sundaejs/overview
 *
 * The MIT License
 * Copyright (c) 2011 
 * http://www.opensource.org/licenses/mit-license.php
*/
var sundae = {};
(function (window, undef) {
    //Enviroment variables
    var _kernel, _kernelSize, _kernelSum;
    var _tag = "a";
    var _sigma = 2;
    var _epsilon = 0.05;
    var _w = window;
    var _testSuite = [];

    sundae.setBlurRadius = function(s){
        if(s)
            _sigma = s;
    };
    sundae.setTolerance = function(e){
        if(e)
            _epsilon = e;
    };
    sundae.setTestTag = function(t){
        if(t)
            _tag = t;
    };
    sundae.init = function(){
        setupKernel();
        setupBody();
        getTests();     
    };
    function injestCurr(aCanvas, test){
        var startTime = (new Date).getTime(), totalTime = 0;
        try{
            test.body.run(aCanvas);
        }
        catch(e){
            throw (new error("Failed to render test"));
        }
        totalTime = (new Date).getTime() - startTime;
        if(test.expectedTime){
            if(totalTime > test.expectedTime){
                throw (new error("Failed: " + (totalTime - test.expectedTime) + "ms Too long"));
            }
        }
        return totalTime;
    }
    function injectOrig(aCanvas, url){
        if(url){
            try{
                var ctx = aCanvas.getContext("2d");
                var img = new Image();
                img.onload = function(){
                    ctx.drawImage(img, 0, 0, img.width, img.height);
                }
                img.src = url;
            }
            catch(e){
                throw (new error("Failed to load reference"));
            }
        }
        else{
            throw (new error("No reference"));
        }
    }
    function setupTest(test){
        var name = test.name || "default";
        var d = createDiv(_w.document.getElementById("sundae"), name);
        var a = createCanvas(d, name + "-orig", 100, 100);
        var b = createCanvas(d, name + "-curr", 100, 100);
        var c = createCanvas(d, name + "-diff", 100, 100);
        var t = 0;
        try{
            injectOrig(a, test.referenceImageURL);
            t = injectCurr(b);
        }
        catch(e){
            alert(e.name);
            alert(e.message);
        }
    }
    function createDiv(parent, id){
        var d = _w.document.createElement("div");
        d.id = id;
        d.style = "margin: 5px; padding-top: 10px;";
        parent.appendChild(d);
        return d;
    }
    function createCanvas(parent, id, h, w){
        var c = _w.document.createElement("canvas");
        c.id = id;
        c.width = w;
        c.height = h;
        parent.appendChild(c);
        return c;
    }
    function setupBody(){
        createDiv(_w.document.body, "sundae");
    }
    function getTests(){
        var setupTests = function(){
            _testSuite = testSuite;
            if(_testSuite){
                for(var i = 0, sl = _testSuite.length; i < sl; i++){
                    if(_testSuite[i].test){
                        for(var j = 0, tl = _testSuite[i].test.length; j < tl; j++){
                            var test = _testSuite[i].test[j];
                            var loadedStatus = false;
                            if(_testSuite[i].test[j].dependancyURL){
                                for(var m = 0, dl = _testSuite[i].test[j].dependancyURL.length; m < dl; m++){
                                    getScript(_testSuite[i].test[j].dependancyURL[m], 
                                        function(){
                                            if(m == dl && loadedStatus == false){
                                                loadedStatus = true;
                                                setupTest(test);
                                            }
                                        }
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }
        getScript("./resources/tests.js", setupTests); 
    }
    function getScript(url, callback){
        var s = _w.document.createElement('script');
        s.type = 'text/javascript';
        s.src = url;
        s.async = false;     
        s.onreadystatechange = s.onload = function(){
            var state = s.readyState;
            if(!state || /loaded|complete/.test(state)){
                callback();
            }
        }
        _w.document.head.appendChild(s);       
    }
    //Global Utility Functions
    function getPixels(aCanvas, isWebGL) {        
        try {
            if (isWebGL) {
                var context = aCanvas.getContext("experimental-webgl");  
                var data = null;
                try{
                    data = context.readPixels(0, 0, 100, 100, context.RGBA, context.UNSIGNED_BYTE);
                    if(context.getError()){
                        throw new Error("API has changed");                
                    }              
                }
                catch(e){             
                    data = new Uint8Array(100 * 100 * 4);
                    context.readPixels(0, 0, 100, 100, context.RGBA, context.UNSIGNED_BYTE, data);
                }
                return data;
            } 
            else {
                return aCanvas.getContext('2d').getImageData(0, 0, aCanvas.width, aCanvas.height).data;
            }
        } 
        catch (e) {
            return null;
        }
    }
    function compare(_a, _aWebGL, _b, _bWebGL, _c){
        var rc = true;
        var valueEpsilon = _epsilon * 255;
        //Get pixel arrays from canvases
        var _aPix = getPixels(_a, _aWebGL); 
        var _bPix = getPixels(_b, _bWebGL);
        //Blur pixel arrays
        _aPix = blur(_aPix, _aPix.width, _aPix.height); 
        _bPix = blur(_bPix, _bPix.width, _bPix.height);
        if(_aPix.length === _bPix.length){
            //Compare pixel arrays
            var _cCtx = _c.getContext('2d');
            var _cPix = _cCtx.createImageData(_c.width, _c.height);
            var len = _bPix.length;
            for (var j=0; j < len; j+=4){
                if (Math.abs(_bPix[j] - _aPix[j]) < valueEpsilon  &&
                    Math.abs(_bPix[j + 1] - _aPix[j + 1]) < valueEpsilon &&
                    Math.abs(_bPix[j + 2] - _aPix[j + 2]) < valueEpsilon &&
                    Math.abs(_bPix[j + 3] - _aPix[j + 3]) < valueEpsilon){
                    _cPix.data[j] = _cPix.data[j+1] = _cPix.data[j+2] = _cPix.data[j+3] = 0;
                } //Pixel difference in _c
                else{
                    _cPix.data[j] = 255;
                    _cPix.data[j+1] = _cPix.data[j+2] = 0;
                    _cPix.data[j+3] = 255;
                    rc = false;
                }
            }
            //Display pixel difference in _c
            if(rc){
                _cCtx.fillStyle = "rgb(0,255,0)";
                _cCtx.fillRect (0, 0, _c.width, _c.height);
            }
            else{
                _cCtx.putImageData(_cPix, 0, 0);
            }
        }
        else{
            rc = false;
        }
        return rc;
    }
    function setupKernel() {
        var ss = _sigma * _sigma;
        var factor = 2 * Math.PI * ss;
        _kernel = new Array();
        _kernel.push(new Array());
        var i = 0, j;
        do {
            var g = Math.exp(-(i * i) / (2 * ss)) / factor;
            if (g < 1e-3) break;
            _kernel[0].push(g);
            ++i;
        } while (i < 7);
        _kernelSize = i;
        for (j = 1; j < _kernelSize; ++j) {
            _kernel.push(new Array());
            for (i = 0; i < _kernelSize; ++i) {
                var g = Math.exp(-(i * i + j * j) / (2 * ss)) / factor;
                _kernel[j].push(g);
            }
        }
        _kernelSum = 0;
        for (j = 1 - _kernelSize; j < _kernelSize; ++j) {
            for (i = 1 - _kernelSize; i < _kernelSize; ++i) {
                _kernelSum += _kernel[Math.abs(j)][Math.abs(i)];
            }
        }
    }
    function blur(data, width, height) {
        var len = data.length;
        var newData = new Array(len);
        for (var y = 0; y < height; ++y) {
            for (var x = 0; x < width; ++x) {
                var r = 0, g = 0, b = 0, a = 0;
                for (j = 1 - _kernelSize; j < _kernelSize; ++j) {
                    if (y + j < 0 || y + j >= height) continue;
                    for (i = 1 - _kernelSize; i < _kernelSize; ++i) {
                        if (x + i < 0 || x + i >= width) continue;
                        r += data[4 * ((y + j) * width + (x + i)) + 0] * _kernel[Math.abs(j)][Math.abs(i)];
                        g += data[4 * ((y + j) * width + (x + i)) + 1] * _kernel[Math.abs(j)][Math.abs(i)];
                        b += data[4 * ((y + j) * width + (x + i)) + 2] * _kernel[Math.abs(j)][Math.abs(i)];
                        a += data[4 * ((y + j) * width + (x + i)) + 3] * _kernel[Math.abs(j)][Math.abs(i)];
                    }
                }
                newData[4 * (y * width + x) + 0] = r / _kernelSum;
                newData[4 * (y * width + x) + 1] = g / _kernelSum;
                newData[4 * (y * width + x) + 2] = b / _kernelSum;
                newData[4 * (y * width + x) + 3] = a / _kernelSum;               
            }
        }
        return newData;
    }
})(window);
