import React from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {getFsSoknadByFiksDigisosId} from "../../../utils/utilityFunctions";
import Paper from "@material-ui/core/Paper";
import SoknadStatusView from "../soknadStatusView/SoknadStatusView";
import {FsSoknad} from "../../../redux/v3/v3FsTypes";
import Typography from "@material-ui/core/Typography";
import TildeldeltNavkontorView from "../navKontor/TildeltNavKontorView";


const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
    },
    root2: {
        backgroundColor: theme.palette.background.paper,
        position: 'relative',
        minHeight: 200,
    },
    paper: {
        margin: theme.spacing(2, 0),
        padding: theme.spacing(3, 2),
        display: 'inline',
        minWidth: '35%',
        flex:1
    },
    paper2: {
        display: 'flex',
        flexWrap: 'wrap',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
}));


interface StoreProps {
    soknad: FsSoknad | undefined;
}

type Props = DispatchProps & StoreProps;

const ToppPanel: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const {soknad} = props;

    if (soknad) {
        return (
            <div>

                <div className={classes.paper2}>
                    <Paper className={classes.paper}>
                        <Typography variant={"h5"} component={"h3"}>
                            Oversikt over søknaden
                        </Typography>
                        <Typography variant={"subtitle1"}>
                            Navn på søker: {soknad.navn}
                        </Typography>
                        <Typography variant={"subtitle1"}>
                            FiksDigisosId: {soknad.fiksDigisosId}
                        </Typography>
                        <TildeldeltNavkontorView soknad={soknad} />

                    </Paper>
                    <SoknadStatusView soknad={soknad}/>
                </div>
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
    const {aktivSoknad} = state.v2;
    const {soknader} = state.v3;
    return {
        soknad: getFsSoknadByFiksDigisosId(soknader, aktivSoknad)
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
