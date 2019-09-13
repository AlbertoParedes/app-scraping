
/* eslint-disable no-undef */
/* eslint-disable no-loop-func */
const fs = require('fs');
const glob = require('glob');
var getDocumentProperties = require('office-document-properties');
const path = require('path')
module.exports = {
  run: function(mainWindow, path) {

    console.log();
    console.log();
    console.log(path);
    console.log();
    console.log();

    
    var getDirectories = (src, callback) => {
      glob(src + '/**/*', callback);
    };


    getDirectories(path, (err, res) => {
      if (err) {
        console.log('Error', err);
      } else {
        
        var documents = []

        const run = async () => {
          for(var i=0; i<res.length; i++){
            await new Promise( resolve => {
              var element = res[i]
              if(!element.endsWith('.docx'))resolve()

              getDocumentProperties.fromFilePath(element, (err, data) => {
                if (err){console.log(err);
                }else{
                  documents.push({path:element,data, slash:'/'})
                }
                resolve()
              })
              
            })
          }
          mainWindow.send('RESPONSE_COUNTER_WORD', documents)
        }
        run()

      }
    });


  },

  stop: function() {
  }
}

