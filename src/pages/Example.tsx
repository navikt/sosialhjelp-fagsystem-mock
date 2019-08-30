import React, {ChangeEvent} from 'react';
import {Panel} from "nav-frontend-paneler";
import ReactJson from "react-json-view";
import {Input} from "nav-frontend-skjema";
import {Knapp} from "nav-frontend-knapper";
import Cog from "../components/ikoner/TannHjul";
import {AppState, DispatchProps} from "../redux/reduxTypes";
import {connect} from "react-redux";
import {ExampleModel} from "../redux/example/exampleTypes";
import {setAppName} from "../redux/example/exampleActions";



interface ExampleProps {
    example: ExampleModel
}

interface ExampleState {
    input: string;
}

type Props = DispatchProps & ExampleProps;



class Example extends React.Component<Props, ExampleState> {

    constructor(props: Props){
        super(props);
        this.state = {
            input: ""
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

    render(){
        const {appname} = this.props.example;

        return (
            <div>
                {/*<Panel>*/}
                {/*    <div className={"column"}>*/}
                {/*        <Form schema={hendelseSchemaTest}*/}
                {/*              formData={this.state.digisosSoker}*/}
                {/*              uiSchema={uiSchema}*/}
                {/*            // @ts-disable*/}
                {/*            //additionalMetaSchemas={[additionalMetaSchemas]}*/}
                {/*              onChange={(json) => this.handleChange(json)}*/}
                {/*              onSubmit={(json) => this.handleSubmit(json)}*/}
                {/*              onError={log("errors")}*/}
                {/*        />*/}
                {/*    </div>*/}
                {/*</Panel>*/}
                {/*<Panel>*/}
                {/*    <div className={"column"}>*/}
                {/*        <div className={"jsonView"}>*/}
                {/*            <ReactJson src={this.state.digisosSoker}/>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</Panel>*/}

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
)(Example);
