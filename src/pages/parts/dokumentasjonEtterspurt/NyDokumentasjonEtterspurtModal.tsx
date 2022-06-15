import React, {useRef, useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, Modal, Paper, Theme} from "@material-ui/core";
import {v4 as uuidv4} from 'uuid';
import {
    oppdaterDokumentasjonEtterspurt,
    sendNyHendelseOgOppdaterModel,
    sendPdfOgOppdaterDokumentasjonEtterspurt,
    skjulNyDokumentasjonEtterspurtModal
} from "../../../redux/actions";
import {makeStyles }from "@material-ui/core/styles";
import Fade from "@material-ui/core/Fade";
import Backdrop from "@material-ui/core/Backdrop";
import {FsSoknad, Model} from "../../../redux/types";
import 'date-fns';
import Typography from "@material-ui/core/Typography";
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import {
    Dokument,
    DokumentasjonEtterspurt,
    FilreferanseType,
    HendelseType
} from "../../../types/hendelseTypes";
import Grid from "@material-ui/core/Grid";
import {
    formatDateString,
    getDateOrNullFromDateString,
    getNow
} from "../../../utils/utilityFunctions";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import IconButton from "@material-ui/core/IconButton";
import Box from "@material-ui/core/Box";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Button from "@material-ui/core/Button";
import CustomTextField from "../../../components/customTextField";
import CustomKeyboardDatePicker from "../../../components/customKeyboardDatePicker";

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
    dokumentreferanse: null,
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

    const dokumenterErAlleredeEtterspurt = soknad.dokumentasjonEtterspurt && soknad.dokumentasjonEtterspurt.dokumenter.length > 0;

    function resetStateValues() {
        setModalDokumentasjonEtterspurt({...initialDokumentasjonEtterspurt});
        setModalDokument({...initialDokument});

        setVisFeilmelding(false);
        setVisFeilmeldingDatePicker(false);
    }

    const handleFileUpload = (files: FileList) => {
        if (files.length !== 1) {
            return;
        }
        const formData = new FormData();
        formData.append("file", files[0], files[0].name);

        sendPdfOgOppdaterDokumentasjonEtterspurt(formData, modalDokumentasjonEtterspurt.dokumenter, model, dispatch);

        dispatch(dispatch(skjulNyDokumentasjonEtterspurtModal()));

        setTimeout(() => {
            resetStateValues();
        }, 500);
    };

    const leggTilDokument = () => {
        let innsendelsesfristDate = getDateOrNullFromDateString(modalDokument.innsendelsesfrist);
        const nyttDokument: Dokument = {
            dokumenttype: modalDokument.dokumenttype,
            tilleggsinformasjon: modalDokument.tilleggsinformasjon,
            innsendelsesfrist: innsendelsesfristDate ? innsendelsesfristDate.toISOString() : null,
            dokumentreferanse: createDokumentreferanse(),
        };
        setModalDokumentasjonEtterspurt({...modalDokumentasjonEtterspurt, dokumenter: [...modalDokumentasjonEtterspurt.dokumenter, nyttDokument]});
        setModalDokument({...initialDokument});
    };

    const createDokumentreferanse = () => {
        const randomId = Math.round(Math.random() * 1_000_000);
        return "woldena-dokref-" + randomId;
    }

    const sendDokumentasjonEtterspurt = () => {
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
    };

    let date = new Date();
    date.setDate(new Date().getDate() + 7); // En uke frem i tid
    date.setHours(12);
    const innsendelsesfrist = date.toISOString();

    const setDefaultDokumentasjonEtterspurt = () => {
        const nyttDokument: Dokument = {
            dokumenttype: 'Tannlege',
            tilleggsinformasjon: 'Kostnadsoverslag fra tannlegen din ',
            innsendelsesfrist: innsendelsesfrist,
            dokumentreferanse: createDokumentreferanse(),
        };
        setModalDokumentasjonEtterspurt({...modalDokumentasjonEtterspurt, dokumenter: [...modalDokumentasjonEtterspurt.dokumenter, nyttDokument]});
        setModalDokument({...initialDokument});
    };

    const makeTableRow = (dokument: Dokument, idx:number) => {
        const uuid = uuidv4();
        return <TableRow key={dokument.dokumenttype + dokument.tilleggsinformasjon + uuid}>
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
            <TableCell>{dokument.dokumentreferanse}</TableCell>
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
                                <TableCell align="left">Dokumentreferanse</TableCell>
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

    const fyllInnDokumenterIModalDokumentasjonEtterspurt = () => {
        if (soknad.dokumentasjonEtterspurt) {
            setModalDokumentasjonEtterspurt({...soknad.dokumentasjonEtterspurt});
        }
    };

    const onAddClick = () => {
        return () => {
            if (modalDokument.dokumenttype === '') {
                setVisFeilmelding(true);
            } else if (getDateOrNullFromDateString(modalDokument.innsendelsesfrist) == null) {
                setVisFeilmeldingDatePicker(true);
            } else {
                leggTilDokument();
            }
        };
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
                            <Grid container spacing={1} justifyContent="center" alignItems="center">
                                <Grid item key={'Grid: Dokumenttype'} xs={3} zeroMinWidth>
                                    <CustomTextField label={'Dokumenttype'} value={modalDokument.dokumenttype}
                                                     setValue={(verdi: string) => setModalDokument({...modalDokument, dokumenttype: verdi})}
                                                     required={true} visFeilmelding={visFeilmelding}
                                                     setVisFeilmelding={setVisFeilmelding} id={"nytt_dokumentasjonskrav_input_type"} />
                                </Grid>
                                <Grid item key={'Grid: Tilleggsinformasjon'} xs={5} zeroMinWidth>
                                    <CustomTextField label={'Tilleggsinformasjon'} value={modalDokument.tilleggsinformasjon}
                                                     setValue={(verdi: string) => setModalDokument({...modalDokument, tilleggsinformasjon: verdi})}
                                                     id={"nytt_dokumentasjonskrav_input_tilleggsinformasjon"} />
                                </Grid>
                                <Grid item key={'grid: Innsendelsesfrist'} xs={2} zeroMinWidth>
                                    <CustomKeyboardDatePicker label={'Innsendelsesfrist'} value={modalDokument.innsendelsesfrist}
                                                              setValue={(verdi: string) => setModalDokument({...modalDokument, innsendelsesfrist: verdi})}
                                                              isOpen={datePickerIsOpen} setIsOpen={setDatePickerIsOpen}
                                                              required={true} visFeilmelding={visFeilmeldingDatePicker} setVisFeilmelding={setVisFeilmeldingDatePicker} />
                                </Grid>
                                <Grid item key={"grid: legg til dokument"} xs={2} zeroMinWidth>
                                    <Box className={classes.addbox}>
                                        {!smallScreen && <Button id={"legg_til_dokumentkrav"} variant="contained" color={'default'} onClick={onAddClick()}>
                                            {smallScreen ? '+' : 'Legg til dokumentkrav'}
                                        </Button>}
                                        {smallScreen && <IconButton id={"legg_til_dokumentkrav"} aria-label="delete" onClick={onAddClick()}>
                                            <AddIcon/>
                                        </IconButton>}
                                    </Box>
                                </Grid>
                            </Grid>
                        </div>
                        <div className={classes.paperback2}>
                            {insertDokumentasjonEtterspurtOversikt()}
                        </div>
                        <div className={classes.paperback2}>
                            <Box className={classes.addbox}>

                                <Button variant="outlined" color={'default'} onClick={() => {
                                    setDefaultDokumentasjonEtterspurt();
                                }}>
                                    Fyll ut alle felter
                                </Button>

                                <Button id={"etterspor_dokumentasjon_send"} variant={!dokumenterErAlleredeEtterspurt ? 'contained' : 'outlined'}
                                        color={!dokumenterErAlleredeEtterspurt ? 'primary' : 'secondary'} onClick={() => {
                                    sendDokumentasjonEtterspurt();
                                }}>
                                    {dokumenterErAlleredeEtterspurt ? "Endre etterspurt dokumentasjon" : "Etterspør dokumentasjon"}
                                </Button>
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
