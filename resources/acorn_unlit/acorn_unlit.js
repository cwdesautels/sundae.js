function start1(cvs, cb){
  var ps = new PointStream();
  ps.setup(cvs);
  ps.pointSize(5);
  ps.onRender = function(){
    ps.background([1, 1, 1, 1]);
    ps.clear();
    ps.translate(0, 0, -25);
    ps.render(acorn);
    if(acorn.status === 3){
      cb();
      ps.onRender = function(){};
    }
  };
  var acorn = ps.load('resources/XB-PointStream/clouds/acorn.asc');
}