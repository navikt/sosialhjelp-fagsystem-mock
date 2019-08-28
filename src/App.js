import React from 'react';
import './App.css';
import ReactJson from "react-json-view";
import Form from "react-jsonschema-form";


// import schemaDigisosSoker from './digisos/digisos-soker'
import hendelseSchema from './digisos/hendelse-schema-test';


export const log = (type) => console.log.bind(console, type);

const additionalMetaSchemas = require("ajv/lib/refs/json-schema-draft-06.json");
const initialDigisosSoker = require('./digisos/komplett');
const initialHendelseTest = require('./digisos/initial-hendelse-test');


function CustomFieldTemplate(props) {
  const {id, classNames, label, help, required, description, errors, children} = props;



  return (
      <div className={classNames}>
        <label htmlFor={id}>{label}{required ? "*" : null}</label>
        {description}
        {children}
        {errors}
        {help}
      </div>
  );
}


const uiSchema = {
  "ui:FieldTemplate": CustomFieldTemplate
};


class App extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      digisosSoker: initialHendelseTest
    }

  };

  handleChange(json){
    this.setState({
      digisosSoker: json.formData
    });
  }

  handleSubmit(json){
    this.setState({
      digisosSoker: json.formData
    });
  }

  render(){
    return (
      <div className={"wrapper"}>
        <div className={"column"}>
          {/*<Form schema={schemaDigisosSoker}*/}
          {/*      formData={this.state.digisosSoker}*/}
          {/*      additionalMetaSchemas={[additionalMetaSchemas]}*/}
          {/*      onChange={(json) => this.handleChange(json)}*/}
          {/*      onSubmit={(json) => this.handleSubmit(json)}*/}
          {/*      onError={log("errors")}*/}
          {/*/>*/}
          <Form schema={hendelseSchema}
                formData={this.state.digisosSoker}
                uiSchema={uiSchema}
                additionalMetaSchemas={[additionalMetaSchemas]}
                onChange={(json) => this.handleChange(json)}
                onSubmit={(json) => this.handleSubmit(json)}
                onError={log("errors")}
          />
        </div>
        <div className={"column"}>
          <div className={"jsonView"}>
            <ReactJson src={this.state.digisosSoker}/>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
