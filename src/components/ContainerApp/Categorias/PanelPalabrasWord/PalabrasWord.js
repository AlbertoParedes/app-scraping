import React, {Component} from 'react'
import { ReactComponent as Trash } from '../../../Global/Images/trash.svg';
import { ReactComponent as Cross } from '../../../Global/Images/add_circle.svg';
import { ReactComponent as Code } from '../../../Global/Images/code.svg';
import { ReactComponent as Right } from '../../../Global/Images/right-arrow.svg';
import { ReactComponent as Loop } from '../../../Global/Images/loop.svg';
import { ReactComponent as Save } from '../../../Global/Images/save-alt.svg';
import { ReactComponent as Reset } from '../../../Global/Images/thumb_up.svg';
import ReactHtmlParser from 'react-html-parser'; 
import WordButton from './WordButton'
import DatePicker  from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment'

const { ipcRenderer } = window.require('electron');

class PalabrasWord extends Component{

  constructor(props){
    super(props)
    this.state={
      documents: {},
      filesOrdenados:[],
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
      statusScript:'run',
      path:'',
      startDate: new Date(),
      empleados:{}
    }
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
    ipcRenderer.removeListener('RESPONSE_COUNTER_WORD',this.setDocument);
  }
  componentDidMount = () => {
    ipcRenderer.on('RESPONSE_COUNTER_WORD',this.setDocument);
  }

  setDocument = (event, documents) => {

    var empleados = {}
    
    var path = this.state.path;
    documents.forEach(element => {

      //separamos el path resultante para sabe en que carpeta esta y asi saber el empleado que lo ha hecho
      var pathElement = element.path.replace(path,'')
      if(pathElement.startsWith(element.slash)){ pathElement = pathElement.replace(element.slash,'') }
      var arrayPath = pathElement.split(element.slash)
      //-----------------------------------------------------------------------------------------------------

      if(!empleados[arrayPath[0]]){
        empleados[arrayPath[0]] = {
          name: arrayPath[0],
          //documents:0,
          //words:0,
          dates:{}
        }
      }

      //vemos en que fecha vamos a poner este documento
      var createdYM = moment(element.data.created).format('YYYY-MM');
      console.log(empleados[arrayPath[0]]);
      
      if(!empleados[arrayPath[0]].dates[createdYM]){
        empleados[arrayPath[0]].dates[createdYM] = {
          words: 0,
          documentos:[]
        }
      }

      var numWords = empleados[arrayPath[0]].dates[createdYM].words;
      numWords = numWords + element.data.words;
      empleados[arrayPath[0]].dates[createdYM].words = numWords
      empleados[arrayPath[0]].dates[createdYM].documentos.push(element.data)
    




    });

    console.log(empleados);
    this.setState({
      empleados
    })
    
    
  }
 
  setPath = (path) => {
    this.setState({ path },()=>{
      ipcRenderer.send('GET_INFO_WORDS', path);
    })
    
  }
  getData = () => {
    //console.log('getting data...');
  }

  setFechaEnlaces = fecha => {
    console.log(fecha);
    
  }
  handleChange(date) {

    console.log(date);
    this.setState({startDate:date})
    
  }


  render(){
    if(!this.state.visibility)return false
    var id_date = moment(this.state.startDate).format('YYYY-MM');
    console.log(id_date);
    
    return(
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
         
            {this.state.statusScript==='run'?<WordButton setPath={path=>this.setPath(path)} />:null}

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

            <div id='dp-w'>
              <DatePicker
                selected={this.state.startDate}
                onChange={(date)=>this.handleChange(date)}
                dateFormat="MMMM, yyyy"
                showMonthYearPicker
              />
            </div>

            
          
        </div>


        <div>
          
          {Object.keys(this.state.empleados).length>0?
            <div className='item-word-result header-table-counter-word'>
              <div className='item-word-empleado'>
                <div className='item-word-arrow'></div>
                <div className='item-word-name'>Empleado</div>
                <div className='item-word-palabras'>Palabras</div>
                <div className='item-word-docum'>Documentos</div>
              </div>
            </div>
          :null}
          

          {Object.keys(this.state.empleados).length>0?
            Object.entries(this.state.empleados).map(([k,e])=>{
              if(!e.dates[id_date]) return false;
              return(
                <div key={k} className='item-word-result'>
                  <div className='item-word-empleado'>
                    <div className='item-word-arrow'>
                      <Right  />
                    </div>
                    <div className='item-word-name'>{e.name}</div>
                    <div className='item-word-palabras'>{e.dates[id_date].words}</div>
                    <div className='item-word-docum'>{e.dates[id_date].documentos.length}</div>
                  </div>
                </div>
              )
            })
            :null
          }

        </div>



      </div>
    )
  }
} 

export default PalabrasWord