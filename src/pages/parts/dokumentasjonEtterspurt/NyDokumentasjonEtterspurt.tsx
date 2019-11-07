import React, {useRef, useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, Modal, Paper, Theme} from "@material-ui/core";
import {
    sendNyHendelseOgOppdaterModel,
    oppdaterDokumentasjonEtterspurt,
    setAktivtRammevedtak,
    sendPdfOgOppdaterDokumentasjonEtterspurt,
    skjulNyDokumentasjonEtterspurtModal
} from "../../../redux/actions";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Fade from "@material-ui/core/Fade";
import Backdrop from "@material-ui/core/Backdrop";
import {FsSoknad, Model} from "../../../redux/types";
import TextField from '@material-ui/core/TextField';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {KeyboardDatePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';
import Fab from "@material-ui/core/Fab";
import Typography from "@material-ui/core/Typography";
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import {Dokument, DokumentasjonEtterspurt, FilreferanseType, HendelseType} from "../../../types/hendelseTypes";
import Grid from "@material-ui/core/Grid";
import {formatDateString, getDateOrNullFromDateString, getNow} from "../../../utils/utilityFunctions";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import IconButton from "@material-ui/core/IconButton";
import Box from "@material-ui/core/Box";
import useMediaQuery from "@material-ui/core/useMediaQuery";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        modal: {
            display: 'flex',
            justifyContent: 'center',
            '@media (min-height: 500px)': {
                alignItems: 'center',
            },
            overflowY: 'auto',
        },
        paper: {
            backgroundColor: theme.palette.background.paper,
            border: '2px solid #000',
            boxShadow: theme.shadows[5],
            padding: theme.spacing(2, 4, 3),
        },
        papertowel: {
            backgroundColor: theme.palette.background.paper,
            width:'80%',
        },
        paperback: {
            backgroundColor: theme.palette.background.paper,
            padding: theme.spacing(2),
            width:'100%',
            display: 'flex',
            flexwrap: 'wrap',
        },
        paperback2: {
            backgroundColor: theme.palette.background.paper,
            // width:'100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexwrap: 'wrap',
        },
        paperbox: {
            border: '2px solid #000',
            boxShadow: theme.shadows[5],
        },
        textField: {
            marginLeft: theme.spacing(2),
            marginRight: theme.spacing(2),
            width:'95%',
        },
        otherField: {
            marginLeft: theme.spacing(2),
            marginRight: theme.spacing(2),
        },
        addbox: {
            margin: theme.spacing(2, 0, 2, 0),
            display: 'flex',
            flexwrap: 'wrap',
            flexDirection: 'row',
            justifyContent: 'center',
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
            minWidth: '20px',
        },
        tablePaper: {
            margin: theme.spacing(2),
            overflowX: 'auto',
        },
        table: {
            '@media (min-width: 1000px)': {
                minWidth: 650,
            },
        },
        paperRoute: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexwrap: 'wrap',
        },
        margin: {
            margin: theme.spacing(1),
        },
    }),
);


interface OwnProps {
    soknad: FsSoknad
}

interface StoreProps {
    visNyDokumentasjonEtterspurtModal: boolean;
    model: Model
}

type Props = DispatchProps & OwnProps & StoreProps;

const standardRef = "2c75227d-64f8-4db6-b718-3b6dd6beb450";
const initialDokumentasjonEtterspurt: DokumentasjonEtterspurt = {
    type: HendelseType.DokumentasjonEtterspurt,
    hendelsestidspunkt: '',
    forvaltningsbrev: {
        referanse: {
            type: FilreferanseType.dokumentlager,
            id: standardRef
        }
    },
    vedlegg: [],
    dokumenter: []
};

const initialDokument: Dokument = {
    dokumenttype: '',
    tilleggsinformasjon: null,
    innsendelsesfrist: null,
};

const NyDokumentasjonEtterspurtModal: React.FC<Props> = (props: Props) => {
    const [modalDokumentasjonEtterspurt, setModalDokumentasjonEtterspurt] = useState<DokumentasjonEtterspurt>(initialDokumentasjonEtterspurt);
    const [modalDokument, setModalDokument] = useState<Dokument>(initialDokument);
    const [visFeilmelding, setVisFeilmelding] = useState(false);
    const [visFeilmeldingDatePicker, setVisFeilmeldingDatePicker] = useState(false);
    const [datePickerIsOpen, setDatePickerIsOpen] = useState(false);
    const classes = useStyles();
    const {visNyDokumentasjonEtterspurtModal, dispatch, model, soknad} = props;
    const inputEl = useRef<HTMLInputElement>(null);
    const smallScreen = useMediaQuery('(max-width:1200px)');

    function resetStateValues() {
        setModalDokumentasjonEtterspurt({...initialDokumentasjonEtterspurt});

        setVisFeilmelding(false);
        setVisFeilmeldingDatePicker(false);

        dispatch(setAktivtRammevedtak(null));
    }

    const handleFileUpload = (files: FileList) => {
        if (files.length !== 1) {
            return;
        }
        const formData = new FormData();
        formData.append("file", files[0], files[0].name);

        sendPdfOgOppdaterDokumentasjonEtterspurt(soknad.fiksDigisosId, formData, modalDokumentasjonEtterspurt.dokumenter, model, soknad, dispatch);

        setVisFeilmelding(false);
        setVisFeilmeldingDatePicker(false);

        dispatch(dispatch(skjulNyDokumentasjonEtterspurtModal()));
    };

    const leggTilDokument = () => {
        let innsendelsesfristDate = getDateOrNullFromDateString(modalDokument.innsendelsesfrist);
        const nyttDokument: Dokument = {
            dokumenttype: modalDokument.dokumenttype,
            tilleggsinformasjon: modalDokument.tilleggsinformasjon,
            innsendelsesfrist: innsendelsesfristDate ? innsendelsesfristDate.toISOString() : null
        };
        setModalDokumentasjonEtterspurt({...modalDokumentasjonEtterspurt, dokumenter: [...modalDokumentasjonEtterspurt.dokumenter, nyttDokument]});
        setModalDokument({...initialDokument});
    };

    function skalLasteOppFil() {
        return (model.backendUrlTypeToUse === 'q0' || model.backendUrlTypeToUse === 'q1')
            && modalDokumentasjonEtterspurt.forvaltningsbrev.referanse.id === standardRef;
    }

    const sendDokumentasjonEtterspurt = () => {
        if(skalLasteOppFil() && inputEl && inputEl.current) {
            inputEl.current.click();
        } else {
            const nyHendelse: DokumentasjonEtterspurt = {
                type: HendelseType.DokumentasjonEtterspurt,
                hendelsestidspunkt: getNow(),
                forvaltningsbrev: modalDokumentasjonEtterspurt.forvaltningsbrev,
                vedlegg: [],
                dokumenter: modalDokumentasjonEtterspurt.dokumenter
            };

            sendNyHendelseOgOppdaterModel(nyHendelse, model, dispatch, oppdaterDokumentasjonEtterspurt(soknad.fiksDigisosId, nyHendelse));

            dispatch(dispatch(skjulNyDokumentasjonEtterspurtModal()));

            setTimeout(() => {
                resetStateValues();
            }, 500);
        }
    };

    const makeTableRow = (dokument: Dokument, idx:number) => {
        return <TableRow key={dokument.dokumenttype + dokument.tilleggsinformasjon}>
            <TableCell component="th" scope="row">
                {dokument.dokumenttype}
            </TableCell>
            {dokument.tilleggsinformasjon != null ?
                <TableCell>{dokument.tilleggsinformasjon}</TableCell> :
                <TableCell variant={'footer'}>Ikke utfylt</TableCell>
            }
            {dokument.innsendelsesfrist != null ?
                <TableCell align="right">{formatDateString(dokument.innsendelsesfrist)}</TableCell> :
                <TableCell variant={'footer'} align="right">Ikke utfylt</TableCell>
            }
            <TableCell align="right">
                <IconButton aria-label="delete" onClick={() => {
                    let dokumenter = [...modalDokumentasjonEtterspurt.dokumenter];
                    dokumenter.splice(idx, 1);
                    setModalDokumentasjonEtterspurt({...modalDokumentasjonEtterspurt, dokumenter: dokumenter})
                }}>
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </TableCell>
        </TableRow>
    };

    const insertDokumentasjonEtterspurtOversikt = () => {

        if (modalDokumentasjonEtterspurt.dokumenter.length > 0) {
            return (
                <Paper className={classes.tablePaper}>
                    <Table className={classes.table} size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Type</TableCell>
                                <TableCell>Tilleggsinformasjon</TableCell>
                                <TableCell align="right">Innsendelsesfrist</TableCell>
                                <TableCell align="right">Slett krav</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {modalDokumentasjonEtterspurt.dokumenter.map((dokument, idx) => makeTableRow(dokument, idx))}
                        </TableBody>
                    </Table>
                </Paper>
            );
        } else {
            return (
                <>
                    <br/>
                    <Typography variant={"subtitle1"} className={classes.tablePaper}>
                        Ingen dokumenter er lagt til
                    </Typography>
                </>
            )
        }
    };

    function getTextFieldGrid(label: string, value: any, setValue: (v: any) => any, width: 1|2|3|4|5 = 3, required: boolean = false, id?: string) {
        return <Grid item key={'Grid: ' + label} xs={width} zeroMinWidth>
            <TextField
                id={id ? id : "outlined-name"}
                label={label}
                className={classes.textField}
                value={value ? value : ''}
                required={required}
                error={required && visFeilmelding}
                onChange={(evt) => {
                    setValue(evt.target.value);
                    if (required) {
                        if (evt.target.value.length === 0) {
                            setVisFeilmelding(true);
                        } else {
                            setVisFeilmelding(false);
                        }
                    }
                }}
                InputLabelProps={{
                    shrink: true,
                }}
                margin="normal"
                variant="filled"
                autoComplete="off"
            />
        </Grid>;
    }

    function getKeyboardDatePickerGrid(label: string, value: any, setValue: (v: string) => any, isOpen: boolean, setIsOpen: any) {
        return <Grid item key={"grid: " + label} xs={2} zeroMinWidth>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                    className={classes.otherField}
                    disableToolbar
                    required={true}
                    error={visFeilmeldingDatePicker}
                    variant="inline"
                    format="yyyy-MM-dd"
                    margin="normal"
                    id={label}
                    label={label}
                    open={isOpen}
                    onOpen={() => setIsOpen(true)}
                    onClose={() => setIsOpen(false)}
                    value={value}
                    onChange={(date: any) => {
                        setValue(date);
                        setIsOpen(false);
                        setVisFeilmeldingDatePicker(false);
                    }}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    KeyboardButtonProps={{
                        'aria-label': 'change date',
                    }}
                />
            </MuiPickersUtilsProvider>
        </Grid>;
    }

    const fyllInnDokumenterIModalDokumentasjonEtterspurt = () => {
        if (soknad.dokumentasjonEtterspurt) {
            setModalDokumentasjonEtterspurt({...soknad.dokumentasjonEtterspurt});
        }
    };

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
            onRendered={() => fyllInnDokumenterIModalDokumentasjonEtterspurt()}
            onClose={() => {
                dispatch(skjulNyDokumentasjonEtterspurtModal());
                setTimeout(() => {
                    resetStateValues();
                }, 500);
            }}
        >
            <Fade in={visNyDokumentasjonEtterspurtModal}>
                <div className={classes.papertowel}>
                    <div className={classes.paperbox}>
                        <div className={classes.paperback}>
                            <Grid container spacing={1} justify="center" alignItems="center">
                                {getTextFieldGrid("Dokumenttype", modalDokument.dokumenttype, (verdi: string) => setModalDokument({...modalDokument, dokumenttype: verdi}), 3, true, "nytt_dokumentasjonskrav_input_type")}
                                {getTextFieldGrid("Tilleggsinformasjon", modalDokument.tilleggsinformasjon, (verdi: string) => setModalDokument({...modalDokument, tilleggsinformasjon: verdi}), 5, false, "nytt_dokumentasjonskrav_input_tilleggsinformasjon")}
                                {getKeyboardDatePickerGrid("Innsendelsesfrist", modalDokument.innsendelsesfrist, (verdi: string) => setModalDokument({...modalDokument, innsendelsesfrist: verdi}),
                                    datePickerIsOpen, setDatePickerIsOpen)}

                                <Grid item key={"grid: legg til dokument"} xs={2} zeroMinWidth>
                                    <Box className={classes.addbox}>
                                        <Fab id={"legg_til_dokumentkrav"} size="small" aria-label="add" className={classes.fab} color="primary" onClick={() => {
                                            if (modalDokument.dokumenttype === '') {
                                                setVisFeilmelding(true);
                                            } else if (getDateOrNullFromDateString(modalDokument.innsendelsesfrist) == null) {
                                                setVisFeilmeldingDatePicker(true);
                                            } else {
                                                leggTilDokument();
                                            }
                                        }}>
                                            <AddIcon/>
                                        </Fab>
                                        <Typography hidden={smallScreen}>
                                            Legg til dokumentkrav
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </div>
                        <div className={classes.paperback2}>
                            {insertDokumentasjonEtterspurtOversikt()}
                        </div>
                        <div className={classes.paperback2}>
                            <Box className={classes.addbox}>
                                <Fab id={"etterspor_dokumentasjon_send"} size="small" aria-label="add" className={classes.fab} color="primary" onClick={() => {
                                    sendDokumentasjonEtterspurt();
                                }}>
                                    <AddIcon/>
                                </Fab>
                                <input
                                    id={'inputField vedtakFattet'}
                                    ref={inputEl}
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            handleFileUpload(e.target.files)
                                        }
                                    }}
                                    onClick={( event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
                                        const element = event.target as HTMLInputElement;
                                        element.value = '';
                                    }}
                                    type="file"
                                    hidden={true}
                                    className="visuallyhidden"
                                    tabIndex={-1}
                                    accept={window.navigator.platform.match(/iPad|iPhone|iPod/) !== null ? "*" : "application/pdf"}
                                />
                            </Box>
                            <Typography>
                                {skalLasteOppFil() ? "Etterspør dokumentasjon og velg forvaltningsbrev" : "Etterspør dokumentasjon"}
                            </Typography>
                        </div>
                    </div>
                </div>
            </Fade>
        </Modal>
    );
};

const mapStateToProps = (state: AppState) => ({
    visNyDokumentasjonEtterspurtModal: state.model.visNyDokumentasjonEtterspurtModal,
    model: state.model
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
