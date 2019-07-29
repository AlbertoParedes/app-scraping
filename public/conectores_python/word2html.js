var path = require("path")
const { PythonShell } = require("python-shell");
var mammoth = require("mammoth");
var htmlToJson = require('html-to-json')
var fs = require('fs');
//CommonJS
let XLSX = require('xlsx');
module.exports = {

  start: function (mainWindow, files) {
    //Al final no lo conenctamos con python ya que se puede sacar el html con la libreria mommoth 
    var promesas = []

    files.forEach(file=>{
      var p = new Promise((resolve, reject) => {
        
        mammoth.convertToHtml({path: file.path})
        .then(function(result){
            var html = result.value; 
            //var messages = result.messages;
            if(html){ 

              //sustituir tags to nothhing
              
              html = html.replace(/<p>&lt;h1&gt;/g,'<h1>').replace(/&lt;\/h1&gt;<\/p>/g,'</h1>')
              html = html.replace(/<p>&lt;h2&gt;/g,'<h2>').replace(/&lt;\/h2&gt;<\/p>/g,'</h2>')
              html = html.replace(/<p>&lt;h3&gt;/g,'<h3>').replace(/&lt;\/h3&gt;<\/p>/g,'</h3>')
              html = html.replace(/<p>&lt;h4&gt;/g,'<h4>').replace(/&lt;\/h4&gt;<\/p>/g,'</h4>')
              html = html.replace(/<p>&lt;h5&gt;/g,'<h5>').replace(/&lt;\/h5&gt;<\/p>/g,'</h5>')

              html = html.replace(/<p><strong>&lt;h1&gt;/g,'<h1>').replace(/&lt;\/h1&gt;<\/strong><\/p>/g,'</h1>')
              html = html.replace(/<p><strong>&lt;h2&gt;/g,'<h2>').replace(/&lt;\/h2&gt;<\/strong><\/p>/g,'</h2>')
              html = html.replace(/<p><strong>&lt;h3&gt;/g,'<h3>').replace(/&lt;\/h3&gt;<\/strong><\/p>/g,'</h3>')
              html = html.replace(/<p><strong>&lt;h4&gt;/g,'<h4>').replace(/&lt;\/h4&gt;<\/strong><\/p>/g,'</h4>')
              html = html.replace(/<p><strong>&lt;h5&gt;/g,'<h5>').replace(/&lt;\/h5&gt;<\/strong><\/p>/g,'</h5>')

              html = html.replace(/&lt;(.*?)&gt;/g,'').replace(/&lt;\/(.*?)&gt;/g,'')

              html = html.replace(/alt="(.*?)"/g,'').replace(/alt="(.*?) "/g,'').replace(/  +/g,' ')

              //he visto que pueden existir algunos id por lo que eliminaremos eso tambien
              html = html.replace(/id="(.*?)"/g,'').replace(/id="(.*?) "/g,'').replace(/  +/g,' ')
              html = html.replace(/id="(.*?)"/g,'').replace(/id="(.*?) "/g,'').replace(/  +/g,' ')
              //eliminamos tag vacias (a)
              html = html.replace(/<a><\/a>/g,'').replace(/<a ><\/a>/g,'')

              file.html=html              
              htmlToJson.parse(html, ['img', function ($item) {return $item.attr('src');}])
              .done( (items) => {
                file.images = items;
                items.forEach(src=>{
                  file.html = file.html.replace(`<p><img src="${src}" /></p>`,`<img src="${src}" />`)
                })
                if(!file.html.includes('<h1>')){ 
                  file.html = file.html.replace('<p>','<h1>').replace('</p>','</h1>') 
                }
                resolve()
              }, err => {
                file.images = [];
                if(!file.html.includes('<h1>')){ file.html.replace('<p>','<h1>').replace('</p>','</h1>') }
                resolve()
              });
            
            }
            else{
              file.html='';
              file.images = [];
              resolve()
            }
            
        })
        .done();
      });
      promesas.push(p)
    })

    Promise.all(promesas).then(values => {
      mainWindow.send('RESPONSE_UPLOAD_WORDS', files)
    });







    /*
    var options = {
      scriptPath: path.join(__dirname, '../../python'),
      //pythonPath: '/usr/local/bin/python3',
      args: [item]
    }

    var shell = new PythonShell('word2html.py', options); //executes python script on python3

    shell.on('message', function (message) {
      console.log(message);
      mainWindow.send('RESPONSE_UPLOAD_WORDS', message)
    })
    */

  },

  saveData: function(mainWindow, data){

    var files = data.files;
    var path = data.path;

    fs.exists(path+'/word2html',(exist)=>{
      if(!exist){
        fs.mkdir(path+'/word2html',(result)=>{
          path = path+'/word2html';
          createImagesFolder(mainWindow,path,files)
        })
      }else{
        path = path+'/word2html';
        createImagesFolder(mainWindow,path,files)
      }
    })

  }

}

function createImagesFolder(mainWindow,path,files){

  fs.exists(path+'/images',(exist)=>{
    if(!exist){
      fs.mkdir(path+'/images',(result)=>{
        saveAll(mainWindow,path,files)
      })
    }else{
      saveAll(mainWindow,path,files)
    }
  })
  
}
function saveAll(mainWindow,path,files){

  //Guardamos todas as fotos 
  files.forEach(file=>{
    if(file.images && file.images.length>0){

      //eliminar todas las imagenes excepto la primera
      let src
      for(var i=0;i<file.images.length;i++){
        //solo nos quedamos con la primera imagen 
        src = file.images[i];
        if(i===0){
          var ext = src.substring(src.indexOf('data:image/')+11, src.indexOf(';base64'))
          var dataImg = src.replace(/^data:image\/\w+;base64,/, "");
          var buf = new Buffer(dataImg, 'base64');

          fs.writeFile(`${path}/images/${file.id}.${ext}`, buf,()=>{
            //console.log('ok');
          });
          //file.html = file.html.replace(src,`/images/${file.id}.${ext}`);
          file.html = file.html.replace(`<img src="${src}" />`,`<img src="/images/${file.id}.${ext}" alt="" />`)
        }else{
          file.html = file.html.replace(`<img src="${src}" />`,``)
        }
      }

    }
  })

  
  

  //Creamos el excel-----------
    
  var lastItem = files[files.length-1]
  var dataExcel = []
  for(var i=0; i<lastItem.id; i++){
    var item = files.find((f)=>{return f.id===(i+1)})
    if( item ){dataExcel.push({'ID': item.id,'NAME':item.name,'HTML':item.html,})
    }else{dataExcel.push({'ID': '','NAME':'','HTML':'',})}
  }

  var wb = XLSX.utils.book_new();
  var ws = XLSX.utils.json_to_sheet(dataExcel);
  XLSX.utils.book_append_sheet(wb, ws, "resultados");
  var nameFile = path+'/resultados.xlsx'
  XLSX.writeFile(wb, nameFile );
    

}
