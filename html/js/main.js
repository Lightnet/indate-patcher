var gui = require('nw.gui');
var win = gui.Window.get();
global.document = window.document;

win.on( "loaded", function () {
  //setup

  var Data = require('./js/Data.js');
  var Interface = require('./js/Interface.js');

  //starting application
  var app = new Interface.AppView({
    model: new Data.Config()
  });




  global.settings = new Data.Config();
  console.log("done");
});
