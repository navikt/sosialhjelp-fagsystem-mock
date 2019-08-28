import React, {ChangeEvent} from "react";
import {connect} from "react-redux";
import {ExampleModel} from "./redux/example/exampleTypes";
import {AppState, DispatchProps} from "./redux/reduxTypes";
import {Panel} from "nav-frontend-paneler";
import {Knapp} from "nav-frontend-knapper";
import {setAppName} from "./redux/example/exampleActions";
import {Input, SkjemaGruppe} from "nav-frontend-skjema";
import Cog from "./components/ikoner/TannHjul";
import Form from "react-jsonschema-form";
import ReactJson from "react-json-view";

// const additionalMetaSchemas = require("ajv/lib/refs/json-schema-draft-06.json");
const digisosKomplett = require('./digisos/komplett');
const initialHendelseTest = require('./digisos/initial-hendelse-test');
const hendelseSchema = require('./digisos/hendelse-schema-test');
const minimal = require('./digisos/minimal');


function CustomFieldTemplate(props: any) {
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

export const log = (type: any) => console.log.bind(console, type);

const uiSchema = {
    "ui:FieldTemplate": CustomFieldTemplate
};


interface ForsideProps {
    example: ExampleModel
}

interface ForsideState {
    input: string;
    digisosSoker: object;
    preparedDigisosSoker: object;
}

type Props = ForsideProps & DispatchProps;

class Forside extends React.Component<Props, ForsideState> {

    constructor(props: Props) {
        super(props);
        this.state = {
            input: "",
            digisosSoker: initialHendelseTest,
            preparedDigisosSoker: minimal
        }
    }

    handleInput(value: string) {
        this.setState({
            input: value,
        });
    }

    handleClickSystemButton() {
        this.props.dispatch(setAppName(this.state.input))
    }

    handleChange(json: any) {
        this.setState({
            digisosSoker: json.formData
        });
    }

    handleSubmit(json: any) {
        this.setState({
            digisosSoker: json.formData
        });
    }

    render() {

        const {appname} = this.props.example;

        const listOfJsxHendelser = digisosKomplett.hendelser.map((hendelse: any, idx: any) => {

            buttonText = this.state.preparedDigisosSoker.hendelser.length > idx + 1;

            return (
                <li key={idx}>
                    <Panel>
                        {hendelse.type}
                        <Knapp
                            disabled={idx === 0}
                        >
                            asd
                        </Knapp>
                    </Panel>
                </li>
            );
        });

        return (
            <div className={"margintop"}>
                <Panel>
                    <h3>
                        Bruker- og søknadsdata
                    </h3>
                    <SkjemaGruppe>
                        <Input label={'Bruker identifikator'}/>
                        <Input label={'Søknadsreferanse'}/>
                    </SkjemaGruppe>
                </Panel>

                <Panel>
                    <ol>
                        {listOfJsxHendelser}
                    </ol>
                </Panel>

                <Panel>
                    <div className={"column"}>
                        <div className={"jsonView"}>
                            <ReactJson src={this.state.preparedDigisosSoker}/>
                        </div>
                    </div>
                </Panel>


                <Panel>
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
                            // @ts-disable
                            //additionalMetaSchemas={[additionalMetaSchemas]}
                              onChange={(json) => this.handleChange(json)}
                              onSubmit={(json) => this.handleSubmit(json)}
                              onError={log("errors")}
                        />
                    </div>

                </Panel>
                <Panel>
                    <div className={"column"}>
                        <div className={"jsonView"}>
                            <ReactJson src={this.state.digisosSoker}/>
                        </div>
                    </div>
                </Panel>

                <Panel>
                    <h3>
                        Example panel
                    </h3>
                    <Input
                        label={'Enter app name:'}
                        value={this.state.input}
                        onChange={(evt: ChangeEvent<HTMLInputElement>) => {
                            this.handleInput(evt.target.value)
                        }}
                    />

                    <Knapp
                        id={"system_button"}
                        form="kompakt"
                        onClick={() => this.handleClickSystemButton()}
                    >
                        <Cog/>
                        <span className="sr-only">Submit</span>
                    </Knapp>

                    <Panel
                        border={true}
                        className={"margintop"}
                    >
                        {appname}
                    </Panel>

                </Panel>
            </div>
        )
    }

}

const mapStateToProps = (state: AppState) => ({
    example: state.example
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Forside);
