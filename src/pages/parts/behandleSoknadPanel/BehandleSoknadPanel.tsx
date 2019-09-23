import React, {useState} from 'react';
import {V2Model} from "../../../redux/v2/v2Types";
import Hendelse from "../../../types/hendelseTypes";
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import SaksOversiktView from "../saksOversiktView/SaksOversiktView";
import {Box} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import NavKontorViewView from "../navKontor/NavKontorView";
import {getSoknadByFiksDigisosId} from "../../../utils/utilityFunctions";
import {Soknad} from "../../../types/additionalTypes";
import SoknadOversiktView from "../navKontor/NavKontorView";
import Paper from "@material-ui/core/Paper";
import SoknadStatusView from "../soknadStatusView/SoknadStatusView";


const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        // maxWidth: 360,
        // color: 'white',
        // backgroundColor: 'white',
    },
    paper: {
        padding: theme.spacing(1, 1)
    }
}));

interface StoreProps {
    soknad: Soknad | undefined;
}

interface BehandleSoknadPanelState {
    input: string;
}

const initialState: BehandleSoknadPanelState = {
    input: ''
};

type Props = DispatchProps & StoreProps;
type State = BehandleSoknadPanelState;


const BehandleSoknadPanel: React.FC<Props> = (props: Props) => {
    const [state, setState] = useState(initialState);

    const classes = useStyles();

    const {soknad} = props;

    if (soknad) {
        return (
            <div className={classes.root}>
                <SoknadOversiktView soknad={soknad}/>
                <SoknadStatusView soknad={soknad}/>
                <SaksOversiktView soknad={soknad}/>
            </div>
        );
    }

    return (
        <Paper className={classes.paper}>
            Velg en søknad fra innboksen for å behandle den.
        </Paper>
    )

};

const mapStateToProps = (state: AppState) => {
    const {soknader, aktivSoknad} = state.v2;
    return {
        soknad: getSoknadByFiksDigisosId(soknader, aktivSoknad)
    };
};

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BehandleSoknadPanel);
