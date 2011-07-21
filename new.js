(function (window, undefined){
(function(a){a=a||{};var b={},c,d;c=function(a,d,e){var f=a.halt=!1;a.error=function(a){throw a},a.next=function(c){c&&(f=!1);if(!a.halt&&d&&d.length){var e=d.shift(),g=e.shift();f=!0;try{b[g].apply(a,[e,e.length,g])}catch(h){a.error(h)}}return a};for(var g in b){if(typeof a[g]==="function")continue;(function(e){a[e]=function(){var g=Array.prototype.slice.call(arguments);if(e==="onError"){if(d){b.onError.apply(a,[g,g.length]);return a}var h={};b.onError.apply(h,[g,g.length]);return c(h,null,"onError")}g.unshift(e);if(!d)return c({},[g],e);a.then=a[e],d.push(g);return f?a:a.next()}})(g)}e&&(a.then=a[e]),a.call=function(b,c){c.unshift(b),d.unshift(c),a.next(!0)};return a.next()},d=a.addMethod=function(d){var e=Array.prototype.slice.call(arguments),f=e.pop();for(var g=0,h=e.length;g<h;g++)typeof e[g]==="string"&&(b[e[g]]=f);--h||(b["then"+d.substr(0,1).toUpperCase()+d.substr(1)]=f),c(a)},d("chain",function(a){var b=this,c=function(){if(!b.halt){if(!a.length)return b.next(!0);try{null!=a.shift().call(b,c,b.error)&&c()}catch(d){b.error(d)}}};c()}),d("run",function(a,b){var c=this,d=function(){c.halt||--b||c.next(!0)},e=function(a){c.error(a)};for(var f=0,g=b;!c.halt&&f<g;f++)null!=a[f].call(c,d,e)&&d()}),d("defer",function(a){var b=this;setTimeout(function(){b.next(!0)},a.shift())}),d("onError",function(a,b){var c=this;this.error=function(d){c.halt=!0;for(var e=0;e<b;e++)a[e].call(c,d)}})})(this);
    //Global constants
    var noop = function(){},
    epsilon = function(e){
        return (Math.abs(e) % 101) / 100;
    },
    sigma = function(s){
        return Math.abs(s);
    },
    getImage = function(aCanvas, url, callback) {
        var ctx = aCanvas.getContext('2d');
        var img = new Image();
        img.onerror = function () {
            throw new Error('Image load failed: ' + url);
        };
        img.onload = function () {
            ctx.drawImage(img, 0, 0, img.width, img.height);
            callback();
        };
        img.src = url;
    },
    getJson = function (src, callback) {
        var r = new XMLHttpRequest();
        r.open('GET', src, true);
        r.overrideMimeType('application/json');
        r.onerror = function () {
            throw new Error('JSON load failed: ' + src);
        };
        r.onload = function () {
            try {
                callback(JSON.parse(r.responseText));
            }
            catch (e) {
                throw new Error(e);
            }
        };
        r.send(null);
    },
    getScript = function (src, callback) {
        var s = window.document.createElement('script');
        s.type = 'text/javascript';
        s.onerror = function () {
            throw new Error('Script load failed: ' + src);
        };
        s.onload = function () {
            callback();
            window.document.head.removeChild(s);
        };
        s.src = src;
        window.document.head.appendChild(s);
    },
    Queue = function(num, callback){
        var that = this, list = [], getThread = (function(n){
            var worker = [], temp, setup = function (me) {
                temp = new Worker('slave.js');
                temp.onerror = function (event) {
                    throw new Error('Worker Thread Error' + event.message);
                };
                temp.onmessage = function (event) {
                    callback(event.data);
                    var data = that.pop();
                    if (data) {
                        this.postMessage(data);
                    }
                    else {
                        worker[me].status = true;
                    }
                };
                worker.push({'worker' : temp, 'status' : true});
            };
            while (n--) {
                setup(n);
            }
            return function () {
                var n = worker.length;
                while (n--) {
                    if (worker[n].status) {
                        worker[n].status = false;
                        return worker[n].worker;
                    }
                }
            };         
        })(num);
        Queue.prototype.push = function (data) {
            var worker = getThread();
            if (worker) {
                worker.postMessage(data);
            }
            else {
                list.push(data);
            }
        };
        Queue.prototype.pop = function () {
            return list.pop();
        };
    },
    putPixels2D = function(id, pixels) {
        var c = window.document.getElementById(id);
        var cCtx = c.getContext('2d');
        var img = cCtx.getImageData(0, 0, c.width, c.height);
        for (var i = 0, len = pixels.length; i < len; i++) {
            img.data[i] = pixels[i];
        }
        cCtx.putImageData(img, 0, 0);
    };
    var Sundae = window.Sundae = function(func){
        if(func && typeof(func) === 'function'){
            window.document.addEventListener('DOMContentLoaded', func, false);
        }
        else {
            throw new Error("Argument Type Mismatch: Sundae expected a function");
        }
    },
    sundae = window.sundae = function(divId){
        //Instance Variables
        var onRrunning, onImport, onAdd, onComplete,
        container = {}, 
        queue = new Queue(4, function(data){
            putPixels2D(data.id, data.pix);
        }),
        loading = 0, go = false, canStart(){
            return loading === 0;
        },
        tolerance = 0.05,
        blur = 2, 
        tests = [], 
        tag = 'all';
        //Initialization
        onRunning = onImport = onAdd = onComplete = noop;
        container = window.document.getElementById(divId);
        if(container && container instanceof HTMLDivElement){
            //Sundae Object
            var s = {
                noop: noop,
                addTest: function(obj){
                    if(obj && obj instanceof Object){
                        tests.push(obj);
                        onAdd();
                    }
                    else {
                        throw new Error("Argument Type Mismatch: addTest expected an Object");
                    }
                    return s;
                },
                addTests: function(arr){
                    if(arr && arr instanceof Array){
                        for(var i = 0, len = arr.length; i < len; i++){
                            s.addTest(arr[i]);
                        }
                    }
                    else {
                        throw new Error("Argument Type Mismatch: addTests expected an Array");
                    }
                    return s;
                },
                addTestFile: function(file){
                    if(file && typeof(file) === 'string'){
                        loading++;
                        run(function(){
                            getJson(file, function(data){
                                s.addTests(data);
                                onimport();
                            });
                        });
                    }
                    else {
                        throw new Error("Argument Type Mismatch: addTestFile expected a String");
                    }
                    return s;
                },
                setBlur: function(num){
                    if(num && !isNaN(num = parseInt(num))){
                        blur = sigma(num);
                    }
                    return s;
                },
                setTolerance: function(num){
                    if(num && !isNaN(num = parseInt(num))){
                        tolerance = epsilon(num);
                    }
                    return s;
                },
                setTag: function(str){
                    if(str){
                        tag = str + '';
                    }
                    return s;
                },
                addLibrary: function(lib){
                    if(lib && typeof(lib) === 'string'){
                        loading++;
                        run(function(){
                            getScript(lib, onImport);
                        });
                    }
                    else {
                        throw new Error("Argument Type Mismatch: addLibrary expected a String");
                    }
                    return s;
                },
                addLibraries: function(arr){
                    if(arr && arr instanceof Array){
                        for(var i = 0, len = arr.length; i < len; i++){
                            loading++;
                            run((function(me){
                                return function(){
                                    getScript(arr[me], onImport);
                                };
                            })(i));
                        }
                    }
                    else {
                        throw new Error("Argument Type Mismatch: addLibraries expected an Array");
                    }
                    return s;
                },
                onAdd: function(callback){
                    if(callback && typeof(callback) === 'function'){
                        onAdd = callback;
                    }
                    else {
                        throw new Error("Argument Type Mismatch: onReady expected a Function");
                    }
                    return s;
                },
                onImport: function(callback){
                    if(callback && typeof(callback) === 'function'){
                        onImport = callback;
                    }
                    else {
                        throw new Error("Argument Type Mismatch: onReady expected a Function");
                    }
                    return s;
                },
                onRunning: function(callback){
                    if(callback && typeof(callback) === 'function'){
                        onRunning = callback;
                    }
                    else {
                        throw new Error("Argument Type Mismatch: onRunning expected a Function");
                    }
                    return s;
                },
                onComplete: function(callback){
                    if(callback && typeof(callback) === 'function'){
                        onComplete = callback;
                    }
                    else {
                        throw new Error("Argument Type Mismatch: onComplete expected a Function");
                    }
                    return s;
                },
                getTags: function(){
                    var arr = [];
                    arr.push('all');
                    for(var i = 0, tag = undefined, len = tests.length; i < len; i ++){
                        tag = tests[i].tag;
                        if(tag){
                            arr.push(tag);
                        }
                    }
                    return arr;
                },
                getTests: function(){
                    return tests;
                },
                start: function(){
                    return s;
                }
            };
            return s;
        }
        else {
            throw new Error("Sundae Initialization: HTML Div Id not provided");
        }
    };
})(window);

