import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, Modal, Theme} from "@material-ui/core";
import {setAktivUtbetaling, skjulNyUtbetalingModal} from "../../../redux/v2/v2Actions";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Fade from "@material-ui/core/Fade";
import Backdrop from "@material-ui/core/Backdrop";
import {V2Model} from "../../../redux/v2/v2Types";
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
import Hendelse, {HendelseType, Utbetaling, UtbetalingStatus} from "../../../types/hendelseTypes";
import {oHendelser} from "../../../redux/v3/v3Optics";
import {aiuuur, nyUtbetaling, oppdaterUtbetaling} from "../../../redux/v3/v3Actions";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import DateFnsUtils from "@date-io/date-fns";
import {KeyboardDatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import Typography from "@material-ui/core/Typography";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";
import Fab from "@material-ui/core/Fab";
import AddIcon from '@material-ui/icons/Add';
import {FsSoknad} from "../../../redux/v3/v3FsTypes";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";

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
            marginLeft: theme.spacing(6),
            marginRight: theme.spacing(6),
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
    v2: V2Model;
    aktivUtbetaling: string | undefined | null;
    modalSaksreferanse: string|null;
}

type Props = DispatchProps & OwnProps & StoreProps;

const initialUtbetaling: Utbetaling = {
    type: HendelseType.Utbetaling,
    hendelsestidspunkt: '',
    utbetalingsreferanse: generateFilreferanseId(),
    saksreferanse: '',
    rammevedtaksreferanse: null,
    status: null,
    belop: null,
    beskrivelse: null,
    forfallsdato: null,
    stonadstype: null,
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
    rammevedtaksreferanse: generateFilreferanseId(),
    status: UtbetalingStatus.PLANLAGT_UTBETALING,
    belop: 1337,
    beskrivelse: "Midler til å kjøpe utvidelsespakker til Starcraft",
    forfallsdato: defaultForfallsdato,
    stonadstype: "Mana potion",
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
    const {visNyUtbetalingModal, dispatch, v2, soknad, aktivUtbetaling, modalSaksreferanse} = props;

    function resetStateValues() {
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
    }

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

        const soknadUpdated = oHendelser.modify((a: Hendelse[]) => [...a, nyHendelse])(soknad);

        if (aktivUtbetaling == null) {
            dispatch(
                aiuuur(
                    soknad.fiksDigisosId,
                    soknadUpdated.fiksDigisosSokerJson,
                    v2,
                    nyUtbetaling(soknad.fiksDigisosId, nyHendelse)
                )
            );
        } else {
            dispatch(
                aiuuur(
                    soknad.fiksDigisosId,
                    soknadUpdated.fiksDigisosSokerJson,
                    v2,
                    oppdaterUtbetaling(soknad.fiksDigisosId, nyHendelse)
                )
            );
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

    function getTextFieldGrid(label: string, value: any, setValue: (v: any) => any, inputType: string = 'text', required: boolean = false) {
        return <Grid item key={'Grid: ' + label} xs={6} zeroMinWidth>
            <TextField
                disabled={required && referansefeltDisabled}
                id="outlined-name"
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
                type={inputType}
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
        return <Grid item key={"grid: " + label} xs={3} zeroMinWidth>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                    className={classes.otherField}
                    disableToolbar
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
                            {getTextFieldGrid("Utbetalingsreferanse", modalUtbetaling.utbetalingsreferanse,
                                (verdi: string) => setModalUtbetaling({...modalUtbetaling, utbetalingsreferanse: verdi}), "text", true)}
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
                            {getTextFieldGrid("Rammevedtaksreferanse", modalUtbetaling.rammevedtaksreferanse,
                                (verdi: string) => setModalUtbetaling({...modalUtbetaling, rammevedtaksreferanse: verdi}))}
                            {getTextFieldGrid("Beløp", modalUtbetaling.belop, (verdi: number) => setModalUtbetaling({...modalUtbetaling, belop: +verdi}), "number")}
                            {getTextFieldGrid("Beskrivelse", modalUtbetaling.beskrivelse, (verdi: string) => setModalUtbetaling({...modalUtbetaling, beskrivelse: verdi}))}
                            {getKeyboardDatePickerGrid("Forfallsdato", modalUtbetaling.forfallsdato, (verdi: string) => setModalUtbetaling({...modalUtbetaling, forfallsdato: verdi}),
                                forfallsdatoDatePickerIsOpen, setForfallsdatoDatePickerIsOpen)}
                            {getKeyboardDatePickerGrid("Utbetalingsdato", modalUtbetaling.utbetalingsdato, (verdi: string) => setModalUtbetaling({...modalUtbetaling, utbetalingsdato: verdi}),
                                utbetalingsdatoDatePickerIsOpen, setUtbetalingsdatoDatePickerIsOpen)}
                            {getTextFieldGrid("Stønadstype", modalUtbetaling.stonadstype, (verdi: string) => setModalUtbetaling({...modalUtbetaling, stonadstype: verdi}))}
                            {getKeyboardDatePickerGrid("fom", modalUtbetaling.fom, (verdi: string) => setModalUtbetaling({...modalUtbetaling, fom: verdi}),
                                fomDatePickerIsOpen, setFomDatePickerIsOpen)}
                            {getKeyboardDatePickerGrid("tom", modalUtbetaling.tom, (verdi: string) => setModalUtbetaling({...modalUtbetaling, tom: verdi}),
                                tomDatePickerIsOpen, setTomDatePickerIsOpen)}
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
                            {getTextFieldGrid("Mottaker", modalUtbetaling.mottaker, (verdi: string) => setModalUtbetaling({...modalUtbetaling, mottaker: verdi}))}
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
                            {getTextFieldGrid("Utbetalingsmetode", modalUtbetaling.utbetalingsmetode, (verdi: string) => setModalUtbetaling({...modalUtbetaling, utbetalingsmetode: verdi}))}
                        </Grid>
                    </div>
                    <div className={classes.paperboys}>
                        {(aktivUtbetaling == null) &&
                            <Typography className={classes.finalButtons}>
                                <Fab size="small" aria-label="add" className={classes.fab} color="primary" onClick={() => {
                                    setDefaultUtbetaling();
                                }}>
                                    <AddIcon/>
                                </Fab>
                                Fyll ut alle felter
                            </Typography>
                        }
                        <Typography className={classes.finalButtons}>
                            <Fab size="small" aria-label="add" className={classes.fab} color="primary" onClick={() => {
                                if (!visFeilmelding) {
                                    sendUtbetaling();
                                }
                            }}>
                                <AddIcon/>
                            </Fab>
                            {(aktivUtbetaling == null ? "Legg til utbetaling" : "Endre utbetaling")}
                        </Typography>
                    </div>
                </div>
            </Fade>
        </Modal>
    );
};

const mapStateToProps = (state: AppState) => ({
    visNyUtbetalingModal: state.v2.visNyUtbetalingModal,
    v2: state.v2,
    aktivUtbetaling: state.v2.aktivUtbetaling,
    modalSaksreferanse: state.v2.modalSaksreferanse
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
