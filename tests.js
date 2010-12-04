// These are the test files in this dir to be run.
var tests = [
  { name: "t1_default", model: "duck", tags: ["Static"] }
];
//"./resources/t1_default.png"


//TEST FUNCTIONS HERE
var testFuncs = {
  t1_default: function(canvasName){
    // Create new c3dl.Scene object
    scn = new c3dl.Scene();
    scn.setCanvasTag(canvasName);
    // Create GL context
    renderer = new c3dl.WebGL();
    renderer.createRenderer(this);
    // Attach renderer to the scene
    scn.setRenderer(renderer);
    scn.init(canvasName);
    if(renderer.isReady() ){
      duck = new c3dl.Collada();
      duck.init("./resources/duck.dae");
      // Add the object to the scene
      scn.addObjectToScene(duck);
      // Create a camera
      var cam = new c3dl.FreeCamera();
      cam.setPosition(new Array(0, 0, -500.0));
      cam.setLookAtPoint(new Array(0.0, 0.0, 0.0));
      // Add the camera to the scene
      scn.setCamera(cam);
      scn.startScene();
    }
  }
}