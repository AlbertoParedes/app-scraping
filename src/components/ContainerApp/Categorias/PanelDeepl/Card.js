import React,{Component} from 'react'
import { ReactComponent as Logo } from '../../../Global/Images/download-cloud.svg';
import { ReactComponent as Play } from '../../../Global/Images/play.svg';
import { ReactComponent as Loop } from '../../../Global/Images/loop.svg';
import { ReactComponent as Stop } from '../../../Global/Images/stop.svg';
import { ReactComponent as Check } from '../../../Global/Images/check.svg';
import { ReactComponent as Trash } from '../../../Global/Images/trash.svg';
import ConfirmAlert from '../../../Global/ConfirmAlert'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setScrapingDeepl } from '../../../../redux/actions';
import firebase from '../../../../firebase/Firebase';
import XLSX from 'xlsx';
const db = firebase.database().ref();
const { ipcRenderer } = window.require('electron');
class Card extends Component{

  constructor(props){
    super(props);
    this.state={
      eliminar: false,
      estadoScript:false
    }
  }

  goScraping = () => {
    this.props.setScrapingDeepl(this.props.item)
    ipcRenderer.send('START_SCRAPING_DEEPL', {browser:this.props.browser,documento:this.props.item});
  }

  confirmResult = (result) => {
    if(result==='cancelar'){
      this.setState({eliminar:false})
    }if(result==='aceptar'){
      ipcRenderer.send('DETELE_DATA_TRADUCCIONES', this.props.item.id);
      this.setState({eliminar:false})
    }

  }

  stopProcess = () => {
    ipcRenderer.send('STOP_SCRAPING_DEEPL');
  }

  handleDowload = () => {
    console.log(this.props.item.urls);
    var totalRows = [], hojas={};
    Object.entries(this.props.item.urls).forEach(([i,o])=>{
      console.log(o);
      if(!hojas[o.hoja]){
        hojas[o.hoja]={hoja:o.hoja, data:[]}
      }
      var row = {
        'URL': o.url,
        'Texto original': o.texto && o.texto.trim()!==''?o.texto.trim():'',
        'Text traducido': o.traduccion && o.traduccion.trim()!==''?o.traduccion.trim():''

      };
      hojas[o.hoja].data.push(row)
      totalRows.push(row)
    })

    console.log(hojas);
    
    
    
    if(totalRows.length>0){
      var wb = XLSX.utils.book_new();

      Object.entries(hojas).forEach(([key,item])=>{
        var ws = XLSX.utils.json_to_sheet(item.data);
        XLSX.utils.book_append_sheet(wb, ws, item.hoja);
      })

      //var ws = XLSX.utils.json_to_sheet(data);
      //XLSX.utils.book_append_sheet(wb, ws, this.props.item.hoja);


      XLSX.writeFile(wb, this.props.item.nombre);
    }
    
  }

  render(){
    
    var item = this.props.item;
    
    //name
    var name = 'Sin titulo'
    if (item.nombre.trim() !== '' && item.nombre.includes('.')) {
      var part = item.nombre.trim().split('.')
      name = part[0]
    }

    //averiguar cuantas keywords tienen resultados
    var results = Object.entries(item.urls).filter(([i, u]) => { return u.traduccion });

    var urlsText = ''
    Object.entries(item.urls).forEach(([i, u]) => {
      if (urlsText.length < 300)
      urlsText = urlsText + u.url + ", "
    });

    return (
      <div className='Card2' >
        <div className='heading_2'>
          <span>{name}</span>
        </div>
        
        <div className='display_flex'>
          <p>{Object.keys(item.urls).length} URLs</p>
          {results.length>0?
            <span className='cloud-ahrefs-keywords ' onClick={()=>this.handleDowload()}>
              <Logo />
              Descargar  {results.length===Object.keys(item.urls).length?'':'('+results.length+')'} </span>
          :null}
          
        </div>
        <div className='container-kws'>
          {urlsText}
        </div>

        <div className='toolbar-card-ahrefs'>
          {!this.props.documentScrapingDeepl || this.props.documentScrapingDeepl.id!==item.id?<div className='items-toolbara-ahrefs' onClick={()=>this.setState({eliminar:true})}><Trash className='btn-ahres-tool trashbutton' /></div>:null}
          
          { (!this.props.documentScrapingDeepl && results.length!==Object.keys(item.urls).length) ?
            <div onClick={()=>this.goScraping()} className='items-toolbara-ahrefs'><Play className='btn-ahres-tool playbutton item-play-ahref' /></div>:null
          }

          { this.props.documentScrapingDeepl && this.props.documentScrapingDeepl.id===item.id ?
            <div className='items-toolbara-ahrefs pr status-run-ahrefs-card status-run-deepl'>
              <Loop className='btn-ahres-tool item-running-ahref' />
              <Stop className='btn-ahres-tool item-stop-ahrefs' onClick={()=>{this.stopProcess()}}/>
            </div>:null
          }

          { results.length===Object.keys(item.urls).length ?
            <div onClick={()=>this.goScraping()} className='items-toolbara-ahrefs'><Check className='btn-ahres-tool item-check-ahref' /></div>:null
          }
        </div>

        {this.state.eliminar ?
          <ConfirmAlert
            text={'¿Estás seguro que deseas eliminar este documento?'}
            cancelar={'Cancelar'}
            aceptar={'Eliminar'}
            confirmResult={(result) => this.confirmResult(result)}
          /> : null
        }
        

      </div>
    )
  }

}

function mapStateToProps(state) {return {os:state.global.os, documentScrapingDeepl: state.global.documentScrapingDeepl}}
function matchDispatchToProps(dispatch) { return bindActionCreators({ setScrapingDeepl }, dispatch)}
export default connect(mapStateToProps, matchDispatchToProps)(Card);