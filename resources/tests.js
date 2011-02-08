var testSuite = [{
    test: [{
        name: "First test!",
        referenceImageURL: "resources/default.png",
        run: function (canvas) { var gl = canvas.getContext('experimental-webgl'); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); }
    }, {
        name: "Second test!",
        referenceImageURL: "resources/default2.png",
        run: function (canvas) { var gl = canvas.getContext('experimental-webgl'); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); }
    }]
}, {
    test: [{
        name: "Third test!",
        referenceImageURL: "resources/default.png",
        run: function (canvas) { var gl = canvas.getContext('experimental-webgl'); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); }
    }, {
        name: "Fourth test!",
        referenceImageURL: "resources/default3.png",
        run: function (canvas) { var gl = canvas.getContext('experimental-webgl'); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); }
    }]
}];