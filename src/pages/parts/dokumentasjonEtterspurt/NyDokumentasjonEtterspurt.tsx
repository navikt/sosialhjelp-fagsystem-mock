import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, Modal, Theme} from "@material-ui/core";
import {skjulNyDokumentasjonEtterspurtModal} from "../../../redux/v2/v2Actions";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Fade from "@material-ui/core/Fade";
import Backdrop from "@material-ui/core/Backdrop";
import {V2Model} from "../../../redux/v2/v2Types";
import {V3State} from "../../../redux/v3/v3Types";
import TextField from '@material-ui/core/TextField';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {KeyboardDatePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';
import Fab from "@material-ui/core/Fab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import AddIcon from '@material-ui/icons/Add';
import Hendelse, {Dokument, DokumentasjonEtterspurt, HendelseType} from "../../../types/hendelseTypes";
import Grid from "@material-ui/core/Grid";
import {getNow} from "../../../utils/utilityFunctions";
import {aiuuur, oppdaterDokumentasjonEtterspurt} from "../../../redux/v3/v3Actions";
import {FsSoknad} from "../../../redux/v3/v3FsTypes";
import {oHendelser} from "../../../redux/v3/v3Optics";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        modal: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        paper: {
            backgroundColor: theme.palette.background.paper,
            border: '2px solid #000',
            boxShadow: theme.shadows[5],
            padding: theme.spacing(2, 4, 3),
        },
        textField: {
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),
        },
        addbox: {
            margin: theme.spacing(2, 0, 2, 0),
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center'
        },
        krav: {
            backgroundColor: theme.palette.background.paper,
            border: '2px solid #000',
            boxShadow: theme.shadows[5],
        },
        fab: {
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),
            margin: theme.spacing(1),
        },
    }),
);


interface OwnProps {
    soknad: FsSoknad
}

interface StoreProps {
    visNyDokumentasjonEtterspurtModal: boolean;
    v2: V2Model;
    v3: V3State;
}

type Props = DispatchProps & OwnProps & StoreProps;


const NyDokumentasjonEtterspurtModal: React.FC<Props> = (props: Props) => {
    const [dokumenttype, setDokumenttype] = useState('');
    const [tilleggsinformasjon, setTilleggsinformasjon] = useState('');
    const initialDokumentListe: Dokument[] = [];
    const [dokumentListe, setDokumentListe] = useState(initialDokumentListe);
    const [visFeilmelding, setVisFeilmelding] = useState(false);
    const [datePickerIsOpen, setDatePickerIsOpen] = useState(false);
    let initialDate = new Date();
    initialDate.setDate(new Date().getDate() + 7); // En uke fram i tid
    initialDate.setHours(12);
    const [innsendelsesfrist, setInnsendelsesfrist] = useState(initialDate);
    const classes = useStyles();
    const {visNyDokumentasjonEtterspurtModal, dispatch, v2, soknad, v3} = props;
    const filreferanselager = v2.filreferanselager;

    const leggTilDokument = () => {
        const nyttDokument: Dokument = {
            dokumenttype: dokumenttype,
            tilleggsinformasjon: tilleggsinformasjon,
            innsendelsesfrist: innsendelsesfrist.toISOString()
        };
        dokumentListe.push(nyttDokument);
        setDokumentListe(dokumentListe);
        setDokumenttype('');
        setTilleggsinformasjon('');
        setInnsendelsesfrist(initialDate);
    };

    const sendDokumentasjonEtterspurt = () => {
        const nyHendelse: DokumentasjonEtterspurt = {
            type: HendelseType.DokumentasjonEtterspurt,
            hendelsestidspunkt: getNow(),
            forvaltningsbrev: {
                referanse: {
                    type: filreferanselager.dokumentlager[0].type,
                    id: filreferanselager.dokumentlager[0].id
                }
            },
            vedlegg: [],
            dokumenter: dokumentListe
        };

        const soknadUpdated = oHendelser.modify((a: Hendelse[]) => [...a, nyHendelse])(soknad);

        dispatch(
            aiuuur(
                soknad.fiksDigisosId,
                soknadUpdated.fiksDigisosSokerJson,
                v2,
                oppdaterDokumentasjonEtterspurt(soknad.fiksDigisosId, nyHendelse)
            )
        );

        setDokumentListe([]);
        setDokumenttype('');
        setTilleggsinformasjon('');
        setInnsendelsesfrist(initialDate);
        setVisFeilmelding(false);

        dispatch(dispatch(skjulNyDokumentasjonEtterspurtModal()));
    };

    function visAlleDokumenter() {
        return <Grid container direction="column" justify="flex-start" alignItems="flex-start" spacing={3}>
            {dokumentListe.map((dokument: Dokument, index) => {
                return (
                    <Grid item key={'krav: ' + index} xs={12} zeroMinWidth>
                        <Box className={classes.krav}>
                            <TextField
                                id="outlined-name"
                                label="Dokumenttype"
                                className={classes.textField}
                                value={dokument.dokumenttype}
                                margin="normal"
                                variant="outlined"
                            />
                            <TextField
                                id="outlined-name"
                                label="Tilleggsinfo"
                                className={classes.textField}
                                value={dokument.tilleggsinformasjon}
                                margin="normal"
                                variant="outlined"
                            />
                            <TextField
                                id="outlined-name"
                                label="Innsendelsesfrist (UTC)"
                                className={classes.textField}
                                value={dokument.innsendelsesfrist.substring(0, dokument.innsendelsesfrist.search('T'))}
                                margin="normal"
                                variant="outlined"
                            />
                        </Box>
                    </Grid>)
        })}
        </Grid>
    }

    return (
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
            }}
            open={visNyDokumentasjonEtterspurtModal}
            onClose={() => dispatch(skjulNyDokumentasjonEtterspurtModal())}
        >
            <Fade in={visNyDokumentasjonEtterspurtModal}>
                <div className={classes.paper}>
                    <Box className={classes.addbox}>
                        <TextField
                            id="outlined-name"
                            label="Dokumenttype"
                            className={classes.textField}
                            value={dokumenttype}
                            required={true}
                            error={visFeilmelding}
                            onChange={(evt) => {
                                setDokumenttype(evt.target.value);
                                if (evt.target.value.length == 0) {
                                    setVisFeilmelding(true);
                                } else {
                                    setVisFeilmelding(false);
                                }
                            }}
                            margin="normal"
                            variant="filled"
                            autoComplete="off"
                        />
                        <TextField
                            id="outlined-name"
                            label="Tilleggsinfo"
                            className={classes.textField}
                            value={tilleggsinformasjon}
                            onChange={(evt) => setTilleggsinformasjon(evt.target.value)}
                            margin="normal"
                            variant="filled"
                            autoComplete="off"
                        />
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                                disableToolbar
                                variant="inline"
                                format="MM/dd/yyyy"
                                margin="normal"
                                id="date-picker-inline"
                                label="Innsendelsesfrist"
                                open={datePickerIsOpen}
                                onOpen={() => setDatePickerIsOpen(true)}
                                onClose={() => setDatePickerIsOpen(false)}
                                value={innsendelsesfrist}
                                onChange={(date: any) => {
                                    setInnsendelsesfrist(date);
                                    setDatePickerIsOpen(false);
                                }}
                                KeyboardButtonProps={{
                                    'aria-label': 'change date',
                                }}
                            />
                        </MuiPickersUtilsProvider>

                        <Fab size="small" aria-label="add" className={classes.fab} color="primary" onClick={() => {
                            if (dokumenttype === '') {
                                setVisFeilmelding(true);
                            } else {
                                leggTilDokument();
                            }
                        }}>
                            <AddIcon/>
                        </Fab>
                        <Typography>
                            Legg til dokumentkrav
                        </Typography>
                        <Fab size="small" aria-label="add" className={classes.fab} color="primary" onClick={() => {
                            sendDokumentasjonEtterspurt();
                        }}>
                            <AddIcon/>
                        </Fab>
                        <Typography>
                            Etterspør dokumentasjon
                        </Typography>
                    </Box>
                    {(dokumentListe.length == 0) && <Typography>Ingen dokumenter lagt til</Typography>}
                    {visAlleDokumenter()}
                </div>
            </Fade>
        </Modal>
    );
};

const mapStateToProps = (state: AppState) => ({
    visNyDokumentasjonEtterspurtModal: state.v2.visNyDokumentasjonEtterspurtModal,
    v2: state.v2,
    v3: state.v3
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NyDokumentasjonEtterspurtModal);
