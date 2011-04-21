function rightSideUp(aCanvas, callback){
    var gl = aCanvas.getContext('experimental-webgl');
    var pix = new Uint8Array(aCanvas.width * aCanvas.height * 4);
    gl.readPixels(0, 0, aCanvas.width, aCanvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pix);
    for(var i=0, len=pix.length; i < len; i+=4){
            pix[i] = pix[i + 3] = 255;
            pix[i + 1] = pix[i + 2] = 0;
    }
    callback();
}
