(function (window, undefined){
    //Global constants
    var noop = function(){},
        error = function(str){throw new Error(str);},
        epsilon = function(e){
            return (Math.abs(e) % 101) / 100;
        },
        sigma = function(s){
            return Math.abs(s);
        },
        isLoaded = function(src, arr) {
            if (arr.indexOf(src) === -1) {
                arr.push(src);
                return false;
            }
            else {
                return true;
            }
        },
        getJson = function (src, callback) {
            var r = new XMLHttpRequest();
            r.open('GET', src, true);
            r.overrideMimeType('application/json');
            r.onerror = function () {
                error('JSON load failed: ' + src);
            };
            r.onload = function () {
                try {
                    callback(JSON.parse(r.responseText));
                }
                catch (e) {
                    error('JSON was not valid: ' + src);
                }
            };
            r.send(null);
        },
        getScript = function (src, callback) {
            var s = window.document.createElement('script');
            s.type = 'text/javascript';
            s.onerror = function () {
                error('Script load failed: ' + src);
            };
            s.onload = function () {
                callback();
                window.document.head.removeChild(s);
            };
            s.src = src;
            window.document.head.appendChild(s);
        };
    var Sundae = window.Sundae = function(divId){
        //Instance Variables
        var running, ready, complete,
        tolerance, blur, tests, tag, files;
        //Initialization
        tests = files = [];
        tolerance = 5; 
        blue = 2;
        tag = 'all';
        running = ready = complete = noop;
        return {
            addTest: function(obj){
                if(obj && obj instanceof Object){
                    tests.push(obj);
                    ready();
                }
                else {
                    error("Argument Type Mismatch: addTest expected an Object");
                }
                return this;
            },
            addTests: function(arr){
                if(arr && arr instanceof Array){
                    for(var i = 0, len = arr.length; i < len; i++){
                        this.addTest(arr[i]);
                    }
                }
                else {
                    error("Argument Type Mismatch: addTests expected an Array");
                }
                return this;
            },
            addTestFile: function(file){
                if(file && typeof(file) === 'string'){
                    if(!isLoaded(file, files)){
                        getJson(file, this.addTests);
                    }
                }
                else {
                    error("Argument Type Mismatch: addTestFile expected a String");
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
                if(lib && typeof(lib) === 'string'){
                    if(!isLoaded(lib, files)){
                        getScript(lib, ready);
                    }
                }
                else {
                    error("Argument Type Mismatch: addLibrary expected a String");
                }
                return this;
            },
            addLibraries: function(arr){
                if(arr && arr instanceof Array){
                    for(var i = 0, len = arr.length; i < len; i++){
                        this.addLibrary(arr[i]);
                    }
                }
                else {
                    error("Argument Type Mismatch: addLibraries expected an Array");
                }
                return this;
            },
            onReady: function(callback){
                if(callback && typeof(callback) === 'function'){
                    ready = callback;
                }
                else {
                    error("Argument Type Mismatch: onReady expected a Function");
                }
                return this;
            },
            onRunning: function(callback){
                if(callback && typeof(callback) === 'function'){
                    running = callback;
                }
                else {
                    error("Argument Type Mismatch: onRunning expected a Function");
                }
                return this;
            },
            onComplete: function(callback){
                if(callback && typeof(callback) === 'function'){
                    complete = callback;
                }
                else {
                    error("Argument Type Mismatch: onComplete expected a Function");
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
                return this;
            }
        };
    };
})(window);
