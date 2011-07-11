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
    Chain = function(callback){
        Chain.prototype.callback = callback || noop;
        Chain.prototype.isEmpty = function(){ return head === undefined; };
        Chain.prototype.cont = function(num){
            var i = 0;
            return function(){
                i++;
                if(num === i){
                    this.run();
                }
            };
        };
        Chain.prototype.next = function(){
            var nb = new Bucket();
            if(that.isEmpty()){
                head = tail = nb;
            }
            else {
                tail.next = nb;
                tail = nb;
            }
            return that;
        };
        Chain.prototype.add = function(node){
            if(typeof(node) === 'function'){
                if(that.isEmpty()){
                    head = tail = new Bucket();
                }
                tail.push(node);
            }
        };
        Chain.prototype.pop = function(){
            if(that.isEmpty()){
                return undefined;
            }
            else{
                var data = head.data;
                if(head.next === undefined){
                    head = tail = undefined;       
                }
                else {
                    head = head.next;
                }
                return data;
            }
        };
        Chain.prototype.run = function(){
            if(that.isEmpty()){
                that.callback();
            }
            else {
                var obj = that.pop();
                var arr = obj.get();
                for(var i = 0, len = arr.length; i < len; i++){
                    arr[i](that.cont(len));
                }
            }
        };
        var that = this, head, tail,
        Bucket = function(){
            var nodes = [];
            Bucket.prototype.next = undefined;
            Bucket.prototype.push = function(node){
                nodes.push(node);
            };
            Bucket.prototype.get = function(){
                return nodes;
            };
        };
        head = tail = undefined;
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
    var Sundae = window.Sundae = function(divId){
        //Instance Variables
        var running, imp, add, complete, 
        container = {}, 
        queue = new Queue(4, function(data){
            putPixels2D(data.id, data.pix);
        }),
        chain = new Chain(),
        tolerance = 0.05,
        blur = 2, 
        tests = [], 
        tag = 'all';
        //Initialization
        container = window.document.getElementById('divId');
        running = imp = add = complete = noop;
        //Sundae Object
        return {
            noop: noop,
            addTest: function(obj){
                if(obj){
                    if(obj instanceof Object){
                        tests.push(obj);
                        add();
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
                        chain.add(function(callback){
                            getJson(file, function(data){
                                this.addTests(data);
                                callback();
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
                        chain.next().add(function(callback){
                            getScript(lib, function(){
                                imp();
                                callback();
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
                        chain.next();
                        for(var i = 0, len = arr.length; i < len; i++){
                            chain.add((function(me){
                                return function(callback){
                                    getScript(arr[me], function(){
                                        imp();
                                        callback();
                                    });
                                };
                            })(i));
                        }
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
                chain.callback = function(){
                    //start function
                };
                chain.run();
                alert(container);
                return this;
            }
        };
    };
})(window);
