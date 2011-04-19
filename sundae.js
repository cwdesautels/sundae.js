/*!
 * Sundae Javascript Library v0.4
 * http://sundae.lighthouseapp.com/dashboard
 *
 * Copyright (c) 2011 Carlin Desautels
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * if Pix == null error
 * about:config
 * security.fileuri.strict_origin_policy == false
*/
var sundae = {};
(function (_w, undef) {
    //Enviroment variables
    var _tag = "all";
    var _sigma = 2;
    var _epsilon = 0.05;
    var _numWorkers = 4;
    var _loadedDeps = [];
    var _container;
    var _pool = {};
    var _queue = {};
    _queue.setup = function (){
        var list = [];
        _queue.push = function(data){
            var worker = _pool.getThread();
            if(worker)
                worker.postMessage(data);
            else
                list.push(data);
        };
        _queue.pop = function(){
            return list.pop();
        };
    };
    _pool.setup = function (n){
        var worker = [];
        _pool.getThread = function (){
            var n = worker.length;
            while (n--){
                if(worker[n].status){
                    worker[n].status = false;
                    return worker[n].worker;
                }
            }
        };
        var temp;
        while (n--){
            temp = new Worker("resources/slave.js");
            temp.onmessage = function (event){
                var pix = event.data;
                putPixels2D(pix.id, pix.pix);
                //Continue the process
                var data = _queue.pop();
                if(data)
                    this.postMessage(data);
                else if(worker[n])
                    worker[n].status = true;
            };
            worker.push({"worker":temp, "status":true});
        }
    };
    sundae.setBlurRadius = function(s){
        if(s)
            _sigma = Math.abs(+s);
    };
    sundae.setTolerance = function(e){
        if(e)
            _epsilon = (Math.abs(+e) % 101) / 100;
    };
    sundae.setTestTag = function(t){
        if(t)
            _tag = '' + t;
    };
    sundae.init = function(){
        var s = _w.document.getElementById("setup");
        _container = createDiv(_w.document.body, "sundae");
        var b = createButton(s ? s : _container, "showAll", "Hide All", function(){
            for(var i = 0, len = _container.childNodes.length; i < len; i++){
                if(_container.childNodes[i].type != "submit"){
                    if(b.innerHTML == "Show All"){
                        _container.childNodes[i].style.display = "block"
                    }
                    else{
                        _container.childNodes[i].style.display = "none"
                    }
                }
            }
            b.innerHTML = b.innerHTML == "Show All" ? "Hide all" : "Show All";
        });
        var f = createButton(s ? s : _container, "showFail", "Show Fails", function(){
            for(var i = 0, len = _container.childNodes.length; i < len; i++){
                if(_container.childNodes[i].type != "submit"){
                    for(var j = 0, dlen = _container.childNodes[i].childNodes.length; j < dlen; j++){
                        if(_container.childNodes[i].childNodes[j].id.search(/diff$/) > -1){
                            var pix = getPixels(_container.childNodes[i].childNodes[j], false);
                            if(pix[1] > 0){
                                _container.childNodes[i].style.display = "none";
                            }
                            else
                                _container.childNodes[i].style.display = "block";
                        }
                    }
                }
            }
            b.innerHTML = "Show All";
        });
        var p = createButton(s ? s : _container, "showFail", "Show Passes", function(){
            for(var i = 0, len = _container.childNodes.length; i < len; i++){
                if(_container.childNodes[i].type != "submit"){
                    for(var j = 0, dlen = _container.childNodes[i].childNodes.length; j < dlen; j++){
                        if(_container.childNodes[i].childNodes[j].id.search(/diff$/) > -1){
                            var pix = getPixels(_container.childNodes[i].childNodes[j], false);
                            if(pix[1] > 0){
                                _container.childNodes[i].style.display = "block";
                            }
                            else
                                _container.childNodes[i].style.display = "none";   
                        }
                    }
                }
            }
            b.innerHTML = "Show All";
        });
        //Tester starting point
        _queue.setup();
        _pool.setup(_numWorkers);
        getTests();     
    };
    function reportResult(r,t){
        r.innerHTML = t.name + ": [" + t.firstCanvas.time + "ms] vs " + "[" + t.secondCanvas.time + "ms]";
        if(t.note)
          r.innerHTML += " - " + t.note;
    }
    function setupTest(test, radius, tolerance){
        var name = test.name || "default";
        var d = createDiv(_container, name);
        var r = createDiv(d, name + "-title");
        var a = createCanvas(d, name + "-first", 100, 100);
        var b = createCanvas(d, name + "-second", 100, 100);
        var c = createCanvas(d, name + "-diff", 100, 100);
        test.firstCanvas.time = 3;
        test.secondCanvas.time = 3;
        function runTest(who, func){
            var startTime = (new Date).getTime();
            func();
            test[who + "Canvas"].time = (new Date).getTime() - startTime;
        }
        var isDone = {"first" : false, "second" : false};
        var whenDone = function(who){
            isDone[who] = true;
            if(isDone["first"] == true && isDone["second"] == true){
                reportResult(r, test);
                var pix = {};
                pix.a = getPixels(a, isWebgl(a));
                pix.b = getPixels(b, isWebgl(b));
                pix.c = getPixels(c, false);
                pix.aId = a.id;
                pix.bId = b.id; 
                pix.cId = c.id;
                pix.eps = (Math.abs(test.tolerance ? test.tolerance : tolerance ? tolerance : _epsilon) % 101) / 100;
                pix.sig = Math.abs(test.blurRadius ? test.blurRadius : radius ? radius : _sigma);
                pix.height = c.height;
                pix.width = c.width;
                _queue.push(pix);
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
                                _w[obj.run](aCanvas, function(){
                                    whenDone(who);
                                });
                            }
                        );
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
                        testObj(aCanvas, function(){
                            whenDone(who);
                        });
                    }
                );
            }
            else if(typeof(testObj) === "string"){
                runTest(who, 
                    function(){
                        _w[testObj](aCanvas, function(){
                            whenDone(who);
                        });
                    }
                );
            }
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
        var setupTests = function(tests, radius, tolerance){
            for(var j = 0; j < tests.length; j++){
                if(_tag == "all" || (_tag != "all" && tests[j].tag && tests[j].tag == _tag))
                    setupTest(tests[j], radius, tolerance);
            }
        };
        var setupTestSuites = function(data){
            if(data.testSuite){
                if(data.blurRadius)
                    sundae.setBlurRadius(data.blurRadius);
                if(data.tolerance)
                    sundae.setTolerance(data.tolerance);
                for(var i = 0; i < data.testSuite.length; i++){
                    if(data.testSuite[i].dependancyURL){
                        loadDeps(data.testSuite[i].dependancyURL, 
                            function(tests, radius, tol){
                                return function(){
                                    setupTests(tests, radius, tol);
                                };
                            }(data.testSuite[i].test, data.testSuite[i].blurRadius, data.testSuite[i].tolerance)
                        );
                    }
                    else{
                        setupTests(data.testSuite[i].test, data.testSuite[i].blurRadius, data.testSuite[i].tolerance);
                    }    
                }
            }
        };
        getJSON("resources/tests.json", setupTestSuites); 
    }
    //Global Utility Functions
    function putPixels2D(id, pixels){
        var c = _w.document.getElementById(id);
        var cCtx = c.getContext('2d');  
        var img = cCtx.getImageData(0, 0, c.width, c.height);
        for(var i = 0, len = pixels.length; i < len; i++){
            img.data[i] = pixels[i];
        }
        cCtx.putImageData(img, 0, 0);
    }
    function createButton(parent, id, text, callback){
        var b = _w.document.createElement("button");
        b.id = id;
        b.onclick=callback;
        b.innerHTML = text;
        parent.appendChild(b);
        return b;
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
                //_w.document.head.removeChild(s);
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
