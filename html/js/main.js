var gui = require('nw.gui');
var win = gui.Window.get();
global.document = window.document;

win.on( "loaded", function () {
  //setup

  var Data = require('./js/Data.js');
  var Updater = require('./js/Updater.js');
  var Interface = require('./js/Interface.js');

  //initialize vars
  var config = null;
  var app = null;
  var updater = null;

  //make config and load saved data
  config = new Data.Config();

  //updater = new Updater(config);

  config.load(function(){
    app = new Interface.AppView({
      model: config
    });
  });


  global.settings = new Data.Config();
  console.log("done");
});
