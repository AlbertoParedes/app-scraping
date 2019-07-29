import React ,{ Component } from 'react';

class Switch extends Component {

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
      <div className={`div_switch ${this.props.class_div?this.props.class_div:''}`} >
        <label ckecked={(this.state.valor).toString()} onClick={ event => this.updateChekbox(event.currentTarget)} className="switch label_switch">
          <span className={`slider round ${ this.state.valor?'active_switch':''}`}></span>
        </label>
      </div>
    )
  }
}

export default Switch;
