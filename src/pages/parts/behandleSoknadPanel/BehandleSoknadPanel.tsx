import React, {useState} from 'react';
import {V2Model} from "../../../redux/v2/v2Types";
import Hendelse from "../../../types/hendelseTypes";
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import SaksOversiktView from "../saksOversiktView/SaksOversiktView";
import {Box} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";


const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        maxWidth: 360,
        // color: 'white',
        // backgroundColor: 'white',
    },
}));

interface BehandleSoknadPanelProps {
    v2: V2Model
    hendelserUpdated: Hendelse[]
}

interface BehandleSoknadPanelState {
    input: string;
}

const initialState: BehandleSoknadPanelState = {
    input: ''
};

type Props = DispatchProps & BehandleSoknadPanelProps;
type State = BehandleSoknadPanelState;


const BehandleSoknadPanel: React.FC<Props> = (props: Props) => {
    const [state, setState] = useState(initialState);

    const classes = useStyles();

    return (
        <div>
            <Box>
                Dette er en boks
            </Box>
            BehandleSoknadPanel
            <SaksOversiktView />
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
)(BehandleSoknadPanel);
