import React, {useState} from 'react';
import {V2Model} from "../../../redux/v2/v2Types";
import Hendelse from "../../../types/hendelseTypes";
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";


interface ExampleProps {
    v2: V2Model
    hendelserUpdated: Hendelse[]
}

interface ExampleState {
    input: string;
}

const initialState: ExampleState = {
    input: ''
};

type Props = DispatchProps & ExampleProps;
type State = ExampleState;


const ExampleView: React.FC<Props> = (props: Props) => {
    const [state, setState] = useState(initialState);

    return (
        <div>
            SoknadsOversiktPanel
        </div>
    );
};

const mapStateToProps = (state: AppState) => ({
    v2: state.v2,
    hendelserUpdated: JSON.parse(JSON.stringify(state.v2.fiksDigisosSokerJson.sak.soker.hendelser))
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
