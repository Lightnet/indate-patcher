var gui = require('nw.gui');
var Data = require('../js/Data');
var Interface = require('../js/Interface');

global.document = window.document;

var win = gui.Window.get();
win.on( "loaded", function () {

  var data = new Data();
  var interface = new Interface(data);

  global.data = data;
  global.interface = interface;
  console.log("done");
});
