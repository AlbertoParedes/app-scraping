import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { changeActivoMenu } from '../../redux/actions';

class MenuBar extends Component {



  changeItem = (item,activo, categoria, id) => {
    if(activo)return false;
    this.props.changeActivoMenu({item, categoria, id})
  }
  
  render() {
    
    return (
      <div className='menu-bar'>
        {
          Object.entries(this.props.menu).map(([k,o])=>{
            if(!o.id)return null;
            var text = o.id && o.id==='home'?'home':this.props.apps[o.id].textMenu;
            return(
              <div key={k} onClick={()=>this.changeItem(k, o.activo, o.categoria, o.id)} className={`items-menu visible-item ${o.activo ? 'menu-item-activo-1' : ''}`}>{text}</div>
            )
          })
        }
        <div className='zd2'></div>
      </div>
    
    )
  }
}

function mapStateToProps(state) {
  return {
    menu: state.global.menu,
    apps:state.global.apps
  }
}
function matchDispatchToProps(dispatch) {
  return bindActionCreators({
    changeActivoMenu
  }, dispatch)
}
export default connect(mapStateToProps, matchDispatchToProps)(MenuBar);