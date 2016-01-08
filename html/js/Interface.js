var _ = require('underscore');
var Backbone = require('Backbone');


//main app view
var AppView = Backbone.View.extend({
  el: "body",

  initialize: function () {
    this.listenTo( this.model, 'change', this.render );
    this.updateChecker = new UpdateChecker();
    this.render();
  },

  render: function () {
    this.$el.empty();

    this.$el.append( '<div id="exitButton"></div>' );
    this.$el.append( this.updateChecker.render().el );
  }

});

//update check
var UpdateChecker = Backbone.View.extend({

  el: '<div id="updateChecker">',

  events: {
    "click #continueButton" : "play"
  },

    initialize: function () {
      this.render();
    },

    render: function (state) {
      this.$el.empty();

      this.$el.append(
        '<ul>'+
        '<li id="loader"></li>'+
        '<li id="updateMessage">Checking for update...</li>'+
        '<li id="continueButton">Skip</li>'+
        '</ul>'
      );

      return this;
    },

    //internal vars
    play: function () {
      console.log("skip");
    }

  });

//export Data
module.exports.AppView = AppView;
module.exports.UpdateChecker = UpdateChecker;
