import React,{Component} from 'react'
import { ReactComponent as Logo } from '../../../Global/Images/download-cloud.svg';
import ConfirmAlert from '../../../Global/ConfirmAlert'
import { ReactComponent as Trash } from '../../../Global/Images/trash.svg';
import XLSX from 'xlsx';
import firebase from '../../../../firebase/Firebase';

import moment from 'moment-with-locales-es6'
const db = firebase.database().ref();
class Card extends Component{

  constructor(props){
    super(props);
    this.state={
      item: this.props.item,
      eliminar: false,

      fecha:false, 
      totalMedios:false, 
      medios: false, 
      year: false, 
    }
  }

  componentWillMount = () => {
    this.renderData()
  }

  componentWillReceiveProps = newProps => {
    if(this.state.item.id_document!==newProps.item.id_document){this.setState({item:newProps.item},()=>{this.renderData()})}
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.item.id_document !== nextProps.item.id_document) {
      return true;
    }
    if (this.state.fecha !== nextState.fecha || this.state.totalMedios !== nextState.totalMedios || this.state.medios !== nextState.medios || this.state.year !== nextState.year ) {
      return true;
    }
    if (this.state.eliminar !== nextState.eliminar) {
      return true;
    }
    return false;
  }

  downloadDocument = () => {

    var periodicosIndividuales = [], blogIndividuales=[], blogsGrupos=[], periodicosGrupos=[];

    this.state.item.medios.periodicosIndividuales.forEach((o)=>{
      periodicosIndividuales.push({
        'NOMBRE': o.name,
        'URL':o.url,
        'OFERTA':o.oferta?'Si':'No',
        'IDIOMA':o.idioma,
        'DR':o.dr,
        'DA':o.da,
        'PA':o.pa,
        'CF':o.cf,
        'TF':o.tf,
        'RD':o.rd,
        'PRECIO SIN GRUPO':o.precioSinGrupo
      })
    })

    this.state.item.medios.blogsIndividuales.forEach((o)=>{
      blogIndividuales.push({
        'NOMBRE': o.name,
        'URL':o.url,
        'OFERTA':o.oferta?'Si':'No',
        'IDIOMA':o.idioma,
        'DR':o.dr,
        'DA':o.da,
        'PA':o.pa,
        'CF':o.cf,
        'TF':o.tf,
        'RD':o.rd,
        'PRECIO SIN GRUPO':o.precioSinGrupo
      })
    })

    this.state.item.medios.gruposPeriodicos.forEach((o)=>{
      periodicosGrupos.push({
        'NOMBRE': o.name,
        'URL':o.url,
        'OFERTA':o.oferta?'Si':'No',
        'DR':o.dr,
        'DA':o.da,
        'PA':o.pa,
        'CF':o.cf,
        'TF':o.tf,
        'EM':o.em,
        'EO':o.eo,
        'TEMÁTICA':o.tematica,
        'PRECIO POR PERSONA':o.precioPorPersona
      })
    })

    this.state.item.medios.gruposBlogs.forEach((o)=>{
      blogsGrupos.push({
        'NOMBRE': o.name,
        'URL':o.url,
        'OFERTA':o.oferta?'Si':'No',
        'DR':o.dr,
        'DA':o.da,
        'PA':o.pa,
        'CF':o.cf,
        'TF':o.tf,
        'EM':o.em,
        'EO':o.eo,
        'TEMÁTICA':o.tematica,
        'PRECIO POR PERSONA':o.precioPorPersona
      })
    })

    var wb = XLSX.utils.book_new();

    var periodicosIndividualesWS = XLSX.utils.json_to_sheet(periodicosIndividuales);
    var blogsIndividualesWS = XLSX.utils.json_to_sheet(blogIndividuales);

    var periodicosGruposWS = XLSX.utils.json_to_sheet(periodicosGrupos);
    var blogsGruposWS = XLSX.utils.json_to_sheet(blogsGrupos);
    
    if(periodicosIndividuales.length>0)
      XLSX.utils.book_append_sheet(wb, periodicosIndividualesWS, "Periodicos (Individual)");
    
    if(blogIndividuales.length>0)
      XLSX.utils.book_append_sheet(wb, blogsIndividualesWS, "Blogs (Individual)");

    if(periodicosGrupos.length>0)
      XLSX.utils.book_append_sheet(wb, periodicosGruposWS, "Grupos (periódicos)");
    
    if(blogsGrupos.length>0)
      XLSX.utils.book_append_sheet(wb, blogsGruposWS, "Grupos (blogs)");
     


    if(periodicosIndividuales.length>0 || blogIndividuales.length>0){
      XLSX.writeFile(wb, `Prensarank Medios.xlsx`);
    }
    
  }

  renderData = () => {
    var item = this.state.item;
  
    var medios = '', totalMedios = 0
      Object.entries(item.medios).some(([i, m]) => {
        if (medios.length < 300){
          Object.entries(m).some(([i2, m2]) => {
            if (medios.length < 300){ medios = medios + m2.name + ", "; return false;
            }else{ return true; }
          })
        }
        totalMedios+=Object.keys(m).length
      });


    var fecha = moment(item.timestamp)
    var year = false;

    if(fecha.format('DD/MM/YYYY')===moment().format('DD/MM/YYYY') || fecha.format('DD/MM/YYYY')===moment().subtract(1, 'day').format('DD/MM/YYYY')){
      fecha = fecha.locale('es').calendar();
      fecha = fecha.charAt(0).toUpperCase() + fecha.slice(1)
    }else{
      fecha = fecha.locale('es').format('LL');
      var arrayFecha = fecha.split('de');
      fecha =  arrayFecha[0].trim()   +' de '+ arrayFecha[1].trim().charAt(0).toUpperCase() + arrayFecha[1].trim().slice(1)
      if(arrayFecha[2].trim()!==moment().format('YYYY').toString()){
        year = arrayFecha[2].trim()
      }
    }

    this.setState({
      fecha, totalMedios, year, medios
    })

  }

  confirmResult = (result) => {
    if(result==='cancelar'){
      this.setState({eliminar:false})
    }if(result==='aceptar'){
      var multiPath = {}
      multiPath[`Others/apps/scraping/prensarank-medios/documents/${this.state.item.id_document}`]=null
      db.update(multiPath)
      .then(()=>{
        this.setState({eliminar:false})
      })
      .catch(err=>{
        console.log(err);
      })
      
    }

  }

  render(){
  

    return (
      <div className='Card2' >
        <div className='heading_2'>
          <span>{this.state.fecha}</span>
        </div>
        {/*<h2>{this.state.fecha}</h2>*/}
        <div className='display_flex'>
          <p>{this.state.totalMedios} {this.state.totalMedios===1?'Resultado':'Resultados'}</p>
          <span onClick={()=>this.downloadDocument()} className='cloud-ahrefs-keywords ' ><Logo />Descargar</span>
          {this.state.year?
            <div className='year-item-card'>{this.state.year}</div>
          :null}
          
        </div>
        <div className='container-kws'>
          {this.state.medios}
        </div>

        <div className='toolbar-card-ahrefs'>
          <div className='items-toolbara-ahrefs' onClick={()=>this.setState({eliminar:true})}><Trash className='btn-ahres-tool trashbutton' /></div>
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

export default Card