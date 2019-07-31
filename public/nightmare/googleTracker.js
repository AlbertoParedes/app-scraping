/* eslint-disable no-undef */
/* eslint-disable no-loop-func */
var Nightmare = require('nightmare');
var nightmare = null;
const path = require('path');
var internetAvailable = require("internet-available");
const request = require('request');

module.exports = {
  run: function(mainWindow, data) {

    var medios = {}

    Nightmare.action('updateStatus', (text , done) => {mainWindow.send('RESPONSE_GOOGLE_TRACKER', text);done();});
    Nightmare.action('uploadResultado', (text , done) => {mainWindow.send('SUBIR_GOOGLE_TRACKER', text);done();});

    var options = {
      typeInterval: 0,
      //executionTimeout: 2 * 60 * 1000,
      //waitTimeout: 2 * 60 * 1000,

      executionTimeout: 2 * 1000,
      waitTimeout: 2 * 1000,

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
    .goto('https://www.google.es/webhp?num=100')
    //.goto('https://www.google.es/')
    .updateStatus({id:0, text:'Abriendo <b>Google</b>', status:'ok'})

    //.wait(3000)

    //analizamos los periodicon individuales
    .then(()=>{
      return new Promise(resolve=>{

        var keywords = data.keywords
        const run = async () => {

          for (i = 0; i < keywords.length; ) {

            await new Promise( resolve => {
              var keyword = keywords[i]

              var kwdDecode = encodeURI(keyword.keyword)

              nightmare
              //eliminamos la keyword a buscar anterior
              .updateStatus({id:2, text:'', status:''})
              //mostramos el cliente a analizar
              .updateStatus({id:1, text:'Cliente: <b>'+keyword.web+'</b>', status:'running'})

              .insert('[name=q]','')
              //.wait(1 * 1000)
              .updateStatus({id:2, text:'Kewyword: <b>'+keyword.keyword+'</b>', status:'running'})
              .insert('[name="q"]', keyword.keyword)
              //.insert('[name="q"]', 'confeccion industrial')
              //.wait(1 * 1000)
              .type('[name="q"]', '\u000d')

              //.wait(`div#res[role="main"] > #search div[data-async-context="query:${kwdDecode}"]`)
              .wait(`div#res[role="main"] > #search div[data-async-context="query:${kwdDecode}"]`)

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
                  } catch (error) {}

                  if(url){
                    n++
                    element.style.position = 'relative'


                    var html = element.innerHTML;
                    //agregamos la posicion a todos los resultados
                    html+= `<div style="position: absolute; font-size: 20px; top: 0px; left: -90px; height: 100%; width: 65px; text-align: center; display: flex; flex-direction: column; justify-content: center;" >${n}</div>`

                    var dominio = url;
                    dominio = dominio.startsWith("http://") ?  dominio.replace('http://','') : dominio;
                    dominio = dominio.startsWith("https://") ?  dominio.replace('https://','') : dominio;
                    dominio = dominio.startsWith("www.") ?  dominio.replace('www.','') : dominio;



                    //Buscamos que al menos uno de los dominios introducidos coincida con la url del resultado
                    var sameWeb = Object.entries(keyword.dominios).find(([k,d])=>{
                      var itemWeb = d;
                      itemWeb = itemWeb.startsWith("http://") ?  itemWeb.replace('http://','') : itemWeb;
                      itemWeb = itemWeb.startsWith("https://") ?  itemWeb.replace('https://','') : itemWeb;
                      itemWeb = itemWeb.startsWith("www.") ?  itemWeb.replace('www.','') : itemWeb;
                      itemWeb = itemWeb.endsWith("/") ?  itemWeb.substring(0,itemWeb.length-1): itemWeb;

                      return dominio.includes(itemWeb)
                    })

                    if(sameWeb){
                      //coincidencia con la url de nuestro cliente
                      html+='<div style="position: absolute; top: -10px; border: 4px solid #e64a89; width: calc(100% + 10px); height: calc(100% + 10px); left: -10px; border-radius: 13px;" ></div>'
                      resultadosCliente.push({
                        posicion: n,
                        url: url,
                        dominio: {id:sameWeb[0], url:sameWeb[1]},
                      })
                    }else{
                      //buscamos si algunos de los dominios de competidores coincide con la url del resultado
                      var sameCompetidor = Object.entries(keyword.competidores).find(([k,d])=>{
                        var itemComp = d;
                        itemComp = itemComp.startsWith("http://") ?  itemComp.replace('http://','') : itemComp;
                        itemComp = itemComp.startsWith("https://") ?  itemComp.replace('https://','') : itemComp;
                        itemComp = itemComp.startsWith("www.") ?  itemComp.replace('www.','') : itemComp;
                        itemComp = itemComp.endsWith("/") ?  itemComp.substring(0,itemComp.length-1): itemComp;
                        return dominio.includes(itemComp)
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
                console.log(altura);

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
                console.log('');
                console.log('');

                nightmare
                .end()
                .then(()=>{

                  //return new Promise(resolve=>{

                    request('https://maker.ifttt.com/trigger/reset/with/key/rdcFB2_ZLgJLiAf-pX8HGRQ6qVsxb8GKoL_eePspHT', (err, res, body) => {

                      const internet = async () => {
                        var online = false;
                        //Hasta que no haya internet no paramos de comprobar si  ya ha vuelto
                        while(!online) {
                          await new Promise( resolve => {
                            setTimeout(() => {

                              internetAvailable()
                              .then(()=>{
                                console.log("Internet available");
                                console.log("Internet available");
                                  nightmare = new Nightmare(options);
                                  nightmare
                                  .useragent('Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36')
                                  .updateStatus({id:0, text:'Abriendo <b>Google</b>', status:'running'})
                                  .goto('https://www.google.es/webhp?num=100')
                                  //.goto('https://www.google.es/')
                                  .updateStatus({id:0, text:'Abriendo <b>Google</b>', status:'ok'})
                                  .then(()=>{
                                    console.log('Ya ha vuelto el internet');
                                  })
                                  .catch(()=>{
                                      console.log("error 4402");
                                      resolve()
                                  });

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
                        console.log('Traza 100');


                      }
                      internet();


                    })

                  //})

                })
                .catch(err=>{
                  console.log('Error 3302:', err);

                })








              })

            })
          }

          console.log('====================================');
          console.log('termina el for');
          console.log('====================================');
          resolve()

        }
        run();

      })
    })
    .then( data => {
      console.log('Success');
      nightmare
      .end()
      .then(()=>{console.log('Cerrando...');})
      .catch(err=>{
        console.log('Error 298:', err);
      })

    })
    .catch (err =>{
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

function getDominio(url){
  var dominio = url;
  dominio = dominio.startsWith("http://") ?  dominio.replace('http://','') : dominio;
  dominio = dominio.startsWith("https://") ?  dominio.replace('https://','') : dominio;
  dominio = dominio.startsWith("www.") ?  dominio.replace('www.','') : dominio;
  return dominio
}
