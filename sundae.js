/*!
 * Sundae Javascript Library v0.4
 * http://sundae.lighthouseapp.com/dashboard
 *
 * The MIT License
 * Copyright (c) 2011 Carlin Desautels
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
            var testObj = eval(run);
            var startTime = 0;
            if(typeof(testObj) === "function"){
                startTime = (new Date).getTime();
                testObj(aCanvas);
            }
            else if(typeof(testObj) === "object"){
                startTime = (new Date).getTime();
                getScript(testObj.src, function(){_w[testObj.func](aCanvas);}); 
            }
            t = (new Date).getTime() - startTime;
            defer(500).thenRun(function(){compare(a, b, c);reportResult(r,t,e);});
        };
        var injectOrig = function(aCanvas, url){
            var ctx = aCanvas.getContext("2d");
            var img = new Image();
            img.onload = function(){
                ctx.drawImage(img, 0, 0, img.width, img.height);
                injectCurr(b, test.run);
            }
            img.src = url;
        };
        //Fill Canvases
        injectOrig(a, test.referenceImageURL);
    }
    function createDiv(parent, id){
        var d = _w.document.createElement("div");
        d.id = id;
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
        var setupTests = function(data, validJson){
            _testSuite = data.testSuite || undef;
            _deps = {};
            if(_testSuite){
                for(var i = 0, sl = _testSuite.length; i < sl; i++){
                    if(_testSuite[i].test){
                        for(var j = 0, tl = _testSuite[i].test.length; j < tl; j++){
                            if(_testSuite[i].test[j].dependancyURL){//starting of sync nightmare
                                for(var m = 0, dl = _testSuite[i].test[j].dependancyURL.length; m < dl; m++){
                                    _deps[_testSuite[i].test[j].dependancyURL[m]] = false;
                                }
                                for (var x in _deps){
                                    load(_deps[x]).thenRun(
                                        function(_dep){
                                            return function(){_dep = true;};
                                        }(_deps[x])
                                    );
                                }
                            }
                            defer(500).thenRun(
                                function(_test){
                                    return function(){setupTest(_test)};
                                }(_testSuite[i].test[j])
                            );
                        }
                    }
                }
            }
            else{
                alert("no test suite: " + _data);
            }
        }
        getScript("resources/tests.json", setupTests, true); 
    }
    function getScript(src, success, isJSON){
        if(isJSON){
            var r = new XMLHttpRequest();
            r.open("GET", src, true);
            r.overrideMimeType("application/json");
            r.onload = function(){
                try{
                    success(JSON.parse(r.responseText));
                }
                catch(e){
                    //Not valid JSON
                    //success(eval("(" + r.responseText + ")"));
                }
            };
            r.send(null);
        }
        else{
            var s = _w.document.createElement('script');
		    s.type = 'text/javascript';
		    s.onload = function(){
                success();
            };
		    s.src = src;
            _w.document.head.appendChild(s);
        }      
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
                return aCanvas.getContext('2d').getImageData(0, 0, aCanvas.width, aCanvas.height).data;
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
    //load.js
    /* Copyright (c) 2010 Chris O'Hara <cohara87@gmail.com>. MIT Licensed */
    function loadScript(a,b,c){var d=document.createElement("script");d.type="text/javascript",d.src=a,d.onload=b,d.onerror=c,d.onreadystatechange=function(){var a=this.readyState;if(a==="loaded"||a==="complete")d.onreadystatechange=null,b()},head.insertBefore(d,head.firstChild)}(function(a){a=a||{};var b={},c,d;c=function(a,d,e){var f=a.halt=!1;a.error=function(a){throw a},a.next=function(c){c&&(f=!1);if(!a.halt&&d&&d.length){var e=d.shift(),g=e.shift();f=!0;try{b[g].apply(a,[e,e.length,g])}catch(h){a.error(h)}}return a};for(var g in b){if(typeof a[g]==="function")continue;(function(b){a[b]=function(){var e=Array.prototype.slice.call(arguments);e.unshift(b);if(!d)return c({},[e],b);a.then=a[b],d.push(e);return f?a:a.next()}})(g)}e&&(a.then=a[e]),a.call=function(b,c){c.unshift(b),d.unshift(c),a.next(!0)};return a.next()},d=a.addMethod=function(d){var e=Array.prototype.slice.call(arguments),f=e.pop();for(var g=0,h=e.length;g<h;g++)typeof e[g]==="string"&&(b[e[g]]=f);--h||(b["then"+d[0].toUpperCase()+d.substr(1)]=f),c(a)},d("run",function(a,b){var c=this,d=function(){c.halt||(--b||c.next(!0))};for(var e=0,f=b;!c.halt&&e<f;e++)null!=a[e].call(c,d,c.error)&&d()}),d("defer",function(a){var b=this;setTimeout(function(){b.next(!0)},a.shift())}),d("onError",function(a,b){var c=this;this.error=function(d){c.halt=!0;for(var e=0;e<b;e++)a[e].call(c,d)},this.next(!0)})})(this),addMethod("load",function(a,b){for(var c=[],d=0;d<b;d++)(function(b){c.push(function(c,d){loadScript(a[b],c,d)})})(d);this.call("run",c)});var head=document.getElementsByTagName("head")[0]||document.documentElement    
})(window);
