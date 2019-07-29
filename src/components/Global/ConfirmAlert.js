import React ,{ Component } from 'react';
import ReactHtmlParser from 'react-html-parser';
import { ReactComponent as Campana } from './Images/campana.svg'
class ConfirmAlert extends Component {

  constructor(props){
    super(props);
    this.state = {
      valor: this.props.valor,
      json: this.props.json,
    }
  }

  componentWillReceiveProps = (newProps) => {
    if(this.state.valor!==newProps.valor)this.setState({valor:newProps.valor});
    if(this.state.json!==newProps.json)this.setState({json:newProps.json});
  }

  updateChekbox = (x) => {
    if(this.props.callbackSwitch){
      var json = this.state.json;
      json['valor'] = this.state.valor?false:true;
      this.props.callbackSwitch(json);
    }
  }

  render(){
    return (
      <div className='panel-confirm-alert'>
        <div className={`confirm-alert`} >
          <div className='confirm-top-bar'>
            <div className='confirm-top-bar-container-image'><Campana /></div>
            <div className='text-confirm-alert'>
              <span>{ReactHtmlParser(this.props.text)}</span>
            </div>
          </div>
          <div className='container-bottom-btns-confirm'>
            {this.props.cancelar? <div onClick={()=>this.props.confirmResult('cancelar')} className='btn-cancelar-confirm'>{this.props.cancelar}</div> :null}
            {this.props.confirmar? <div onClick={()=>this.props.confirmResult('confirmar')} className='btn-cancelar-confirm'>{this.props.confirmar}</div> :null}
            {this.props.aceptar? <div onClick={()=>this.props.confirmResult('aceptar')} className='btn-aceptar-confirm'>{this.props.aceptar}</div> :null}
          </div>
        </div>
      </div>
    )
  }
}

export default ConfirmAlert;
