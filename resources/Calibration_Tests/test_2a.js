function testTwoReal(canvas, callback) { 
	var gl = canvas.getContext('experimental-webgl'); 
	gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
	callback(); 
}
