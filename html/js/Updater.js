var fs = require('fs.extra');
var hp = require('http-https');
var events = require('events');

//Updater constructor
var Updater = function (config) {


  //call EventEmitter constructor
  events.EventEmitter.call(this);
};

//inherit from EventEmitter
Updater.prototype.__proto__ = events.EventEmitter.prototype;

//exports
module.exports = Updater;
