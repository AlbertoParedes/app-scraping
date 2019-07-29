var path = require("path")
const { PythonShell } = require("python-shell");

module.exports = {

  start: function (mainWindow, json) {

    var options = {
      //pythonPath: '/usr/local/bin/python3',
      //scriptPath: path.join(__dirname, '../../../../python'),//
      scriptPath: path.join(__dirname,'../../../python'),//DEPLOY WINDOWS
      //scriptPath: path.join(__dirname,'../../python'),//DEV
      pythonOptions: ['-u'],
      args: [json],
      mode:'json'
    }
    
    var shell = new PythonShell('ahrefs.py',options); //executes python script on python3
    shell.on('message', function (message) {
      //mainWindow.send('RESPONSE_SCRAPING_KEYWORDS', message)
      if(message.type==='msg'){
        mainWindow.send('RESPONSE_SCRAPING_KEYWORDS', message)
      }else if(message.type==='db'){
        mainWindow.send('RESPONSE_SCRAPING_KEYWORDS_DB', message)
      }
    })

  }

}