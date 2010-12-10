// These are the test files in this dir to be run.
var tests = [
  { name: "t1_default", model: "duck", tags: ["Static"] },
  { name: "t1_defaultMoving", model: "duck", tags: ["Moving"] },
  { name: "t1_default", model: "duck", tags: ["Calibration"] },
  { name: "t2_roll", model: "duck", tags: ["Static"] },
  { name: "t3_shine", model: "duck", tags: ["Static"] },
  { name: "t4_redDuck", model: "duck", tags: ["Static"] },
  { name: "t5_noLight", model: "duck", tags: ["Static"] },
  { name: "t6_lowLight", model: "duck", tags: ["Static"] },
  { name: "t7_yaw", model: "duck", tags: ["Static"] },
  { name: "t8_cameraX", model: "duck", tags: ["Static"] },
  { name: "t9_cameraY", model: "duck", tags: ["Static"] },
  { name: "t10_cameraZ", model: "duck", tags: ["Static"] },
  { name: "t11_scaleUp", model: "duck", tags: ["Static"] },
  { name: "t12_scaleDown", model: "duck", tags: ["Static"] },
];

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
  t1_defaultMoving: function(canvasName){
    scn = new c3dl.Scene();
    scn.setCanvasTag(canvasName);
    renderer = new c3dl.WebGL();
    renderer.createRenderer(this);
    scn.setRenderer(renderer);
    scn.init(canvasName);
    if(renderer.isReady() ){
      duck = new c3dl.Collada();
      duck.init("./resources/duck.dae");
      duck.setAngularVel(new Array(0.0, 0.001, 0.0));
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
  },
  t3_shine: function(canvasName){
    scn = new c3dl.Scene();
    scn.setCanvasTag(canvasName);
    renderer = new c3dl.WebGL();
    renderer.createRenderer(this);
    scn.setRenderer(renderer);
    scn.init(canvasName);
    if(renderer.isReady() ){
      var demoMat = new c3dl.Material();
      demoMat.setDiffuse([1,0.1,0.6]);
      demoMat.setAmbient([0.2,0.4,0.8]);
      demoMat.setSpecular([0.8,0.8,0.8]);
      demoMat.setShininess(25);
      duck = new c3dl.Collada();
      duck.init("./resources/duck.dae");
      duck.setMaterial(demoMat);
      scn.addObjectToScene(duck);
      var cam = new c3dl.FreeCamera();
      cam.setPosition(new Array(0, 0, -500.0));
      cam.setLookAtPoint(new Array(0.0, 0.0, 0.0));
      scn.setCamera(cam);
      var diffuse = new c3dl.PositionalLight();
      diffuse.setName('diffuse');
      diffuse.setPosition([0,300,0]);
      diffuse.setDiffuse([0.5,0.5,0.5,1]);
      diffuse.setAmbient([0.4,1,0.4,1]);
      diffuse.setOn(true);
      scn.addLight(diffuse);
      var spec = new c3dl.DirectionalLight();
      spec.setName('spec');
      spec.setDirection([-2,-10,-20]);
      spec.setSpecular([1,1,1,1])
      spec.setOn(true);
      scn.addLight(spec);
      scn.startScene();
    }
  },
  t4_redDuck: function(canvasName){
    scn = new c3dl.Scene();
    scn.setCanvasTag(canvasName);
    renderer = new c3dl.WebGL();
    renderer.createRenderer(this);
    scn.setRenderer(renderer);
    scn.init(canvasName);
    if(renderer.isReady() ){
      var demoMat = new c3dl.Material();
      demoMat.setDiffuse([1,0.6,0.6]);
      demoMat.setAmbient([0.8,1,0.8]);
      duck = new c3dl.Collada();
      duck.init("./resources/duck.dae");
      duck.setMaterial(demoMat);
      scn.addObjectToScene(duck);
      var cam = new c3dl.FreeCamera();
      cam.setPosition(new Array(0, 0, -500.0));
      cam.setLookAtPoint(new Array(0.0, 0.0, 0.0));
      scn.setCamera(cam);
      var diffuse = new c3dl.PositionalLight();
      diffuse.setName('diffuse');
      diffuse.setPosition([0,300,0]);
      diffuse.setDiffuse([0.5,0.5,0.5,1]);
      diffuse.setOn(true);
      scn.addLight(diffuse);
      scn.startScene();
    }
  },
  t5_noLight: function(canvasName){
    scn = new c3dl.Scene();
    scn.setCanvasTag(canvasName);
    renderer = new c3dl.WebGL();
    renderer.createRenderer(this);
    scn.setRenderer(renderer);
    scn.setAmbientLight(new Array(0,0,0,0));
    scn.init(canvasName);
    if(renderer.isReady()){
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
  t6_lowLight: function(canvasName){
    scn = new c3dl.Scene();
    scn.setCanvasTag(canvasName);
    renderer = new c3dl.WebGL();
    renderer.createRenderer(this);
    scn.setRenderer(renderer);
    scn.setAmbientLight(new Array(0.3,0.3,0.3,1.0));
    scn.init(canvasName);
    if(renderer.isReady()){
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
  t7_yaw: function(canvasName){
    scn = new c3dl.Scene();
    scn.setCanvasTag(canvasName);
    renderer = new c3dl.WebGL();
    renderer.createRenderer(this);
    scn.setRenderer(renderer);
    scn.init(canvasName);
    if(renderer.isReady() ){
      duck = new c3dl.Collada();
      duck.init("./resources/duck.dae");
      duck.yaw(30);
      scn.addObjectToScene(duck);
      var cam = new c3dl.FreeCamera();
      cam.setPosition(new Array(0, 0, -500.0));
      cam.setLookAtPoint(new Array(0.0, 0.0, 0.0));
      scn.setCamera(cam);
      scn.startScene();
    }
  },
  t8_cameraX: function(canvasName){
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
      cam.setLookAtPoint(new Array(100.0, 0.0, 0.0));
      scn.setCamera(cam);
      scn.startScene();
    }
  },
  t9_cameraY: function(canvasName){
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
      cam.setLookAtPoint(new Array(0.0, 300.0, 0.0));
      scn.setCamera(cam);
      scn.startScene();
    }
  },
  t10_cameraZ: function(canvasName){
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
      cam.setPosition(new Array(0, 0, -1000.0));
      cam.setLookAtPoint(new Array(0.0, 0.0, 0.0));
      scn.setCamera(cam);
      scn.startScene();
    }
  },
  t11_scaleUp: function(canvasName){
    scn = new c3dl.Scene();
    scn.setCanvasTag(canvasName);
    renderer = new c3dl.WebGL();
    renderer.createRenderer(this);
    scn.setRenderer(renderer);
    scn.init(canvasName);
    if(renderer.isReady() ){
      duck = new c3dl.Collada();
      duck.init("./resources/duck.dae");
      duck.scale(new Array(2, 2, 2));
      scn.addObjectToScene(duck);
      var cam = new c3dl.FreeCamera();
      cam.setPosition(new Array(0, 0, -500.0));
      cam.setLookAtPoint(new Array(0.0, 0.0, 0.0));
      scn.setCamera(cam);
      scn.startScene();
    }
  },
  t12_scaleDown: function(canvasName){
    scn = new c3dl.Scene();
    scn.setCanvasTag(canvasName);
    renderer = new c3dl.WebGL();
    renderer.createRenderer(this);
    scn.setRenderer(renderer);
    scn.init(canvasName);
    if(renderer.isReady() ){
      duck = new c3dl.Collada();
      duck.init("./resources/duck.dae");
      duck.scale(new Array(0.5, 0.5, 0.5));
      scn.addObjectToScene(duck);
      var cam = new c3dl.FreeCamera();
      cam.setPosition(new Array(0, 0, -500.0));
      cam.setLookAtPoint(new Array(0.0, 0.0, 0.0));
      scn.setCamera(cam);
      scn.startScene();
    }
  },
}