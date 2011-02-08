/*
API

All function calls can be substituted with a URL to a function
*REQUIRED - indicate required parameters for test


var globalBlurRadius = int
var globalTolerance = float
function globalSetup(){called once before first suite is started}
function globalTeardown(){called once after last suite is finished}
function onGlobalRun(){called before each suite's setup}
function onGlobalRunComplete(){called before each suite's teardown}

var testSuite = [ Array or suites within the scope of the program
  {
    suiteBlurRadius: int
    suiteTolerance: float
    suiteSetup: function(){called once before suite starts}
    suiteTeardown: function(){called once after suite ends}
    onSuiteRun: function(canvas){called before each test's setup within suite}
    onSuiteRunComplete: function(canvas){called after each test's teardown within suite} 
    test : [ Array of tests within the scope of the suite
      {
        name: string
        ID: string
        tag: const
        expectedFail: boolean
        expectedPass: boolean
        dependancyURL: [array of URL strings]
        referenceImageURL: string
        messageOnFail: string
        messageOnPass: string
        description: string
        testBlurRadius: int
        testTolerance: float
        expectedTime: int(ms)
        body: {
          run: function(canvas){called to run selected test} * REQUIRED
          testSetup: function(canvas){called once before test starts} 
          testTeardown: function(canvas){called once after test ends}
          onTestRun: function(canvas){called before test's setup}
          onTestRunComplete: function(canvas){called after test's teardown}
        }
      }
    ]
  }
]
*/

var globalBlurRadius = 0;
var globalTolerance = 0.00;
function globalSetup(){}
function globalTeardown(){}
function onGlobalRun(){}
function onGlobalRunComplete(){}

var testSuite = [
  {
      test: [
      {   //test 1
          name: "First test!",
          //dependancyURL: [""],
          referenceImageURL: "resources/default.png",
          body: {
              run: function (canvas) {
                  var gl = canvas.getContext('experimental-webgl');
                  gl.clearColor(0, 0, 0, 1);
                  gl.clear(gl.COLOR_BUFFER_BIT);
              }
          }
      },
      {   //Test 2
          name: "Second test!",
          referenceImageURL: "resources/default2.png",
          body: {
              run: function (canvas) {
                  var gl = canvas.getContext('experimental-webgl');
                  gl.clearColor(0, 0, 0, 1);
                  gl.clear(gl.COLOR_BUFFER_BIT);
              }
          }
      }]
  },
  {
      test: [
      {   //test 3
          name: "Third test!",
          //dependancyURL: [""],
          referenceImageURL: "resources/default.png",
          body: {
              run: function (canvas) {
                  var gl = canvas.getContext('experimental-webgl');
                  gl.clearColor(0, 0, 0, 1);
                  gl.clear(gl.COLOR_BUFFER_BIT);
              }
          }
      },
      {   //Test 4
          name: "Fourth test!",
          referenceImageURL: "resources/default2.png",
          body: {
              run: function (canvas) {
                  var gl = canvas.getContext('experimental-webgl');
                  gl.clearColor(0, 0, 0, 1);
                  gl.clear(gl.COLOR_BUFFER_BIT);
              }
          }
      }/*,
      {   //Test 5
          name: "Fifth test!",
          dependancyURL: "./resources/c3dl/c3dapi.js",
          referenceImageURL: "./resources/default3.png",
          body: {
              run: function (canvas) {
                  c3dl.addMainCallBack(testSuite[1].test[2].body.run, canvas);
                  c3dl.addModel("./resources/duck.dae");
                  scn = new c3dl.Scene();
                  scn.setCanvasTag(canvasName);
                  renderer = new c3dl.WebGL();
                  renderer.createRenderer(this);
                  scn.setRenderer(renderer);
                  scn.init(canvasName);
                  if (renderer.isReady()) {
                      duck = new c3dl.Collada();
                      duck.init("./resources/duck.dae");
                      scn.addObjectToScene(duck);
                      var cam = new c3dl.FreeCamera();
                      cam.setPosition(new Array(0, 0, -500.0));
                      cam.setLookAtPoint(new Array(0.0, 0.0, 0.0));
                      scn.setCamera(cam);
                      scn.startScene();
                  }
              }
          }
      }*/]
  }
];