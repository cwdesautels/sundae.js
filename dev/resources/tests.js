var tests = [{
    "name": "Test 1",
    "type": "static",
    "knownGood": "./resources/expected/test1.png",
    "dependancies": ["./resources/dependancies/c3dl/c3dapi.js"],
    "requirements": ["./resources/requirements/duck.dae"],
    "errorMsg": "Default scene failed to render properly [Camera_pos = 0,0,-500]",
    "run": {
        "start": function (canvas) {
            scn = new c3dl.Scene();
            scn.setCanvasTag(canvas);
            renderer = new c3dl.WebGL();
            renderer.createRenderer(this);
            scn.setRenderer(renderer);
            scn.init(canvas);
            if (renderer.isReady()) {
                duck = new c3dl.Collada();
                duck.init(test1.requirements[0]);
                scn.addObjectToScene(duck);
                var cam = new c3dl.FreeCamera();
                cam.setPosition(new Array(0, 0, -500.0));
                cam.setLookAtPoint(new Array(0.0, 0.0, 0.0));
                scn.setCamera(cam);
                scn.startScene();
            }
        },
        "pre": function (canvas) {
            c3dl.init();
            c3dl.addMainCallBack(tests[0].run.start, canvas);
            c3dl.addModel(tests[0].requirements[0]);
        },
        "post": function (canvas) {}
    }
}, { //Next test object
    "name": "",                 //REQUIRED: Its gotta have a name right?
    "type": "",                 //Selective test loading (static or calibration)
    "knownGood": "",            //REQUIRED: Known good result (eg. png's path)
    "dependancies": ["", ""],   //Library dependancies
    "requirements": ["", ""],   //Additional file dependancies (eg. model's path)
    "errorMsg": "",             //Meaningful error
    "run": {
        "start": function (canvas) { 
            //REQUIRED: Begins render inside canvas    
        },
        "pre": function (canvas) {
            //test enviroment construction
        },
        "post": function (canvas) {
            //test enviroment deconstruction
        }
    }
}];
JSON.encode(tests);