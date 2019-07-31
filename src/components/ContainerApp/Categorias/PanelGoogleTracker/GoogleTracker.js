import React, {Component} from 'react'
import { ReactComponent as Play } from '../../../Global/Images/play.svg';
import { ReactComponent as Loop } from '../../../Global/Images/loop.svg';
import { ReactComponent as Cross } from '../../../Global/Images/cross.svg';
import { ReactComponent as Check } from '../../../Global/Images/check.svg';
import ReactHtmlParser from 'react-html-parser';
import firebase from '../../../../firebase/Firebase';
import Switch from '../../../Global/Switch'
import functions from '../../../../functions'
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
      clientes:{}
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

  subirResultado = (event, data) => {
    console.log(data);

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

    db.child('Clientes').orderByKey().limitToFirst(1).on("value", snapshot =>{
    //db.child('Clientes').orderByKey().once("value", snapshot =>{
      var clientes = {};
      snapshot.forEach( data => {
        var {eliminado,activo, web, id_cliente, servicios} = data.val();
        try {
          if(!eliminado && activo && servicios.tracking.activo){
            clientes[data.key]={web,eliminado,id_cliente, activo, tracking:servicios.tracking}
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

      if(c.tracking.keywords){
        Object.entries(c.tracking.keywords).forEach(([j,k])=>{

          if(k.activo && !k.eliminado /* && k.done */){
            var dominio = functions.getDominio(c.web)
            keywords.push({
              keyword:k.keyword,
              web: c.web,
              id_cliente:c.id_cliente,
              id_keyword:k.id_keyword,
              dominios: {"dominio0":dominio, "dominio1":"academia.com/"},
              competidores:{"competidor1": "corteyconfeccioncarmen.es", "competidor2":"educaweb.com"}
            })
          }

        })
      }

    })


    console.log(keywords.length);
    this.setState({keywords})


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


  render(){
    var numDocuments = 0;
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
              <p className='subtitle-container-principal'>{numDocuments} {numDocuments===1?'DOCUMENTO':'DOCUMENTOS'}</p>
            </div>
            <div className='text-explicativo-container'>{this.props.app.desciption}</div>
          </div>
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
          </div>


          <div className='switch-container-browser'>
            <Switch class_div={'switch_browser'} callbackSwitch={this.callbackSwitch} json={{id:'browser'}} valor={this.state.browser}/>
            <div className='text-switch-prensarank'>browser</div>
          </div>

        </div>


      </div>
    )
  }
}

export default GoogleTracker
