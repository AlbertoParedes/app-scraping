import React, { Component } from 'react';
import * as fs from 'fs'
class SheetJS extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  };
  handleFile = files => {
    
    var listFiles = []
    Object.entries(files).forEach(([i,o])=>{
      if(o.name.endsWith('.docx') || o.name.endsWith('.doc')){
        listFiles.push({name:o.name, path:o.path})
      }
    })
    this.props.getFiles(listFiles);
  };

  render() {
    return (
      <DragDropFile handleFile={this.handleFile}>
        <DataInput handleFile={this.handleFile} />
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
    if (files && files[0]) this.props.handleFile(files);
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
  handleChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) this.props.handleFile(files);
  };

  selectFolder = e =>{
    var theFiles = e.target.files;
    var path = theFiles[0].path;
    console.log(path);
  }

  render() {
    return (
      <div>



        <input type="file" id="word_files" accept={SheetJSFT} onChange={this.handleChange} name="word_files" className="display_none" data-multiple-caption="{count} files selected" multiple />
        
        <label htmlFor="word_files">
          <div className='button-upload'>Subir documentos</div>
        </label>

        {/* 
        <input type="file" id="word_files_path" name="word_files_path" onChange={e=>this.selectFolder(e)} webkitdirectory='' mozdirectory='' msdirectory='' odirectory='' directory='' multiple='' />

        <label htmlFor="word_files_path">
          <div className='button-upload'>Path</div>
        </label>
        */}
      
      </div>
    )
  }
}

/* list of supported file types */
const SheetJSFT = [
  "docx"
].map(function (x) { return "." + x; }).join(",");

