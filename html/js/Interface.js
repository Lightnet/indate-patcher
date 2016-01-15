var _ = require('underscore');
var Backbone = require('Backbone');


//main app view
var AppView = Backbone.View.extend({
  el: "body",

  initialize: function () {
    this.allowExit = true;
    this.listenTo( this.model, 'change', this.render );
    this.updateChecker = new UpdateChecker();
    this.render();
  },

  render: function () {
    this.$el.empty();

    if( this.allowExit )
      this.$el.append( '<div id="exitButton"></div>' );

    this.$el.append( this.updateChecker.render().el );
  },

  updateUser: function (msg) {
    this.updateChecker.newMessage(msg);
  },

  endUpdating: function (msg) {
    this.updateChecker.endUpdating(msg);
    this.allowExit = true;
    this.render();
  },

  deactivateSkip: function () {
    this.updateChecker.deactivateSkip();
    this.allowExit = false;
    this.render();
  }


});

//update check
var UpdateChecker = Backbone.View.extend({

  el: '<div id="updateChecker">',

  events: {
    "click #continueButton" : "play"
  },

  initialize: function () {
    this.msg = "checking for update...";
    this.isDone = false;
    this.showButton = true;
    this.render();
  },

  render: function (state) {
    this.$el.empty();

    if( !this.isDone ){
      if( this.showButton ) {
        this.$el.append(
          '<ul>'+
          '<li id="loader" class="active"></li>'+
          '<li id="updateMessage">'+this.msg+'</li>'+
          '<li id="continueButton">Skip</li>'+
          '</ul>'
        );
      } else {
        this.$el.append(
          '<ul>'+
          '<li id="loader" class="active"></li>'+
          '<li id="updateMessage">'+this.msg+'</li>'+
          '<li id="waitMessage">Do not close.</li>'+
          '</ul>'
        );
      }
    } else {
      this.$el.append(
        '<ul>'+
        '<li id="loader" class="done"></li>'+
        '<li id="updateMessage">'+this.msg+'</li>'+
        '<li id="continueButton" class="active">Play</li>'+
        '</ul>'
      );
    }


    return this;
  },

  //internal vars
  play: function () {
    console.log("skip");
  },

  newMessage: function (msg) {
    this.msg = msg;
    this.render();
  },

  endUpdating: function (msg) {
    this.msg = msg;
    this.isDone = true;
    this.showButton = true;
    this.render();
  },

  deactivateSkip: function () {
    this.showButton = false;
    this.render();
  }

});

//export Data
module.exports.AppView = AppView;
module.exports.UpdateChecker = UpdateChecker;
