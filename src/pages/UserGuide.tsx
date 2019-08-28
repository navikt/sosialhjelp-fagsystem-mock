import React from "react";
import {connect} from "react-redux";
import {DispatchProps, AppState} from "../redux/reduxTypes";
import {ExampleModel} from "../redux/example/exampleTypes";

type Props = ExampleModel & DispatchProps;

class UserGuide extends React.Component<Props, {}> {

    render() {
        return (
            <>
                <h1>Sosialhjelp Fagsystem Mock</h1>
                <p>
                    User Guide for Sosialhjelp Fagsystem Mock
                </p>
                <pre>coming soon...</pre>
            </>
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
)(UserGuide);
