var fs = require('fs');
var crypto = require('crypto');
var Backbone = require('Backbone');

//encryption variables
var cryptKey = '85CE6CCF67FBBAA8BB13479C3A6E084D';
var inputEncoding = 'utf8';
var outputEncoding = 'hex';

//data class
//models and collections
var Config = Backbone.Model.extend({
  defaults: {
    server: "www.default.com/indate",
    identity: "default",
    user: "user",
    password: "passs",
    pathToExecutable: ""
  },

  save: function () {
    var json = JSON.stringify( this.toJSON(), null, 4 );

    //encrypt json
    var cipher = crypto.createCipher( 'aes-256-cbc', cryptKey );
    var crypted = cipher.update(json, inputEncoding, outputEncoding);

    //write out to file
    fs.writeFile( "indate.cfg", crypted + cipher.final(outputEncoding) );
  },

  load: function (callback) {
    //check if config file exists
    if ( fs.existsSync("indate.cfg") ) {//if exists
      var crypted = fs.readFileSync("indate.cfg" , inputEncoding );

      var decipher = crypto.createDecipher('aes-256-cbc', cryptKey);
      var decrypted = decipher.update(crypted, outputEncoding, inputEncoding);

      this.set( JSON.parse( decrypted + decipher.final( inputEncoding ) ) );

    } else  if ( fs.existsSync("setup.json") ) {

      var setup = fs.readFileSync("setup.json" , inputEncoding );
      this.set( JSON.parse(setup) );

      //save settings locally
      this.save();

      //delete setup file
      fs.unlinkSync( "setup.json");
    } else {
      //throw an error
    }

    callback();
  }


});

//export Data
module.exports.Config = Config;
