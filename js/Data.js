var fs = require('fs');
var Backbone = require('Backbone');


//data class
var Data = function () {
  this.projects = "";

  //models and collections
  Project = Backbone.Model.extend();
  var defaultProject = new Project({
    name: "default",
    description: "empty",
    path: "./buffer/default",
    remotePath: "/home/public/default/update",
    server: "ftp.default.com",
    user: "user",
    password: "pass",
    updateType: "whole",
    perFile: false,
    version: "0",
    checksums: []
  });

  Projects = Backbone.Collection.extend({
    Model : Project,
    URL : "#"
  });


  /*--- internal functions ---*/

  /*--- constructor ---*/

  this.projects = new Projects([defaultProject.clone(),defaultProject.clone()]);



};

//export Data
module.exports = Data;
