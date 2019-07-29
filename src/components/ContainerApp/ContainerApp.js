import React, { Component } from "react";
import Home from './Home/Home'
import { connect } from 'react-redux';

import AhrefsKeywordPanel from "./Categorias/PanelAhrefsKeywords/AhrefsKeywords";
import Word2Html from "./Categorias/PanelWord2Html/Word2Html";
import Presarank from "./Categorias/PanelPresarank/Presarank";

class ContainerApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }


  render() {
    return (
      <div className='container-app' >

        {this.props.panelSeleccionado.categoria === 1 ? <Home /> : null}

        <AhrefsKeywordPanel 
          visibility={this.props.panelSeleccionado.categoria === 2 && this.props.panelSeleccionado.idPanel==='ahrefs_keywords'?true:false} 
          app={this.props.apps['ahrefs_keywords']} 
        />

        <Word2Html 
          visibility={this.props.panelSeleccionado.categoria === 2 && this.props.panelSeleccionado.idPanel==='word2html'?true:false} 
          app={this.props.apps['word2html']} 
        />

        <Presarank 
          visibility={this.props.panelSeleccionado.categoria === 2 && this.props.panelSeleccionado.idPanel==='prensarank'?true:false} 
          app={this.props.apps['prensarank']} 
        />

      </div>
    );
  }
}


function mapStateToProps(state) {
  return {
    panelSeleccionado: state.global.panelSeleccionado,
    apps: state.global.apps
  }
}
export default connect(mapStateToProps, null)(ContainerApp);
