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

  config.load(function(){
    updater = new Updater(config);

    app = new Interface.AppView({
      model: config
    });
  });

  updater.on('change', function(msg) {
    app.updateUser(msg);
  });

  updater.on('ended', function(msg) {
    app.endUpdating(msg);
  });

  updater.on('lock', function(){
    app.deactivateSkip();
  });

  global.settings = new Data.Config();
  console.log("done");
});
