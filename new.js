(function (window, undefined){
    //Global constants
    var noop = function(){},
        epsilon = function(e){
            return (Math.abs(e) % 101) / 100;
        },
        sigma = function(s){
            return Math.abs(s);
        },
        isLoaded = function(obj, att) {
            if(obj[att] && obj[att] === true){
                return true;
            }
            return false;
        },
        canStart = function(obj){
            for(var i in obj){
                if(arr[i] === false){
                    return false;
                }
            }
            return true;
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
                    throw new Error('JSON was not valid: ' + src);
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
            var list = [], getThread = (function(n){
                var worker = [], temp, setup = function (me) {
                    temp = new Worker('slave.js');
                    temp.onerror = function (event) {
                        throw new Error('Worker Thread Error' + event.message);
                    };
                    temp.onmessage = function (event) {
                        callback(event.data);
                        var data = Queue.pop();
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
        };
    var Sundae = window.Sundae = function(divId){
        //Instance Variables
        var running, ready, complete, container, queue,
        tolerance, blur, tests, tag, files, start;
        //Initialization
        queue = container = {};
        tests = files = [];
        tolerance = 5; 
        blue = 2;
        tag = 'all';
        running = ready = complete = start = noop;
        return {
            noop: noop,
            addTest: function(obj){
                if(obj){
                    if(obj instanceof Object){
                        tests.push(obj);
                        if(canStart(files)){
                           start(); 
                        }
                        ready();
                    }
                    else {
                        throw new Error("Argument Type Mismatch: addTest expected an Object");
                    }
                }
                return this;
            },
            addTests: function(arr){
                if(arr){
                    if(arr instanceof Array){
                        for(var i = 0, len = arr.length; i < len; i++){
                            this.addTest(arr[i]);
                        }
                    }
                    else {
                        throw new Error("Argument Type Mismatch: addTests expected an Array");
                    }
                }
                return this;
            },
            addTestFile: function(file){
                if(file){
                    if(typeof(file) === 'string'){
                        if(!isLoaded(files, file)){
                            files[file] = false;
                            getJson(file, function(){
                                files[file] = true;
                                if(canStart(files)){
                                   start(); 
                                }	
                                this.addTests
                            });
                        }
                    }
                    else {
                        throw new Error("Argument Type Mismatch: addTestFile expected a String");
                    }
                }
                return this;
            },
            setBlur: function(num){
                if(num && !isNaN(num = parseInt(num))){
                    blur = sigma(num);
                }
                return this;
            },
            setTolerance: function(num){
                if(num && !isNaN(num = parseInt(num))){
                    tolerance = epsilon(num);
                }
                return this;
            },
            setTag: function(str){
                if(str){
                    tag = str + '';
                }
                return this;
            },
            addLibrary: function(lib){
                if(lib){
                    if(typeof(lib) === 'string'){
                        if(!isLoaded(files, lib)){
                            files[lib] = false;
                            getScript(lib, 
                            function(){
                                files[lib] = true;
                                if(canStart()){
                                   start(); 
                                }
                                ready();
                            });
                        }
                    }
                    else {
                        throw new Error("Argument Type Mismatch: addLibrary expected a String");
                    }
                }
                return this;
            },
            addLibraries: function(arr){
                if(arr){
                    if(arr instanceof Array){
                        for(var i = 0, len = arr.length; i < len; i++){
                            this.addLibrary(arr[i]);
                        }
                    }
                    else {
                        throw new Error("Argument Type Mismatch: addLibraries expected an Array");
                    }
                }
                return this;
            },
            onReady: function(callback){
                if(callback){
                    if(typeof(callback) === 'function'){
                        ready = callback;
                    }
                    else {
                        throw new Error("Argument Type Mismatch: onReady expected a Function");
                    }
                }
                return this;
            },
            onRunning: function(callback){
                if(callback){
                    if(typeof(callback) === 'function'){
                        running = callback;
                    }
                    else {
                        throw new Error("Argument Type Mismatch: onRunning expected a Function");
                    }
                }
                return this;
            },
            onComplete: function(callback){
                if(callback){
                    if(typeof(callback) === 'function'){
                        complete = callback;
                    }
                    else {
                        throw new Error("Argument Type Mismatch: onComplete expected a Function");
                    }
                }
                return this;
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
                queue = new Queue(4, noop);
                if(canStart(files)){
                    start();
                }
                else {
                    start = noop;   
                }
                return this;
            }
        };
    };
})(window);
