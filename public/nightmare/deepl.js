/* eslint-disable no-undef */
/* eslint-disable no-loop-func */
const db = require('../sql/database')
var internetAvailable = require("internet-available");
const request = require('request');
const puppeteer = require('puppeteer');
var browser = null
var stopRunning = false;
var reinicioRouter = false

var settings = {
  timeout: 3000000
}

module.exports = {

  setEstado : function(mainWindow,obj){
    mainWindow.send('RESPONSE_DEEPL_STATUS', obj)
  },

  run: function(mainWindow, data) {

    /* eslint-disable no-undef */
    /* eslint-disable no-loop-func */
    

    var {documento} = data
  

    const run = async () => {
      stopRunning = false;
      this.setEstado(mainWindow, {id:0, text:'Abriendo navegador', status:'running'})
      browser = await puppeteer.launch({headless: data.browser?false:true});
      var page = await browser.newPage();
      this.setEstado(mainWindow, {id:0, text:'Abriendo navegador', status:'ok'})
      this.setEstado(mainWindow, {id:1, text:'0 de '+Object.keys(documento.urls).length+' urls', status:'running'})
      var n = 0;
      for(var key in documento.urls){

        await new Promise(async resolve => {
          n++
          var vecesBaneado = 0
          var baneado = false, terminado=false;
          while((baneado===true || terminado===false) && !stopRunning){

            var post = documento.urls[key];
            console.log('id:',post.id);
            
            if(post.traduccion!==''){
              this.setEstado(mainWindow, {id:1, text:n+' de '+Object.keys(documento.urls).length+' urls', status:'running'})
              return resolve()
            }
            this.setEstado(mainWindow, {id:3, text:``, status:'empty'})
            this.setEstado(mainWindow, {id:2, text:`Scrapeando texto de <b>${post.url}</b>`, status:'running'})
            //Buscamos el texto que de la pagina 
            await page.goto(post.url, settings);
            const bodyText = await page.evaluate(() => {
              var body = document.body;
              body.querySelectorAll("script, style, noscript").forEach(e => e.parentNode.removeChild(e));
              return body.innerText
            });
            this.setEstado(mainWindow, {id:2, text:`Scrapeando texto de <b>${post.url}</b>`, status:'ok'})
            
            var arrayText = bodyText.split('\n')
            var arrayParrafos = [{text:''}];
  
            for (let i = 0; i < arrayText.length; i++) {
              var text = arrayText[i].trim()
              
              if(text!==''){
                var lastItem = arrayParrafos[arrayParrafos.length-1].text
                //si el ultimo elemento del array es menor que 5000 caracteteres añadiremos este texto
                if(lastItem.length<5000 && lastItem.length+text.length+1<5000){
                  arrayParrafos[arrayParrafos.length-1].text = `${lastItem}\n${text}`;
                }else{
                  //si el texto es menor de 5000, agregaremos un nuevo elemento con ese texto
                  if(text.length<5000){
                    arrayParrafos.push({text})
                  }else{
                    //esto implica que es texto es mayor que 5000 por lo que hay que separarlo por plabras
                    var words = text.split(' ')
                    var arrayWords = [{text:''}]
                    for(var j=0; j<words.length;j++){
                      if(arrayWords[arrayWords.length-1].text.length<5000 && arrayWords[arrayWords.length-1].text.length+words[j].trim().length+1<5000){
                        arrayWords[arrayWords.length-1].text = `${arrayWords[arrayWords.length-1].text.trim()} ${words[j].trim()}`;
                      }else{
                        arrayWords.push({text: words[j].trim()})
                      }
                    }
                    arrayParrafos = [...arrayParrafos, ...arrayWords]
                  }
                }
              }
            }
            
            this.setEstado(mainWindow, {id:3, text:`Traduciendo 0 de ${arrayParrafos.length} bloque(s)`, status:'running'})
            for (let i = 0; i < arrayParrafos.length; i++) {
              const element = arrayParrafos[i];
              var pos = i+1;
              await page.goto(`https://www.deepl.com/translator#en/es/${encodeURI(element.text.trim())}`, settings)
              this.setEstado(mainWindow, {id:3, text:`Traduciendo ${pos} de ${arrayParrafos.length} bloque(s)`, status:'running'})

              try {
                await page.waitForFunction(`document.querySelector('[dl-test="translator-target"] textarea').value.trim().length>0`)
                const traduccion = await page.evaluate(() => {
                  const traduccion = document.querySelector('[dl-test="translator-target"] textarea').value.trim();
                  document.querySelector('[dl-test="translator-target"] textarea').value = ''
                  return traduccion
                });
                arrayParrafos[i].traduccion = traduccion
                baneado = false;
                vecesBaneado = 0;
                if(arrayParrafos.length===pos){
                  this.setEstado(mainWindow, {id:3, text:`Traduciendo ${pos} de ${arrayParrafos.length} bloque(s)`, status:'ok'})
                  this.setEstado(mainWindow, {id:4, text:'', status:'empty'})

                }
              } catch (error) {
                //significa que nos han baneado la ip
                baneado = true;
                i = arrayParrafos.length;
                this.setEstado(mainWindow, {id:4, text:'<span style="color:#ff5b5b;"><b>IP baneada.</b> Reiniciando proceso...</span>', status:'running'})
              }
              
              //break;
            }
            if(!baneado){
              //Unimos los parrafos y las traducciones en uno solo
              var texto = '', traduccion='';
              arrayParrafos.forEach(item=>{
                texto=texto + '\n' + item.text
                traduccion=traduccion + '\n' + item.traduccion
              })
  
              await db.query(`UPDATE traducciones set texto = ?, traduccion = ? where id = ?`, [texto, traduccion, post.id])
              this.getData(mainWindow)
              terminado=true;
              this.setEstado(mainWindow, {id:1, text:n+' de '+Object.keys(documento.urls).length+' urls', status:'running'})
              resolve()

            }else{
              vecesBaneado++
              console.log('baneado');
              await browser.close();
              
              if(!stopRunning){

                if(vecesBaneado>3 && reinicioRouter){

                  //reiniciamos el router
                  await request('https://maker.ifttt.com/trigger/reset/with/key/rdcFB2_ZLgJLiAf-pX8HGRQ6qVsxb8GKoL_eePspHT', (err, res, body) => {

                          const internet = async () => {
                            var online = false;
                            //Hasta que no haya internet no paramos de comprobar si  ya ha vuelto
                            while(!online) {
                              await new Promise( resolve => {
                                setTimeout(() => {
                                  internetAvailable()
                                  .then(async ()=>{
                                    browser = await puppeteer.launch({headless: data.browser?false:true});
                                    page = await browser.newPage();
                                    console.log('Se ha reiniciado el router');
                                    online=true;
                                    resolve()
                                  })
                                  .catch(()=>{
                                    console.log("No internet");
                                    resolve()
                                  });

                                }, 3 * 1000)
                              });
                            }
                            resolve()
                          }
                          internet();
                        })


                }else{
                  await new Promise(resolve => setTimeout(resolve, 7*1000));
                  browser = await puppeteer.launch({headless: data.browser?false:true});;
                  page = await browser.newPage();
                }

                
              }
              
              //baneado=true
            }
          }
          
          if(stopRunning){
            resolve()
          }

          
        })
        

      }

      await browser.close();

    }
    run()





    /*
    async function getPic() {
      const browser = await puppeteer.launch({headless: false});
      const page = await browser.newPage();
      await page.goto('https://www.google.es/search?num=100&q=posiciionamiento+se&nfpr=1&sa=X&ved=0ahUKEwic16uf6OfjAhVJU30KHQsZBQcQvgUIMigB');
      //await page.setViewport({width: 1000, height: 500})
      var img = await page.screenshot({encoding: 'binary',  fullPage: true});
      console.log(img);
      //await browser.close();
    }
    getPic();
    */



  },

  stop: function(mainWindow) {
    try {
      browser.close();
    } catch (error) { }
    stopRunning = true
    mainWindow.send('STOP_SCRAPING_DEEPL');
  },

  saveData: async function (mainWindow,data){
    const {nombre} = data.documento
    const documento = {nombre}

    const res = await db.query('INSERT INTO documentos_traducciones set ?', [documento])
    if(res.insertId){
      
      
      await new Promise(resolve => {
        data.documento.urls.forEach(async (element, index)=>{
          element.id_documento=res.insertId
          await db.query('INSERT INTO traducciones set ?', [element])
        })
        setTimeout(resolve, 500)
      });
      this.getData(mainWindow)
    }
  },

  getData: async function(mainWindow){
    const results = await db.query(`SELECT traducciones.*,traducciones.id as 'id_traduccion', documentos_traducciones.* FROM traducciones JOIN documentos_traducciones ON traducciones.id_documento=documentos_traducciones.id ORDER BY documentos_traducciones.id DESC`)
    
    var documentos = {}
    results.forEach(item=>{
      if(!documentos[item.id_documento]){
        documentos[item.id_documento] = {
          id:item.id_documento,
          nombre: item.nombre,
          created_at: item.create_at,
          urls:{}
        }
      }
      documentos[item.id_documento].urls[item.id_traduccion] = {
        id:item.id_traduccion,
        url:item.url,
        hoja:item.hoja,
        idioma_inicio:item.idioma_fin,
        idioma_fin:item.idioma_fin,
        texto:item.texto?item.texto:'',
        traduccion:item.traduccion?item.traduccion:'',
        id_documento:item.id_documento,
      }
      
      
    })
    mainWindow.send('GET_DATA_TRADUCCIONES', documentos);
  },

  deleteData: async function(mainWindow, id){
//    await db.query('DELETE FROM traducciones WHERE traducciones.id_documento = ?; DELETE FROM documentos_traducciones WHERE documentos_traducciones.id = ?'[id,id])
    await db.query('DELETE FROM traducciones WHERE traducciones.id_documento = ?; DELETE FROM documentos_traducciones WHERE documentos_traducciones.id = ?',[id,id])

    this.getData(mainWindow)
  }
}

