/*!
 * Sundae Javascript Library v0.4
 * http://http://sundae.lighthouseapp.com/projects/68207-sundaejs/overview
 *
 * The MIT License
 * Copyright (c) 2011 
 * http://www.opensource.org/licenses/mit-license.php
*/
var sundae;
(function (window, undef) {
    sundae = { "tests" : [] }
    
    var kernel, kernelSize, kernelSum;
    //Sundae attributes
    sundae.init = function(type, sigma, epsilon){
        _type = "a";
        _sig = 2;
        _eps = 0.05;
        //No reliable data checking
        if(type != undef){
            _type = type;
            if(sigma != undef){
                _sig = sigma;
                if(epsilon != undef){
                    _eps = epsilon;
                }
            }
        }
        buildKernel(_sig);
        runCompare(buildTests(_type));

    };
    function buildTests(type){
        getScript("./resources/tests.js");
        getTests(type);
    }
    function getTests(type){
        sundae.tests = new Array();
        sundae.tests.push(SON.parse(tests));
        //Only fill array with test type matching type ignore if type is a
        for(int i = 0, len = sundae.tests.length; i < len ; i++){
            getScript(sundae.tests[i].dependancies);
        } 
    }
    function getScript(urlArray){
    //toDo
		var script;
		
		if (typeof url == 'object') {
			for (var key in url) {
				if (url[key]) {
					script = { name: key, url: url[key] };
				}
			}
		} else { 
			script = { name: toLabel(url),  url: url }; 
		}

		var existing = scripts[script.name];
		if (existing) { return existing; }
		
		// same URL?
		for (var name in scripts) {
			if (scripts[name].url == script.url) { return scripts[name]; }	
		}
		
		scripts[script.name] = script;
		return script;        
    }
    function runCompare(tests){
        if(tests){
            for(var i = 0, rc = false, len = tests.length; i < len; i++, rc = false){
                if(tests[i].curr && tests[i].orig){
                    if(rc = compare(tests[i].orig, false, tests[i].curr, true, tests[i].diff)){
                        //_tests[i].title.innerHTML = titleText(i+1, tl, _tests[i].time, _tests[i].name);
                        //passedCount++;
                    }
                    else{
                        //_tests[i].title.innerHTML = titleText(i+1, tl, _tests[i].time, _tests[i].name, "pixels off");
                        //failedCount++;
                    }
                }
                else{
                    //_tests[i].title.innerHTML = titleText(i+1, tl, _tests[i].time, _tests[i].name, "invalid test");
                    //failedCount++;
                }
            }
        }
        else{
            //_tests[i].title.innerHTML = titleText(i+1, tl, _tests[i].time, _tests[i].name, "no tests");
        }
    }
    function getPixels(aCanvas, isWebGL) {        
        try {
            if (isWebGL) {
                var context = aCanvas.getContext("experimental-webgl");  
                var data = null;
                try{
                    data = context.readPixels(0, 0, 100, 100, context.RGBA, context.UNSIGNED_BYTE);
                    if(context.getError()){
                        throw new Error("API has changed");                
                    }              
                }
                catch(e){             
                    data = new Uint8Array(100 * 100 * 4);
                    context.readPixels(0, 0, 100, 100, context.RGBA, context.UNSIGNED_BYTE, data);
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
    //Global Canvas fillers
    function inject_c3dl(_aCanvas, _main, _path){
        var startTime = (new Date).getTime(), totalTime = 0;
        if(_aCanvas && _main && _path){
            c3dl.addMainCallBack(_main, _aCanvas);
            c3dl.addModel(_path);
        }
        totalTime = (new Date).getTime() - startTime;
        return totalTime;
    }
    function inject_png(_aCanvas, _path){
        if(_aCanvas && _path){
         var _ctx = _aCanvas.getContext('2d');
            var _img = new Image();
            _img.onload = function(){
            _ctx.drawImage(_img,0,0,_img.width,_img.height);
            }
            _img.src = _path;         
        }   
    }
    //Global utility functions
    function compare(_a, _aWebGL, _b, _bWebGL, _c){
        var rc = true;
        var valueEpsilon = epsilon * 255;
        //Get pixel arrays from canvases
        var _aPix = getPixels(_a, _aWebGL); 
        var _bPix = getPixels(_b, _bWebGL);
        //Blur pixel arrays
        _aPix = blur(_aPix, _aPix.width, _aPix.height); 
        _bPix = blur(_bPix, _bPix.width, _bPix.height);
        if(_aPix.length === _bPix.length){
            //Compare pixel arrays
            var _cCtx = _c.getContext('2d');
            var _cPix = _cCtx.createImageData(_c.width, _c.height);
            var len = _bPix.length;
            for (var j=0; j < len; j+=4){
                if (Math.abs(_bPix[j] - _aPix[j]) < valueEpsilon  &&
                    Math.abs(_bPix[j + 1] - _aPix[j + 1]) < valueEpsilon &&
                    Math.abs(_bPix[j + 2] - _aPix[j + 2]) < valueEpsilon &&
                    Math.abs(_bPix[j + 3] - _aPix[j + 3]) < valueEpsilon){
                    _cPix.data[j] = _cPix.data[j+1] = _cPix.data[j+2] = _cPix.data[j+3] = 0;
                } //Pixel difference in _c
                else{
                    _cPix.data[j] = 255;
                    _cPix.data[j+1] = _cPix.data[j+2] = 0;
                    _cPix.data[j+3] = 255;
                    rc = false;
                }
            }
            //Display pixel difference in _c
            if(rc){
                _cCtx.fillStyle = "rgb(0,255,0)";
                _cCtx.fillRect (0, 0, _c.width, _c.height);
            }
            else{
                _cCtx.putImageData(_cPix, 0, 0);
            }
        }
        else{
            rc = false;
        }
        return rc;
    }
    function buildKernel(sig) {
        var ss = sig * sig;
        var factor = 2 * Math.PI * ss;
        kernel = new Array();
        kernel.push(new Array());
        var i = 0, j;
        do {
            var g = Math.exp(-(i * i) / (2 * ss)) / factor;
            if (g < 1e-3) break;
            kernel[0].push(g);
            ++i;
        } while (i < 7);
        kernelSize = i;
        for (j = 1; j < kernelSize; ++j) {
            kernel.push(new Array());
            for (i = 0; i < kernelSize; ++i) {
                var g = Math.exp(-(i * i + j * j) / (2 * ss)) / factor;
                kernel[j].push(g);
            }
        }
        kernelSum = 0;
        for (j = 1 - kernelSize; j < kernelSize; ++j) {
            for (i = 1 - kernelSize; i < kernelSize; ++i) {
                kernelSum += kernel[Math.abs(j)][Math.abs(i)];
            }
        }
    }
    function blur(data, width, height) {
        var len = data.length;
        var newData = new Array(len);
        for (var y = 0; y < height; ++y) {
            for (var x = 0; x < width; ++x) {
                var r = 0, g = 0, b = 0, a = 0;
                for (j = 1 - kernelSize; j < kernelSize; ++j) {
                    if (y + j < 0 || y + j >= height) continue;
                    for (i = 1 - kernelSize; i < kernelSize; ++i) {
                        if (x + i < 0 || x + i >= width) continue;
                        r += data[4 * ((y + j) * width + (x + i)) + 0] * kernel[Math.abs(j)][Math.abs(i)];
                        g += data[4 * ((y + j) * width + (x + i)) + 1] * kernel[Math.abs(j)][Math.abs(i)];
                        b += data[4 * ((y + j) * width + (x + i)) + 2] * kernel[Math.abs(j)][Math.abs(i)];
                        a += data[4 * ((y + j) * width + (x + i)) + 3] * kernel[Math.abs(j)][Math.abs(i)];
                    }
                }
                newData[4 * (y * width + x) + 0] = r / kernelSum;
                newData[4 * (y * width + x) + 1] = g / kernelSum;
                newData[4 * (y * width + x) + 2] = b / kernelSum;
                newData[4 * (y * width + x) + 3] = a / kernelSum;               
            }
        }
        return newData;
    }
})(window);