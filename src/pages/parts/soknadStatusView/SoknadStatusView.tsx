import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, Paper} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import FormControl from "@material-ui/core/FormControl";
import RadioGroup from "@material-ui/core/RadioGroup";
import Hendelse, {HendelseType, SoknadsStatus, SoknadsStatusType} from "../../../types/hendelseTypes";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import Typography from "@material-ui/core/Typography";
import AddIcon from '@material-ui/icons/Add';
import Box from "@material-ui/core/Box";
import Fab from "@material-ui/core/Fab";
import {FsSoknad} from "../../../redux/v3/v3FsTypes";
import {aiuuur, oppdaterSoknadsStatus} from "../../../redux/v3/v3Actions";
import {getNow} from "../../../utils/utilityFunctions";
import {V2Model} from "../../../redux/v2/v2Types";
import {oHendelser} from "../../../redux/v3/v3Optics";
import {visNyDokumentasjonEtterspurtModal} from "../../../redux/v2/v2Actions";
import NyDokumentasjonEtterspurtModal from "../dokumentasjonEtterspurt/NyDokumentasjonEtterspurt";


const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: theme.spacing(2)
        },
        paper: {
            padding: theme.spacing(2, 2),
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center'
        },
        paper2: {
            padding: theme.spacing(2, 2),
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            marginLeft: theme.spacing(2)
        },
        box: {
            marginTop: theme.spacing(1),
            padding: theme.spacing(1),
        },
        formControl: {
            margin: theme.spacing(3)
        },
        addbox: {
            margin: theme.spacing(2, 0, 2, 0),
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            color: 'inherit'

        },
        fab: {
            marginRight: theme.spacing(1),
        },
        horizontalWrapper: {
            display: 'flex',
            flexDirection: 'column'
        },
        horizontalBox: {
            // display: 'inline-block'
        }
    });
});

interface OwnProps {
    soknad: FsSoknad
}

interface StoreProps {
    v2: V2Model
}

type Props = DispatchProps & OwnProps & StoreProps;


const SoknadStatusView: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const {dispatch, soknad} = props;

    const fabAdd = () => {
        const fab = {
            color: 'primary' as 'primary',
            className: classes.fab,
            icon: <AddIcon/>,
            label: 'Add',
        };
        return (
            <Box className={classes.addbox}>
                <Fab aria-label={fab.label} className={fab.className} color={fab.color}
                     onClick={() => dispatch(visNyDokumentasjonEtterspurtModal())}>
                    {fab.icon}
                </Fab>
                <Typography>
                    Etterspør mer dokumentasjon
                </Typography>
            </Box>
        )
    };

    return (
        <div className={classes.root}>
            <Paper className={classes.paper}>
                <Box className={classes.box}>
                    <FormControl component="fieldset" className={classes.formControl}>
                        <Typography variant={'h5'}>Status på Søknaden</Typography>
                        {/*<FormLabel component="legend">Status på sak</FormLabel>*/}
                        <RadioGroup aria-label="soknadsStatus" name="soknadsStatus1" value={soknad.soknadsStatus.status}
                                    onChange={(event, value) => {
                                        if (
                                            value === SoknadsStatusType.MOTTATT ||
                                            value === SoknadsStatusType.UNDER_BEHANDLING ||
                                            value === SoknadsStatusType.FERDIGBEHANDLET ||
                                            value === SoknadsStatusType.BEHANDLES_IKKE
                                        ) {

                                            const nyHendelse: SoknadsStatus = {
                                                type: HendelseType.SoknadsStatus,
                                                hendelsestidspunkt: getNow(),
                                                status: value
                                            };

                                            const soknadUpdated = oHendelser.modify((a: Hendelse[]) => [...a, nyHendelse])(soknad);

                                            dispatch(
                                                aiuuur(
                                                    soknad.fiksDigisosId,
                                                    soknadUpdated.fiksDigisosSokerJson,
                                                    props.v2,
                                                    oppdaterSoknadsStatus(soknad.fiksDigisosId, nyHendelse)
                                                )
                                            )
                                        }
                                    }}
                        >
                            <FormControlLabel value={SoknadsStatusType.MOTTATT} control={<Radio/>} label={"Mottatt"}/>
                            <FormControlLabel value={SoknadsStatusType.UNDER_BEHANDLING} control={<Radio/>}
                                              label={"Under behandling"}/>
                            <FormControlLabel value={SoknadsStatusType.FERDIGBEHANDLET} control={<Radio/>}
                                              label={"Ferdigbehandlet"}/>
                            <FormControlLabel value={SoknadsStatusType.BEHANDLES_IKKE} control={<Radio/>}
                                              label={"Behandles ikke"}/>
                        </RadioGroup>
                    </FormControl>
                </Box>
            </Paper>
            <Paper className={classes.paper2}>
                <div className={classes.horizontalWrapper}>
                    <Box className={classes.horizontalBox}>
                        <Typography variant={"h5"}>Dokumentasjon som er etterspurt</Typography>
                        {/*<IconButton>*/}
                        {fabAdd()}
                        {/*</IconButton>*/}
                    </Box>
                    <Box className={classes.horizontalBox}>
                        <Typography variant={'h5'}>Foreløpig svar</Typography>
                        <Typography>Foreløpig svar</Typography>
                        <Typography>Lag et foreløpig svar hvis foreksempel saksbehandlingstiden tar lengre tid enn
                            forventet.</Typography>
                    </Box>
                    <NyDokumentasjonEtterspurtModal/>
                </div>
            </Paper>
        </div>
    );
};

const mapStateToProps = (state: AppState) => ({
    v2: state.v2
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SoknadStatusView);
