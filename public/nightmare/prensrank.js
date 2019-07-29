/* eslint-disable no-undef */
/* eslint-disable no-loop-func */
var Nightmare = require('nightmare');
var nightmare = null;
const path = require('path');

module.exports = {
  run: function(mainWindow, data) {

    var medios = {}
    
    Nightmare.action('updateStatus', (text , done) => {mainWindow.send('RESPONSE_PRENSARANK', text);done();});
    Nightmare.action('subirMedios', (text , done) => {mainWindow.send('SUBIR_MEDIOS_PRENSARANK', text);done();});

    nightmare = Nightmare({
      typeInterval: 0,
      executionTimeout: 2 * 60 * 1000,
      waitTimeout: 2 * 60 * 1000,
      //executionTimeout: 6000,
      //waitTimeout: 10000,
      show: data.browser,
      height: 800,
      width: 1200,
      //electronPath: require('../../node_modules/nightmare/node_modules/electron')//DEV
      //electronPath: require('../../../electron')//DEPLOY WINDOWS
      //electronPath: require(`${path.join(__dirname, '../../node_modules/nightmare/node_modules/electron')}`)
      electronPath: require(`${path.join(__dirname, '../../../app.asar.unpacked/node_modules/nightmare/node_modules/electron')}`)//DEPLOY MAC
    });

    nightmare
    .updateStatus({id:0, text:'Abriendo <b>Prensarank</b>', status:'running'})
    .goto('https://prensarank.com/panel/')
    .updateStatus({id:0, text:'Abriendo <b>Prensarank</b>', status:'ok'})

    .wait('form#user-signup input[name="email"]')
    .updateStatus({id:1, text:`Introduciendo email: <b>${data.account.user}</b>`, status:'running'})
    .insert('form#user-signup input[name="email"]', data.account.user)
    .updateStatus({id:1, text:`Introduciendo email: <b>${data.account.user}</b>`, status:'ok'})

    .wait('form#user-signup input[name="password"]')
    .updateStatus({id:2, text:`Introduciendo contraseña: <b style="font-size: 30px;position: relative;line-height:  0px;top: 4px;">·······</b>`, status:'running'})
    .insert('form#user-signup input[name="password"]', data.account.password)
    .updateStatus({id:2, text:`Introduciendo contraseña: <b style="font-size: 30px;position: relative;line-height:  0px;top: 4px;">·······</b>`, status:'ok'})
    .wait('button#submit-form')

    .click('button#submit-form')
    .updateStatus({id:3, text:'Accediendo al panel', status:'running'})
    .wait(5000)
    .wait('div.page-content')//esperamos a que se encuentre el panel de inicio para saber que estamos dentro de nuestra cuenta
    .updateStatus({id:3, text:'Accediendo al panel', status:'ok'})
    
    //analizamos los periodicon individuales
    .then(()=>{
      // promesa global que termina cuando termina el bucle de paginas con el que cogemos todas las urls
      return new Promise( resolve =>{
        console.log('Traza 1');
        

        var idContainer = 'newspaper_wrapper', idPaginate = 'newspaper_paginate'

        nightmare
        .updateStatus({id:4, text:'Accediendo a <b>Periódicos (Individual)</b>', status:'running'})
        .goto('https://prensarank.com/panel/periodicos/')
        .wait(`#${idContainer} > div.row:nth-child(2) table tbody tr`)
        .updateStatus({id:4, text:'Accediendo a <b>Periódicos (Individual)</b>', status:'ok'})

        .updateStatus({id:5, text:'Guardando medios', status:'running'})
        .evaluate( (idContainer, idPaginate) => {
          return new Promise( resolve =>{
            var periodicosIndividuales = []
            var activePage=0 , totalPages = document.querySelector(`#${idContainer} > div.row:last-child #${idPaginate} > ul.pagination > li.paginate_button:nth-last-child(2)`).textContent
            
            totalPages = !isNaN(totalPages) ? (+totalPages) : 1

            
            

            const loop = async () => {
              for(var i = 1; i<=totalPages; i++){
                //Comprobamos que la pagina activa es la misma que la variable y sino hay que dar al boton next;
                activePage = (+document.querySelector(`#${idContainer} > div.row:last-child #${idPaginate} > ul.pagination > li.paginate_button.active`).textContent)
                if(activePage!==i){
                  //clickamos next page para refrescar la tabla
                  document.querySelector(`#${idContainer} > div.row:last-child #${idPaginate} > ul.pagination > li.paginate_button.next`).click()
                  await new Promise( resolve => {
                    var checkExist = setInterval( () => {
                      var actualPage = (+document.querySelector(`#${idContainer} > div.row:last-child #${idPaginate} > ul.pagination > li.paginate_button.active`).textContent)
                      if (actualPage===i) {
                        clearInterval(checkExist);
                        resolve()
                      }
                  }, 1000);
                  })
                  activePage = i;
                }
                // si llega a este punto debemos coger todos los datos de la tabla
                var rows = document.querySelectorAll(`#${idContainer} > div.row:nth-child(2) > div > table > tbody > tr[role='row']`);
                if(!rows){
                  await new Promise( resolve => {
                    var checkExist = setInterval( () => {
                      var actualPage = document.querySelectorAll(`#${idContainer} > div.row:nth-child(2) > div > table > tbody > tr[role='row']`);
                      if (actualPage) {
                        rows = document.querySelectorAll(`#${idContainer} > div.row:nth-child(2) > div > table > tbody > tr[role='row']`);
                        clearInterval(checkExist);
                        resolve()
                      }
                  }, 1000);
                  })
                }

                for (let r of rows) {
                  var 
                    url = r.querySelector('td:nth-child(1) > a').getAttribute('href').replace('http://nullrefer.com/?','').replace('https://nullrefer.com/?',''),
                    name = r.querySelector('td:nth-child(1) > a').textContent,
                    oferta = r.querySelector('td:nth-child(1) > a > i.fa.fa-tag')?true:false,
                    idioma = r.querySelector('td:nth-child(2) > img').getAttribute('src'),
                    dr = (+r.querySelector('td:nth-child(3)').textContent),
                    da = (+r.querySelector('td:nth-child(4)').textContent),
                    pa = (+r.querySelector('td:nth-child(5)').textContent),
                    cf = (+r.querySelector('td:nth-child(6)').textContent),
                    tf = (+r.querySelector('td:nth-child(7)').textContent),
                    rd = (+r.querySelector('td:nth-child(8)').textContent),
                    precioSinGrupo = r.querySelector('td:nth-child(9)').textContent
                  
                  idioma = idioma.substring(idioma.lastIndexOf('/')+1, idioma.lastIndexOf('.'))
                  periodicosIndividuales.push({name,url,oferta,idioma, dr, da, pa, cf, tf, rd, precioSinGrupo})
                }
              }
              resolve(periodicosIndividuales)
            }
            loop();
          })
        },idContainer, idPaginate)
        .then((periodicosIndividuales)=>{
          medios['periodicosIndividuales'] = periodicosIndividuales;

          nightmare
          .updateStatus({id:5, text:'Guardando medios', status:'ok'})
          .then().catch(err=>{console.log(err)})

          resolve()
        })
        .catch(err=>{
          nightmare
          .updateStatus({id:5, text:'Guardando medios', status:'error'})
          .then().catch(err=>{console.log(err)})
          //console.log(err);
        })
      })  
    })
    .catch(err=>{
      console.log(err);
    })

    //analizamos los blogs
    .then(()=>{
      return new Promise( resolve =>{
        
        var idContainer = 'blog_wrapper', idPaginate = 'blog_paginate'
        nightmare
        .updateStatus({id:6, text:'Accediendo a <b>Blogs (Individual)</b>', status:'running'})
        .goto('https://prensarank.com/panel/blogs/')
        .wait(`#${idContainer} > div.row:nth-child(2) table tbody tr`)
        .updateStatus({id:6, text:'Accediendo a <b>Blogs (Individual)</b>', status:'ok'})

        .updateStatus({id:7, text:'Guardando medios', status:'running'})
        .evaluate( (idContainer, idPaginate) => {
          console.log('Traza 2');
          return new Promise( resolve =>{
            console.log('Traza 2');
            var blogsIndividuales = []
            var activePage=0 , totalPages = document.querySelector(`#${idContainer} > div.row:last-child #${idPaginate} > ul.pagination > li.paginate_button:nth-last-child(2)`).textContent
            totalPages = !isNaN(totalPages) ? (+totalPages) : 1
            console.log('Traza 2.1');
            const runLoop = async () => {
              for(var i = 1; i<=totalPages; i++){
                //Comprobamos que la pagina activa es la misma que la variable y sino hay que dar al boton next;
                activePage = (+document.querySelector(`#${idContainer} > div.row:last-child #${idPaginate} > ul.pagination > li.paginate_button.active`).textContent)
                if(activePage!==i){
                  //clickamos next page para refrescar la tabla
                  document.querySelector(`#${idContainer} > div.row:last-child #${idPaginate} > ul.pagination > li.paginate_button.next`).click()
                  await new Promise( resolve => {
                    var checkExist = setInterval( () => {
                      var actualPage = (+document.querySelector(`#${idContainer} > div.row:last-child #${idPaginate} > ul.pagination > li.paginate_button.active`).textContent)
                      if (actualPage===i) {
                        clearInterval(checkExist);
                        resolve()
                      }
                  }, 2000);
                  })
                  activePage = i;
                }
                // si llega a este punto debemos coger todos los datos de la tabla
                var rows = document.querySelectorAll(`#${idContainer} > div.row:nth-child(2) > div > table > tbody > tr[role='row']`);
                if(!rows){
                  await new Promise( resolve => {
                    var checkExist = setInterval( () => {
                      var actualPage = document.querySelectorAll(`#${idContainer} > div.row:nth-child(2) > div > table > tbody > tr[role='row']`);
                      if (actualPage) {
                        rows = document.querySelectorAll(`#${idContainer} > div.row:nth-child(2) > div > table > tbody > tr[role='row']`);
                        clearInterval(checkExist);
                        resolve()
                      }
                  }, 1000);
                  })
                }
                
                for (let r of rows) {
                  var 
                    url = r.querySelector('td:nth-child(1) > a').getAttribute('href').replace('http://nullrefer.com/?','').replace('https://nullrefer.com/?',''),
                    name = r.querySelector('td:nth-child(1) > a').textContent,
                    oferta = r.querySelector('td:nth-child(1) > a > i.fa.fa-tag')?true:false,
                    idioma = r.querySelector('td:nth-child(2) > img').getAttribute('src'),
                    dr = (+r.querySelector('td:nth-child(3)').textContent),
                    da = (+r.querySelector('td:nth-child(4)').textContent),
                    pa = (+r.querySelector('td:nth-child(5)').textContent),
                    cf = (+r.querySelector('td:nth-child(6)').textContent),
                    tf = (+r.querySelector('td:nth-child(7)').textContent),
                    rd = (+r.querySelector('td:nth-child(8)').textContent),
                    precioSinGrupo = r.querySelector('td:nth-child(9)').textContent
                  
                  idioma = idioma.substring(idioma.lastIndexOf('/')+1, idioma.lastIndexOf('.'))
                  blogsIndividuales.push({name, url,oferta,idioma, dr, da, pa, cf, tf, rd, precioSinGrupo})
                  
                }
              }
              console.log('Traza 2.2');
              resolve(blogsIndividuales)
            }
            runLoop();

          })

        }, idContainer, idPaginate)
        .then((blogsIndividuales)=>{
          medios['blogsIndividuales'] = blogsIndividuales;

          nightmare
          .updateStatus({id:7, text:'Guardando medios', status:'ok'})
          .then()
          .catch(err=>{console.log(err)})

          resolve()
        })
        .catch(err=>{
          console.log(err)
          nightmare
          .updateStatus({id:7, text:'Guardando medios', status:'error'})
          .then().catch(err=>{console.log(err)})
        })
      })  
    })
    .catch(err=>{
      console.log(err);
    })

    //analizamos los Grupos(periodicos)
    .then(()=>{
      return new Promise( resolve =>{
        console.log('Traza 3');
        var idContainer = 'groups_wrapper', idPaginate = 'groups_paginate'
        nightmare
        .updateStatus({id:8, text:'Accediendo a <b>Grupos (periódicos)</b>', status:'running'})
        .goto('https://prensarank.com/panel/grupos/')
        .wait(`#${idContainer} > div.row:nth-child(2) table tbody tr`)
        .updateStatus({id:8, text:'Accediendo a <b>Grupos (periódicos)</b>', status:'ok'})

        .updateStatus({id:9, text:'Guardando medios', status:'running'})
        .evaluate( (idContainer, idPaginate) => {
          return new Promise( resolve =>{
            
            var gruposPeriodicos = []
            var activePage=0 , totalPages = document.querySelector(`#${idContainer} > div.row:last-child #${idPaginate} > ul.pagination > li.paginate_button:nth-last-child(2)`).textContent
            totalPages = !isNaN(totalPages) ? (+totalPages) : 1
            
            const runLoop = async () => {
              for(var i = 1; i<=totalPages; i++){
                //Comprobamos que la pagina activa es la misma que la variable y sino hay que dar al boton next;
                activePage = (+document.querySelector(`#${idContainer} > div.row:last-child #${idPaginate} > ul.pagination > li.paginate_button.active`).textContent)
                if(activePage!==i){
                  //clickamos next page para refrescar la tabla
                  document.querySelector(`#${idContainer} > div.row:last-child #${idPaginate} > ul.pagination > li.paginate_button.next`).click()
                  await new Promise( resolve => {
                    var checkExist = setInterval( () => {
                      var actualPage = (+document.querySelector(`#${idContainer} > div.row:last-child #${idPaginate} > ul.pagination > li.paginate_button.active`).textContent)
                      if (actualPage===i) {
                        clearInterval(checkExist);
                        resolve()
                      }
                  }, 1000);
                  })
                  activePage = i;
                }
                // si llega a este punto debemos coger todos los datos de la tabla
                var rows = document.querySelectorAll(`#${idContainer} > div.row:nth-child(2) > div > table > tbody > tr[role='row']`);
                if(!rows){
                  await new Promise( resolve => {
                    var checkExist = setInterval( () => {
                      var actualPage = document.querySelectorAll(`#${idContainer} > div.row:nth-child(2) > div > table > tbody > tr[role='row']`);
                      if (actualPage) {
                        rows = document.querySelectorAll(`#${idContainer} > div.row:nth-child(2) > div > table > tbody > tr[role='row']`);
                        clearInterval(checkExist);
                        resolve()
                      }
                  }, 1000);
                  })
                }
                
                for (let r of rows) {
                  var 
                    url = r.querySelector('td:nth-child(1) > a').getAttribute('href').replace('http://nullrefer.com/?','').replace('https://nullrefer.com/?',''),
                    name = r.querySelector('td:nth-child(1) > a').textContent,
                    oferta = r.querySelector('td:nth-child(1) > a > i.fa.fa-tag')?true:false,
                    dr = (+r.querySelector('td:nth-child(2)').textContent),
                    da = (+r.querySelector('td:nth-child(3)').textContent),
                    pa = (+r.querySelector('td:nth-child(4)').textContent),
                    cf = (+r.querySelector('td:nth-child(5)').textContent),
                    tf = (+r.querySelector('td:nth-child(6)').textContent),
                    em = (+r.querySelector('td:nth-child(7)').textContent),
                    eo = (+r.querySelector('td:nth-child(8)').textContent),
                    tematica = r.querySelector('td:nth-child(9)').textContent,
                    precioPorPersona = r.querySelector('td:nth-child(10)').textContent
                  gruposPeriodicos.push({name, url,oferta, dr, da, pa, cf, tf, em, eo, tematica, precioPorPersona })
                }
              }
              resolve(gruposPeriodicos)
            }
            runLoop();

          })

        }, idContainer, idPaginate)
        .then((gruposPeriodicos)=>{
          medios['gruposPeriodicos'] = gruposPeriodicos;

          nightmare
          .updateStatus({id:9, text:'Guardando medios', status:'ok'})
          .then()
          .catch(err=>{console.log(err)})

          resolve()
        })
        .catch(err=>{
          nightmare
          .updateStatus({id:9, text:'Guardando medios', status:'error'})
          .then()
          .catch(err=>{console.log(err)})
        })
      })  
    })
    .catch(err=>{
      console.log(err);
    })

    //analizamos los Grupos(blogs)
    .then(()=>{
      return new Promise( resolve =>{
        console.log('Traza 4');
        var idContainer = 'groupsblogs_wrapper', idPaginate = 'groupsblogs_paginate'
        nightmare
        .updateStatus({id:10, text:'Accediendo a <b>Grupos (blogs)</b>', status:'running'})
        .goto('https://prensarank.com/panel/grupos-blogs/')
        .wait(`#${idContainer} > div.row:nth-child(2) table tbody tr`)
        .updateStatus({id:10, text:'Accediendo a <b>Grupos (blogs)</b>', status:'ok'})

        .updateStatus({id:11, text:'Guardando medios', status:'running'})
        .evaluate( (idContainer, idPaginate) => {
          return new Promise( resolve =>{
            
            var gruposBlogs = []
            var activePage=0 , totalPages = document.querySelector(`#${idContainer} > div.row:last-child #${idPaginate} > ul.pagination > li.paginate_button:nth-last-child(2)`).textContent
            totalPages = !isNaN(totalPages) ? (+totalPages) : 1
            
            const runLoop = async () => {
              for(var i = 1; i<=totalPages; i++){
                //Comprobamos que la pagina activa es la misma que la variable y sino hay que dar al boton next;
                activePage = (+document.querySelector(`#${idContainer} > div.row:last-child #${idPaginate} > ul.pagination > li.paginate_button.active`).textContent)
                if(activePage!==i){
                  //clickamos next page para refrescar la tabla
                  document.querySelector(`#${idContainer} > div.row:last-child #${idPaginate} > ul.pagination > li.paginate_button.next`).click()
                  await new Promise( resolve => {
                    var checkExist = setInterval( () => {
                      var actualPage = (+document.querySelector(`#${idContainer} > div.row:last-child #${idPaginate} > ul.pagination > li.paginate_button.active`).textContent)
                      if (actualPage===i) {
                        clearInterval(checkExist);
                        resolve()
                      }
                  }, 1000);
                  })
                  activePage = i;
                }
                // si llega a este punto debemos coger todos los datos de la tabla
                var rows = document.querySelectorAll(`#${idContainer} > div.row:nth-child(2) > div > table > tbody > tr[role='row']`);
                if(!rows){
                  await new Promise( resolve => {
                    var checkExist = setInterval( () => {
                      var actualPage = document.querySelectorAll(`#${idContainer} > div.row:nth-child(2) > div > table > tbody > tr[role='row']`);
                      if (actualPage) {
                        rows = document.querySelectorAll(`#${idContainer} > div.row:nth-child(2) > div > table > tbody > tr[role='row']`);
                        clearInterval(checkExist);
                        resolve()
                      }
                  }, 1000);
                  })
                }
                
                for (let r of rows) {
                  var 
                    url = r.querySelector('td:nth-child(1) > a').getAttribute('href').replace('http://nullrefer.com/?','').replace('https://nullrefer.com/?',''),
                    name = r.querySelector('td:nth-child(1) > a').textContent,
                    oferta = r.querySelector('td:nth-child(1) > a > i.fa.fa-tag')?true:false,
                    dr = (+r.querySelector('td:nth-child(2)').textContent),
                    da = (+r.querySelector('td:nth-child(3)').textContent),
                    pa = (+r.querySelector('td:nth-child(4)').textContent),
                    cf = (+r.querySelector('td:nth-child(5)').textContent),
                    tf = (+r.querySelector('td:nth-child(6)').textContent),
                    em = (+r.querySelector('td:nth-child(7)').textContent),
                    eo = (+r.querySelector('td:nth-child(8)').textContent),
                    tematica = r.querySelector('td:nth-child(9)').textContent,
                    precioPorPersona = r.querySelector('td:nth-child(10)').textContent
                    gruposBlogs.push({name, url,oferta, dr, da, pa, cf, tf, em, eo, tematica, precioPorPersona })
                }
              }
              resolve(gruposBlogs)
            }
            runLoop();

          })

        }, idContainer, idPaginate)
        .then((gruposBlogs)=>{
          medios['gruposBlogs'] = gruposBlogs;

          nightmare
          .updateStatus({id:11, text:'Guardando medios', status:'ok'})
          .then().catch(err=>{console.log(err)})

          resolve()
        })
        .catch(err=>{
          nightmare
          .updateStatus({id:11, text:'Guardando medios', status:'error'})
          .then().catch(err=>{console.log(err)})
          //console.log(err);
        })
      })  
    })
    .catch(err=>{
      console.log(err);
    })

    .then(()=>{
      try {
        nightmare
        .subirMedios({medios})
        .updateStatus({id:10000, text:'Done', status:'ok'})
        .end().then().catch(err=>{console.log(err)})
        console.log('Traza 5');
      } catch (error) {
        console.log('Traza 5',error);
      }
     
    })
    .catch( error =>{
      console.log('Traza 6');
      try {
        nightmare
        .updateStatus({id:10000, text:'Ha ocurrido algún error', status:'error'})
        .end().then().catch(err=>{console.log(err)})
        console.log(error);
      } catch (error) {
        console.log('Traza 5',error);
      }
      
      
    })
    return "Scraping";
  },

  stop: function() {
    nightmare.end().then().catch(err=>{console.log(err)})
    return "Close";
  }
}