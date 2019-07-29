import React, { Component } from "react";
import moment from 'moment'
import WordButton from './WordButton'

import format from 'xml-formatter'
import convert from'xml-js';
import firebase from '../../../../firebase/Firebase';
import XLSX from 'xlsx';
import ReactHtmlParser from 'react-html-parser'; 
import { ReactComponent as Trash } from '../../../Global/Images/trash.svg';
import { ReactComponent as Cross } from '../../../Global/Images/add_circle.svg';
import { ReactComponent as Code } from '../../../Global/Images/code.svg';
import { ReactComponent as Image } from '../../../Global/Images/image.svg';
import { ReactComponent as Loop } from '../../../Global/Images/loop.svg';
import { ReactComponent as Save } from '../../../Global/Images/save-alt.svg';
import { ReactComponent as Reset } from '../../../Global/Images/thumb_up.svg';
const db = firebase.database().ref();

const { ipcRenderer } = window.require('electron');

class Word2Html extends Component {
  constructor(props) {
    super(props);
    this.state = {
      documents: {},
      visibility:this.props.visibility,
      getData:false,      
      styleImage:{
        background:`linear-gradient(95.65deg, rgb(22, 26, 57) 13.2%, rgba(22, 26, 57, 0.9) 55.88%, rgba(39, 39, 72, 0.35) 97.88%) center center / cover, url(${this.props.app.image}) no-repeat`,
        backgroundPosition: "center center",
        transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0s',
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: '0px',
        left: '0px'
      },
      recentDocuemts:{},
      arrayFiles:[],
      filesOrdenados:[],
      allIds:{},
      openCode:false,
      showImages:false,
      statusScript:'run'
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
  }

  componentWillMount = () => {
    ipcRenderer.removeListener('RESPONSE_UPLOAD_WORDS',this.updateMessage);
  }
  componentDidMount = () => {
    ipcRenderer.on('RESPONSE_UPLOAD_WORDS',this.updateMessage);
  }
  updateMessage = (event, files) => {

    var allIds = {}
    files.forEach((file,i)=>{
      this.getId(allIds,file,i)
    })

    const arrayFiles = files

    files.sort((a, b) => {
      if (a.id > b.id) { return 1; }
      if (a.id < b.id) { return -1;}
    })

    this.setState({arrayFiles,filesOrdenados:files, allIds, statusScript:'guardar'})

  }

  getId = (allIds, file,index) =>{
    var id = -1;
    if(file.name.length>0){
      try {
        for(var i=0;i<=file.name.length;i++){
          if(!isNaN(file.name.substring(0,i+1))){
            id=file.name.substring(0,i+1);
          }
        }
      } catch (error) {}

      if(id!==-1){
        var name = file.name.substring(id.length,file.name.length);
        for(var j=0;j<name.length;j++){
          var c = name.charAt(j);
          if( c.toUpperCase() !== c.toLowerCase() ){
            //si entra en este if significa que hemos encontrado la primera letra, por lo que habra que salir del for
            name = name.substring(j,name.length)
            j=name.length
          }
        }
        file.name = name.trim()
      }
    }
    file.id = (+id)
    //guardar en allIds
    if(!allIds[(+id)]){
      allIds[(+id)] = []
    }
    file.id_array=index
    allIds[(+id)].push({name:file.name, index})
  }


  getData = () => {
    //console.log('getting data...');
  }

  getFiles = files =>{
    /*var obj = {
      files: files
    }
    */
    //ipcRenderer.send('GET_DATA_WORDS', JSON.stringify(obj));
    if(files.length>0){
      this.setState({
        statusScript:'running'
      },()=>{
        ipcRenderer.send('GET_DATA_WORDS', files);
      })
    }
    
  }

  saveDownload = e => {
    const files = e.target.files;
    if (files && files[0]){
      var pathDownload = files[0].path
      ipcRenderer.send('SAVE_DATA_WORDS', {path:pathDownload,files:this.state.filesOrdenados});
    }
    
    document.getElementById('fileselector-w2h').value = ''
    
  }

  resetAll = () => {
    this.setState({
      recentDocuemts:{},
      arrayFiles:[],
      filesOrdenados:[],
      allIds:{},
      openCode:false,
      showImages:false,
      statusScript:'run'
    })
  }

  openCode = (file) =>{
    if(this.state.openCode && this.state.openCode.id_array===file.id_array){
      this.setState({ openCode: false, showImages:false })
    }else{
      this.setState({ openCode: file, showImages:false })
    }
  }

  showImages = file => {
    if(this.state.showImages && this.state.showImages.id_array===file.id_array){
      this.setState({ openCode: false, showImages:false })
    }else{
      this.setState({ openCode: false, showImages: file})
    }
  }

  deleteItem = id => {
    var filesOrdenados = this.state.filesOrdenados;
    filesOrdenados.splice(id, id+1)
    this.setState({filesOrdenados})
  }
  deleteImage = (id_image, id_array) =>{
    //console.log(id, file);
    var filesOrdenados = this.state.filesOrdenados;
    //filesOrdenados[id_array].images.length = filesOrdenados[id_array].images.length - 1
    //delete filesOrdenados[id_array].images[id_image]
    filesOrdenados[id_array].html = filesOrdenados[id_array].html.replace(`<img src="${filesOrdenados[id_array].images[id_image]}" />`,``)
    filesOrdenados[id_array].images.splice(id_image, id_image+1)
    this.setState({filesOrdenados})
  }
   

  render() {

    if(!this.state.visibility)return false
    return (
      <div className='home-app' >

        <div  className='container-type1' >
          <div className='img-container-panel' style={this.state.styleImage}></div>
          <div className='pr'>
            <h1>{this.props.app.titlePanel}</h1>
            <div className='container-tools-ahrefs'>
              <p className='subtitle-container-principal'>{this.state.filesOrdenados.length} {this.state.filesOrdenados.length===1?'DOCUMENTO':'DOCUMENTOS'}</p>
            </div>
            <div className='text-explicativo-container'>{this.props.app.desciption}</div>
          </div>
          <div className='container-buttons-panel'>
         
            {this.state.statusScript==='run'?<WordButton getFiles={files=>this.getFiles(files)} />:null}

            {this.state.statusScript==='running'?
              <div className={`btn-w2a-option running-w2h`}>
                <div className='displa_flex'>
                  <Loop className='loop-prensarank' />
                  <div className='text-btn-prensarank'>Convirtiendo...</div>
                </div>
              </div>:null
            }
            
            {this.state.statusScript==='guardar'?
              <div className={`btn-w2a-option btn-w2a-save`} onClick={(e)=>{document.getElementById('fileselector-w2h').click()}}>
                <div className='displa_flex'>
                  <Save className='save-w2h' />
                  <div className='text-btn-prensarank'>Guardar resultados</div>
                </div>
                <input id="fileselector-w2h" type="file"  onChange={(e)=>{this.saveDownload(e)}} webkitdirectory={'true'} directory={'true'} multiple={'true'} style={{display:'none'}} />
              </div>:null
            }

            {this.state.statusScript==='guardar'?
              <div className={`btn-w2a-option btn-reset-w2h`} onClick={(e)=>{this.resetAll()}}>
                <div className='displa_flex center-block height_100'>
                  <Reset  />
                </div>
              </div>
            :null}
           </div>
          
        </div>

        <div>

          {this.state.filesOrdenados.length>0?

            this.state.filesOrdenados.map((f,i)=>{
              
              return(
                <div className={`item-word-result`} key={i}>
                  <div className='display_flex'>

                    <div className={`w2h-id ${f.id===-1?'wrong-id':''} ${this.state.allIds[f.id] && this.state.allIds[f.id].length>1?'repeat-id-w2h':''} `}>{f.id!==-1?f.id:'✖'}</div>

                    <div className='w2h-text'>{f.name.replace('.docx','')}</div>
                    <div className={`tools-w2h`}>
                      <div className='center-block code-row-w2h' onClick={()=>this.openCode(f)} ><Code className={`${this.state.openCode && this.state.openCode.id_array===f.id_array?'open-icon':''}`} /></div>
                      {f.images && f.images.length>0?
                        <div className='center-block image-row-w2h' onClick={()=>this.showImages(f)} ><Image className={`${this.state.showImages && this.state.showImages.id_array===f.id_array?'open-icon':''} ${f.images.length>1?'more-image-error':''}`} /></div>
                      :null
                      }
                      <div className='center-block trash-row-w2h' onClick={()=>this.deleteItem(i)} ><Trash className='trash-row-w2h' /></div>
                    </div>

                  </div>

                  {this.state.openCode && this.state.openCode.id_array===f.id_array?
                    <div className='html-w2a-container'>
                      <div>
                        {ReactHtmlParser(this.state.openCode.html)}
                      </div>
                    </div>
                    :null
                  }

                  {f.images && f.images.length>0 && this.state.showImages && this.state.showImages.id_array===f.id_array?
                    <div className='html-w2a-container'>
                      <div>
                        {
                          this.state.showImages.images.map((s,k)=>{
                            return(
                              <div key={k} className='img-w2h-delete'>
                                <div className='icon-delete-image-w2h' onClick={()=>this.deleteImage(k,i)} ><Cross /></div>
                                <img src={s} alt=""/>
                              </div>
                            )
                          })
                        }
                      </div>
                    </div>
                    :null
                  }


                </div>
              )
            }):null

          }


        </div>

      </div>
    );
  }

}


export default Word2Html;