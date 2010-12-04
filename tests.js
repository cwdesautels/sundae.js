// These are the test files in this dir to be run.
var tests = [
  { name: "t1_default", model: "duck", tags: ["Static"] },
  { name: "t2_roll", model: "duck", tags: ["Static"] }
];
//"./resources/t1_default.png"


//TEST FUNCTIONS HERE
var testFuncs = {
  t1_default: function(canvasName){
    scn = new c3dl.Scene();
    scn.setCanvasTag(canvasName);
    renderer = new c3dl.WebGL();
    renderer.createRenderer(this);
    scn.setRenderer(renderer);
    scn.init(canvasName);
    if(renderer.isReady() ){
      duck = new c3dl.Collada();
      duck.init("./resources/duck.dae");
      scn.addObjectToScene(duck);
      var cam = new c3dl.FreeCamera();
      cam.setPosition(new Array(0, 0, -500.0));
      cam.setLookAtPoint(new Array(0.0, 0.0, 0.0));
      scn.setCamera(cam);
      scn.startScene();
    }
  },
  t2_roll: function(canvasName){
    scn = new c3dl.Scene();
    scn.setCanvasTag(canvasName);
    renderer = new c3dl.WebGL();
    renderer.createRenderer(this);
    scn.setRenderer(renderer);
    scn.init(canvasName);
    if(renderer.isReady() ){
      duck = new c3dl.Collada();
      duck.init("./resources/duck.dae");
      duck.roll(180); //radians
      scn.addObjectToScene(duck);
      var cam = new c3dl.FreeCamera();
      cam.setPosition(new Array(0, 0, -500.0));
      cam.setLookAtPoint(new Array(0.0, 0.0, 0.0));
      scn.setCamera(cam);
      scn.startScene();
    }
  }
}