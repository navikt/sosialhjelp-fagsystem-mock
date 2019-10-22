import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, Modal, Theme} from "@material-ui/core";
import {setAktivtRammevedtak, skjulNyRammevedtakModal} from "../../../redux/v2/v2Actions";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Fade from "@material-ui/core/Fade";
import Backdrop from "@material-ui/core/Backdrop";
import {V2Model} from "../../../redux/v2/v2Types";
import {
    formatDateString,
    generateFilreferanseId,
    getNow,
    getRammevedtakByRammevedtaksreferanse, getSakTittelFraSaksreferanse,
    getShortDateISOString
} from "../../../utils/utilityFunctions";
import {V3State} from "../../../redux/v3/v3Types";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Hendelse, {HendelseType, Rammevedtak} from "../../../types/hendelseTypes";
import {oHendelser} from "../../../redux/v3/v3Optics";
import {aiuuur, nyttRammevedtak, oppdaterRammevedtak} from "../../../redux/v3/v3Actions";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
import Fab from "@material-ui/core/Fab";
import AddIcon from '@material-ui/icons/Add';
import {FsSoknad} from "../../../redux/v3/v3FsTypes";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import {KeyboardDatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        modal: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
        chips: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        chip: {
            margin: 2,
        },
    }),
);

function getStyles(name: string, personName: string[], theme: Theme) {
    return {
        fontWeight:
            personName.indexOf(name) === -1
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium,
    };
}

interface OwnProps {
    soknad: FsSoknad
}

interface StoreProps {
    visNyRammevedtakModal: boolean;
    v2: V2Model;
    v3: V3State;
    aktivtRammevedtak: string | undefined | null;
}

type Props = DispatchProps & OwnProps & StoreProps;

const initialRammevedtak: Rammevedtak = {
    type: HendelseType.Rammevedtak,
    hendelsestidspunkt: '',
    rammevedtaksreferanse: generateFilreferanseId(),
    saksreferanse: null,
    beskrivelse: null,
    belop: null,
    fom: null,
    tom: null
};

let date = new Date();
date.setDate(new Date().getDate() - 7); // En uke tilbake i tid
date.setHours(12);
const defaultFomDato = getShortDateISOString(date);
date.setDate(new Date().getDate() + 14); // To uker fram i tid
date.setHours(12);
const defaultTomDato = getShortDateISOString(date);

const defaultRammevedtak: Rammevedtak = {
    type: HendelseType.Rammevedtak,
    hendelsestidspunkt: '',
    rammevedtaksreferanse: generateFilreferanseId(),
    saksreferanse: null,
    beskrivelse: 'Spillutgifter',
    belop: 1337,
    fom: defaultFomDato,
    tom: defaultTomDato
};

const NyttRammevedtakModal: React.FC<Props> = (props: Props) => {
    const [modalRammevedtak, setModalRammevedtak] = useState<Rammevedtak>(initialRammevedtak);
    const [fomDatePickerIsOpen, setFomDatePickerIsOpen] = useState(false);
    const [tomDatePickerIsOpen, setTomDatePickerIsOpen] = useState(false);
    const [visFeilmelding, setVisFeilmelding] = useState(false);

    const classes = useStyles();
    const {visNyRammevedtakModal, dispatch, v2, v3, soknad, aktivtRammevedtak} = props;

    function resetStateValues() {
        setModalRammevedtak({...initialRammevedtak});

        setFomDatePickerIsOpen(false);
        setTomDatePickerIsOpen(false);
        setVisFeilmelding(false);

        dispatch(setAktivtRammevedtak(null));
    }

    const sendRammevedtak = () => {
        const nyHendelse: Rammevedtak = {...modalRammevedtak};
        nyHendelse.hendelsestidspunkt = getNow();
        nyHendelse.fom = formatDateString(nyHendelse.fom);
        nyHendelse.tom = formatDateString(nyHendelse.tom);

        const soknadUpdated = oHendelser.modify((a: Hendelse[]) => [...a, nyHendelse])(soknad);

        if (aktivtRammevedtak == null) {
            dispatch(
                aiuuur(
                    soknad.fiksDigisosId,
                    soknadUpdated.fiksDigisosSokerJson,
                    v2,
                    nyttRammevedtak(soknad.fiksDigisosId, nyHendelse)
                )
            );
        } else {
            dispatch(
                aiuuur(
                    soknad.fiksDigisosId,
                    soknadUpdated.fiksDigisosSokerJson,
                    v2,
                    oppdaterRammevedtak(soknad.fiksDigisosId, nyHendelse)
                )
            );
        }

        resetStateValues();

        dispatch(dispatch(skjulNyRammevedtakModal()));
    };

    const setDefaultRammevedtak = () => {
        setModalRammevedtak({...defaultRammevedtak, rammevedtaksreferanse: generateFilreferanseId()});

        if (soknad.saker.length > 0) {
            setModalRammevedtak({...defaultRammevedtak, saksreferanse: soknad.saker[0].referanse});
        }

        setFomDatePickerIsOpen(false);
        setTomDatePickerIsOpen(false);
        setVisFeilmelding(false);
    };

    const fyllInnAktivtRammevedtak = () => {
        console.log(aktivtRammevedtak);
        if (aktivtRammevedtak) {
            let rammevedtak = getRammevedtakByRammevedtaksreferanse(soknad.rammevedtak, aktivtRammevedtak);
            if (rammevedtak){
                setModalRammevedtak(rammevedtak);
            }
        }
    };

    function getTextFieldGrid(label: string, value: any, setValue: (v: any) => any, required: boolean = false) {
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
            open={visNyRammevedtakModal}
            onRendered={() => fyllInnAktivtRammevedtak()}
            onClose={() => {
                resetStateValues();
                props.dispatch(skjulNyRammevedtakModal());
            }}
        >
            <Fade in={visNyRammevedtakModal}>
                <div className={classes.papertowel}>
                    <div className={classes.paperback}>
                        <Grid container spacing={3} justify="center" alignItems="center">
                            {(aktivtRammevedtak == null) ?
                                getTextFieldGrid("Rammevedtakreferanse", modalRammevedtak.rammevedtaksreferanse, (verdi: string) => {
                                    setModalRammevedtak({...modalRammevedtak, rammevedtaksreferanse: verdi})
                                }, true)
                                : (<Grid item key={'Grid: Rammevedtaksreferanse'} xs={6} zeroMinWidth>
                                    <TextField
                                        disabled
                                        id="Rammevedtaksreferanse-disabled"
                                        label="Rammevedtakreferanse"
                                        className={classes.textField}
                                        required={true}
                                        defaultValue={modalRammevedtak.rammevedtaksreferanse}
                                        margin="normal"
                                        variant="filled"
                                    />
                                </Grid>)}
                            <Grid item key={'Saksreferanse'} xs={6} zeroMinWidth>
                                <FormControl className={classes.formControl2}>
                                    <InputLabel htmlFor="age-simple" shrink={true}>Saksreferanse</InputLabel>
                                    <Select
                                        value={modalRammevedtak.saksreferanse ? modalRammevedtak.saksreferanse : ''}
                                        onChange={(evt) => setModalRammevedtak({...modalRammevedtak, saksreferanse: evt.target.value as string})}
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

                            {getTextFieldGrid("Beskrivelse", modalRammevedtak.beskrivelse, (verdi: string) => setModalRammevedtak({...modalRammevedtak, beskrivelse: verdi}))}

                            {getTextFieldGrid("Beløp", modalRammevedtak.belop, (verdi: number) => setModalRammevedtak({...modalRammevedtak, belop: verdi}))}

                            {getKeyboardDatePickerGrid("fom", modalRammevedtak.fom, (verdi: string) => setModalRammevedtak({...modalRammevedtak, fom: verdi}),
                                fomDatePickerIsOpen, setFomDatePickerIsOpen)}
                            {getKeyboardDatePickerGrid("tom", modalRammevedtak.tom, (verdi: string) => setModalRammevedtak({...modalRammevedtak, tom: verdi}),
                                tomDatePickerIsOpen, setTomDatePickerIsOpen)}
                        </Grid>
                    </div>
                    <div className={classes.paperboys}>
                        {(aktivtRammevedtak == null) &&
                        <Typography className={classes.finalButtons}>
                            <Fab size="small" aria-label="add" className={classes.fab} color="primary" onClick={() => {
                                setDefaultRammevedtak();
                            }}>
                                <AddIcon/>
                            </Fab>
                            Fyll ut alle felter
                        </Typography>
                        }
                        <Typography className={classes.finalButtons}>
                            <Fab size="small" aria-label="add" className={classes.fab} color="primary" onClick={() => {
                                if (!visFeilmelding) {
                                    sendRammevedtak();
                                }
                            }}>
                                <AddIcon/>
                            </Fab>
                            {(aktivtRammevedtak == null ? "Legg til rammevedtak" : "Endre rammevedtak")}
                        </Typography>
                    </div>
                </div>
            </Fade>
        </Modal>
    );
};

const mapStateToProps = (state: AppState) => ({
    visNyRammevedtakModal: state.v2.visNyRammevedtakModal,
    v2: state.v2,
    v3: state.v3,
    aktivtRammevedtak: state.v2.aktivtRammevedtak
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NyttRammevedtakModal);
