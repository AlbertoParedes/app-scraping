var path = require("path")
const { PythonShell } = require("python-shell");

module.exports = {

  start: function (mainWindow, json) {


    var options = {
      pythonPath: '/usr/local/bin/python3',//AGREGAR ESTA LINEA SOLO SI ES MAC
      //scriptPath: path.join(__dirname,'../../../python'),//DEPLOY WINDOWS
      scriptPath: path.join(__dirname,'../../../../python'),//DEPLOY MAC
      //scriptPath: path.join(__dirname,'../../python'),//DEV
      pythonOptions: ['-u'],
      args: [json],
      mode:'json'
    }
    
    
    var shell = new PythonShell('ahrefs.py',options); //executes python script on python3
    shell.on('message', function (message) {
      mainWindow.send('RESPONSE_SCRAPING_KEYWORDS', message)
      console.log(message);
      
      if(message.type==='msg'){
        mainWindow.send('RESPONSE_SCRAPING_KEYWORDS', message)
      }else if(message.type==='db'){
        mainWindow.send('RESPONSE_SCRAPING_KEYWORDS_DB', message)
      }
    })


    

  }

}