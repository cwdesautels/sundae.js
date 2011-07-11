(function (window, undefined){
    //Global constants
    var noop = function(){},
    epsilon = function(e){
        return (Math.abs(e) % 101) / 100;
    },
    sigma = function(s){
        return Math.abs(s);
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
    workerQueue = function(num, callback){
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
    },
    functionChain = function(){
        var Bucket = function(arr){
            Bucket.prototype.next = undefined;
            Bucket.prototype.data = arr;
        }, head, tail;
        head = tail = undefined;
        functionChain.prototype.isEmpty = function(){
            return head === undefined;
        };
        functionChain.prototype.push = function(arr){
            var nn;
            if(arr instanceof Array){
                nn = new Bucket(arr);
            }
            else{
                nn = new Bucket([arr]);
            }
            if(functionChain.isEmpty()){
                head = tail = nn;
            }
            else {
                tail.next = nn;
                tail = nn;
            }
        };
        functionChain.prototype.pop = function(){
            if(!functionChain.isEmpty()){
                var data = head.data;
                if(head.next === undefined){
                    head = tail = undefined;       
                }
                else {
                    head = head.next;
                }
                return data;
            }
            else{
                return undefined;
            }
        };
        functionChain.prototype.run = function(){
            while(!functionChain.isEmpty()){
                var bucket = functionChain.pop();
                for(var i = 0, len = bucket.data.length; i < len; i++){
                    bucket.data[i]();
                }
            }
        };
    };
    var Sundae = window.Sundae = function(divId){
        //Instance Variables
        var running, imp, add, complete, go, 
        container = {}, 
        queue = new workerQueue(4, noop),
        list = new functionChain(),
        tolerance = 0.05,
        blur = 2, 
        tests = [], 
        tag = 'all',
        tasks = 0,
        total = 0,
        canStart = function(){ return tasks === 0 && tests.length === total; };
        //Initialization
        container = window.document.getElementById('divId');
        running = imp = add = complete = go = noop;
        //Sundae Object
        return {
            noop: noop,
            addTest: function(obj){
                if(obj){
                    if(obj instanceof Object){
                        tests.push(obj);
                        add();
                        go();
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
                        var len = arr.length;
                        total += len;
                        for(var i = 0; i < len; i++){
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
                        tasks += 1;
                        list.push(function(){
                            getJson(file, function(arr){
                                tasks -= 1;
                                this.addTests(arr);
                            });
                        });
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
                        tasks += 1;
                        list.push(function(){
                            getScript(lib, function(){
                                tasks -= 1;
                                go();
                            });
                        });
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
                        var libs = [], len = arr.length;
                        tasks += len;
                        for(var i = 0; i < len; i++){
                            libs.push(function(){
                                getScript(arr[i], function(){
                                    tasks -= 1;
                                    go();
                                });
                            });
                        }
                        list.push(libs);
                    }
                    else {
                        throw new Error("Argument Type Mismatch: addLibraries expected an Array");
                    }
                }
                return this;
            },
            onAdd: function(callback){
                if(callback){
                    if(typeof(callback) === 'function'){
                        add = callback;
                    }
                    else {
                        throw new Error("Argument Type Mismatch: onReady expected a Function");
                    }
                }
                return this;
            },
            onImport: function(callback){
                if(callback){
                    if(typeof(callback) === 'function'){
                        imp = callback;
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
                list.run();
                go = function(){
                    if(canStart()){
                        //start function
                    }
                };
                go();
                return this;
            }
        };
    };
})(window);
