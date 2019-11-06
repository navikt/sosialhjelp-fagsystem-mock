import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";


interface OwnProps {
}

interface StoreProps {
}

interface State {
    input: string;
}

const initialState: State = {
    input: ''
};

type Props = DispatchProps & OwnProps & StoreProps;


const ExampleView: React.FC<Props> = (props: Props) => {
    const [state, setState] = useState(initialState);

    return (
        <div>
            SoknadsOversiktPanel
        </div>
    );
};

const mapStateToProps = (state: AppState) => ({
    model: state.model,
    hendelserUpdated: JSON.parse(JSON.stringify(state.model.fiksDigisosSokerJson.sak.soker.hendelser))
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExampleView);
