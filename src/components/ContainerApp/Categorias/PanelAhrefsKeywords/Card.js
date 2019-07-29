import React,{Component} from 'react'
import { ReactComponent as Logo } from '../../../Global/Images/download-cloud.svg';
import { ReactComponent as Play } from '../../../Global/Images/play.svg';
import { ReactComponent as Loop } from '../../../Global/Images/loop.svg';
import { ReactComponent as Check } from '../../../Global/Images/check.svg';
import { ReactComponent as Trash } from '../../../Global/Images/trash.svg';
import ConfirmAlert from '../../../Global/ConfirmAlert'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setScrapingOpera } from '../../../../redux/actions';
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
    
    var item = JSON.parse(JSON.stringify(this.props.item))
    var keywords = {}
    //solo pasamos las keywords sin resultados
    Object.entries(this.props.item.keywords).forEach(([k,kwd])=>{
      if(!kwd.results){
        keywords[k]=kwd
      }
    })
    item.keywords=keywords

    var obj = {
      item,
      os:this.props.os
    }
    this.props.setScrapingOpera(this.props.item)
    
    ipcRenderer.send('START_SCRAPING_KEYWORDS_AHREFS', JSON.stringify(obj));
  }

  confirmResult = (result) => {
    if(result==='cancelar'){
      this.setState({eliminar:false})
    }if(result==='aceptar'){
      var multiPath = {}
      multiPath[`Others/apps/scraping/keywords-explorer-ahrefs/documents/${this.props.item.id_document}`]=null
      db.update(multiPath)
      .then(()=>{
        this.setState({eliminar:false})
      })
      .catch(err=>{
        console.log(err);
      })
      
    }

  }

  handleDowload = () => {
    console.log(this.props.item.keywords);
    var data = [];
    Object.entries(this.props.item.keywords).forEach(([i,o])=>{
      var row = {};
      row['KEYWORD']= o.keyword;
      if(o.results){
        o.results.forEach((o2,i2)=>{
          row['K'+(i2+1)]=o2
        })
      }
      
      data.push(row)
    })
    
    if(data.length>0){
      var wb = XLSX.utils.book_new();
      var ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, this.props.item.sheetName);
      XLSX.writeFile(wb, this.props.item.name);
    }
    
  }

  render(){
    var item = this.props.item;
    
    //name
    var name = 'Sin titulo'
    if (item.name.trim() !== '' && item.name.includes('.')) {
      var part = item.name.trim().split('.')
      name = part[0]
    }

    //averiguar cuantas keywords tienen resultados
    var results = Object.entries(item.keywords).filter(([i, kw]) => { return kw.results });

    var kws = ''
    Object.entries(item.keywords).forEach(([i, kw]) => {
      if (kws.length < 300)
        kws = kws + kw.keyword + ", "
    });

    return (
      <div className='Card2' >
        <div className='heading_2'>
          <span>{name}</span>
        </div>
        
        <div className='display_flex'>
          <p>{Object.keys(item.keywords).length} Keywords</p>
          {results.length>0?
            <span className='cloud-ahrefs-keywords ' onClick={()=>this.handleDowload()}>
              <Logo />
              Descargar  {results.length===Object.keys(item.keywords).length?'':'('+results.length+')'} </span>
          :null}
          
        </div>
        <div className='container-kws'>
          {kws}
        </div>

        <div className='toolbar-card-ahrefs'>
          {!this.props.documentScrapingOpera || this.props.documentScrapingOpera.id_document!==item.id_document?<div className='items-toolbara-ahrefs' onClick={()=>this.setState({eliminar:true})}><Trash className='btn-ahres-tool trashbutton' /></div>:null}
          
          { (!this.props.documentScrapingOpera && results.length!==Object.keys(item.keywords).length) ?
            <div onClick={()=>this.goScraping()} className='items-toolbara-ahrefs'><Play className='btn-ahres-tool playbutton item-play-ahref' /></div>:null
          }

          { this.props.documentScrapingOpera && this.props.documentScrapingOpera.id_document===item.id_document ?
            <div className='items-toolbara-ahrefs pr status-run-ahrefs-card'>
              <Loop className='btn-ahres-tool item-running-ahref' />
              {/*<Stop className='btn-ahres-tool item-stop-ahrefs' />*/}
            </div>:null
          }

          { results.length===Object.keys(item.keywords).length ?
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

function mapStateToProps(state) {return {os:state.global.os, documentScrapingOpera: state.global.documentScrapingOpera}}
function matchDispatchToProps(dispatch) { return bindActionCreators({ setScrapingOpera }, dispatch)}
export default connect(mapStateToProps, matchDispatchToProps)(Card);