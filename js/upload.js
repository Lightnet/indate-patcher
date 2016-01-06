var fs = require('fs');
var path = require('path');
var Client = require('sftpjs');


//internal vars
var fileList = [];

//create the sftp connection
var c = Client();
c.on('ready', function () {
  c.list("/home/protected/bb/updates/", connectedCallback);
});

//connect to sftp
c.connect({
  host : 'ssh.phx.nearlyfreespeech.net',
  user : 'zaywolfe_umam',
  password : 'd2wZHr7t2VKj5rDZFRPF'
});

//my stuff

function connectedCallback (err, res) {
  if (err) throw err;

  //store the list
  fileList = res;
  console.log(fileList);

  /*//add save dialog
  document.write('<input id="saver" type="file" nwsaveas="filename.txt" />');

  //attach callback
  var chooser = document.querySelector("#saver");
  chooser.addEventListener("change", function(evt) {
    console.log(this.value);
    startDownload(this.value);
  }, false);*/
  startDownload();
}


function startDownload () {
  var dir = path.dirname(process.execPath);
  console.log(dir);
  c.fastGet(
    "/home/protected/bb/updates/"+fileList[0].name,
    dir + "/tmp/" + fileList[0].name,
    { "step" : downloadUpdate },
    function (err) {
      if (err) throw err;
      c.end();
    }
  );


}

function downloadUpdate (total_trans, chunk, total) {
  console.log(total - total_trans);
}
