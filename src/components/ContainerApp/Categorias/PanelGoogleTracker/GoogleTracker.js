import React, {Component} from 'react'
import { ReactComponent as Play } from '../../../Global/Images/play.svg';
import { ReactComponent as Reset } from '../../../Global/Images/replay.svg';
import { ReactComponent as Loop } from '../../../Global/Images/loop.svg';
import { ReactComponent as Cross } from '../../../Global/Images/cross.svg';
import { ReactComponent as Check } from '../../../Global/Images/check.svg';
import ReactHtmlParser from 'react-html-parser';
import ConfirmAlert from '../../../Global/ConfirmAlert'
import firebase from '../../../../firebase/Firebase';
import Switch from '../../../Global/Switch'
import functions from '../../../../functions'
import axios from 'axios';
import moment from 'moment'

const db = firebase.database().ref();
const { ipcRenderer } = window.require('electron');

class GoogleTracker extends Component{

  constructor(props){
    super(props)
    this.state={
      visibility:this.props.visibility,
      documents: {},
      recentDocuments:{} ,
      getData:false,
      styleImage:{background:`linear-gradient(95.65deg, rgb(22, 26, 57) 13.2%, rgba(22, 26, 57, 0.9) 55.88%, rgba(39, 39, 72, 0.35) 97.88%) center center / cover, url(${this.props.app.image}) no-repeat`,backgroundPosition: "center center",transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0s',position: 'absolute',width: '100%',height: '100%',top: '0px',left: '0px'},
      statusScript:'run',//el status puede ser: run, running, cancel
      browser: true,
      estados:{},
      showTerminal:false,
      clientes:{},
      num:0,
      keywords:[],
      reiniciar:false
    }
  }

  componentWillMount = () => {
    ipcRenderer.removeListener('RESPONSE_GOOGLE_TRACKER',this.updateMessageScraping);
    ipcRenderer.removeListener('SUBIR_GOOGLE_TRACKER',this.subirResultado);
  }
  componentDidMount = () => {
    ipcRenderer.on('RESPONSE_GOOGLE_TRACKER',this.updateMessageScraping);
    ipcRenderer.on('SUBIR_GOOGLE_TRACKER',this.subirResultado);
  }
  updateMessageScraping = (event, data) => {
    var estados = this.state.estados;
    estados[data.id]=data;
    this.setState({estados})
  }

  subirResultado = (event, keyword) => {

    var year = moment().format('YYYY');
    var month = moment().format('MM');
    var day = moment().format('DD');
    var id_date = moment().format('YYYY-MM-DD')

    day = '02'
    id_date = '2019-08-02'

    var file = new Blob( [keyword.buf], { type: "image/png" } );
    file.lastModifiedDate = new Date();
    file.name = `${day}.png`;

    var data = new FormData();
    data.append('path', `${keyword.id_cliente}/${keyword.id_keyword}/${year}/${month}`);
    data.append("image", file, file.name);

    const BASE_URL = 'https://seo.yoseomk.vps-100.netricahosting.com';
    axios.post( `${BASE_URL}/files/upload-image-tracking`, data)
    .then( res => {
      if(res.status===200){

        var imageUrl = `${BASE_URL}/${res.data.imageUrl}`
        var multiPath = {}
        var new_results = {
          previous : keyword.results.new,
          new:{
            all_positions:keyword.resultados,
            first_position:keyword.resultados?keyword.resultados[0].posicion:false,
            first_url:keyword.resultados?keyword.resultados[0].url:false,
            id_date:id_date,
            image:imageUrl,
            competidores: keyword.resultadosCompetidores,
          }
        }
        multiPath[`Servicios/Tracking/Resultados/clientes/${keyword.id_cliente}/${keyword.id_keyword}/keyword`] = keyword.keyword;
        multiPath[`Servicios/Tracking/Resultados/clientes/${keyword.id_cliente}/${keyword.id_keyword}/dates/${id_date}`]={
          id_date:id_date,
          image: imageUrl,
          keyword:keyword.keyword,
          timestamp : Date.now(),
          results:{
            all_positions:keyword.resultados,
            first_position:keyword.resultados?keyword.resultados[0].posicion:false,
            first_url:keyword.resultados?keyword.resultados[0].url:false,
            competidores: keyword.resultadosCompetidores,
          }

        }

        multiPath[`Clientes/${keyword.id_cliente}/servicios/tracking/keywords/${keyword.id_keyword}/done`]= true;
        multiPath[`Clientes/${keyword.id_cliente}/servicios/tracking/keywords/${keyword.id_keyword}/results`]= new_results;
        console.log(multiPath);
        
        db.update(multiPath)
        .then(()=>console.log('Actualizado correctamente', keyword.id_cliente,  keyword.keyword ))
        .catch(err => console.log(err))
        

      }
      
    })

    this.setState({num:this.state.num-1})
  }

  componentWillReceiveProps = newProps => {
    if(this.state.visibility!==newProps.visibility){
      if(!this.state.getData){
        this.setState({visibility:newProps.visibility,getData:true},()=>{
          this.getData()
        })
      }else{
        this.setState({visibility:newProps.visibility})
      }
    }
  }

  getData = () => {
    var multipath = {}

    //db.child('Clientes').orderByKey().limitToFirst(1).on("value", snapshot =>{
    db.child('Clientes').orderByKey().once("value", snapshot =>{
      var clientes = {};
      snapshot.forEach( data => {
        var {eliminado,activo, web, id_cliente, servicios} = data.val();
        try {
          if(!eliminado && activo && servicios.tracking.activo){
            clientes[data.key]= data.val();
          }
        } catch (error) {}

      });
      
      this.setState({clientes},()=>this.collectKeywords())
    })

  }

  collectKeywords = () => {

    var clientes = this.state.clientes;
    var keywords = []

    Object.entries(clientes).forEach(([i,c])=>{

      if(c.servicios.tracking.keywords && c.servicios.tracking.dominios){
        Object.entries(c.servicios.tracking.keywords).forEach(([j,k])=>{

          if(k.activo && !k.eliminado && !k.done ){

            var kwd = k
            kwd.id_cliente = c.id_cliente
            kwd.web = c.web
            kwd.dominios = c.servicios.tracking.dominios
            kwd.competidores = c.servicios.tracking.competidores?c.servicios.tracking.competidores:false
            keywords.push(kwd)

          }

        })
      }

    })
    console.log(keywords);
    
    this.setState({keywords, num:keywords.length})

  }

  handleScript = () => {
    var statusScript = this.state.statusScript;

    var data = {
      browser:this.state.browser,
      keywords:this.state.keywords
    }


    if(statusScript==='run'){
      statusScript = 'running';
      ipcRenderer.send('START_GOOGLE_TRACKER',data);
      this.setState({statusScript, estados:{}, showTerminal:true})
    }else if(statusScript==='running'){
      statusScript='run'
      ipcRenderer.send('STOP_GOOGLE_TRACKER',data);
      this.setState({statusScript, showTerminal:false})
    }
  }

  callbackSwitch = (json) => {
    if(json.id==='browser'){
      if(this.state.statusScript==='run'){
        this.setState({browser:json.valor})
      }
    }
  }

  clearKeywordsDone = () => {


    var multiPath = {}
    Object.entries(this.state.clientes).forEach( ([k,c]) => {
      //con esto solo activamos el cliente deseado
      //if(c.id_cliente!=="-LJEGvPbJdRTHycJKMsX")return null
      if(!c.servicios.tracking || c.eliminado || !c.servicios.tracking.activo || !c.servicios.tracking.keywords)return false;
      Object.entries(c.servicios.tracking.keywords).forEach( ([k2, w]) =>{
        if(!w.activo || w.eliminado) return false;
        multiPath[`Clientes/${c.id_cliente}/servicios/tracking/keywords/${w.id_keyword}/done`]=false
      })

    })
    console.log(multiPath);
    db.update(multiPath)
    .then(()=>{
      console.log('Actualizado correctamente');
      this.setState({reiniciar:false})
    })
    .catch(err=>{console.log(err);
    })

  }

  confirmResult = (result) => {
    if(result==='cancelar'){
      this.setState({reiniciar:false})
    }if(result==='aceptar'){
      this.clearKeywordsDone()
      
    }

  }


  render(){
    var numDocuments = this.state.num;
    console.log(numDocuments);
    if(!this.state.visibility)return false
    return(
      <div className='home-app' >
        {/*TERMINAL*/}
        <div className={` ${this.state.showTerminal?'show-terminal':'hidde-terminal'}`}>
          <div className={`container-terminal`}>
            <h3 className='tiitle-grid pdd-top-10'>Terminal</h3>
            {
              Object.entries(this.state.estados).map(([i,o])=>{
                return(
                  <div className='item-terminal' key={i}>
                    {o.status==='running'?<Loop className='loop-item-prensarank' />:null}
                    {o.status==='ok'?<Check className='check-item-prensarank' />:null}
                    {o.status==='error'?<Cross className='cross-item-prensarank' />:null}
                    <div className='text-item-prensarank'>{ReactHtmlParser(o.text)}</div>
                  </div>
                )
              })
            }
          </div>
        </div>

        <div  className='container-type1' >
          <div className='img-container-panel' style={this.state.styleImage}></div>
          <div className='pr'>
            <h1>{this.props.app.titlePanel}</h1>
            <div className='container-tools-ahrefs'>
              <p className='subtitle-container-principal'>{numDocuments} {numDocuments===1?'KEYWORD':'KEYWORDS'}</p>
            </div>
            <div className='text-explicativo-container'>{this.props.app.desciption}</div>
          </div>
          {
            this.state.keywords.length>0?
            <div className='container-buttons-panel'>
              <div onClick={()=>this.handleScript()} className={`button-upload btn-prensarank ${this.state.statusScript==='running'?'running-prensarank':''}`}>

                {this.state.statusScript==='run'?
                  <div className='displa_flex'>
                    <Play className='play-prensarank' />
                    <div className='text-btn-prensarank'>Ejecutar script</div>
                  </div>:null
                }

                {this.state.statusScript==='running'?
                  <div className='displa_flex'>
                    <Loop className='loop-prensarank' />
                    <div className='text-btn-prensarank'>Ejecutando script</div>

                    <Cross className='cancel-prensarank' />
                    <div className='text-btn-prensarank text-cancel-prensarank'>Cancelar script</div>
                  </div>:null
                }

              </div>
              
              <div onClick={()=>this.setState({reiniciar:true})} className={`button-upload btn-prensarank btn-reiniciar-kwds`}>
                <div className='displa_flex'>
                  <Reset className='reset-keywords' />
                  <div className='text-btn-prensarank'>Reiniciar</div>
                </div>

              </div>



            </div>
            :null
          }
          


          <div className='switch-container-browser'>
            <Switch class_div={'switch_browser'} callbackSwitch={this.callbackSwitch} json={{id:'browser'}} valor={this.state.browser}/>
            <div className='text-switch-prensarank'>browser</div>
          </div>

        </div>


        {this.state.reiniciar ?
          <ConfirmAlert
            text={'¿Estás seguro que deseas <b>reiniciar</b> las keywords?'}
            cancelar={'Cancelar'}
            aceptar={'Aceptar'}
            confirmResult={(result) => this.confirmResult(result)}
          />:null
        }


      </div>
    )
  }
}

export default GoogleTracker
