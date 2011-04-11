/*!
 * Sundae Javascript Library v0.4
 * http://sundae.lighthouseapp.com/dashboard
 *
 * The MIT License
 * Copyright (c) 2011 Carlin Desautels
 * http://www.opensource.org/licenses/mit-license.php
*/
var sundae = {};
(function (_w, undef) {
    //Enviroment variables
    var _kernel, _kernelSize, _kernelSum;
    var _tag = "all";
    var _sigma = 2;
    var _epsilon = 0.05;
    var _delay = 0;
    var _loadedDeps = [];
    var _container;
    var _showBlur = false;
    var _compareWorker = new Worker("resources/compare.js");
    _compareWorker.onmessage = function (event) {
        if(_showBlur){
            putPixels(event.data.aId, event.data.a);
            putPixels(event.data.bId, event.data.b);
        }
        putPixels(event.data.cId, event.data.c);
    };
    var _blurWorker = new Worker("resources/blur.js");
    _blurWorker.onmessage = function (event) {
        _compareWorker.postMessage(event.data);
    };
    var _kernelBuilder = new Worker("resources/kernel.js");
    _kernelBuilder.onmessage = function (event) {
        _blurWorker.postMessage(event.data);
    };
    sundae.setBlurRadius = function(s){
        if(s)
            _sigma = Math.abs(+s);
    };
    sundae.setTolerance = function(e){
        if(e)
            _epsilon = (Math.abs(+e) % 101) / 100;
    };
    sundae.setShowBlur = function (b){
        _showBlur = !!b;
    };
    sundae.setTestTag = function(t){
        if(t)
            _tag = '' + t;
    };
    sundae.setDelay = function(d){
        if(d)
            _delay = Math.abs(+d);
    };
    sundae.init = function(){
        //Tester starting point
        _container = createDiv(_w.document.body, "sundae");
        getTests();     
    };
    function reportResult(r,t){
        r.innerHTML = t.name + ": [" + t.firstCanvas.time + "ms] vs " + "[" + t.secondCanvas.time + "ms]";
        if(t.note)
          r.innerHTML += " - " + t.note;
    }
    function setupTest(test){
        var name = test.name || "default";
        var d = createDiv(_container, name);
        var r = createDiv(d, name + "-title");
        var a = createCanvas(d, name + "-first", 100, 100);
        var b = createCanvas(d, name + "-second", 100, 100);
        var c = createCanvas(d, name + "-diff", 100, 100);
        test.firstCanvas.time = 0;
        test.secondCanvas.time = 0;
        function runTest(who, func){
            var startTime = (new Date).getTime();
            func();
            test[who + "Canvas"].time = (new Date).getTime() - startTime;
        }
        var isDone = {"first" : false, "second" : false};
        var whenDone = function(who){
            isDone[who] = true;
            if(isDone["first"] == true && isDone["second"] == true){
                //if Pix == null error
                //about:config
                //security.fileuri.strict_origin_policy == false
                reportResult(r, test);
                var pix = {};
                pix.a = getPixels(a, isWebgl(a));
                pix.b = getPixels(b, isWebgl(b));
                pix.c = getPixels(c, false);
                pix.aId = a.id;
                pix.bId = b.id; 
                pix.cId = c.id;
                pix.eps = _epsilon * 255;
                pix.sig = _sigma;
                pix.height = c.height;
                pix.width = c.width;
                _w.setTimeout(
                    function(){
                        _kernelBuilder.postMessage(pix);
                        //_blurWorker.postMessage(pix);
                        //_compareWorker.postMessage(pix);
                    }, _delay
                );
            }
        };
        function sourceLoader(obj, aCanvas, who){
            if(obj.src.type === "image"){
                getImage(aCanvas, obj.src.url, 
                    function(){
                        whenDone(who);
                    }
                );    
            }
            else if(obj.src.type === "script"){
                getScript(obj.src.url, 
                    function(){
                        runTest(who,
                            function(){
                                _w[obj.run](aCanvas);
                            }
                        );
                        whenDone(who);
                    }
                );
            }
            else if(obj.src.type === "json"){
                getJSON(obj.src.url,
                    function(data){
                        sourceRunner(data[obj.run], aCanvas, who);
                    }
                );
            }
        }
        function sourceRunner(obj, aCanvas, who){
            var testObj = eval(obj);
            if(typeof(testObj) === "function"){
                runTest(who, 
                    function(){
                        testObj(aCanvas);
                    }
                );
            }
            else if(typeof(testObj) === "string"){
                runTest(who, 
                    function(){
                        _w[testObj](aCanvas);
                    }
                );
            }
            whenDone(who);
        }
        if(test.firstCanvas.src){
            sourceLoader(test.firstCanvas, a, "first");
        }
        else if(test.firstCanvas.run){
            sourceRunner(test.firstCanvas.run, a, "first");
        }
        if(test.secondCanvas.src){
            sourceLoader(test.secondCanvas, b, "second");
        }
        else if(test.secondCanvas.run){
            sourceRunner(test.secondCanvas.run, b, "second");
        }
    }
    function getTests(){
        var loadDeps = function(deps, callback){
            var totalLen = 0, totalLoaded = 0;
            var allDepsLoaded = function(){
                totalLoaded++;
                if(totalLen === totalLoaded)
                    callback();
            };
            if(typeof(deps) === 'object'){
                totalLen = deps.length;
                for(var i = 0; i < deps.length; i++){
                    getScript(deps[i], allDepsLoaded);
                }
            }
            else if(typeof(deps) === 'string'){
                getScript(deps, callback);
            }
        };
        var setupTests = function(tests){
            for(var j = 0; j < tests.length; j++){
                if(_tag == "all" || (_tag != "all" && tests[j].tag && tests[j].tag == _tag))
                    setupTest(tests[j]);
            }
        };
        var setupTestSuites = function(data){
            if(data.testSuite){
                for(var i = 0; i < data.testSuite.length; i++){
                    if(data.testSuite[i].dependancyURL){
                        loadDeps(data.testSuite[i].dependancyURL, 
                            function(tests){
                                return function(){
                                    setupTests(tests);
                                };
                            }(data.testSuite[i].test)
                        );
                    }
                    else{
                        setupTests(data.testSuite[i].test);
                    }    
                }
            }
        };
        getJSON("resources/tests.json", setupTestSuites); 
    }
    //Global Utility Functions
    function putPixels(id, pixels){
        var c = _w.document.getElementById(id);
        if(isWebgl(c)){
            var gl = c.getContext('experimental-webgl');
            gl.texImage2D(gl.TEXTURE_2D, 0, 0, 0, c.width, c.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels); 
        }
        else {
            var cCtx = c.getContext('2d');  
            var img = cCtx.getImageData(0, 0, c.width, c.height);
            for(var i = 0, len = pixels.length; i < len; i++){
                img.data[i] = pixels[i];
            }
            cCtx.putImageData(img, 0, 0);
        }
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
    function isWebgl(aCanvas){
        var contexts = ["webgl","experimental-webgl","moz-webgl","webkit-3d"];
        var rc = false;
        for (var i = 0; !rc && i < contexts.length; i++){
            try{
                rc = aCanvas.getContext(contexts[i]);
            }
            catch(e){}
        }
        return rc;
    }
    function isLoaded(src){
        if(_loadedDeps.indexOf(src) == -1){
            _loadedDeps.push(src);
            return false;
        }
        else
            return true;
    }
    function getImage(aCanvas, url, callback){
        var ctx = aCanvas.getContext("2d");
        var img = new Image();
        img.onload = function(){
            ctx.drawImage(img, 0, 0, img.width, img.height);
            callback();
        }
        img.src = url;
    }
    function getJSON(src, callback){
        if(!isLoaded(src)){
            var r = new XMLHttpRequest();
            r.open("GET", src, true);
            r.overrideMimeType("application/json");
            r.onload = function(){
                try{
                    callback(JSON.parse(r.responseText));
                }
                catch(e){
                    //Not valid JSON
                    callback(eval("(" + r.responseText + ")"));
                }
            };
            r.send(null);
        }
    }
    function getScript(src, callback){
        if(!isLoaded(src)){
            var s = _w.document.createElement('script');
            s.type = 'text/javascript';
            s.onload = function(){
                callback();
                _w.document.head.removeChild(s);
            };
            s.src = src;
            _w.document.head.appendChild(s);
        }
    }
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
    // Opera createImageData fix
    try {
        if (!("createImageData" in CanvasRenderingContext2D.prototype)) {
            CanvasRenderingContext2D.prototype.createImageData = function(sw,sh) { return this.getImageData(0,0,sw,sh); }
        }
    } catch(e) {}
})(window);
