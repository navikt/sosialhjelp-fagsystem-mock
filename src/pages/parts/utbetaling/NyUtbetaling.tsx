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
    generateFilreferanseId,
    getFsSaksStatusByIdx,
    getNow,
    getUtbetalingByUtbetalingsreferanse
} from "../../../utils/utilityFunctions";
import {V3State} from "../../../redux/v3/v3Types";
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
            alignItems: 'center',
            justifyContent: 'center',
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
            minWidth: 250,
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
    v3: V3State;
    aktivSakIndex: number | undefined;
    aktivUtbetaling: string | undefined | null;
}

type Props = DispatchProps & OwnProps & StoreProps;


const NyUtbetalingModal: React.FC<Props> = (props: Props) => {
    const [utbetalingsreferanse, setUtbetalingsreferanse] = useState(generateFilreferanseId());
    const [rammevedtaksreferanse, setRammevedtaksreferanse] = useState<string|null>(null);
    const [status, setStatus] = useState<UtbetalingStatus|null>(null);
    const [belop, setBelop] = useState<number|null>(null);
    const [beskrivelse, setBeskrivelse] = useState<string|null>(null);
    const [forfallsdato, setForfallsdato] = useState<Date|null>(null);
    const [stonadstype, setStonadstype] = useState<string|null>(null);
    const [utbetalingsdato, setUtbetalingsdato] = useState<Date|null>(null);
    const [fom, setFom] = useState<Date|null>(null);
    const [tom, setTom] = useState<Date|null>(null);
    const [annenMottaker, setAnnenMottaker] = useState<boolean|null>(null);
    const [annenMottakerTrueVariant, setAnnenMottakerTrueVariant] = useState<'text'|'outlined'|'contained'|undefined>('text');
    const [annenMottakerFalseVariant, setAnnenMottakerFalseVariant] = useState<'text'|'outlined'|'contained'|undefined>('text');
    const [mottaker, setMottaker] = useState<string|null>(null);
    const [kontonummer, setKontonummer] = useState<string|null>(null);
    const [kontonummerLabelPlaceholder, setKontonummerLabelPlaceholder] = useState("Kontonummer (Ikke satt)");
    const [utbetalingsmetode, setUtbetalingsmetode] = useState<string|null>(null);
    const [forfallsdatoDatePickerIsOpen, setForfallsdatoDatePickerIsOpen] = useState(false);
    const [utbetalingsdatoDatePickerIsOpen, setUtbetalingsdatoDatePickerIsOpen] = useState(false);
    const [fomDatePickerIsOpen, setFomDatePickerIsOpen] = useState(false);
    const [tomDatePickerIsOpen, setTomDatePickerIsOpen] = useState(false);
    const [visFeilmelding, setVisFeilmelding] = useState(false);


    const classes = useStyles();
    const {visNyUtbetalingModal, dispatch, v2, v3, soknad, aktivSakIndex, aktivUtbetaling} = props;

    const getDateStringOrNull = (date: Date|null) => {
        if (date == null) {
            return null;
        } else {
            return date.toISOString().substring(0, date.toISOString().search('T'));
        }
    };

    function resetStateValues() {
        setUtbetalingsreferanse(generateFilreferanseId());
        setRammevedtaksreferanse(null);
        setStatus(null);
        setBelop(null);
        setBeskrivelse(null);
        setForfallsdato(null);
        setStonadstype(null);
        setUtbetalingsdato(null);
        setFom(null);
        setTom(null);
        setAnnenMottaker(null);
        setAnnenMottakerTrueVariant('text');
        setAnnenMottakerFalseVariant('text');
        setMottaker(null);
        setKontonummer(null);
        setKontonummerLabelPlaceholder("Kontonummer (Ikke satt)");
        setUtbetalingsmetode(null);
        setForfallsdatoDatePickerIsOpen(false);
        setUtbetalingsdatoDatePickerIsOpen(false);
        setFomDatePickerIsOpen(false);
        setTomDatePickerIsOpen(false);
        setVisFeilmelding(false);
        dispatch(setAktivUtbetaling(null));
    }

    const sendUtbetaling = () => {
        const sak = getFsSaksStatusByIdx(soknad.saker, aktivSakIndex);
        const nyHendelse: Utbetaling = {
            type: HendelseType.Utbetaling,
            hendelsestidspunkt: getNow(),
            utbetalingsreferanse: utbetalingsreferanse,
            saksreferanse: sak.referanse,
            rammevedtaksreferanse: rammevedtaksreferanse,
            status: status,
            belop: belop,
            beskrivelse: beskrivelse,
            forfallsdato: getDateStringOrNull(forfallsdato),
            stonadstype: stonadstype,
            utbetalingsdato: getDateStringOrNull(utbetalingsdato),
            fom: getDateStringOrNull(fom),
            tom: getDateStringOrNull(tom),
            annenMottaker: annenMottaker,
            mottaker: mottaker,
            kontonummer: kontonummer && kontonummer.length == 11 ? kontonummer : null,
            utbetalingsmetode: utbetalingsmetode,
        };

        const soknadUpdated = oHendelser.modify((a: Hendelse[]) => [...a, nyHendelse])(soknad);

        if (aktivUtbetaling == null) {
            dispatch(
                aiuuur(
                    soknad.fiksDigisosId,
                    soknadUpdated.fiksDigisosSokerJson,
                    v2,
                    nyUtbetaling(soknad.fiksDigisosId, sak.referanse, nyHendelse)
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

        resetStateValues();

        dispatch(dispatch(skjulNyUtbetalingModal()));
    };

    const setDefaultUtbetaling = () => {
        let defaultForfallsdato = new Date();
        defaultForfallsdato.setDate(new Date().getDate() + 7); // En uke fram i tid
        defaultForfallsdato.setHours(12);
        let defaultUtbetalingsdato = new Date();
        defaultUtbetalingsdato.setDate(new Date().getDate() + 7); // En uke fram i tid
        defaultUtbetalingsdato.setHours(12);
        let defaultFomDato = new Date();
        defaultFomDato.setDate(new Date().getDate() - 7); // En uke tilbake i tid
        defaultFomDato.setHours(12);
        let defaultTomDato = new Date();
        defaultTomDato.setDate(new Date().getDate() + 14); // To uker fram i tid
        defaultTomDato.setHours(12);

        setUtbetalingsreferanse(generateFilreferanseId());
        setRammevedtaksreferanse(generateFilreferanseId());
        setStatus(UtbetalingStatus.PLANLAGT_UTBETALING);
        setBelop(1337);
        setBeskrivelse("Midler til å kjøpe utvidelsespakker til Starcraft");
        setForfallsdato(defaultForfallsdato);
        setStonadstype("Mana potion");
        setUtbetalingsdato(defaultUtbetalingsdato);
        setFom(defaultFomDato);
        setTom(defaultTomDato);
        setAnnenMottaker(false);
        setAnnenMottakerTrueVariant('text');
        setAnnenMottakerFalseVariant('contained');
        setMottaker("Jim Raynor");
        setKontonummer("12345678903");
        setKontonummerLabelPlaceholder("Kontonummer");
        setUtbetalingsmetode("Buttcoin");
        setForfallsdatoDatePickerIsOpen(false);
        setUtbetalingsdatoDatePickerIsOpen(false);
        setFomDatePickerIsOpen(false);
        setTomDatePickerIsOpen(false);
        setVisFeilmelding(false);
    };

    function getDatoFromAktivBetaling(dato: string|null) {
        let gammelForfallsdato: Date | null = null;
        if (dato == null) {
            gammelForfallsdato = null;
        } else {
            gammelForfallsdato = new Date(dato);
            gammelForfallsdato.setHours(12);
        }
        return gammelForfallsdato;
    }

    const fyllInnAktivUtbetaling = () => {
        if (aktivUtbetaling) {
            console.log(aktivSakIndex);
            const sak = getFsSaksStatusByIdx(soknad.saker, aktivSakIndex);
            let utbetaling = getUtbetalingByUtbetalingsreferanse(sak.utbetalinger, aktivUtbetaling);
            if (utbetaling){
                setUtbetalingsreferanse(utbetaling.utbetalingsreferanse);
                setRammevedtaksreferanse(utbetaling.rammevedtaksreferanse);
                setStatus(utbetaling.status);
                setBelop(utbetaling.belop);
                setBeskrivelse(utbetaling.beskrivelse);
                setForfallsdato(getDatoFromAktivBetaling(utbetaling.forfallsdato));
                setStonadstype(utbetaling.stonadstype);
                setUtbetalingsdato(getDatoFromAktivBetaling(utbetaling.utbetalingsdato));
                setFom(getDatoFromAktivBetaling(utbetaling.fom));
                setTom(getDatoFromAktivBetaling(utbetaling.tom));
                setAnnenMottaker(utbetaling.annenMottaker);
                setAnnenMottakerTrueVariant(utbetaling.annenMottaker == null || !utbetaling.annenMottaker ? 'text' : 'contained');
                setAnnenMottakerFalseVariant(utbetaling.annenMottaker == null || utbetaling.annenMottaker ? 'text' : 'contained');
                setMottaker(utbetaling.mottaker);
                setKontonummer(utbetaling.kontonummer);
                setKontonummerLabelPlaceholder(utbetaling.kontonummer == null ? "Kontonummer (Ikke satt)" : "Kontonummer");
                setUtbetalingsmetode(utbetaling.utbetalingsmetode);
            }
        }
    };

    // Ser mer fancy ut, men vanskeligere å forstå og man må lage shrinksettere til alle teksttfelter
    function getTextFieldGridWithDynamicShrink(label: string, value: any, setter: any, shrink: boolean, shrinkSetter: any) {
        return <Grid item key={label} xs={6} zeroMinWidth>
            <TextField
                id="outlined-name"
                label={label}
                className={classes.textField}
                value={value}
                onChange={(evt) => {
                    setter(evt.target.value);
                    shrinkSetter(true);
                }}
                onFocus={() => shrinkSetter(true)}
                onBlur={() => {
                    if (value == null || value.length < 1) {
                        shrinkSetter(false);
                    }
                }}
                InputLabelProps={{
                    shrink: shrink,
                }}
                margin="normal"
                variant="filled"
                autoComplete="off"
            />
        </Grid>;
    }

    function getTextFieldGrid(label: string, value: any, setValue: any, inputType: string, required: boolean) {
        return <Grid item key={'Grid: ' + label} xs={6} zeroMinWidth>
            <TextField
                id="outlined-name"
                label={label}
                className={classes.textField}
                value={value ? value : ''}
                required={required}
                error={required && visFeilmelding}
                onChange={(evt) => {
                    setValue(evt.target.value);
                    if (required) {
                        if (evt.target.value.length == 0) {
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

    function getKeyboardDatePickerGrid(label: string, value: any, setValue: any, isOpen: boolean, setIsOpen: any) {
        return <Grid item key={"grid: " + label} xs={6} zeroMinWidth>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                    className={classes.otherField}
                    disableToolbar
                    variant="inline"
                    format="MM/dd/yyyy"
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
                resetStateValues();
                props.dispatch(skjulNyUtbetalingModal());
            }}
        >
            <Fade in={visNyUtbetalingModal}>
                <div className={classes.papertowel}>
                    <div className={classes.paperback}>
                        <Grid container spacing={3} justify="center" alignItems="center">
                            {(aktivUtbetaling == null) ?
                                getTextFieldGrid("Utbetalingsreferanse", utbetalingsreferanse, setUtbetalingsreferanse, "text", true)
                                : (<Grid item key={'Grid: Utbetalingsreferanse'} xs={6} zeroMinWidth>
                                        <TextField
                                        disabled
                                        id="Utbetalingsreferanse-disabled"
                                        label="Utbetalingsreferanse"
                                        className={classes.textField}
                                        required={true}
                                        defaultValue={utbetalingsreferanse}
                                        margin="normal"
                                        variant="filled"
                                    />
                                </Grid>)}
                            {getTextFieldGrid("Rammevedtaksreferanse", rammevedtaksreferanse, setRammevedtaksreferanse, "text", false)}
                            <Grid item key={'Status'} xs={6} zeroMinWidth>
                                <FormControl className={classes.formControl}>
                                    <InputLabel htmlFor="age-simple" shrink={true}>Status</InputLabel>
                                    <Select
                                        value={status ? status : ''}
                                        onChange={(evt) => setStatus(evt.target.value as UtbetalingStatus)}
                                        inputProps={{
                                            name: 'setStatus',
                                            id: 'status',
                                        }}
                                    >
                                        <MenuItem value={UtbetalingStatus.PLANLAGT_UTBETALING}>Planlagt
                                            Utbetaling</MenuItem>
                                        <MenuItem value={UtbetalingStatus.UTBETALT}>Utbetalt</MenuItem>
                                        <MenuItem value={UtbetalingStatus.STOPPET}>Stoppet</MenuItem>
                                        <MenuItem value={UtbetalingStatus.ANNULLERT}>Annulert</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            {getTextFieldGrid("Beløp", belop, setBelop, "number", false)}
                            {getTextFieldGrid("Beskrivelse", beskrivelse, setBeskrivelse, "text", false)}
                            {getKeyboardDatePickerGrid("Forfallsdato", forfallsdato, setForfallsdato, forfallsdatoDatePickerIsOpen, setForfallsdatoDatePickerIsOpen)}
                            {getTextFieldGrid("Stønadstype", stonadstype, setStonadstype, "text", false)}
                            {getKeyboardDatePickerGrid("Utbetalingsdato", utbetalingsdato, setUtbetalingsdato, utbetalingsdatoDatePickerIsOpen, setUtbetalingsdatoDatePickerIsOpen)}
                            {getKeyboardDatePickerGrid("fom", fom, setFom, fomDatePickerIsOpen, setFomDatePickerIsOpen)}
                            {getKeyboardDatePickerGrid("tom", tom, setTom, tomDatePickerIsOpen, setTomDatePickerIsOpen)}
                            <Grid item key={'Annen mottaker'} xs={6} zeroMinWidth>
                                <Typography variant={"subtitle1"} className={classes.otherField}>
                                    {"Annen mottaker:  "}
                                    <ButtonGroup
                                        color="primary"
                                        aria-label="full-width contained primary button group"
                                    >
                                        <Button variant={annenMottakerTrueVariant} onClick={() => {
                                            setAnnenMottaker(true);
                                            setAnnenMottakerTrueVariant('contained');
                                            setAnnenMottakerFalseVariant('text');
                                        }}>True</Button>
                                        <Button variant={annenMottakerFalseVariant} onClick={() => {
                                            setAnnenMottaker(false);
                                            setAnnenMottakerTrueVariant('text');
                                            setAnnenMottakerFalseVariant('contained');
                                        }}>False</Button>
                                    </ButtonGroup>
                                </Typography>
                            </Grid>
                            {getTextFieldGrid("Mottaker", mottaker, setMottaker, "text", false)}
                            <Grid item key={'Kontonummer'} xs={6} zeroMinWidth>
                                <TextField
                                    id="filled-number"
                                    label={kontonummerLabelPlaceholder}
                                    onChange={(evt) => {
                                        setKontonummer(evt.target.value);
                                        if (evt.target.value.length == 11) {
                                            setKontonummerLabelPlaceholder("Kontonummer");
                                        } else {
                                            setKontonummerLabelPlaceholder("Kontonummer (Ikke satt)");
                                        }
                                    }}
                                    type="number"
                                    className={classes.textField}
                                    value={kontonummer ? kontonummer : ''}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    autoComplete="off"
                                    margin="normal"
                                    variant="filled"
                                />
                            </Grid>
                            {getTextFieldGrid("Utbetalingsmetode", utbetalingsmetode, setUtbetalingsmetode, "text", false)}
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
    v3: state.v3,
    aktivSakIndex: state.v2.aktivSakIndex,
    aktivUtbetaling: state.v2.aktivUtbetaling
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
