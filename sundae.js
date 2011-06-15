/*!
 * Sundae Javascript Library v0.9
 * http://sundae.lighthouseapp.com/dashboard
 *
 * Copyright (c) 2011 Carlin Desautels
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the 'Software'), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
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
var SundaeTestsFile = 'tests.json';

(function (_w, undef) {
    //Enviroment variables
    var sundae,
        _file = SundaeTestsFile,
        _data,
        _tag = 'All',
        _sigma = 2,
        _epsilon = 0.05,
        _numWorkers = 4,
        _loadedDeps = [],
        _container,
        _results,
        _count = 0,
        _passCount = 0,
        _pool = {},
        _queue = {},
        _jsonpCallbackCount = 0;
    //Global Utility Functions
    function postError(name, msg) {
        console.log('Error: [' + name + '] - ' + msg);
    }
    function isLoaded(src) {
        if (_loadedDeps.indexOf(src) === -1) {
            _loadedDeps.push(src);
            return false;
        }
        else {
            return true;
        }
    }
    function getScript(src, callback) {
        if (!isLoaded(src)) {
            var s = _w.document.createElement('script');
            s.type = 'text/javascript';
            s.onerror = function () {
                postError(src, 'script load failed');
            };
            s.onload = function () {
                callback();
                _w.document.head.removeChild(s);
            };
            s.src = src;
            _w.document.head.appendChild(s);
        }
    }
    function getImage(aCanvas, url, callback) {
        var ctx = aCanvas.getContext('2d');
        var img = new Image();
        img.onerror = function () {
            postError(url, 'image load failed');
        };
        img.onload = function () {
            ctx.drawImage(img, 0, 0, img.width, img.height);
            callback();
        };
        img.src = url;
    }
    function getJSONP(src, callback) {
        if (!isLoaded(src)) {
            var functionName = 'jsonCB_' + _jsonpCallbackCount++;
            _w[functionName] = function (data) {
                if (typeof(data) === 'string') {
                    try {
                        callback(JSON.parse(data));
                    }
                    catch (e) {
                        try {
                            callback(JSON.parse(JSON.stringify(data)));
                            postError(src, 'JSON was loaded, but not valid');
                        }
                        catch (x) {
                            postError(src, 'JSONP data was invalid');
                        }
                    }
                }
            };
            getScript(src + 'callback=' + functionName, undef);
        }
    }
    function getJSON(src, callback) {
        if (!isLoaded(src)) {
            var r = new XMLHttpRequest();
            r.open('GET', src, true);
            r.overrideMimeType('application/json');
            r.onerror = function () {
                postError(src, 'JSON load failed');
            };
            r.onload = function () {
                try {
                    callback(JSON.parse(r.responseText));
                }
                catch (e) {
                    try {
                        callback(eval('(' + r.responseText + ')'));
                        postError(src, 'JSON was loaded, but not valid');
                    }
                    catch (e) {
                        postError(src, 'JSON data was invalid');
                    }
                }
            };
            r.send(null);
        }
    }
    function getPixels(aCanvas, isWebGL) {
        try {
            if (isWebGL) {
                var context = aCanvas.getContext('experimental-webgl');
                var data = null;
                try {
                    data = context.readPixels(0, 0, aCanvas.width, aCanvas.height, context.RGBA, context.UNSIGNED_BYTE);
                    if (context.getError()) {
                        throw new Error('API has changed');
                    }
                }
                catch (e) {
                    if (!data) {
                        data = new Uint8Array(aCanvas.width * aCanvas.height * 4);
                        context.readPixels(0, 0, aCanvas.width, aCanvas.height, context.RGBA, context.UNSIGNED_BYTE, data);
                    }
                }
                var col = 0;
                var row = (4 * aCanvas.width * aCanvas.height) - (4 * aCanvas.width);
                var n = new Uint8Array(aCanvas.width * aCanvas.height * 4);
                for (var j = 0, len = data.length; j < len; j += 4, col += 4) {
                    if (col === 4 * aCanvas.width) {
                        col = 0;
                        row -= 4 * aCanvas.width;
                    }
                    n[j] = data[row + col];
                    n[j + 1] = data[row + col + 1];
                    n[j + 2] = data[row + col + 2];
                    n[j + 3] = data[row + col + 3];
                }
                return n;
            }
            else {
                return aCanvas.getContext('2d').getImageData(0, 0, aCanvas.width, aCanvas.height).data;
            }
        }
        catch (x) {
            postError(aCanvas.id, 'failed to get pixels');
            return null;
        }
    }
    function showResults() {
        _count++;
        var total = -1;
        for (var i = 0, len = _container.childNodes.length; i < len; i++) {
            if (_container.childNodes[i].type !== 'submit') {
                total++;
            }
        }
        if (_count < total) {
            _results.innerHTML = 'Sundae Running... [' + _count + '/' + total + ']';
        }
        else {
            _results.innerHTML = 'Sundae Done! [' + _count + '/' + total + '] - ' + _passCount + ' PASSES';
        }
    }
    function runSetup(src, run) {
        if (run) {
            run = eval(run);
            if (src && src.url && src.type && typeof(run) === 'string') {
                if (src.type === 'script') {
                    getScript(src.url, run);
                }
                else {
                    postError('Setup ' + run, 'is an unsopported source type');
                }
            }
            else if (typeof(run) === 'function') {
                run();
            }
            else {
                postError('Setup ' + run, 'has is malformed, see README');
            }
        }
    }
    function showPasses(passes) {
        for (var i = 0, len = _container.childNodes.length; i < len; i++) {
            if (_container.childNodes[i].type !== 'submit') {
                for (var j = 0, dlen = _container.childNodes[i].childNodes.length; j < dlen; j++) {
                    if (_container.childNodes[i].childNodes[j].id) {
                        if (_container.childNodes[i].childNodes[j].id.search(/diff$/) > -1) {
                            var pix = getPixels(_container.childNodes[i].childNodes[j], false);
                            if (pix[1] > 0) {
                                _container.childNodes[i].style.display = passes ? 'block' : 'none';
                            }
                            else {
                                _container.childNodes[i].style.display = passes ? 'none' : 'block';
                            }
                        }
                    }
                }
            }
        }
    }
    function flipAllDivs(show) {
        for (var i = 1, len = _container.childNodes.length; i < len; i++) {
            if (_container.childNodes[i].type !== 'submit') {
                if (show) {
                    _container.childNodes[i].style.display = 'block';
                }
                else {
                    _container.childNodes[i].style.display = 'none';
                }
            }
        }
    }
    function putPixels2D(id, pixels) {
        if (pixels[1] > 0) {
            _passCount++;
        }
        var c = _w.document.getElementById(id);
        var cCtx = c.getContext('2d');
        var img = cCtx.getImageData(0, 0, c.width, c.height);
        for (var i = 0, len = pixels.length; i < len; i++) {
            img.data[i] = pixels[i];
        }
        cCtx.putImageData(img, 0, 0);
    }
    function createDiv(parent, id) {
        var d = _w.document.createElement('div');
        d.id = id;
        parent.appendChild(d);
        return d;
    }
    function createCanvas(parent, id, h, w) {
        var c = _w.document.createElement('canvas');
        c.id = id;
        c.width = w;
        c.height = h;
        parent.appendChild(c);
        return c;
    }
    function isWebgl(aCanvas) {
        var contexts = ['webgl', 'experimental-webgl', 'moz-webgl', 'webkit-3d'];
        var rc = false;
        for (var i = 0; !rc && i < contexts.length; i++) {
            try {
                rc = aCanvas.getContext(contexts[i]);
            }
            catch (e) {}
        }
        return rc;
    }
    function getNsetData (file) {
        getJSON(file, function (data) {
            _data = data;
        });
    }
    //Tester engine
    function reportResult(r, t) {
        r.innerHTML = t.name + ': [' + t.time.first + 'ms] vs ' + '[' + t.time.second + 'ms]';
        if (t.note) {
            r.innerHTML += ' - ' + t.note;
        }
    }
    function setupTest(test, radius, tolerance) {
        var name = test.name || 'default';
        var d = createDiv(_container, name);
        var r = createDiv(d, name + '-title');
        var a = createCanvas(d, name + '-first', 100, 100);
        var b = createCanvas(d, name + '-second', 100, 100);
        var c = createCanvas(d, name + '-diff', 100, 100);
        r.innerHTML = test.name + ': Running...';
        test.time = {
            first: 3,
            second: 3,
            firstStart: 0,
            secondStart: 0  
        };
        function runTest(id, func) {
            var who = id.substring(id.lastIndexOf('-') + 1, id.length);
            test.time[who + 'Start'] = (new Date()).getTime();
            func();
        }
        var isDone = {'first' : false, 'second' : false};
        var whenDone = function (who) {
            if (!test[who + 'Canvas'].src || (test[who + 'Canvas'].src && test[who + 'Canvas'].src.type !== 'image')) {
                test.time[who] = (new Date()).getTime() - test.time[who + 'Start'];
	        }
            isDone[who] = true;
            if (isDone.first === true && isDone.second === true) {
                reportResult(r, test);
                var pix = {};
                pix.a = getPixels(a, isWebgl(a));
                pix.b = getPixels(b, isWebgl(b));
                pix.c = getPixels(c, false);
                pix.aId = a.id;
                pix.bId = b.id;
                pix.cId = c.id;
                pix.knownFail = test.knownFail;
                pix.eps = test.tolerance ? Math.abs((+test.tolerance) % 101) / 100 : tolerance ? Math.abs((+tolerance) % 101) / 100 : _epsilon;
                pix.sig = Math.abs(test.blurRadius ? +test.blurRadius : radius ? +radius : _sigma);
                pix.height = c.height;
                pix.width = c.width;
                _queue.push(pix);
            }
        };
        function sourceRunner(obj, aCanvas, callback) {
            var testObj = eval(obj);
            if (typeof(testObj) === 'function') {
                runTest(aCanvas.id, function () {
                    testObj(aCanvas, callback);
                });
            }
            else if (typeof(testObj) === 'string') {
                runTest(aCanvas.id, function () {
                    _w[testObj](aCanvas, callback);
                });
            }
            else {
                postError(test.name, 'has a malformed run tag');
            }
        }
        function sourceLoader(obj, aCanvas, callback) {
            if (obj.src.url && obj.src.type) {
                if (obj.src.type === 'image') {
                    getImage(aCanvas, obj.src.url, callback);
                }
                else if (obj.src.type === 'script') {
                    getScript(obj.src.url, function () {
                        runTest(aCanvas.id, function () {
                            _w[obj.run](aCanvas, callback);
                        });
                    });
                }
                else if (obj.src.type === 'json') {
                    getJSON(obj.src.url, function (data) {
                        sourceRunner(data[obj.run], aCanvas, callback);
                    });
                }
                else if (obj.src.type === 'jsonp') {
                    getJSONP(obj.src.url, function (data) {
                        sourceRunner(data[obj.run], aCanvas, callback);
                    });
                }
                else {
                    postError(test.name, 'is an unsopported source type');
                }
            }
            else {
                postError(test.name, 'has a malformed source tag');
            }
        }
        if (test.firstCanvas.src) {
            sourceLoader(test.firstCanvas, a, function () {
                whenDone('first');
            });
        }
        else if (test.firstCanvas.run) {
            sourceRunner(test.firstCanvas.run, a, function () {
                whenDone('first');
            });
        }
        else {
            postError(test.name, 'firstCanvas malformed, see README');
        }
        if (test.secondCanvas.src) {
            sourceLoader(test.secondCanvas, b, function () {
                whenDone('second');
            });
        }
        else if (test.secondCanvas.run) {
            sourceRunner(test.secondCanvas.run, b, function () {
                whenDone('second');
            });
        }
        else {
            postError(test.name, 'secondCanvas malformed, see README');
        }
    }
    function startTester() {
        var loadDeps = function (deps, callback) {
            var totalLen = 0, totalLoaded = 0;
            var allDepsLoaded = function () {
                totalLoaded++;
                if (totalLen === totalLoaded) {
                    callback();
                }
            };
            if (typeof(deps) === 'object') {
                totalLen = deps.length;
                for (var i = 0; i < deps.length; i++) {
                    getScript(deps[i], allDepsLoaded);
                }
            }
            else if (typeof(deps) === 'string') {
                getScript(deps, callback);
            }
        };
        var setupTests = function (tests, radius, tolerance) {
            if (tests) {
                for (var j = 0, len = tests.length; j < len; j++) {
                    if (tests[j]) {
                        if (_tag === 'All' || (_tag !== 'All' && tests[j].tag && tests[j].tag === _tag)) {
                            setupTest(tests[j], radius, tolerance);
                        }
                    }
                    else {
                        postError('test object [' + j + ']', 'undefined, see README');
                    }
                }
            }
            else {
                postError('test array', 'undefined, see README');
            }
        };
        var setupTestSuites = function (data) {
            if (_data && _data.testSuite) {
                var setup = function (tests, radius, tol) {
                    return function () {
                        setupTests(tests, radius, tol);
                    };
                };
                if (_data.blurRadius) {
                    sundae.setBlurRadius(_data.blurRadius);
                }
                if (_data.tolerance) {
                    sundae.setTolerance(_data.tolerance);
                }
                for (var i = 0, len = _data.testSuite.length; i < len; i++) {
                    if (_data.testSuite[i].setup) {
                        runSetup(_data.testSuite[i].setup.src, _data.testSuite[i].setup.run);
                    }
                    if (_data.testSuite[i].dependancyURL) {
                        loadDeps(_data.testSuite[i].dependancyURL, setup(_data.testSuite[i].test, _data.testSuite[i].blurRadius, _data.testSuite[i].tolerance));
                    }
                    else {
                        setupTests(_data.testSuite[i].test, _data.testSuite[i].blurRadius, _data.testSuite[i].tolerance);
                    }
                }
            }
            else {
                postError('testSuite', 'undefined, see README');
            }
        };
        setupTestSuites(_data);
    }
    //Tester Setup
    _queue.setup = function () {
        var list = [];
        _queue.push = function (data) {
            var worker = _pool.getThread();
            if (worker) {
                worker.postMessage(data);
            }
            else {
                list.push(data);
            }
        };
        _queue.pop = function () {
            return list.pop();
        };
    };
    _pool.setup = function (n) {
        var worker = [], temp, setup = function (me) {
            temp = new Worker('slave.js');
            temp.onerror = function (event) {
                postError('Worker', event.message);
            };
            temp.onmessage = function (event) {
                var pix = event.data;
                putPixels2D(pix.id, pix.data);
                showResults();
                var data = _queue.pop();
                if (data) {
                    this.postMessage(data);
                }
                else {
                    worker[me].status = true;
                }
            };
            worker.push({'worker' : temp, 'status' : true});
        };
        _pool.getThread = function () {
            var n = worker.length;
            while (n--) {
                if (worker[n].status) {
                    worker[n].status = false;
                    return worker[n].worker;
                }
            }
        };
        while (n--) {
            setup(n);
        }
    };
    sundae = {
        setBlurRadius: function (s) {
            if (s) {
                _sigma = Math.abs(+s);
            }
        },
        setTolerance: function (e) {
            if (e) {
                _epsilon = (Math.abs(+e) % 101) / 100;
            }
        },
        setTestTag: function (t) {
            if (t) {
                _tag = '' + t;
            }
        },
        eventHideAll: function () {
            flipAllDivs(false);
        },
        eventShowAll: function () {
            flipAllDivs(true);
        },
        eventShowPasses: function () {
            showPasses(true);
        },
        eventShowFails: function () {
            showPasses(false);
        },
        getTestTags: function () {
            var tagList = [], i, j, tlen, slen, tag = undef;
            tagList.push('All');
            if (_data && _data.testSuite) {
                for (i = 0, slen = _data.testSuite.length; i < slen; i++) {
                    for (j = 0, tlen = _data.testSuite[i].test.length; _data.testSuite[i].test && j < tlen; j++) {
                        tag = _data.testSuite[i].test[j].tag;
                        if (tag && tagList.indexOf(tag) === -1) {
                            tagList.push(tag);
                        }
                    }
                }
            }
            return tagList;
        },
        init: function () {
            //Tester setup
            _container = createDiv(_w.document.body, 'sundae');
            _results = createDiv(_container, 'test_results');
            _results.innerHTML = 'Sundae running...';
            _queue.setup();
            _pool.setup(_numWorkers);
            //Tester starting point
            startTester();
        }
    };
    getNsetData(_file);
    _w.sundae = sundae;
})(window);
