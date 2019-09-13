import React, { Component } from 'react';
import * as fs from 'fs'
class SheetJS extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  };

  handlePath = (path) => {
    this.props.setPath(path)
  }

  render() {
    return (
      <DragDropFile handleFile={this.handleFile}>
        <DataInput handlePath={this.handlePath} />
      </DragDropFile>
    )
  }
}

export default SheetJS;

class DragDropFile extends React.Component {
  constructor(props) {
    super(props);
    this.onDrop = this.onDrop.bind(this);
  }
  suppress(evt) { evt.stopPropagation(); evt.preventDefault(); };
  onDrop(evt) {
    evt.stopPropagation(); evt.preventDefault();
    const files = evt.dataTransfer.files;
    //if (files && files[0]) this.props.handleFile(files);
  }
  render() {
    return (
      <div onDrop={this.onDrop} onDragEnter={this.suppress} onDragOver={this.suppress}>
        {this.props.children}
      </div>
    )
  }
}

class DataInput extends React.Component {

  selectFolder = e =>{
    var theFiles = e.target.files;
    var path = theFiles[0].path;
    this.props.handlePath(path)
  }

  render() {
    return (
      <div>

        <input type="file" id="word_files_path" name="word_files_path" className="display_none" onChange={e=>this.selectFolder(e)} webkitdirectory='' mozdirectory='' msdirectory='' odirectory='' directory='' multiple='' />

        <label htmlFor="word_files_path">
          <div className='button-upload'>Analizar directorio</div>
        </label>
        
      
      </div>
    )
  }
}

/* list of supported file types */
const SheetJSFT = [
  "docx"
].map(function (x) { return "." + x; }).join(",");

