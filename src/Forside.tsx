import React, {ChangeEvent} from "react";
import {connect} from "react-redux";
import {ExampleModel} from "./redux/example/exampleTypes";
import {AppState, DispatchProps} from "./redux/reduxTypes";
import {Panel} from "nav-frontend-paneler";
import {Knapp} from "nav-frontend-knapper";
import {setAppName} from "./redux/example/exampleActions";
import {Input} from "nav-frontend-skjema";
import Cog from "./components/ikoner/TannHjul";

interface ExampleProps {
    example: ExampleModel
}

type Props = ExampleProps & DispatchProps;

class Forside extends React.Component<Props, { input: string}> {

    constructor(props: Props){
        super(props);
        this.state = {
            input: ""
        }
    }

    handleInput(value: string){
        this.setState({
            input: value
        });
    }

    handleClickSystemButton(){
        this.props.dispatch(setAppName(this.state.input))
    }

    render() {

        const {appname} = this.props.example;

        return (
            <Panel>
                <h3>
                    APP NAME:
                </h3>
                <Input
                    label={'Enter app name:'}
                    value={this.state.input}
                    onChange={(evt: ChangeEvent<HTMLInputElement>) => {this.handleInput(evt.target.value)}}
                />

                <Knapp
                    id={"system_button"}
                    form="kompakt"
                    onClick={() => this.handleClickSystemButton()}
                >
                    <Cog />
                    <span className="sr-only">Submit</span>
                </Knapp>

                <Panel
                    border={true}
                    className={"margintop"}
                >
                    {appname}
                </Panel>
            </Panel>
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
