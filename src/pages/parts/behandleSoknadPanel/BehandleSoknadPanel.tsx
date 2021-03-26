import React from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import SaksOversiktView from "../saksOversiktView/SaksOversiktView";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {getFsSoknadByFiksDigisosId} from "../../../utils/utilityFunctions";
import Paper from "@material-ui/core/Paper";
import {FsSoknad} from "../../../redux/types";
import Typography from "@material-ui/core/Typography";
import VilkarOversiktView from "../vilkar/VilkarOversiktView";
import DokumentasjonkravOversiktView from "../dokumentasjonskrav/DokumentasjonkravOversiktView";
import DokumentasjonEtterspurtOversiktView from "../dokumentasjonEtterspurt/DokumentasjonEtterspurtOversiktView";
import UtbetalingOversiktView from "../utbetaling/UtbetalingOversiktView";
import NyUtbetalingModal from "../utbetaling/NyUtbetalingModal";
import NySakModal from "../nySak/NySak";
import NyttDokumentasjonkravModal from "../dokumentasjonskrav/NyttDokumentasjonkravModal";
import NyttVilkarModal from "../vilkar/NyttVilkarModal";
import NyDokumentasjonEtterspurt from "../dokumentasjonEtterspurt/NyDokumentasjonEtterspurtModal";

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
    },
    root2: {
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        '@media (min-width: 1920px)': {
            flexDirection: 'row',
        },
        '@media (max-width: 1919px)': {
            flexDirection: 'column',
        },
    },
    root3: {
        flex: 1,
        '@media (min-width: 1920px)': {
            minWidth: '900px',
        },
        height: '100%'
    },
    root4: {
        flex: 1,
        '@media (min-width: 1920px)': {
            marginLeft: theme.spacing(2),
            minWidth: '900px',
        },
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
    },
    paper3: {
        padding: theme.spacing(2, 2),
        marginTop: theme.spacing(2)

    },
}));


interface StoreProps {
    soknad: FsSoknad | undefined;
}

type Props = DispatchProps & StoreProps;

const BehandleSoknadPanel: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const {soknad} = props;

    if (soknad) {
        return (
            <div className={classes.root}>
                <div className={classes.root2}>
                    <div className={classes.root3}>
                        <SaksOversiktView soknad={soknad}/>
                    </div>

                    <div className={classes.root4}>
                        <DokumentasjonEtterspurtOversiktView soknad={soknad}/>
                    </div>
                </div>
                <br/>
                <br/>
                <br/>
                <br/>
                <Typography variant="h5" component="h3">
                    Ting som ikke er knyttet til en sak:
                </Typography>
                <Typography variant={"subtitle1"}>
                    Obs: Hvis du setter en saksreferanse på en utbetaling blir den flyttet inn under den valgte saken i saksoversikten over.
                </Typography>

                <div className={classes.root2}>
                    <div className={classes.root3}>
                        <VilkarOversiktView soknad={soknad}/>
                    </div>

                    <div className={classes.root4}>
                        <DokumentasjonkravOversiktView soknad={soknad}/>
                    </div>
                </div>

                <div className={classes.root2}>
                    <div className={classes.root3}>
                        <Paper className={classes.paper3}>
                            <Typography variant={"h5"}>Utbetalinger uten saksreferanse</Typography>
                            <UtbetalingOversiktView utbetalingListe={soknad.utbetalingerUtenSaksreferanse} saksreferanse={null}/>
                        </Paper>
                    </div>
                </div>
                <NySakModal />
                <NyDokumentasjonEtterspurt soknad={soknad}/>
                <NyttVilkarModal soknad={soknad}/>
                <NyttDokumentasjonkravModal soknad={soknad}/>
                <NyUtbetalingModal soknad={soknad}/>
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
    const {aktivSoknad} = state.model;
    const {soknader} = state.model;
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
)(BehandleSoknadPanel);
