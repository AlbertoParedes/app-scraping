/* eslint-disable no-undef */
/* eslint-disable no-loop-func */
var Nightmare = require('nightmare');
var nightmare = null;
const path = require('path');
var internetAvailable = require("internet-available");
const request = require('request');
const moment = require('moment')

module.exports = {
  run: function(mainWindow, data) {

    Nightmare.action('updateStatus', (text , done) => {mainWindow.send('RESPONSE_GOOGLE_TRACKER', text);done();});
    Nightmare.action('uploadResultado', (text , done) => {mainWindow.send('SUBIR_GOOGLE_TRACKER', text);done();});
    var urlGoogle = 'https://www.google.es/webhp?num=100'
    //var urlGoogle = 'https://www.google.es'
    var options = {
      typeInterval: 0,
      //executionTimeout: 2 * 60 * 1000,
      //waitTimeout: 2 * 60 * 1000,

      executionTimeout: 2 * 1000,
      waitTimeout: 4 * 1000,

      show: data.browser,
      height: 800,
      width: 650,
      enableLargerThanScreen: true,
      //electronPath: require('../../../electron')//DEPLOY WINDOWS, si creamos la aplicacion con electron-builder esto no hace falta
      //electronPath: require(`${path.join(__dirname, '../../../app.asar.unpacked/node_modules/nightmare/node_modules/electron')}`)//DEPLOY MAC AND WINDOWS
      electronPath: require('../../node_modules/nightmare/node_modules/electron')//DEV
    }


    nightmare = Nightmare(options);

    nightmare
    .useragent('Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36')

    .updateStatus({id:0, text:'Abriendo <b>Google</b>', status:'running'})
    .goto(urlGoogle)
    .updateStatus({id:0, text:'Abriendo <b>Google</b>', status:'ok'})
    .then(()=>{


      return new Promise(resolve=>{

        var keywords = data.keywords

        const run = async () => {

          for (i = 0; i < keywords.length; ) {

            await new Promise( resolve => {
              var keyword = keywords[i];
              //keyword.keyword = 'hhhhhgfhfdvsdfv'

              var kwdDecode = encodeURIComponent(keyword.keyword)
              console.log(i+1,keyword.keyword, kwdDecode);

              console.log('Traza 1');
              nightmare
              //eliminamos la keyword a buscar anterior
              .updateStatus({id:2, text:'', status:''})
              //mostramos el cliente a analizar
              .updateStatus({id:1, text:'Cliente: <b>'+keyword.web+'</b>', status:'running'})
              .insert('[name=q]','')
              //.wait(1 * 1000)
              .updateStatus({id:2, text:'Kewyword: <b>'+keyword.keyword+'</b>', status:'running'})
              .insert('[name="q"]', keyword.keyword)

              .type('[name="q"]', '\u000d')

              //evaluar si existe en  la pagina de google la correccion de gramatica para ir a la pagina correcta
              .evaluate( (keyword) => {
                var badGrammar = document.querySelector('a.spell_orig')
                var notFound = document.querySelector(`div#res[role="main"] > div#topstuff  p[role="heading"] > em`)
                console.log(badGrammar, notFound);
                var data = {}

                if(notFound && notFound.textContent===keyword.keyword){
                  data.notFound = true
                }

                if(badGrammar){
                  if(badGrammar.text===keyword.keyword){
                    data.error='BAD_GRAMMAR'
                    data.url=badGrammar.getAttribute('href')
                  }
                }
                if(Object.keys(data).length>0){

                  return data
                }
                return false

              },keyword)
              .then((response)=>{
                console.log('traza x');

                function handleErrors() {
                  return new Promise(resolve => {
                    console.log(response);
                    if(response && response.error==='BAD_GRAMMAR'){
                      nightmare
                      .goto('http://google.es'+response.url)
                      .then(()=>{resolve(true)})
                      .catch((err)=>{
                        console.log('6700',err);
                        resolve(false)
                      })
                    }

                    resolve(true)

                  });
                }
                function getData(){
                  return new Promise(resolve => {
                    var container = `div#res[role="main"] > #search div[data-async-context="query:${kwdDecode}"]`;
                    if(response && response.notFound){
                      container = `div#res[role="main"]`
                    }

                    nightmare
                    .wait(container)
                    .evaluate( keyword => {

                      var n = 0;
                      //div:not(.kno-ahide) : con esto no contaremos los resultados del acordeon de: "People also ask"
                      var rows = document.querySelectorAll(`div#res[role="main"] > #search div.g`);
                      var resultadosCliente=[], resultadosCompetidores=[]
                      rows.forEach(element => {
                        var acordeon = element.closest('g-accordion-expander')
                        var clase = element.getAttribute('class');
                        if(clase!=='g' || acordeon){return false}

                        var url = false;
                        try {
                          url = element.querySelector('.rc > .r a:not(.fl)').getAttribute('href');
                        } catch (error) {
                          console.log('nourl',error);
                        }

                        if(url){
                          n++
                          element.style.position = 'relative'


                          var html = element.innerHTML;
                          //agregamos la posicion a todos los resultados
                          html+= `<div style="position: absolute; font-size: 20px; top: 0px; left: -90px; height: 100%; width: 65px; text-align: center; display: flex; flex-direction: column; justify-content: center;" >${n}</div>`

                          var dominio = url;
                          //dominio = dominio.startsWith("http://") ?  dominio.replace('http://','') : dominio;
                          //dominio = dominio.startsWith("https://") ?  dominio.replace('https://','') : dominio;
                          //dominio = dominio.startsWith("www.") ?  dominio.replace('www.','') : dominio;



                          //Buscamos que al menos uno de los dominios introducidos coincida con la url del resultado
                          var sameWeb = Object.entries(keyword.dominios).find(([k,d])=>{
                            if(d.status==='activo'){
                              var itemWeb = d.valor;
                              itemWeb = itemWeb.startsWith("http://") ?  itemWeb.replace('http://','') : itemWeb;
                              itemWeb = itemWeb.startsWith("https://") ?  itemWeb.replace('https://','') : itemWeb;
                              itemWeb = itemWeb.startsWith("www.") ?  itemWeb.replace('www.','') : itemWeb;
                              itemWeb = itemWeb.endsWith("/") ?  itemWeb.substring(0,itemWeb.length-1): itemWeb;
                              console.log(itemWeb,' - ',dominio);
                              
                              return dominio.includes(itemWeb)
                            }
                            return false
                          })

                          if(sameWeb){
                            //coincidencia con la url de nuestro cliente
                            html+='<div style="position: absolute; top: -10px; border: 4px solid #e64a89; width: calc(100% + 10px); height: calc(100% + 10px); left: -10px; border-radius: 13px;" ></div>'
                            resultadosCliente.push({
                              posicion: n,
                              url: url,
                              dominio: {id:sameWeb[0], url:sameWeb[1]},
                            })
                          }else if(keyword.competidores){
                            //buscamos si algunos de los dominios de competidores coincide con la url del resultado
                            var sameCompetidor = Object.entries(keyword.competidores).find(([k,d])=>{
                              if(d.status==='activo'){
                                var itemComp = d.valor;
                                itemComp = itemComp.startsWith("http://") ?  itemComp.replace('http://','') : itemComp;
                                itemComp = itemComp.startsWith("https://") ?  itemComp.replace('https://','') : itemComp;
                                itemComp = itemComp.startsWith("www.") ?  itemComp.replace('www.','') : itemComp;
                                itemComp = itemComp.endsWith("/") ?  itemComp.substring(0,itemComp.length-1): itemComp;
                                return dominio.includes(itemComp)
                              }
                              return false
                            })
                            if(sameCompetidor){
                              resultadosCompetidores.push({
                                posicion: n,
                                url: url,
                                dominio: {id:sameCompetidor[0], url:sameCompetidor[1]},
                              })
                              html+='<div style="position: absolute; top: -10px; border: 4px solid #4a9de6; width: calc(100% + 10px); height: calc(100% + 10px); left: -10px; border-radius: 13px;" ></div>'
                            }
                          }
                          element.innerHTML = html;
                        }
                      })

                      //console.log('resultados', resultados);
                      //console.log('resultadosCompetidores', resultadosCompetidores);

                      const body = document.body;
                      body.setAttribute("style", "overflow: hidden; transform:scale(0.5); -webkit-transform-origin-x:left; -webkit-transform-origin-y:top; -moz-transform-origin-x:left; -moz-transform-origin-y: top;");

                      return {
                        resultados: {resultadosCliente, resultadosCompetidores},
                        height: body.getBoundingClientRect().height,
                        width: body.getBoundingClientRect().width
                      };

                    }, keyword)


                    .then((response)=>{

                      //asignamos los resultados a la keyword
                      keyword.resultados = response.resultados.resultadosCliente.length>0?response.resultados.resultadosCliente:false
                      keyword.resultadosCompetidores = response.resultados.resultadosCompetidores.length>0?response.resultados.resultadosCompetidores:false

                      var altura = response.height < 8100 ? response.height : 8100;
                      altura = Math.ceil(altura)

                      nightmare
                      .viewport(650,altura)
                      .wait(1500)
                      .screenshot((err, buf) => {
                        console.log('screenshot',buf);
                        console.log();
                        keyword.buf = buf;

                        nightmare
                        .uploadResultado(keyword)
                        .then(()=>{
                          i++;// ya podemos hacer la siguiente keyword
                          resolve();
                        })
                        .catch(err=>{ console.log('Error 1 ->', err) })

                      })
                      .then(()=>{   console.log('caca') })
                      .catch(err=>{ console.log('Error 2 ->',err) })


                    })
                    .catch(err=>{

                      //hay qure reiniciar router

                      console.log('Error grave:', err);
                      console.log('');

                      if(err.toString().includes('[role="main"]')){
                        console.log('Error en el body, no lo encuentra');
                      }

                      nightmare
                      .end()
                      .then(()=>{

                        request('https://maker.ifttt.com/trigger/reset/with/key/rdcFB2_ZLgJLiAf-pX8HGRQ6qVsxb8GKoL_eePspHT', (err, res, body) => {

                          const internet = async () => {
                            var online = false;
                            //Hasta que no haya internet no paramos de comprobar si  ya ha vuelto
                            while(!online) {
                              await new Promise( resolve => {
                                setTimeout(() => {

                                  internetAvailable()
                                  .then(()=>{
                                    nightmare
                                    .end()
                                    .then(()=>{
                                      console.log("Internet available");
                                      nightmare = new Nightmare(options);
                                      nightmare
                                      .useragent('Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36')
                                      .updateStatus({id:0, text:'Abriendo <b>Google</b>', status:'running'})
                                      .goto(urlGoogle)
                                      .updateStatus({id:0, text:'Abriendo <b>Google</b>', status:'ok'})
                                      .then(()=>{
                                        console.log('Ya ha vuelto el internet');
                                        online=true;
                                        resolve()
                                      })
                                      .catch((err)=>{
                                          console.log("error 4402", err);
                                          nightmare
                                          .end()
                                          .then(()=>{
                                            console.log('okkk');
                                            resolve()
                                          })
                                          .catch(err=>{
                                            console.log('6800',err);
                                            resolve()
                                          })
                                      });


                                      console.log("Ventana abierta otra vez");
                                    })
                                    .catch(err=>{
                                      resolve()
                                    })



                                  })
                                  .catch(()=>{
                                    console.log("No internet");
                                    resolve()
                                  });

                                }, 3 * 1000)
                              });
                            }

                            resolve()
                            console.log('Traza 100');


                          }
                          internet();


                        })



                      })
                      .catch(err=>{
                        console.log('Error 3302:', err);
                      })
                    })
                  })

                }
                async function waitOK() {
                  var access = await handleErrors();

                  if(access){
                    await getData()
                  }

                  resolve()

                }
                waitOK();

              })
              .catch((err)=>{
                console.log('====================================');
                console.log('Error gordo: ', err);
                console.log('====================================');
                resolve()
              })




            })

          }
          console.log('Ha terminado el for');
        }
        run();


      })


    })
    .then( data => {
      console.log(moment());
      console.log('Success');
      nightmare
      .end()
      .then(()=>{console.log('Cerrando...');})
      .catch(err=>{
        console.log('Error 298:', err);
      })

    })
    .catch (err =>{
      console.log(moment());
      console.log('Error 4 ->',err);
      nightmare
      .end()
      .then(()=>{console.log('Cerrando...');})
      .catch(err=>{
        console.log('Error 298:', err);
      })
    })
    return "Scraping";
  },

  stop: function() {
    nightmare.end().then().catch(err=>{console.log(err)})
    return "Close";
  }
}
