import React, { Component } from 'react';
import XLSX from 'xlsx';

class SheetJS extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      cols: []
    };
  };
  handleFile = file => {
    /* Boilerplate to set up FileReader */
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    reader.onload = (e) => {
      /* Parse data */
      const bstr = e.target.result;


      const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array' });
      /* Get first worksheet */
      var hojas = []
      for (let i = 0; i < wb.SheetNames.length; i++) {

        const wsname = wb.SheetNames[i];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        hojas.push({
          hoja:wsname,
          data
        })
      }
      document.querySelector('#file_excel_deepl').value = ''
      this.props.getDataExcel({ nameFile: file.name, hojas });
      

    };
    if (rABS) reader.readAsBinaryString(file); else reader.readAsArrayBuffer(file);
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
    if (files && files[0]) this.props.handleFile(files[0]);
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
  constructor(props) {
    super(props);
  };
  handleChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) this.props.handleFile(files[0]);
  };
  render() {
    return (
      <div>

        <input type="file" id="file_excel_deepl" accept={SheetJSFT} onChange={this.handleChange} name="file_excel_deepl" className="display_none" data-multiple-caption="{count} files selected" multiple="" />
        <label htmlFor="file_excel_deepl">
          <div className='button-upload'>Documento nuevo</div>
        </label>
      
       
      
      
      </div>
    )
  }
}

/* list of supported file types */
const SheetJSFT = [
  "xlsx", "xlsb", "xlsm", "xls", "xml", "csv", "txt", "ods", "fods", "uos", "sylk", "dif", "dbf", "prn", "qpw", "123", "wb*", "wq*", "html", "htm"
].map(function (x) { return "." + x; }).join(",");

/* generate an array of column objects */
const make_cols = refstr => {
  let o = [], C = XLSX.utils.decode_range(refstr).e.c + 1;
  for (var i = 0; i < C; ++i) o[i] = { name: XLSX.utils.encode_col(i), key: i }
  return o;
};
