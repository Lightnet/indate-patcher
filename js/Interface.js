var _ = require('underscore');
var Backbone = require('Backbone');
var templates = require('../js/templates');


var Interface  = function (data) {
  this.home = new Home(data);
};

var Home = Backbone.View.extend({

  el: 'body',

  initialize: function (data) {
    //store data locally
    this.data = data;

    //create views and store them locally
    this.views = {
      projectControl: new ProjectControl(),
      projectList: new ProjectList()
    }

    this.render();
  },

  render: function () {
    //clear home
    this.$el.empty();

    //append views
    this.$el.append(this.views.projectControl.render( this.data.projects ).el);
    this.$el.append(this.views.projectList.render( this.data.projects ).el);

    return this;

  }
});

var ProjectList = Backbone.View.extend({

  el: '<div id="projectList">',

  initialize: function () {
    this.template = _.template( templates.projectListTemplate );
  },

  render: function (projects) {
    var template = this.template;
    var el = this.$el;
    el.empty();

    //create all projects on home
    projects.each( function (model) { el.append( template({
      projectName: model.get("name"),
      projectDescription: model.get("description"),
      projectVersion: model.get("version"),
    }))});


    return this;
  }
});

var ProjectControl = Backbone.View.extend({

  el: '<div id="projectControl">',

  initialize: function () {
    //project control template not created yet
    //this.template = _.template( templates.projectListTemplate );
  },

  render: function (projects) {
    var template = this.template;
    var el = this.$el;
    el.empty();

    return this;
  }
});


//export Data
module.exports = Interface;
