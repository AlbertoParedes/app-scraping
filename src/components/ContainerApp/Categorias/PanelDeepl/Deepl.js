import React, {Component} from 'react' 
import ExcelButton from './ExcelButton'
import moment from 'moment'
import ReactHtmlParser from 'react-html-parser'; 
import { ReactComponent as Loop } from '../../../Global/Images/loop.svg';
import { ReactComponent as Cross } from '../../../Global/Images/cross.svg';
import { ReactComponent as Check } from '../../../Global/Images/check.svg';
import { ReactComponent as Server } from '../../../Global/Images/server.svg';
import Card from './Card'
import Switch from '../../../Global/Switch'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setScrapingDeepl } from '../../../../redux/actions';
const { ipcRenderer } = window.require('electron');

class Deepl extends Component {
  constructor(props){
    super(props)
    this.state = {
      documents: {},
      visibility:this.props.visibility,
      documentScrapingOpera: this.props.documentScrapingOpera,
      getData:false,
      recentDocuments:{},
      estados:{},
      browser: false,
      statusScript:'run',
      refreshBD: true,
      styleImage:{
        background:`linear-gradient(95.65deg, rgb(22, 26, 57) 13.2%, rgba(22, 26, 57, 0.9) 55.88%, rgba(39, 39, 72, 0.35) 97.88%) center center / cover, url(${this.props.app.image}) no-repeat`,
        backgroundPosition: "center center",
        transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0s',
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: '0px',
        left: '0px'
      }
    }
  }

  componentWillMount = () => {
    ipcRenderer.removeListener('GET_DATA_TRADUCCIONES',this.getData);
    ipcRenderer.removeListener('RESPONSE_DEEPL_STATUS',this.updateMessageScraping);
    ipcRenderer.removeListener('STOP_SCRAPING_DEEPL',this.stopSeepl);
    this.requestData()
  }
  componentDidMount = () => {
    ipcRenderer.on('GET_DATA_TRADUCCIONES',this.getData);
    ipcRenderer.on('RESPONSE_DEEPL_STATUS',this.updateMessageScraping);
    ipcRenderer.on('STOP_SCRAPING_DEEPL',this.stopSeepl);
  }
  updateMessageScraping = (event, data) => {
    var estados = this.state.estados;
    estados[data.id]=data;
    this.setState({estados})
  }
  stopSeepl = (event) => {
    this.props.setScrapingDeepl(false)
    this.setState({
      estados:{}
    })
  }
  getData = (event, data) => {
    console.log('kkll',data);
    this.setState({documents: data, refreshBD:true})
  }
  requestData = () => {
    ipcRenderer.send('REQUEST_DATA_TRADUCCIONES',{});
  }
  componentWillReceiveProps = newProps => {
    if(this.state.visibility!==newProps.visibility){
      this.setState({visibility:newProps.visibility})
    }
  }
  

  getDataExcel = (dataFile) => {
    console.log(dataFile);
    var urls = []
    dataFile.hojas.forEach( h => {
      h.data.forEach( (ele,index) => {
        var url = ele[0];
        var idioma_inicio = ele[1] && ele[1].trim()!=='' ? ele[1].trim():'en'
        var idioma_fin = ele[2] && ele[2].trim()!=='' ? ele[2].trim():'es'
        var hoja = h.hoja
        if(url.includes('http')){
          urls.push({url,hoja,idioma_inicio,idioma_fin})
        }
      });
    });
    
    var documento = {
      nombre : dataFile.nameFile,
      urls
    }
    
    this.saveUrls(documento)
    



    
  }
  saveUrls = (documento) =>{
    ipcRenderer.send('SAVE_DOCUMENT_DEEPL', {documento});
  }
  callbackSwitch = (json) => {
    console.log(json);
    
    if(json.id==='browser'){
      if(this.state.statusScript==='run'){
        this.setState({browser:json.valor})
      }
    }
  }

  refreshDataBase = () => {
    this.setState({
      refreshBD:false
    }, ()=>{
      this.requestData()
    })
  }

  render(){
    if(!this.state.visibility)return false
    var numDocuments = Object.keys(this.state.recentDocuments).length + Object.keys(this.state.documents).length

    

    return(
      <div className='home-app' >
        {/*TERMINAL*/}
        <div className={` ${this.props.documentScrapingDeepl?'show-terminal':'hidde-terminal'}`}>
          <div className={`container-terminal pr`}>
            <h3 className='tiitle-grid pdd-top-10'>Terminal</h3>
            {
              Object.entries(this.state.estados).map(([i,o])=>{
                console.log(o.status);
                
                if(o.status==='empty')return null
                if(o.seconds)return null;

                return(
                  <div className='item-terminal' key={i}>
                    {o.status==='running'?<Loop className='loop-item-prensarank' />:null}
                    {o.status==='ok'?<Check className='check-item-prensarank' />:null}
                    {o.status==='error'?<Cross className='cross-item-prensarank' />:null}
                    <div className='text-item-prensarank'>
                      {ReactHtmlParser(o.text)}
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>

        <div  className='container-type1' >
          <div className='img-container-panel' style={this.state.styleImage}></div>
          <div className='pr'>
            <h1>{ReactHtmlParser(this.props.app.titlePanel)}</h1>
            <div className='container-tools-ahrefs'>
              <p className='subtitle-container-principal'>{numDocuments} {numDocuments===1?'DOCUMENTO':'DOCUMENTOS'}</p>
            </div>
            <div className='text-explicativo-container'>{this.props.app.desciption}</div>
          </div>
          
          <div className='container-buttons-panel'>
            <ExcelButton getDataExcel={this.getDataExcel} />
          </div>

          <div className='switch-container-browser'>
            <Switch class_div={'switch_browser'} callbackSwitch={this.callbackSwitch} json={{id:'browser'}} valor={this.state.browser}/>
            <div className='text-switch-prensarank'>browser</div>
          </div>
          {this.state.refreshBD?
            <div className='server-container-deepl' onClick={()=>{this.refreshDataBase()}}>
              <Server className='' />
            </div> 
          :null
          }
                   

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

        {Object.keys(this.state.documents).length>0?<h3 className='tiitle-grid'>Documentos</h3>:null}
        {
          Object.keys(this.state.documents).length>0?
            <div className='CardGroup2'>
              {
                Object.entries(this.state.documents).map(([k, item]) => {
                  return(
                    <Card key={k} item={item} browser={this.state.browser}/>
                  )
                })
              }
            </div>:null
        }



      </div>
    )
  }

}


function mapStateToProps(state) {return {os:state.global.os, documentScrapingDeepl: state.global.documentScrapingDeepl}}
function matchDispatchToProps(dispatch) { return bindActionCreators({ setScrapingDeepl }, dispatch)}
export default connect(mapStateToProps, matchDispatchToProps)(Deepl);