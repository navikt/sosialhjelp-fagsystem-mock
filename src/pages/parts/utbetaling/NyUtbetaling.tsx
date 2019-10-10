import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, Modal, Theme} from "@material-ui/core";
import {skjulNyUtbetalingModal} from "../../../redux/v2/v2Actions";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Fade from "@material-ui/core/Fade";
import Backdrop from "@material-ui/core/Backdrop";
import {V2Model} from "../../../redux/v2/v2Types";
import {generateFilreferanseId, getNow} from "../../../utils/utilityFunctions";
import {V3State} from "../../../redux/v3/v3Types";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Hendelse, {HendelseType, SaksStatus, Utbetaling, UtbetalingStatus} from "../../../types/hendelseTypes";
import {oHendelser} from "../../../redux/v3/v3Optics";
import {aiuuur, oppdaterUtbetaling} from "../../../redux/v3/v3Actions";
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
    soknad: FsSoknad,
    sak: SaksStatus
}

interface StoreProps {
    visNyUtbetalingModal: boolean;
    v2: V2Model;
    v3: V3State;
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
    const [utbetalingDatePickerIsOpen, setUtbetalingDatePickerIsOpen] = useState(false);
    const [fomDatePickerIsOpen, setFomDatePickerIsOpen] = useState(false);
    const [tomDatePickerIsOpen, setTomDatePickerIsOpen] = useState(false);


    const classes = useStyles();
    const {visNyUtbetalingModal, dispatch, v2, v3, soknad, sak} = props;

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
        setUtbetalingDatePickerIsOpen(false);
        setFomDatePickerIsOpen(false);
        setTomDatePickerIsOpen(false);
    }

    const sendUtbetaling = () => {
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
            kontonummer: kontonummer,
            utbetalingsmetode: utbetalingsmetode,
        };

        const soknadUpdated = oHendelser.modify((a: Hendelse[]) => [...a, nyHendelse])(soknad);

        dispatch(
            aiuuur(
                soknad.fiksDigisosId,
                soknadUpdated.fiksDigisosSokerJson,
                v2,
                oppdaterUtbetaling(soknad.fiksDigisosId, nyHendelse)
            )
        );

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
        defaultFomDato.setDate(new Date().getDate() - 7); // En uke fram i tid
        defaultFomDato.setHours(12);
        let defaultTomDato = new Date();
        defaultTomDato.setDate(new Date().getDate() + 14); // En uke fram i tid
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
        setAnnenMottakerFalseVariant('text');
        setMottaker("Jim Raynor");
        setKontonummer("12345678903");
        setKontonummerLabelPlaceholder("Kontonummer");
        setUtbetalingsmetode("Buttcoin");
        setForfallsdatoDatePickerIsOpen(false);
        setUtbetalingDatePickerIsOpen(false);
        setFomDatePickerIsOpen(false);
        setTomDatePickerIsOpen(false);
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
            onClose={() => {
                resetStateValues();
                props.dispatch(skjulNyUtbetalingModal());
            }}
        >
            <Fade in={visNyUtbetalingModal}>
                <div className={classes.papertowel}>
                    <div className={classes.paperback}>
                    <Grid container spacing={3} justify="center" alignItems="center">
                        <Grid item key={'Utbetalingsreferanse'} xs={6} zeroMinWidth>
                            <TextField
                                id="outlined-name"
                                label="Utbetalingsreferanse"
                                className={classes.textField}
                                value={utbetalingsreferanse}
                                onChange={(evt) => setUtbetalingsreferanse(evt.target.value)}
                                margin="normal"
                                variant="filled"
                                autoComplete="off"
                            />
                        </Grid>
                        <Grid item key={'Rammevedtaksreferanse'} xs={6} zeroMinWidth>
                            <TextField
                                id="outlined-name"
                                label="Rammevedtaksreferanse"
                                className={classes.textField}
                                value={rammevedtaksreferanse}
                                onChange={(evt) => setRammevedtaksreferanse(evt.target.value)}
                                margin="normal"
                                variant="filled"
                                autoComplete="off"
                            />
                        </Grid>
                        <Grid item key={'Status'} xs={6} zeroMinWidth>
                            <FormControl className={classes.formControl}>
                                <InputLabel htmlFor="age-simple">Status</InputLabel>
                                <Select
                                    value={status}
                                    onChange={(evt) => setStatus(evt.target.value as UtbetalingStatus)}
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
                        <Grid item key={'Belop'} xs={6} zeroMinWidth>
                            <TextField
                                id="filled-number"
                                label="Beløp"
                                value={belop}
                                onChange={(evt) => setBelop(Number(evt.target.value))}
                                type="number"
                                className={classes.textField}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                autoComplete="off"
                                margin="normal"
                                variant="filled"
                            />
                        </Grid>
                        <Grid item key={'Beskrivelse'} xs={6} zeroMinWidth>
                            <TextField
                                id="outlined-name"
                                label="Beskrivelse"
                                className={classes.textField}
                                value={beskrivelse}
                                onChange={(evt) => setBeskrivelse(evt.target.value)}
                                margin="normal"
                                variant="filled"
                                autoComplete="off"
                            />
                        </Grid>
                        <Grid item key={'Forfallsdato'} xs={6} zeroMinWidth>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                    className={classes.otherField}
                                    disableToolbar
                                    variant="inline"
                                    format="MM/dd/yyyy"
                                    margin="normal"
                                    id="Forfallsdato"
                                    label="Forfallsdato"
                                    open={forfallsdatoDatePickerIsOpen}
                                    onOpen={() => setForfallsdatoDatePickerIsOpen(true)}
                                    onClose={() => setForfallsdatoDatePickerIsOpen(false)}
                                    value={utbetalingsdato}
                                    onChange={(date: any) => {
                                        setForfallsdato(date);
                                        setForfallsdatoDatePickerIsOpen(false);
                                    }}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                    }}
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item key={'Stonadstype'} xs={6} zeroMinWidth>
                            <TextField
                                id="outlined-name"
                                label="Stønadstype"
                                className={classes.textField}
                                value={stonadstype}
                                onChange={(evt) => setStonadstype(evt.target.value)}
                                margin="normal"
                                variant="filled"
                                autoComplete="off"
                            />
                        </Grid>
                        <Grid item key={'Utbetalingsdato'} xs={6} zeroMinWidth>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                    className={classes.otherField}
                                    disableToolbar
                                    variant="inline"
                                    format="MM/dd/yyyy"
                                    margin="normal"
                                    id="Utbetalingsdato"
                                    label="Utbetalingsdato"
                                    open={utbetalingDatePickerIsOpen}
                                    onOpen={() => setUtbetalingDatePickerIsOpen(true)}
                                    onClose={() => setUtbetalingDatePickerIsOpen(false)}
                                    value={utbetalingsdato}
                                    onChange={(date: any) => {
                                        setUtbetalingsdato(date);
                                        setUtbetalingDatePickerIsOpen(false);
                                    }}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                    }}
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item key={'fom'} xs={6} zeroMinWidth>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                    className={classes.otherField}
                                    disableToolbar
                                    variant="inline"
                                    format="MM/dd/yyyy"
                                    margin="normal"
                                    id="fom"
                                    label="fom"
                                    open={fomDatePickerIsOpen}
                                    onOpen={() => setFomDatePickerIsOpen(true)}
                                    onClose={() => setFomDatePickerIsOpen(false)}
                                    value={fom}
                                    onChange={(date: any) => {
                                        setFom(date);
                                        setFomDatePickerIsOpen(false);
                                    }}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                    }}
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item key={'tom'} xs={6} zeroMinWidth>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                    className={classes.otherField}
                                    disableToolbar
                                    variant="inline"
                                    format="MM/dd/yyyy"
                                    margin="normal"
                                    id="tom"
                                    label="tom"
                                    open={tomDatePickerIsOpen}
                                    onOpen={() => setTomDatePickerIsOpen(true)}
                                    onClose={() => setTomDatePickerIsOpen(false)}
                                    value={utbetalingsdato}
                                    onChange={(date: any) => {
                                        setTom(date);
                                        setTomDatePickerIsOpen(false);
                                    }}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                    }}
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item key={'Stonadstype'} xs={6} zeroMinWidth>
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
                        <Grid item key={'Mottaker'} xs={6} zeroMinWidth>
                            <TextField
                                id="outlined-name"
                                label="Mottaker"
                                className={classes.textField}
                                value={mottaker}
                                onChange={(evt) => setMottaker(evt.target.value)}
                                margin="normal"
                                variant="filled"
                                autoComplete="off"
                            />
                        </Grid>
                        <Grid item key={'Kontonummer'} xs={6} zeroMinWidth>
                            <TextField
                                id="filled-number"
                                label={kontonummerLabelPlaceholder}
                                onChange={(evt) => {
                                    if (evt.target.value.length == 11) {
                                        setKontonummer(evt.target.value);
                                        setKontonummerLabelPlaceholder("Kontonummer");
                                    } else {
                                        setKontonummer(null);
                                        setKontonummerLabelPlaceholder("Kontonummer (Ikke satt)");
                                    }
                                }}
                                type="number"
                                className={classes.textField}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                autoComplete="off"
                                margin="normal"
                                variant="filled"
                            />
                        </Grid>
                        <Grid item key={'Utbetalingsmetode'} xs={6} zeroMinWidth>
                            <TextField
                                id="outlined-name"
                                label="Utbetalingsmetode"
                                className={classes.textField}
                                value={utbetalingsmetode}
                                onChange={(evt) => setUtbetalingsmetode(evt.target.value)}
                                margin="normal"
                                variant="filled"
                                autoComplete="off"
                            />
                        </Grid>
                    </Grid>
                    </div>
                    <div className={classes.paperboys}>
                        <Typography className={classes.finalButtons}>
                            <Fab size="small" aria-label="add" className={classes.fab} color="primary" onClick={() => {
                                setDefaultUtbetaling();
                            }}>
                                <AddIcon/>
                            </Fab>
                            Lag en standard utbetaling
                        </Typography>
                        <Typography className={classes.finalButtons}>
                            <Fab size="small" aria-label="add" className={classes.fab} color="primary" onClick={() => {
                                sendUtbetaling();
                            }}>
                                <AddIcon/>
                            </Fab>
                            Send Utbetaling
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
)(NyUtbetalingModal);
