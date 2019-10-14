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

const getShortDateISOString = (date: Date) => date.toISOString().substring(0, date.toISOString().search('T'));

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
    saksreferanse: '',
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
    utbetalingsmetode: "Buttcoin",
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


    const classes = useStyles();
    const {visNyUtbetalingModal, dispatch, v2, v3, soknad, aktivSakIndex, aktivUtbetaling} = props;

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
        dispatch(setAktivUtbetaling(null));
    }

    const sendUtbetaling = () => {
        const sak = getFsSaksStatusByIdx(soknad.saker, aktivSakIndex);
        const nyHendelse: Utbetaling = {...modalUtbetaling};
        nyHendelse.hendelsestidspunkt = getNow();
        nyHendelse.saksreferanse = sak.referanse;
        nyHendelse.kontonummer = modalUtbetaling.kontonummer && modalUtbetaling.kontonummer.length == 11 ? modalUtbetaling.kontonummer : null;

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
        setModalUtbetaling(defaultUtbetaling);

        setAnnenMottakerTrueVariant('text');
        setAnnenMottakerFalseVariant('contained');
        setKontonummerLabelPlaceholder("Kontonummer");
        setForfallsdatoDatePickerIsOpen(false);
        setUtbetalingsdatoDatePickerIsOpen(false);
        setFomDatePickerIsOpen(false);
        setTomDatePickerIsOpen(false);
        setVisFeilmelding(false);
    };

    const fyllInnAktivUtbetaling = () => {
        if (aktivUtbetaling) {
            const sak = getFsSaksStatusByIdx(soknad.saker, aktivSakIndex);
            let utbetaling = getUtbetalingByUtbetalingsreferanse(sak.utbetalinger, aktivUtbetaling);
            if (utbetaling){
                setModalUtbetaling(utbetaling);

                setAnnenMottakerTrueVariant(utbetaling.annenMottaker == null || !utbetaling.annenMottaker ? 'text' : 'contained');
                setAnnenMottakerFalseVariant(utbetaling.annenMottaker == null || utbetaling.annenMottaker ? 'text' : 'contained');
                setKontonummerLabelPlaceholder(utbetaling.kontonummer == null ? "Kontonummer (Ikke satt)" : "Kontonummer");
            }
        }
    };

    function getTextFieldGrid2(label: string, value: any, setValue: (v: any) => any, inputType: string = 'text', required: boolean = false) {
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

    function getKeyboardDatePickerGrid2(label: string, value: any, setValue: (v: string) => any, isOpen: boolean, setIsOpen: any) {
        return <Grid item key={"grid: " + label} xs={6} zeroMinWidth>
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
                        setValue(date.toISOString().substring(0, date.toISOString().search('T')));
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
                                getTextFieldGrid2("Utbetalingsreferanse", modalUtbetaling.utbetalingsreferanse, (verdi: string) => {
                                    setModalUtbetaling({...modalUtbetaling, utbetalingsreferanse: verdi})
                                }, "text", true)
                                : (<Grid item key={'Grid: Utbetalingsreferanse'} xs={6} zeroMinWidth>
                                        <TextField
                                        disabled
                                        id="Utbetalingsreferanse-disabled"
                                        label="Utbetalingsreferanse"
                                        className={classes.textField}
                                        required={true}
                                        defaultValue={modalUtbetaling.utbetalingsreferanse}
                                        margin="normal"
                                        variant="filled"
                                    />
                                </Grid>)}
                            {getTextFieldGrid2("Rammevedtaksreferanse", modalUtbetaling.rammevedtaksreferanse,
                                (verdi: string) => setModalUtbetaling({...modalUtbetaling, rammevedtaksreferanse: verdi}))}
                            <Grid item key={'Status'} xs={6} zeroMinWidth>
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
                                        <MenuItem value={UtbetalingStatus.PLANLAGT_UTBETALING}>Planlagt
                                            Utbetaling</MenuItem>
                                        <MenuItem value={UtbetalingStatus.UTBETALT}>Utbetalt</MenuItem>
                                        <MenuItem value={UtbetalingStatus.STOPPET}>Stoppet</MenuItem>
                                        <MenuItem value={UtbetalingStatus.ANNULLERT}>Annulert</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            {getTextFieldGrid2("Beløp", modalUtbetaling.belop, (verdi: number) => {
                                setModalUtbetaling({...modalUtbetaling, belop: verdi})
                            })}
                            {getTextFieldGrid2("Beskrivelse", modalUtbetaling.beskrivelse, (verdi: string) => setModalUtbetaling({...modalUtbetaling, beskrivelse: verdi}))}
                            {getKeyboardDatePickerGrid2("Forfallsdato", modalUtbetaling.forfallsdato, (verdi: string) => setModalUtbetaling({...modalUtbetaling, forfallsdato: verdi}),
                                forfallsdatoDatePickerIsOpen, setForfallsdatoDatePickerIsOpen)}
                            {getTextFieldGrid2("Stønadstype", modalUtbetaling.stonadstype, (verdi: string) => setModalUtbetaling({...modalUtbetaling, stonadstype: verdi}))}
                            {getKeyboardDatePickerGrid2("Utbetalingsdato", modalUtbetaling.utbetalingsdato, (verdi: string) => setModalUtbetaling({...modalUtbetaling, utbetalingsdato: verdi}),
                                utbetalingsdatoDatePickerIsOpen, setUtbetalingsdatoDatePickerIsOpen)}
                            {getKeyboardDatePickerGrid2("fom", modalUtbetaling.fom, (verdi: string) => setModalUtbetaling({...modalUtbetaling, fom: verdi}),
                                fomDatePickerIsOpen, setFomDatePickerIsOpen)}
                            {getKeyboardDatePickerGrid2("tom", modalUtbetaling.tom, (verdi: string) => setModalUtbetaling({...modalUtbetaling, tom: verdi}),
                                tomDatePickerIsOpen, setTomDatePickerIsOpen)}
                            <Grid item key={'Annen mottaker'} xs={6} zeroMinWidth>
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
                            {getTextFieldGrid2("Mottaker", modalUtbetaling.mottaker, (verdi: string) => setModalUtbetaling({...modalUtbetaling, mottaker: verdi}))}
                            <Grid item key={'Kontonummer'} xs={6} zeroMinWidth>
                                <TextField
                                    id="filled-number"
                                    label={kontonummerLabelPlaceholder}
                                    onChange={(evt) => {
                                        setModalUtbetaling({...modalUtbetaling, kontonummer: evt.target.value});
                                        if (evt.target.value.length == 11) {
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
                            {getTextFieldGrid2("Utbetalingsmetode", modalUtbetaling.utbetalingsmetode, (verdi: string) => setModalUtbetaling({...modalUtbetaling, utbetalingsmetode: verdi}))}
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
