import React, { Component } from "react";
import Card from './Card'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setMenu, setPanelSeleccionado } from '../../../redux/actions';
class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  selectPanel = (categoria, idPanel) => {
    
    this.props.setPanelSeleccionado({categoria,idPanel})
    this.props.setMenu({
      menu:{
        item_1:'home',
        item_2:idPanel
      },
      activo:'item_2'
    })
  }

  render() {


    return (
      <div className='home-app'>

        <h1 className='title-panel'>Home</h1>

        <div className='CardGroup'>

          {
            Object.entries(this.props.apps).map(([k,card])=>{
              return(
                <Card key={k} card={card} selectPanel={() => { this.selectPanel(card.categoria, card.id) }}/>
              )
            })

          }
          

        </div>


      </div>
    );
  }
}


function mapStateToProps(state) {
  return {
    apps:state.global.apps
  }
}
function matchDispatchToProps(dispatch) {
  return bindActionCreators({
    setMenu,


    setPanelSeleccionado
  }, dispatch)
}
export default connect(mapStateToProps, matchDispatchToProps)(Home);
