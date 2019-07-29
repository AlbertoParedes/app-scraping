import React, {Component} from 'react'
import { ReactComponent as Play } from '../../../Global/Images/play.svg';
import { ReactComponent as Loop } from '../../../Global/Images/loop.svg';
import { ReactComponent as Cross } from '../../../Global/Images/cross.svg';
import { ReactComponent as Check } from '../../../Global/Images/check.svg';
import ReactHtmlParser from 'react-html-parser'; 
import firebase from '../../../../firebase/Firebase';
import moment from 'moment'
import Card from './Card'
import Switch from '../../../Global/Switch'

const db = firebase.database().ref();
const { ipcRenderer } = window.require('electron');

class Presarank extends Component{

  constructor(props) {
    super(props);
    this.state = {
      visibility:this.props.visibility,
      documents: {},
      recentDocuments:{} ,
      getData:false,
      styleImage:{background:`linear-gradient(95.65deg, rgb(22, 26, 57) 13.2%, rgba(22, 26, 57, 0.9) 55.88%, rgba(39, 39, 72, 0.35) 97.88%) center center / cover, url(${this.props.app.image}) no-repeat`,backgroundPosition: "center center",transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0s',position: 'absolute',width: '100%',height: '100%',top: '0px',left: '0px'},
      statusScript:'run',//el status puede ser: run, running, cancel 
      browser: false,
      estados:{},
      showTerminal:false,
    };
  }

  componentWillMount = () => {
    ipcRenderer.removeListener('RESPONSE_PRENSARANK',this.updateMessageScraping);
    ipcRenderer.removeListener('SUBIR_MEDIOS_PRENSARANK',this.subirMedios);
  }
  componentDidMount = () => {
    ipcRenderer.on('RESPONSE_PRENSARANK',this.updateMessageScraping);
    ipcRenderer.on('SUBIR_MEDIOS_PRENSARANK',this.subirMedios);
  }

  updateMessageScraping = (event, data) => {
    var estados = this.state.estados;
    estados[data.id]=data;
    this.setState({estados})
  }
  subirMedios = (event, data) => {
    var id_document = db.child(`Others/apps/scraping/prensarank-medios/documents`).push().key;
    var document = {
      id_document,
      medios: data.medios,
      timestamp: (+ new Date())
    }
    var multiPath = {}
    multiPath[`Others/apps/scraping/prensarank-medios/documents/${id_document}`]=document
    db.update(multiPath)
    .then(()=>{
      this.setState({showTerminal:false, statusScript:'run'})
    })
    .catch((err)=>{
      console.log(err);
      this.setState({showTerminal:false, statusScript:'run'})
    })
    console.log(document);
    
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
    console.log('getting data...');
    db.child('Others/apps/scraping/prensarank-medios/documents').orderByKey().on("value", snapshot => {
      var documents = {},recentDocuments ={}
      snapshot.forEach(data => {
        
        var fecha = moment(data.val().timestamp)
        var hoy = moment()
        var dif = hoy.diff(fecha,'days')+1
        if(dif>3){
          documents[data.key] = data.val();
        }else{
          recentDocuments[data.key] = data.val();
        }
      })

      var recentDocumentsOrdenados = Object.entries(recentDocuments)
      recentDocumentsOrdenados.sort((a, b) => {
        a = a[1]; b = b[1]
        if (a.timestamp > b.timestamp) { return 1; }
        if (a.timestamp < b.timestamp) { return -1; }
        return 0;
      });
      recentDocumentsOrdenados.reverse();

      var documentsOrdenados = Object.entries(documents)
      documentsOrdenados.sort((a, b) => {
        a = a[1]; b = b[1]
        if (a.timestamp > b.timestamp) { return 1; }
        if (a.timestamp < b.timestamp) { return -1; }
        return 0;
      });
      documentsOrdenados.reverse();
      
      
      this.setState({ documents:documentsOrdenados, recentDocuments: recentDocumentsOrdenados })
    })
  }

  handleScript = () => {

    var statusScript = this.state.statusScript;

    var data = {
      browser:this.state.browser,
      account:{
        user:'guillermorodriguez@yoseomarketing.com',
        password:'seolamers'
      }
    } 


    if(statusScript==='run'){
      statusScript = 'running';
      ipcRenderer.send('START_PRENSARANK',data);
      this.setState({statusScript, estados:{}, showTerminal:true})
    }else if(statusScript==='running'){
      statusScript='run'
      ipcRenderer.send('STOP_PRENSARANK',data);
      this.setState({statusScript, showTerminal:false})
    }

    


    
    
    
    
  }

  callbackSwitch = (json) => {
    console.log(json);
    if(json.id==='browser'){
      if(this.state.statusScript==='run'){
        this.setState({browser:json.valor})
      }
    }
    
  }

  render(){

    var numDocuments = Object.keys(this.state.recentDocuments).length + Object.keys(this.state.documents).length
    
    if(!this.state.visibility)return false
    return (
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
        
        {this.state.recentDocuments.length>0?<h3 className='tiitle-grid'>Documentos Recientes</h3>:null}
        {
          this.state.recentDocuments.length>0?
            <div className='CardGroup2'>
              {
                this.state.recentDocuments.map((item, id) => {
                  return(
                    <Card key={id} item={item[1]} />
                  )
                })
              }
            </div>:null
        }

        {this.state.documents.length>0?<h3 className='tiitle-grid'>Documentos</h3>:null}
        {
          this.state.documents.length>0?
            <div className='CardGroup2'>
              {
                this.state.documents.map((item, id) => {
                  return(
                    <Card key={id} item={item[1]} />
                  )
                })
              }
            </div>:null
        }

        


      </div>
    )
  }
}

export default Presarank