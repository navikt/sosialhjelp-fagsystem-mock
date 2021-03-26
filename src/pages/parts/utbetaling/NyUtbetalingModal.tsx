import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, Modal, Theme} from "@material-ui/core";
import {
    nyUtbetaling,
    oppdaterUtbetaling,
    sendNyHendelseOgOppdaterModel,
    setAktivUtbetaling,
    skjulNyUtbetalingModal
} from "../../../redux/actions";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Fade from "@material-ui/core/Fade";
import Backdrop from "@material-ui/core/Backdrop";
import {FsSoknad, Model} from "../../../redux/types";
import {
    formatDateString,
    generateFilreferanseId,
    getNow,
    getSakTittelFraSaksreferanse,
    getShortDateISOString,
    getUtbetalingByUtbetalingsreferanse
} from "../../../utils/utilityFunctions";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import {HendelseType, Utbetaling, UtbetalingStatus} from "../../../types/hendelseTypes";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import CustomTextField from "../../../components/customTextField";
import CustomKeyboardDatePicker from "../../../components/customKeyboardDatePicker";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        modal: {
            display: 'flex',
            justifyContent: 'center',
            '@media (min-height: 851px)': {
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
        paperback: {
            backgroundColor: theme.palette.background.paper,
            border: '2px solid #000',
            boxShadow: theme.shadows[5],
            padding: theme.spacing(2),
            width:'100%',
            display: 'flex',
            flexwrap: 'wrap',
        },
        paperboys: {
            backgroundColor: theme.palette.background.paper,
            border: '2px solid #000',
            boxShadow: theme.shadows[5],
            padding: theme.spacing(2),
            width:'100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexwrap: 'wrap',
        },
        papertowel: {
            backgroundColor: theme.palette.background.paper,
            width:'80%',
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
        finalButtons: {
            marginLeft: theme.spacing(2),
            marginRight: theme.spacing(2),
        },
        formControl: {
            marginLeft: theme.spacing(2),
            marginRight: theme.spacing(2),
            '@media (min-width: 1100px)': {
                minWidth: 200
            },
            '@media (max-width: 1099px)': {
                width: '100%'
            },
        },
        formControl2: {
            marginLeft: theme.spacing(2),
            marginRight: theme.spacing(2),
            minWidth: '80%',
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
    visNyUtbetalingModal: boolean;
    model: Model
    aktivUtbetaling: string | undefined | null;
    modalSaksreferanse: string|null;
}

type Props = DispatchProps & OwnProps & StoreProps;

const initialUtbetaling: Utbetaling = {
    type: HendelseType.Utbetaling,
    hendelsestidspunkt: '',
    utbetalingsreferanse: generateFilreferanseId(),
    saksreferanse: '',
    status: null,
    belop: null,
    beskrivelse: null,
    forfallsdato: null,
    utbetalingsdato: null,
    fom: null,
    tom: null,
    annenMottaker: null,
    mottaker: null,
    kontonummer: null,
    utbetalingsmetode: null,
};

let date = new Date();
date.setDate(new Date().getDate() + 7); // En uke fram i tid
date.setHours(12);
const defaultForfallsdato = getShortDateISOString(date);
date.setDate(new Date().getDate() + 6); // Seks dager fram i tid
date.setHours(12);
const defaultUtbetalingsdato = getShortDateISOString(date);
date.setDate(new Date().getDate() - 7); // En uke tilbake i tid
date.setHours(12);
const defaultFomDato = getShortDateISOString(date);
date.setDate(new Date().getDate() + 14); // To uker fram i tid
date.setHours(12);
const defaultTomDato = getShortDateISOString(date);

const defaultUtbetaling: Utbetaling = {
    type: HendelseType.Utbetaling,
    hendelsestidspunkt: '',
    utbetalingsreferanse: generateFilreferanseId(),
    saksreferanse: null,
    status: UtbetalingStatus.PLANLAGT_UTBETALING,
    belop: 1337,
    beskrivelse: "Midler til å kjøpe utvidelsespakker til Starcraft",
    forfallsdato: defaultForfallsdato,
    utbetalingsdato: defaultUtbetalingsdato,
    fom: defaultFomDato,
    tom: defaultTomDato,
    annenMottaker: false,
    mottaker: "Jim Raynor",
    kontonummer: "12345678903",
    utbetalingsmetode: "Kronekort",
};

const NyUtbetalingModal: React.FC<Props> = (props: Props) => {
    const [modalUtbetaling, setModalUtbetaling] = useState<Utbetaling>(initialUtbetaling);
    const [annenMottakerTrueVariant, setAnnenMottakerTrueVariant] = useState<'text'|'outlined'|'contained'|undefined>('text');
    const [annenMottakerFalseVariant, setAnnenMottakerFalseVariant] = useState<'text'|'outlined'|'contained'|undefined>('text');
    const [kontonummerLabelPlaceholder, setKontonummerLabelPlaceholder] = useState("Kontonummer (Ikke satt)");
    const [forfallsdatoDatePickerIsOpen, setForfallsdatoDatePickerIsOpen] = useState(false);
    const [utbetalingsdatoDatePickerIsOpen, setUtbetalingsdatoDatePickerIsOpen] = useState(false);
    const [fomDatePickerIsOpen, setFomDatePickerIsOpen] = useState(false);
    const [tomDatePickerIsOpen, setTomDatePickerIsOpen] = useState(false);
    const [visFeilmelding, setVisFeilmelding] = useState(false);
    const [referansefeltDisabled, setReferansefeltDisabled] = useState(false);


    const classes = useStyles();
    const {visNyUtbetalingModal, dispatch, model, soknad, aktivUtbetaling, modalSaksreferanse} = props;

    const resetStateValues = () => {
        setModalUtbetaling({...initialUtbetaling, utbetalingsreferanse: generateFilreferanseId()});

        setAnnenMottakerTrueVariant('text');
        setAnnenMottakerFalseVariant('text');
        setKontonummerLabelPlaceholder("Kontonummer (Ikke satt)");
        setForfallsdatoDatePickerIsOpen(false);
        setUtbetalingsdatoDatePickerIsOpen(false);
        setFomDatePickerIsOpen(false);
        setTomDatePickerIsOpen(false);
        setVisFeilmelding(false);
        setReferansefeltDisabled(false);
        dispatch(setAktivUtbetaling(null));
    };

    const sendUtbetaling = () => {
        let nyHendelse: Utbetaling = {...modalUtbetaling};
        if (modalSaksreferanse) {
            nyHendelse = {...nyHendelse, saksreferanse: modalSaksreferanse};
        }
        nyHendelse.hendelsestidspunkt = getNow();
        nyHendelse.kontonummer = modalUtbetaling.kontonummer && modalUtbetaling.kontonummer.length === 11 ? modalUtbetaling.kontonummer : null;
        nyHendelse.forfallsdato = formatDateString(nyHendelse.forfallsdato);
        nyHendelse.utbetalingsdato = formatDateString(nyHendelse.utbetalingsdato);
        nyHendelse.fom = formatDateString(nyHendelse.fom);
        nyHendelse.tom = formatDateString(nyHendelse.tom);

        if (aktivUtbetaling == null) {
            sendNyHendelseOgOppdaterModel(nyHendelse, model, dispatch, nyUtbetaling(soknad.fiksDigisosId, nyHendelse));
        } else {
            sendNyHendelseOgOppdaterModel(nyHendelse, model, dispatch, oppdaterUtbetaling(soknad.fiksDigisosId, nyHendelse));
        }

        dispatch(dispatch(skjulNyUtbetalingModal()));

        setTimeout(() => {
            resetStateValues();
        }, 500);
    };

    const setDefaultUtbetaling = () => {
        setModalUtbetaling({...defaultUtbetaling, utbetalingsreferanse: generateFilreferanseId(), saksreferanse: modalUtbetaling.saksreferanse});

        if (soknad.saker.length > 0 && modalUtbetaling.saksreferanse == null) {
            setModalUtbetaling({...defaultUtbetaling, saksreferanse: soknad.saker[0].referanse});
        }

        setAnnenMottakerTrueVariant('text');
        setAnnenMottakerFalseVariant('contained');
        setKontonummerLabelPlaceholder("Kontonummer");
        setForfallsdatoDatePickerIsOpen(false);
        setUtbetalingsdatoDatePickerIsOpen(false);
        setFomDatePickerIsOpen(false);
        setTomDatePickerIsOpen(false);
        setVisFeilmelding(false);
        setReferansefeltDisabled(false);
    };

    const fyllInnAktivUtbetaling = () => {
        if (aktivUtbetaling) {
            let utbetaling = getUtbetalingByUtbetalingsreferanse(soknad, aktivUtbetaling);
            if (utbetaling){
                setModalUtbetaling(utbetaling);

                setAnnenMottakerTrueVariant(utbetaling.annenMottaker == null || !utbetaling.annenMottaker ? 'text' : 'contained');
                setAnnenMottakerFalseVariant(utbetaling.annenMottaker == null || utbetaling.annenMottaker ? 'text' : 'contained');
                setKontonummerLabelPlaceholder(utbetaling.kontonummer == null ? "Kontonummer (Ikke satt)" : "Kontonummer");
                setTimeout(() => {
                    setReferansefeltDisabled(true);
                }, 10);
            }
        } else {
            setModalUtbetaling({...modalUtbetaling, saksreferanse: modalSaksreferanse});
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
            open={visNyUtbetalingModal}
            onRendered={() => fyllInnAktivUtbetaling()}
            onClose={() => {
                props.dispatch(skjulNyUtbetalingModal());
                setTimeout(() => {
                    resetStateValues();
                }, 500);
            }}
        >
            <Fade in={visNyUtbetalingModal}>
                <div className={classes.papertowel}>
                    <div className={classes.paperback}>
                        <Grid container spacing={3} justify="center" alignItems="center">
                            <Grid item key={'Grid: Utbetalingsreferanse'} xs={6} zeroMinWidth>
                                <CustomTextField label={'Utbetalingsreferanse'} value={modalUtbetaling.utbetalingsreferanse}
                                                 setValue={(verdi: string) => setModalUtbetaling({...modalUtbetaling, utbetalingsreferanse: verdi})}
                                                 required={true} referansefeltDisabled={referansefeltDisabled}
                                                 visFeilmelding={visFeilmelding} setVisFeilmelding={setVisFeilmelding} />
                            </Grid>
                            <Grid item key={'Saksreferanse'} xs={6} zeroMinWidth>
                                <FormControl className={classes.formControl2} disabled={modalSaksreferanse != null}>
                                    <InputLabel htmlFor="age-simple" shrink={true}>Saksreferanse</InputLabel>
                                    <Select
                                        value={modalUtbetaling.saksreferanse ? modalUtbetaling.saksreferanse : ''}
                                        onChange={(evt) => setModalUtbetaling({...modalUtbetaling, saksreferanse: evt.target.value as string})}
                                        inputProps={{
                                            name: 'setSaksreferanse',
                                            id: 'saksreferanse',
                                        }}
                                    >
                                        {soknad.saker.map(sak => (
                                            <MenuItem key={sak.referanse} value={sak.referanse}>{sak.referanse + ' ' + getSakTittelFraSaksreferanse(soknad, sak.referanse)}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item key={'Grid: Beløp'} xs={6} zeroMinWidth>
                                <CustomTextField label={'Beløp'} value={modalUtbetaling.belop} inputType={'number'}
                                                 setValue={(verdi: number) => setModalUtbetaling({...modalUtbetaling, belop: +verdi})}/>
                            </Grid>
                            <Grid item key={'Grid: Beskrivelse'} xs={6} zeroMinWidth>
                                <CustomTextField label={'Beskrivelse (Stønadstype)'} value={modalUtbetaling.beskrivelse}
                                                 setValue={(verdi: string) => setModalUtbetaling({...modalUtbetaling, beskrivelse: verdi})}/>
                            </Grid>
                            <Grid item key={"grid: Forfallsdato"} xs={3} zeroMinWidth>
                                <CustomKeyboardDatePicker label={'Forfallsdato'} value={modalUtbetaling.forfallsdato}
                                                          setValue={(verdi: string) => setModalUtbetaling({...modalUtbetaling, forfallsdato: verdi})}
                                                          isOpen={forfallsdatoDatePickerIsOpen} setIsOpen={setForfallsdatoDatePickerIsOpen} />
                            </Grid>
                            <Grid item key={"grid: Utbetalingsdato"} xs={3} zeroMinWidth>
                                <CustomKeyboardDatePicker label={'Utbetalingsdato'} value={modalUtbetaling.utbetalingsdato}
                                                          setValue={(verdi: string) => setModalUtbetaling({...modalUtbetaling, utbetalingsdato: verdi})}
                                                          isOpen={utbetalingsdatoDatePickerIsOpen} setIsOpen={setUtbetalingsdatoDatePickerIsOpen} />
                            </Grid>
                            <Grid item key={"grid: fom"} xs={3} zeroMinWidth>
                                <CustomKeyboardDatePicker label={'fom'} value={modalUtbetaling.fom}
                                                          setValue={(verdi: string) => setModalUtbetaling({...modalUtbetaling, fom: verdi})}
                                                          isOpen={fomDatePickerIsOpen} setIsOpen={setFomDatePickerIsOpen} />
                            </Grid>
                            <Grid item key={"grid: tom"} xs={3} zeroMinWidth>
                                <CustomKeyboardDatePicker label={'tom'} value={modalUtbetaling.tom}
                                                          setValue={(verdi: string) => setModalUtbetaling({...modalUtbetaling, tom: verdi})}
                                                          isOpen={tomDatePickerIsOpen} setIsOpen={setTomDatePickerIsOpen} />
                            </Grid>
                            <Grid item key={'Status'} xs={3} zeroMinWidth>
                                <FormControl className={classes.formControl}>
                                    <InputLabel htmlFor="age-simple" shrink={true}>Status</InputLabel>
                                    <Select
                                        value={modalUtbetaling.status ? modalUtbetaling.status : ''}
                                        onChange={(evt) => setModalUtbetaling({...modalUtbetaling, status: evt.target.value as UtbetalingStatus})}
                                        inputProps={{
                                            name: 'setStatus',
                                            id: 'status',
                                        }}
                                    >
                                        <MenuItem value={UtbetalingStatus.PLANLAGT_UTBETALING}>Planlagt Utbetaling</MenuItem>
                                        <MenuItem value={UtbetalingStatus.UTBETALT}>Utbetalt</MenuItem>
                                        <MenuItem value={UtbetalingStatus.STOPPET}>Stoppet</MenuItem>
                                        <MenuItem value={UtbetalingStatus.ANNULLERT}>Annulert</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item key={'Annen mottaker'} xs={3} zeroMinWidth>
                                <Typography variant={"subtitle1"} className={classes.otherField}>
                                    {"Annen mottaker:  "}
                                    <ButtonGroup
                                        color="primary"
                                        aria-label="full-width contained primary button group"
                                    >
                                        <Button variant={annenMottakerTrueVariant} onClick={() => {
                                            setModalUtbetaling({...modalUtbetaling, annenMottaker: true});
                                            setAnnenMottakerTrueVariant('contained');
                                            setAnnenMottakerFalseVariant('text');
                                        }}>Ja</Button>
                                        <Button variant={annenMottakerFalseVariant} onClick={() => {
                                            setModalUtbetaling({...modalUtbetaling, annenMottaker: false});
                                            setAnnenMottakerTrueVariant('text');
                                            setAnnenMottakerFalseVariant('contained');
                                        }}>Nei</Button>
                                    </ButtonGroup>
                                </Typography>
                            </Grid>
                            <Grid item key={'Grid: Mottaker'} xs={6} zeroMinWidth>
                                <CustomTextField label={'Mottaker'} value={modalUtbetaling.mottaker}
                                                 setValue={(verdi: string) => setModalUtbetaling({...modalUtbetaling, mottaker: verdi})}/>
                            </Grid>
                            <Grid item key={'Kontonummer'} xs={6} zeroMinWidth>
                                <TextField
                                    id="filled-number"
                                    label={kontonummerLabelPlaceholder}
                                    onChange={(evt) => {
                                        setModalUtbetaling({...modalUtbetaling, kontonummer: evt.target.value});
                                        if (evt.target.value.length === 11) {
                                            setKontonummerLabelPlaceholder("Kontonummer");
                                        } else {
                                            setKontonummerLabelPlaceholder("Kontonummer (Ikke satt)");
                                        }
                                    }}
                                    type="number"
                                    className={classes.textField}
                                    value={modalUtbetaling.kontonummer ? modalUtbetaling.kontonummer : ''}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    autoComplete="off"
                                    margin="normal"
                                    variant="filled"
                                />
                            </Grid>
                            <Grid item key={'Grid: Utbetalingsmetode'} xs={6} zeroMinWidth>
                                <CustomTextField label={'Utbetalingsmetode'} value={modalUtbetaling.utbetalingsmetode}
                                                 setValue={(verdi: string) => setModalUtbetaling({...modalUtbetaling, utbetalingsmetode: verdi})}/>
                            </Grid>
                        </Grid>
                    </div>
                    <div className={classes.paperboys}>
                        {(aktivUtbetaling == null) &&
                        <Button className={classes.finalButtons} variant="outlined" color={'default'} onClick={() => {
                            setDefaultUtbetaling();
                        }}>
                            Fyll ut alle felter
                        </Button>
                        }
                        <Button className={classes.finalButtons} variant={aktivUtbetaling == null ? 'contained' : 'outlined'}
                                color={aktivUtbetaling == null ? 'primary' : 'secondary'} onClick={() => {
                                    if (!visFeilmelding) {
                                        sendUtbetaling();
                                    }
                                }}>
                            {(aktivUtbetaling == null ? "Legg til utbetaling" : "Endre utbetaling")}
                        </Button>
                    </div>
                </div>
            </Fade>
        </Modal>
    );
};

const mapStateToProps = (state: AppState) => ({
    visNyUtbetalingModal: state.model.visNyUtbetalingModal,
    model: state.model,
    aktivUtbetaling: state.model.aktivUtbetaling,
    modalSaksreferanse: state.model.modalSaksreferanse
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NyUtbetalingModal);
