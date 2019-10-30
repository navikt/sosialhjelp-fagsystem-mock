import React from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import SaksOversiktView from "../saksOversiktView/SaksOversiktView";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {getFsSoknadByFiksDigisosId} from "../../../utils/utilityFunctions";
import Paper from "@material-ui/core/Paper";
import {FsSoknad} from "../../../redux/v3/v3FsTypes";
import Typography from "@material-ui/core/Typography";
import VilkarOversiktView from "../vilkar/VilkarOversiktView";
import DokumentasjonkravOversiktView from "../dokumentasjonskrav/DokumentasjonkravOversiktView";
import RammevedtakOversiktView from "../rammevedtak/RammevedtakOversiktView";
import DokumentasjonEtterspurtOversiktView from "../dokumentasjonEtterspurt/DokumentasjonEtterspurtOversiktView";
import NyttRammevedtakModal from "../rammevedtak/NyttRammevedtakModal";


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
            <div>

                {/*<div className={classes.paper2}>*/}
                {/*    <Paper className={classes.paper}>*/}
                {/*        <Typography variant={"h5"} component={"h3"}>*/}
                {/*            Oversikt over søknaden*/}
                {/*        </Typography>*/}
                {/*        <Typography variant={"subtitle1"}>*/}
                {/*            Navn på søker: {soknad.navn}*/}
                {/*        </Typography>*/}
                {/*        <Typography variant={"subtitle1"}>*/}
                {/*            FiksDigisosId: {soknad.fiksDigisosId}*/}
                {/*        </Typography>*/}
                {/*        <TildeldeltNavkontorView soknad={soknad} />*/}

                {/*    </Paper>*/}
                {/*    <SoknadStatusView soknad={soknad}/>*/}
                {/*</div>*/}

                <div className={classes.root}>
                    <DokumentasjonEtterspurtOversiktView soknad={soknad}/>

                    <SaksOversiktView soknad={soknad}/>

                    <br/>
                    <br/>
                    <br/>
                    <br/>
                    <Typography variant="h5" component="h3">
                        Ting som ikke er knyttet til en sak:
                    </Typography>
                    <Typography variant={"subtitle1"}>
                        Obs: Hvis du setter en saksreferanse på rammevedtak blir rammevedtaket flyttet inn under den valgte saken i saksoversikten over.
                    </Typography>

                    <VilkarOversiktView soknad={soknad}/>

                    <DokumentasjonkravOversiktView soknad={soknad}/>

                    <div className={classes.root2}>
                        <Paper className={classes.paper3}>
                            <Typography variant={"h5"}>Rammevedtak</Typography>
                            <RammevedtakOversiktView rammevedtakListe={soknad.rammevedtak} saksreferanse={null}/>
                            {(soknad.rammevedtak.length === 0) &&
                            <>
                                <br/>
                                <Typography variant={"subtitle1"}>
                                    Ingen rammevedtak uten saksreferanse er opprettet for denne søknaden.
                                </Typography>
                            </>
                            }
                        </Paper>
                    </div>
                </div>
                <NyttRammevedtakModal soknad={soknad}/>
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
)(BehandleSoknadPanel);
