import React, {useState} from 'react';
import {V2Model} from "../redux/v2/v2Types";
import Hendelse from "../types/hendelseTypes";
import {AppState, DispatchProps} from "../redux/reduxTypes";
import {connect} from "react-redux";
import DarkHeader from "./parts/darkheader/DarkHeader";
import SoknadsOversiktPanel from "./parts/soknadsOversiktPanel/SoknadsOversiktPanel";
import BehandleSoknadPanel from "./parts/behandleSoknadPanel/BehandleSoknadPanel";


interface V3Props {
    v2: V2Model
    hendelserUpdated: Hendelse[]
}

interface V3State {
    input: string;
}

const initialState: V3State = {
    input: ''
};

type Props = DispatchProps & V3Props;
type State = V3State;


const V3: React.FC<Props> = (props: Props) => {
    const [state, setState] = useState(initialState);

    return (
        <div className={"v3-wrapper"}>
            <div className={"v3-header-wrapper"}>
                <DarkHeader />
            </div>
            <div className={"v3-main-wrapper"}>
                <SoknadsOversiktPanel />
                <BehandleSoknadPanel />
            </div>
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
)(V3);


