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
    suiteBlurRadius: 0,
    suiteTolerance: 0.00,
    suiteSetup: function(){},
    suiteTeardown: function(){},
    onSuiteRun: function(canvas){},
    onSuiteRunComplete: function(canvas){},
    test : [
      {
        name: "",
        ID: "",
        tag: "",
        expectedFail: false,
        expectedPass: false,
        dependancyURL: ["",""],
        referenceImageURL: "",
        messageOnFail: "",
        messageOnPass: "",
        description: "",
        testBlurRadius: 0,
        testTolerance: 0.00,
        expectedTime: 0,
        body: {
          run: function(canvas){},
          testSetup: function(canvas){},
          testTeardown: function(canvas){},
          onTestRun: function(canvas){},
          onTestRunComplete: function(canvas){}
        }
      },  //test 1
      {}, //test 2
      {}  //test 3
    ]
  },  //suite 1
  {} //suite 2
];
