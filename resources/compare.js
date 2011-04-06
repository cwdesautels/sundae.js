var done, pix;
var _blurWorkerA = new Worker("blur.js");
var _blurWorkerB = new Worker("blur.js");
_blurWorkerA.onerror = _blurWorkerB.onerror = function (event) {
    throw event.message;
};
_blurWorkerA.onmessage = _blurWorkerB.onmessage = function (event) {
    whenDone();
};
onerror = function (event) {
    throw event.message;
};
onmessage = function (event) {
    done = 0;
    pix = event.data;
    _blurWorkerA.postMessage(0);
    _blurWorkerB.postMessage(0);
};
function whenDone() {
    //done++;
    //if (done == 2) {
        comparePixels();
    //}
}
function comparePixels() {
    var failed = false;
    if (pix.a.length === pix.b.length) {
        var j, len = pix.b.length;
        for (j = 0; j < len; j += 4) {
            if (Math.abs(pix.b[j] - pix.a[j]) < pix.eps &&
                Math.abs(pix.b[j + 1] - pix.a[j + 1]) < pix.eps &&
                Math.abs(pix.b[j + 2] - pix.a[j + 2]) < pix.eps &&
                Math.abs(pix.b[j + 3] - pix.a[j + 3]) < pix.eps) {
                pix.c[j] = pix.c[j + 1] = pix.c[j + 2] = pix.c[j + 3] = 0;
            }
            else {
                pix.c[j] = pix.c[j + 3] = 255;
                pix.c[j + 1] = pix.c[j + 2] = 0;
                failed = true;
            }
        }
    }
    else {
        failed = true;
    }
    if (!failed) {
        for (j = 0; j < len; j += 4) {
            pix.c[j + 1] = pix.c[j+3] = 255;
        }
    }
    postMessage({ pix: pix.c, id: pix.id });
}