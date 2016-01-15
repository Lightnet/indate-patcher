var fs = require('fs.extra');
var hp = require('http-https');
var ncp = require('ncp').ncp;
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
  var processLocalFiles = function (path, callback) {
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

  var downloadFiles = function ( downloadList, index, callback ) {
    index = ( index === undefined)? 0 : index;
    var file = downloadList[index];
    var dpath = config.get("server") + '/indate/' + config.get("identity") + '/' + file.path;
    var destination = file.path.replace('/update-files/', './buffer/' );

    //create file pipe and directories
    var filename = destination.split('/');
    filename = filename[filename.length-1];
    fs.mkdirRecursiveSync( destination.replace(filename, '') );
    var filePipe = fs.createWriteStream(destination);

    //update user
    var percentage = Math.round( (index+1) / downloadList.length * 100 );
    self.emit('change', "downloading update... " + percentage + '%');

    var request = hp.get( dpath, function (response) {
      response.pipe(filePipe);

      filePipe.on('finish', function(){
        filePipe.close(function(){

          //check if last file
          if ( index+1 < downloadList.length || percentage === 100 ){

            downloadFiles( downloadList, index+1, callback );

          } else {

            //update user
            self.emit('change', "finished downloading...");
            callback();

          }

        });
      });
    });

    request.on('error', function(err) {
      self.emit('ended', "Update failed. Try again later.");
    });
  };

  var deleteDownloadedFiles = function (callback) {
    //delete buffer and remake it
    fs.rmrf('./buffer', function (err) {
      if ( err ) {
        self.emit('ended', 'Update Complete. err: could not delete temporary files.');

      } else {//all done

        self.emit('ended', 'Update Complete.');

      }
    });

  };

  var checkDownloadedFiles = function (updateList, callback) {
    //get checksums for downloaded files
    processLocalFiles( './buffer', function (err, downloadedList){
      if ( err ) {
        self.emit('ended', "Update failed. Try again later.");
        //delete downloaded files
        deleteDownloadedFiles();

      } else {//compare checksums
        var allMatch = true;
        var downloadedListLength = downloadedList.length

        for( var i = 0; i < downloadedListLength; i++ ) {
          var matchFound = false;
          var dfile = downloadedList[i].sum;

          //compare to update download list checksums
          var updateListLength = updateList.length;
          for( var j = 0; j < updateListLength; j++ ) {
            var ufile = updateList[j].sum;
            if ( dfile === ufile )
              matchFound = true;
          }

          //if matchFound is false, there was a problem downloading
          if ( !matchFound )
            allMatch = false;
        }

        if ( allMatch ) {
          callback(null);
        } else { //if all match isn't true, there was a problem downloading
          callback(new Error("Mixmatch in update checksums"));
        }

      }
    });
  };

  var invokeUpdateFiles = function (callback) {
    ncp('./buffer', './bin', function (err) {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  }

  /*---- Update main code  ----*/

  processLocalFiles('./bin', function(err, currentData){
    if (err) throw err;

    getUpdateData(function(err, serverData){
      if (err) throw err;


      var updateData = JSON.parse(serverData);
      var downloadList = makeDownloadList(currentData, updateData.files);

      //update user and start file downloads
      if( downloadList.length > 0 ) {

        //update user
        self.emit('change', "update found... ");
        //lock launcher
        self.emit('lock');

        //check if buffer is left behind
        if ( fs.existsSync('./buffer') ) {
          fs.rmrfSync('./buffer');
        }
        //create buffer folder
        fs.mkdirRecursiveSync('./buffer');

        downloadFiles(downloadList, 0, function() {

          //update user
          self.emit('change', 'checking update integrity...' );

          checkDownloadedFiles(downloadList, function (err) {
            if ( err ) {
              self.emit('ended', "Update failed. Try again later.");
              //delete downloaded files
              deleteDownloadedFiles();

            } else {

              //update user
              self.emit('change', 'updating files...' );
              invokeUpdateFiles( function(err){
                if ( err ) {
                  self.emit('ended', "Update failed. Try again later.");
                  //delete downloaded files
                  deleteDownloadedFiles();

                } else {
                  deleteDownloadedFiles();
                }

              });
            }
          });
          //self.emit('ended', "update finished" );
        });
      } else {
        self.emit('ended', "No updates.");
      }


    });
  });



  //call EventEmitter constructor
  events.EventEmitter.call(this);
};

//inherit from EventEmitter
Updater.prototype.__proto__ = events.EventEmitter.prototype;


//exports
module.exports = Updater;
