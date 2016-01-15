var fs = require('fs.extra');
var hp = require('http-https');
var checksum = require('checksum');
var events = require('events');

/*---- utility functions ----*/
//files

var listFiles = function ( path, fileList ) {
  fileList = fileList || [];
  path = ( path[path.length-1] === '/' )? path : path + '/';
  var hotFiles = fs.readdirSync( path );


  hotFiles.forEach(function (file) {
    if ( fs.statSync(path+file).isDirectory() ) {

      fileList = listFiles( path+file+'/', fileList );

    } else {

      fileList.push(path + file)

    }

  });

  return fileList;

}

//checksums

var getChecksums = function (files, callback) {
  //variable to hold checksums
  var checksums = [];

  //get checksums
  files.forEach(function (file) {

    checksum.file(file, function(err, sum ){
      if ( err ) callback(err);

      //var path = file.split('/');
      //var filename = path[path.length-1];
      checksums.push({ path: file, sum: sum });

      //if all the checksums are complete run callback
      if( checksums.length === files.length ) {
        callback(null, checksums);
      }

    });

  });
}


//Updater constructor
var Updater = function (config) {
  var self = this;
  var remotePath = config.get('server') + '/indate/' + config.get('identity') + '/';

  /*---- internal functions ----*/
  //get list of files and checksums for current version
  var processCurrentFiles = function (path, callback) {
    getChecksums(listFiles(path), function(err, sums){
      if ( err ) callback(err);

      callback(null, sums);
    });
  };

  //get list of update data from server
  var getUpdateData = function (callback) {
    var request = hp.get(remotePath + 'update.json', function(res){

      //the response from the server
      res.setEncoding('utf8');

      res.on('data', function (data) {
        callback(null, data);
      });

    });

  };

  var makeDownloadList = function (currentFileList, updateFileList) {
    var downloadList = [];

    var updateFileLength = updateFileList.length;
    for( var i = 0; i < updateFileLength; i++ ) {
      //make comparable update file data
      var ufile = updateFileList[i];
      var updateComparePath = ufile.path.replace('/update-files/', '');
      var updateCompareSum = ufile.sum;

      //variable to check if file should be skip
      var skipFile = false;

      var currentFileLength = currentFileList.length;
      for ( var j = 0; j < currentFileLength; j++ ) {
        //make comparable current file data
        var cfile = currentFileList[j];
        var currentComparePath = cfile.path.replace('./bin/', '');
        var currentCompareSum = cfile.sum;

        //compare file data with all current files
        if ( updateComparePath === currentComparePath ) {

          //file is found, now compare checksums
          if ( updateCompareSum === currentCompareSum ) {
            //checksums match, ie file is the same
            // skip it
            skipFile = true;
          }
        }
      }
      /* If no file path matches then file is new.
         If the checksums don't match then the file is updated.
         So only skip adding to download list if both the path and the sums match.
      */

      if ( !skipFile ) {
        downloadList.push(ufile);
      }
    }

    return downloadList;
  };

  processCurrentFiles('./bin', function(err, currentData){
    if (err) throw err;

    getUpdateData(function(err, serverData){
      if (err) throw err;

      var updateData = JSON.parse(serverData);
      console.log(currentData, updateData);
      console.log(makeDownloadList(currentData, updateData.files));
    });
  });



  //call EventEmitter constructor
  events.EventEmitter.call(this);
};

//inherit from EventEmitter
Updater.prototype.__proto__ = events.EventEmitter.prototype;


//exports
module.exports = Updater;
