import React, { Component } from "react";
import ExcelButton from './ExcelButton'
import moment from 'moment'
import Card from './Card'
import { ReactComponent as Loop } from '../../../Global/Images/loop.svg';
import { ReactComponent as Cross } from '../../../Global/Images/cross.svg';
import { ReactComponent as Check } from '../../../Global/Images/check.svg';

import format from 'xml-formatter'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setScrapingOpera } from '../../../../redux/actions';
import ReactHtmlParser from 'react-html-parser'; 
import ReactCountdownClock from 'react-countdown-clock';
import firebase from '../../../../firebase/Firebase';
const db = firebase.database().ref();

const { ipcRenderer } = window.require('electron');

class AhrefsKeywords extends Component {
  constructor(props) {
    super(props);
    this.state = {
      documents: {},
      visibility:this.props.visibility,
      documentScrapingOpera: this.props.documentScrapingOpera,
      getData:false,
      recentDocuments:{},
      estados:{},
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
    };
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
    if(this.state.documentScrapingOpera!==newProps.documentScrapingOpera){
      this.setState({documentScrapingOpera:newProps.documentScrapingOpera, estados:{} })
    }
  }

  componentWillMount = () => {
    ipcRenderer.removeListener('RESPONSE_SCRAPING_KEYWORDS',this.updateMessage);
    ipcRenderer.removeListener('RESPONSE_SCRAPING_KEYWORDS_DB',this.updateMessageDB);
  }
  componentDidMount = () => {
    ipcRenderer.on('RESPONSE_SCRAPING_KEYWORDS',this.updateMessage);
    ipcRenderer.on('RESPONSE_SCRAPING_KEYWORDS_DB',this.updateMessageDB);
  }
  updateMessageDB = (event, data) => {
    
    var {idDocument, idKeyword, listResultados} = data, multiPath={}
    multiPath['Others/apps/scraping/keywords-explorer-ahrefs/documents/'+idDocument+'/keywords/'+idKeyword+'/results']=listResultados;
    console.log(multiPath);
    db.update(multiPath)
    .then(()=>{ console.log('Ok'); })
    .catch(err=>console.log(err))
  }
  updateMessage = (event, data) => {
    console.log(data);
    

    var estados = this.state.estados;

    estados[data.id]=data;
    if(data.status==='error' || data.text==='Done'){
      this.props.setScrapingOpera(false)
    }
    this.setState({estados})
  }

  getData = () => {
    console.log('getting data...');
    
    db.child('Others/apps/scraping/keywords-explorer-ahrefs/documents').orderByKey().on("value", snapshot => {
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
      this.setState({ documents:documentsOrdenados , recentDocuments: recentDocumentsOrdenados })
    })


  }

  getDataExcel = (dataFile) => {
    var keywords = {}, document = {}, key = false;
    const getKeywords = async () => {
      var id_document = db.child(`Others/apps/scraping/keywords-explorer-ahrefs/documents`).push().key;
      await dataFile.data.forEach(async (element, key) => {
        //if (key === 0) return null; con esto obviamos la primera fila
        var dato = element[0];
        if (dato && dato.toString() !== "") {
          key = db.child(`Others/apps/scraping/keywords-explorer-ahrefs/documents/${id_document}/keywords`).push().key;
          keywords[key] = { id_keyword: key, keyword: dato.toString() }
        }
      })
      document = {
        id_document,
        keywords,
        timestamp: (+ new Date()),
        name: dataFile.nameFile,
        sheetName: dataFile.sheetName
      }
      var multiPath = {}
      multiPath[`Others/apps/scraping/keywords-explorer-ahrefs/documents/${id_document}`] = document
      if (document && document.keywords && Object.keys(document.keywords).length > 0 && (dataFile.nameFile.includes('.xlsx') || dataFile.nameFile.includes('.xls') ) ) {
        db.update(multiPath)
          .then(() => {
            //console.log('ok');
          })
          .catch(err => console.log(err))
      }
    }
    getKeywords();
  }

  

  render() {
    if(!this.state.visibility)return false
    var numDocuments = Object.keys(this.state.recentDocuments).length + Object.keys(this.state.documents).length
    return (
      <div className='home-app' >

        {/*TERMINAL*/}
        <div className={` ${this.state.documentScrapingOpera?'show-terminal':'hidde-terminal'}`}>
          <div className={`container-terminal pr`}>
            <h3 className='tiitle-grid pdd-top-10'>Terminal</h3>

            {this.state.estados['5461'] && this.state.estados['5461'].status==='running'?
              <CountDown  seconds={this.state.estados['5461'].seconds}/>
            :null}
 

            {
              Object.entries(this.state.estados).map(([i,o])=>{
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
            <h1>{this.props.app.titlePanel}</h1>
            <div className='container-tools-ahrefs'>
              <p className='subtitle-container-principal'>{numDocuments} {numDocuments===1?'DOCUMENTO':'DOCUMENTOS'}</p>
            </div>
            <div className='text-explicativo-container'>{this.props.app.desciption}</div>
          </div>
          
          <div className='container-buttons-panel'>
            <ExcelButton getDataExcel={this.getDataExcel} />
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
    );
  }

}


function mapStateToProps(state) {return {documentScrapingOpera: state.global.documentScrapingOpera}}
function matchDispatchToProps(dispatch) { return bindActionCreators({ setScrapingOpera }, dispatch)}
export default connect(mapStateToProps, matchDispatchToProps)(AhrefsKeywords);

class CountDown extends Component{
  constructor(props){
    super(props);
    this.state={
      seconds:this.props.seconds
    }
  }

  componentWillReceiveProps = (newProps) =>{
    if(this.state.seconds!==newProps.seconds){
      this.setState({seconds: newProps.seconds}, ()=>{this.changeTimer()})
    }
  }

  componentDidMount = () =>{
    this.changeTimer()
  }

  changeTimer = () =>{
    var self = this
    var timeleft = self.state.seconds;
    var downloadTimer = setInterval(function(){
      timeleft -= 1;
      if(timeleft <= 0){clearInterval(downloadTimer)}
      self.setState({seconds: timeleft})
    }, 1000);
  }

  render(){
    return(
      <div className='countdown-terminal'>
        {this.state.seconds}
      </div>
    )
  }
}