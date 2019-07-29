import React, { Component } from 'react'
import $ from 'jquery'
import btnDes from './Images/des.svg';
import closeBtn from './Images/close.svg';
import closeBtnHover from './Images/close-hover.svg';
import minimizeBtn from './Images/minimize.svg';
import minimizeBtnHover from './Images/minimize-hover.svg';
import maximizeBtn from './Images/maximize.svg';
import maximizeBtnHover from './Images/maximize-hover.svg';

const { remote, ipcRenderer } = window.require('electron');

class TopBar extends Component {

  constructor(props) {
    super(props)
    this.state = {
      fullScreen: false,
      focusFrame: true
    }
  }

  updateBtns = (event, status) => {
    this.setState({ fullScreen: status ? false : true, })
  }
  componentWillMount = () => {
    ipcRenderer.removeListener('SHOW_BTNS', this.updateBtns);
    ipcRenderer.removeListener('FOCUS_FRAME', this.updateBtnsDesactivos);
  }
  componentDidMount = () => {
    ipcRenderer.on('SHOW_BTNS', this.updateBtns);
    ipcRenderer.on('FOCUS_FRAME', this.updateBtnsDesactivos);
  }

  updateBtnsDesactivos = (event, status) => {
    this.setState({ focusFrame: status })
  }

  close = () => { remote.app.quit(); }
  minimize = () => { remote.getCurrentWindow().minimize() }
  maximize = () => {
    const currentWindow = remote.getCurrentWindow();
    if (currentWindow.isFullScreen()) {
      this.setState({ fullScreen: false }, () => { currentWindow.setFullScreen(false) })
    } else {
      this.setState({ fullScreen: true }, () => { currentWindow.setFullScreen(true) })
    }
  }

  render() {
    return (
      <div className={`app-mac-buttons ${this.state.fullScreen ? 'hide-buttons-mac' : ''}`}>

        {/*Botones visibles frame activo*/}
        <div className='btn-mac-close btn-app' onClick={() => this.close()}><img src={this.state.focusFrame ? closeBtn : btnDes} alt='' /></div>
        <div className='btn-mac-maximize btn-app' onClick={() => this.minimize()}><img src={this.state.focusFrame ? minimizeBtn : btnDes} alt='' /></div>
        <div className='btn-mac-minimize btn-app' onClick={() => this.maximize()} > <img src={this.state.focusFrame ? maximizeBtn : btnDes} alt='' /></div>

        {/*Botones visibles frame activo hover*/}
        <div className='btn-mac-close btn-app-hover' onClick={() => this.close()}><img src={closeBtnHover} alt='' /></div>
        <div className='btn-mac-maximize btn-app-hover' onClick={() => this.minimize()}><img src={minimizeBtnHover} alt='' /></div>
        <div className='btn-mac-minimize btn-app-hover' onClick={() => this.maximize()} > <img src={maximizeBtnHover} alt='' /></div>

      </div>
    )
  }
}

export default TopBar