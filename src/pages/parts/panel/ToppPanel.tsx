import React from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {getFsSoknadByFiksDigisosId} from "../../../utils/utilityFunctions";
import Paper from "@material-ui/core/Paper";
import SoknadStatusView from "../soknadStatusView/SoknadStatusView";
import {FsSoknad} from "../../../redux/types";
import Typography from "@material-ui/core/Typography";
import TildeldeltNavkontorView from "../navKontor/TildeltNavKontorView";
import {BackendUrls} from "../../../redux/types";
import {backendUrls} from "../../../redux/reducer";


const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
    },
    root2: {
        backgroundColor: theme.palette.background.paper,
        position: 'relative',
    },
    paper: {
        margin: theme.spacing(2, 0),
        padding: theme.spacing(3, 2),
        display: 'inline',
        '@media (min-width: 480px)': {
            minWidth: '35%',
        },
        flex:1
    },
    paper2: {
        display: 'flex',
        flexWrap: 'wrap',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    frontendLink: {
        display: 'flex',
        flexWrap: 'wrap',
        overflowWrap: 'break-word',
        wordBreak: 'break-word'
    },
}));


interface StoreProps {
    soknad: FsSoknad | undefined;
    backendUrlTypeToUse: keyof BackendUrls;
}

type Props = DispatchProps & StoreProps;

const ToppPanel: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const {soknad, backendUrlTypeToUse} = props;
    const backendUrl = backendUrls[backendUrlTypeToUse];
    if (soknad) {
        let frontendUrl = backendUrl.substring(0, backendUrl.search('/sosialhjelp/')) + '/sosialhjelp/innsyn/' + soknad.fiksDigisosId + '/status';
        if (frontendUrl.includes('localhost:8080')) {
            frontendUrl = frontendUrl.replace('localhost:8080', 'localhost:3000')
        }
        return (
            <div>

                <div className={classes.paper2}>
                    <Paper className={classes.paper}>
                        <Typography variant={"h5"} component={"h3"}>
                            Oversikt over søknaden
                        </Typography>
                        <Typography variant={"subtitle1"}>
                            FiksDigisosId: {soknad.fiksDigisosId}
                        </Typography>
                        <Typography variant={"subtitle1"} className={classes.frontendLink}>
                            <a href={frontendUrl} target="_blank" rel="noopener noreferrer">{frontendUrl}</a>
                        </Typography>
                        <br/>
                        <TildeldeltNavkontorView soknad={soknad} />

                    </Paper>
                    <SoknadStatusView soknad={soknad}/>
                </div>
            </div>
        );
    }

    return (
        <div/>
    )

};

const mapStateToProps = (state: AppState) => {
    const {aktivSoknad} = state.model;
    const {soknader} = state.model;
    return {
        soknad: getFsSoknadByFiksDigisosId(soknader, aktivSoknad),
        backendUrlTypeToUse: state.model.backendUrlTypeToUse
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
)(ToppPanel);
