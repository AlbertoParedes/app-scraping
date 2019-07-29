import React, { Component } from 'react'
import MacButtons from './MacButtons/MacButtons'
import WindowsButtons from './WindowsButtons/WindowsButtons'
import MenuBar from './MenuBar'
import { connect } from 'react-redux';

class TopBar extends Component {

  render() {
    return (
      <div className={`${this.props.os && this.props.os==='MAC'?'app-topbar-mac':'app-topbar-win'}`}>
        <MenuBar />
        {this.props.os && this.props.os==='MAC'?<MacButtons />:null}
        {this.props.os && this.props.os==='WINDOWS'?<WindowsButtons />:null}

        {this.props.os && this.props.os==='WINDOWS'?
          <div className='zona-drag'></div>
        :null}
        
      </div>
    )
  }
}

function mapStateToProps(state) {return {os:state.global.os}}
export default connect(mapStateToProps, null)(TopBar);