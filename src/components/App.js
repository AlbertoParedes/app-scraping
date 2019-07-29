import React, { Component } from "react";
import TopBar from './TopBar/TopBar'
import ContainerApp from './ContainerApp/ContainerApp'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setOS } from '../redux/actions';
const { ipcRenderer } = window.require('electron');
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      os:null 
    };
  }

  componentWillMount = () => {
    if(!this.state.os){
      ipcRenderer.removeListener('OS',this.sistemaOperativo);
      ipcRenderer.send('OS',null);
    }
  }
  componentDidMount = () => {
    if(!this.state.os){
      ipcRenderer.on('OS',this.sistemaOperativo);
    }
  }

  sistemaOperativo = (event,os) => {
    this.props.setOS(os)
  }

  render() {
    return (
      <div className='app-container'>
        <TopBar />
        <ContainerApp />
      </div>
    );
  }
}

function mapStateToProps(state) {return {os:state.global.os}}
function matchDispatchToProps(dispatch) { return bindActionCreators({ setOS }, dispatch)}
export default connect(mapStateToProps, matchDispatchToProps)(App);
