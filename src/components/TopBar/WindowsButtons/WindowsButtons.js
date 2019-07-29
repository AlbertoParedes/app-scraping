import React, { Component } from 'react'
import './win.css'
const { remote, ipcRenderer } = window.require('electron');

class TopBar extends Component {

  constructor(props) {
    super(props)
    this.state = {
      fullScreen: false
    }
  }

  componentWillMount = () => {
    ipcRenderer.removeListener('FULL_SCREEN', this.setFullScreen);
  }
  componentDidMount = () => {
    ipcRenderer.on('FULL_SCREEN', this.setFullScreen);
  }
  setFullScreen = (event, status) => {
    this.setState({ fullScreen: status })
  }
  

  close = () => { remote.app.quit(); }
  minimize = () => { remote.getCurrentWindow().minimize() }
  maximize = () => {
    const currentWindow = remote.getCurrentWindow();
    //console.log(currentWindow.isMaximized());
    if (this.state.fullScreen) {
      this.setState({ fullScreen: false }, () => { currentWindow.unmaximize() })
    } else {
      this.setState({ fullScreen: true }, () => { currentWindow.maximize() })
    }
  }

  btnMinimize = () => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z" /><path data-id='minimize' d="M3 3h18v2H3V3z" /></svg>
    )
  }
  btnMaximize = () => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z" /><path data-id='maximize' d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" /></svg>)
  }
  btnMaximizeOff = () => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="24" viewBox="0 0 24 24">
      <path data-id='maximize-off' d="M21,19h2V3c0-1.1-0.9-2-2-2H5v2h16V19z M3,23h14c1.1,0,2-0.9,2-2V7c0-1.1-0.9-2-2-2H3C1.9,5,1,5.9,1,7v14
        C1,22.1,1.9,23,3,23z M3,7h14v14H3V7z"/>
      </svg>
    )
  }
  btnClose = () => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z" /><path data-id='close' d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" /></svg>
    )
  }

  render() {
    return (
      <div className={`app-windows-buttons`}>

        <div className='btn-windows-minimize' onClick={() => this.minimize()}>{this.btnMinimize()}</div>
        {!this.state.fullScreen?
          <div className='btn-windows-maximize' onClick={() => this.maximize()}>{this.btnMaximize()}</div>
          :
          <div className='btn-windows-maximize-off' onClick={() => this.maximize()}>{this.btnMaximizeOff()}</div>
        }
        
        <div className='btn-windows-close' onClick={() => this.close()}>{this.btnClose()}</div>

      </div>
    )
  }
}

export default TopBar