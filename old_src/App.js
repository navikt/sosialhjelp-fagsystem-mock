import React from 'react';
import './App.css';
import ReactJson from "react-json-view";
import Form from "react-jsonschema-form";


// import schemaDigisosSoker from './digisos/digisos-soker'
import hendelseSchema from './digisos/hendelse-schema-test';










class App extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      digisosSoker: initialHendelseTest
    }

  };



  render(){
    return (
      <div className={"wrapper"}>

      </div>
    );
  }
}

export default App;
