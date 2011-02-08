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
    function reportResult(r,t){
        r.innerHTML = (" [" + t + "ms]");
    }
    function setupTest(test){
        var name = test.name || "default";
        var d = createDiv(_w.document.getElementById("sundae"), name);
        var r = createDiv(d, name + "-title");
        var a = createCanvas(d, name + "-orig", 100, 100);
        var b = createCanvas(d, name + "-curr", 100, 100);
        var c = createCanvas(d, name + "-diff", 100, 100);
        var t = 0;
        var injectCurr = function(aCanvas, run){
            var startTime = (new Date).getTime(), totalTime = 0;
            //try{
                run(aCanvas);
            //}
            //catch(e){
            //    throw (new error("Failed to render test"));
            //}
            return (new Date).getTime() - startTime;
        };
        var injectOrig = function(aCanvas, url){
            //if(url){
                var ctx = aCanvas.getContext("2d");
                var img = new Image();
                img.onload = function(){
                    ctx.drawImage(img, 0, 0, img.width, img.height);
                    t = injectCurr(b, test.body.run);
                    compare(a, b, c);
                    reportResult(r,t,e);
                }
                img.src = url;
            //}
                //catch(e){
                //    throw (new error("Failed to load reference"));
                //}
            //else{
            //    var ctx = aCanvas.getContext("experimental-webgl");
            //    ctx.clearColor(0, 0, 0, 1);
            //    ctx.clear(ctx.COLOR_BUFFER_BIT);
            //
            //}
        };
        //Fill Canvases
        injectOrig(a, test.referenceImageURL);
    }
    function createDiv(parent, id){
        var d = _w.document.createElement("div");
        d.id = id;
        //Not working
        //d.style = "margin: 5px; padding-top: 10px;";
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
                            if(_testSuite[i].test[j].dependancyURL){//starting of sync nightmare
                                //for(var m = 0, dl = _testSuite[i].test[j].dependancyURL.length; m < dl; m++){
                                    //getScript(_testSuite[i].test[j].dependancyURL[m],
                                    alert("Asd");
                                    getScript(_testSuite[i].test[j].dependancyURL,
                                        function(_test){
                                            var test = _test;
                                            //This async code is breaking my brain
                                            return function(){setupTest(test);};
                                        }(_testSuite[i].test[j])
                                    );
                                //}
                            }
                            else{
                                setupTest(_testSuite[i].test[j]);
                            }
                        }
                    }
                }
            }
        }
        getScript("resources/tests.js", setupTests); 
    }
    function getScript(src, callback){
        var s = _w.document.createElement('script');
        s.type = 'text/javascript';
        s.onload = callback;
        s.onreadystatechange = function(){
            var state = this.readyState;
            if(state === 'loaded' || state === 'complete'){
                this.onreadystatechage = undef;
                this.onload();
            }
        }
        s.src = src;
        _w.document.head.appendChild(s);             
    }
    //Global Utility Functions
    function getPixels(aCanvas, isWebGL) {        
        try {
            if (isWebGL) {
                var context = aCanvas.getContext("experimental-webgl");  
                var data = null;
                try{
                    // try deprecated way first 
                    data = context.readPixels(0, 0, aCanvas.width, aCanvas.height, context.RGBA, context.UNSIGNED_BYTE);
                    // Chrome posts an error
                    if(context.getError()){
                        throw new Error("API has changed");                
                    }              
                }
                catch(e){
                    // if that failed, try new way
                    if(!data){             
                        data = new Uint8Array(aCanvas.width * aCanvas.height * 4);
                        context.readPixels(0, 0, aCanvas.width, aCanvas.height, context.RGBA, context.UNSIGNED_BYTE, data);
                    }
                }
                return data;
            } 
            else {
                try{
                    return aCanvas.getContext('2d').getImageData(0, 0, aCanvas.width, aCanvas.height).data;
                }
                catch(e){
                    netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
                    return aCanvas.getContext('2d').getImageData(0, 0, aCanvas.width, aCanvas.height).data;
                }
            }
        } 
        catch (e) {
            return null;
        }
    }
    function compare(a, b, c){
        var failed = false;
        var valueEpsilon = _epsilon * 255;
        //Get pixel arrays from canvases
        var aPix = getPixels(a, false); 
        var bPix = getPixels(b, true);
        //Blur pixel arrays
        //aPix = blur(aPix, aPix.width, aPix.height); 
        //bPix = blur(bPix, bPix.width, bPix.height);
        if(aPix.length === bPix.length){
            //Compare pixel arrays
            var cCtx = c.getContext('2d');
            var cPix = cCtx.createImageData(c.width, c.height);
            var len = bPix.length;
            for (var j=0; j < len; j+=4){
                if (Math.abs(bPix[j] - aPix[j]) < valueEpsilon  &&
                    Math.abs(bPix[j + 1] - aPix[j + 1]) < valueEpsilon &&
                    Math.abs(bPix[j + 2] - aPix[j + 2]) < valueEpsilon &&
                    Math.abs(bPix[j + 3] - aPix[j + 3]) < valueEpsilon){
                    cPix.data[j] = cPix.data[j+1] = cPix.data[j+2] = cPix.data[j+3] = 0;
                } //Pixel difference in c
                else{
                    cPix.data[j] = 255;
                    cPix.data[j+1] = cPix.data[j+2] = 0;
                    cPix.data[j+3] = 255;
                    failed = true;                 
                }
            }
            //Display pixel difference in _c
            if(failed){
                cCtx.putImageData(cPix, 0, 0);
            }
            else{
                cCtx.fillStyle = "rgb(0,255,0)";
                cCtx.fillRect (0, 0, c.width, c.height);
            }
        }
        else{
            failed = true;
        }
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
    // Opera createImageData fix
    try {
        if (!("createImageData" in CanvasRenderingContext2D.prototype)) {
            CanvasRenderingContext2D.prototype.createImageData = function(sw,sh) { return this.getImageData(0,0,sw,sh); }
        }
    } catch(e) {}
})(window);
