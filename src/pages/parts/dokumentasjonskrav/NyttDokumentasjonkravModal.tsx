import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, Modal, Theme} from "@material-ui/core";
import {setAktivtDokumentasjonkrav, skjulNyDokumentasjonkravModal} from "../../../redux/v2/v2Actions";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Fade from "@material-ui/core/Fade";
import Backdrop from "@material-ui/core/Backdrop";
import {V2Model} from "../../../redux/v2/v2Types";
import {
    generateFilreferanseId,
    getAllUtbetalingsreferanser,
    getDokumentasjonkravByDokumentasjonkravreferanse,
    getNow,
    getSakTittelOgNrFraUtbetalingsreferanse
} from "../../../utils/utilityFunctions";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Hendelse, {Dokumentasjonkrav, DokumentasjonkravStatus, HendelseType} from "../../../types/hendelseTypes";
import {oHendelser} from "../../../redux/v3/v3Optics";
import {aiuuur, nyttDokumentasjonkrav, oppdaterDokumentasjonkrav} from "../../../redux/v3/v3Actions";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
import Fab from "@material-ui/core/Fab";
import AddIcon from '@material-ui/icons/Add';
import {FsSoknad} from "../../../redux/v3/v3FsTypes";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Input from '@material-ui/core/Input';
import Chip from '@material-ui/core/Chip';
import useTheme from "@material-ui/core/styles/useTheme";

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
        finalButtons: {
            marginLeft: theme.spacing(6),
            marginRight: theme.spacing(6),
        },
        formControl: {
            marginLeft: theme.spacing(2),
            marginRight: theme.spacing(2),
            '@media (min-width: 860px)': {
                minWidth: 200,
            },
            '@media (max-width: 859px)': {
                minWidth: '50%',
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
    visNyDokumentasjonkravModal: boolean;
    v2: V2Model;
    aktivtDokumentasjonkrav: string | undefined | null;
}

type Props = DispatchProps & OwnProps & StoreProps;

const initialDokumentasjonkrav: Dokumentasjonkrav = {
    type: HendelseType.Dokumentasjonkrav,
    hendelsestidspunkt: '',
    dokumentasjonkravreferanse: generateFilreferanseId(),
    utbetalingsreferanse: null,
    beskrivelse: null,
    status: null,
};

const defaultDokumentasjonkrav: Dokumentasjonkrav = {
    type: HendelseType.Dokumentasjonkrav,
    hendelsestidspunkt: '',
    dokumentasjonkravreferanse: generateFilreferanseId(),
    utbetalingsreferanse: [],
    beskrivelse: 'Du må kjøpe flere kort til MTG',
    status: DokumentasjonkravStatus.IKKE_OPPFYLT,
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const NyttDokumentasjonkravModal: React.FC<Props> = (props: Props) => {
    const [modalDokumentasjonkrav, setModalDokumentasjonkrav] = useState<Dokumentasjonkrav>(initialDokumentasjonkrav);
    const [visFeilmelding, setVisFeilmelding] = useState(false);
    const [referansefeltDisabled, setReferansefeltDisabled] = useState(false);
    const theme = useTheme();

    const classes = useStyles();
    const {visNyDokumentasjonkravModal, dispatch, v2, soknad, aktivtDokumentasjonkrav} = props;

    function resetStateValues() {
        setModalDokumentasjonkrav({...initialDokumentasjonkrav, dokumentasjonkravreferanse: generateFilreferanseId()});
        setVisFeilmelding(false);
        setReferansefeltDisabled(false);

        dispatch(setAktivtDokumentasjonkrav(null));
    }

    const sendDokumentasjonkrav = () => {
        const nyHendelse: Dokumentasjonkrav = {...modalDokumentasjonkrav};
        nyHendelse.hendelsestidspunkt = getNow();

        const soknadUpdated = oHendelser.modify((a: Hendelse[]) => [...a, nyHendelse])(soknad);

        if (aktivtDokumentasjonkrav == null) {
            dispatch(
                aiuuur(
                    soknad.fiksDigisosId,
                    soknadUpdated.fiksDigisosSokerJson,
                    v2,
                    nyttDokumentasjonkrav(soknad.fiksDigisosId, nyHendelse)
                )
            );
        } else {
            dispatch(
                aiuuur(
                    soknad.fiksDigisosId,
                    soknadUpdated.fiksDigisosSokerJson,
                    v2,
                    oppdaterDokumentasjonkrav(soknad.fiksDigisosId, nyHendelse)
                )
            );
        }

        dispatch(dispatch(skjulNyDokumentasjonkravModal()));

        setTimeout(() => {
            resetStateValues();
        }, 500);
    };

    const setDefaultDokumentasjonkrav = () => {
        setModalDokumentasjonkrav({...defaultDokumentasjonkrav, dokumentasjonkravreferanse: generateFilreferanseId()});

        const alleUtbetalingsreferanser = getAllUtbetalingsreferanser(soknad);
        if (alleUtbetalingsreferanser.length > 0) {
            setModalDokumentasjonkrav({...defaultDokumentasjonkrav, dokumentasjonkravreferanse: generateFilreferanseId(), utbetalingsreferanse: [alleUtbetalingsreferanser[0]]});
        }

        setVisFeilmelding(false);
        setReferansefeltDisabled(false);
    };

    const fyllInnAktivtDokumentasjonkrav = () => {
        if (aktivtDokumentasjonkrav) {
            let dokumentasjonkrav = getDokumentasjonkravByDokumentasjonkravreferanse(soknad.dokumentasjonkrav, aktivtDokumentasjonkrav);
            if (dokumentasjonkrav){
                setModalDokumentasjonkrav(dokumentasjonkrav);

                setTimeout(() => {
                    setReferansefeltDisabled(true);
                }, 10);
            }
        }
    };

    function getTextFieldGrid(label: string, value: any, setValue: (v: any) => any, required: boolean = false) {
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
                InputLabelProps={{
                    shrink: true,
                }}
                margin="normal"
                variant="filled"
                autoComplete="off"
            />
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
            open={visNyDokumentasjonkravModal}
            onRendered={() => fyllInnAktivtDokumentasjonkrav()}
            onClose={() => {
                props.dispatch(skjulNyDokumentasjonkravModal());
                setTimeout(() => {
                    resetStateValues();
                }, 500);
            }}
        >
            <Fade in={visNyDokumentasjonkravModal}>
                <div className={classes.papertowel}>
                    <div className={classes.paperback}>
                        <Grid container spacing={3} justify="center" alignItems="center">
                            {getTextFieldGrid("Dokumentasjonkravreferanse", modalDokumentasjonkrav.dokumentasjonkravreferanse,
                                (verdi: string) => setModalDokumentasjonkrav({...modalDokumentasjonkrav, dokumentasjonkravreferanse: verdi}), true)}
                            <Grid item key={'Utbetalingsreferanse'} xs={6} zeroMinWidth>
                                <FormControl className={classes.formControl2}>
                                    <InputLabel htmlFor="age-simple" shrink={true}>Utbetalingsreferanse</InputLabel>
                                    <Select
                                        multiple
                                        value={modalDokumentasjonkrav.utbetalingsreferanse ? modalDokumentasjonkrav.utbetalingsreferanse : []}
                                        onChange={(event: any) => {
                                            setModalDokumentasjonkrav({...modalDokumentasjonkrav, utbetalingsreferanse: event.target.value as string[]})
                                        }}
                                        input={<Input id="select-multiple-chip" />}
                                        renderValue={selected => (
                                            <div className={classes.chips}>
                                                {(selected as string[]).map(value => (
                                                    <Chip key={value} label={value} className={classes.chip} />
                                                ))}
                                            </div>
                                        )}
                                        MenuProps={MenuProps}
                                    >
                                        {getAllUtbetalingsreferanser(soknad).map(referanse => (
                                            <MenuItem
                                                key={referanse} value={referanse}
                                                style={getStyles(referanse, modalDokumentasjonkrav.utbetalingsreferanse ? modalDokumentasjonkrav.utbetalingsreferanse : [], theme)}>
                                                {referanse + ' ' + getSakTittelOgNrFraUtbetalingsreferanse(soknad, referanse)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {getTextFieldGrid("Beskrivelse", modalDokumentasjonkrav.beskrivelse, (verdi: string) => setModalDokumentasjonkrav({...modalDokumentasjonkrav, beskrivelse: verdi}))}

                            <Grid item key={'Status'} xs={6} zeroMinWidth>
                                <FormControl className={classes.formControl}>
                                    <InputLabel htmlFor="age-simple" shrink={true}>Status</InputLabel>
                                    <Select
                                        value={modalDokumentasjonkrav.status ? modalDokumentasjonkrav.status : ''}
                                        onChange={(evt) => setModalDokumentasjonkrav({...modalDokumentasjonkrav, status: evt.target.value as DokumentasjonkravStatus})}
                                        inputProps={{
                                            name: 'setStatus',
                                            id: 'status',
                                        }}
                                    >
                                        <MenuItem value={DokumentasjonkravStatus.OPPFYLT}>Oppfylt</MenuItem>
                                        <MenuItem value={DokumentasjonkravStatus.IKKE_OPPFYLT}>Ikke oppfylt</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </div>
                    <div className={classes.paperboys}>
                        {(aktivtDokumentasjonkrav == null) &&
                        <Typography className={classes.finalButtons}>
                            <Fab size="small" aria-label="add" className={classes.fab} color="primary" onClick={() => {
                                setDefaultDokumentasjonkrav();
                            }}>
                                <AddIcon/>
                            </Fab>
                            Fyll ut alle felter
                        </Typography>
                        }
                        <Typography className={classes.finalButtons}>
                            <Fab size="small" aria-label="add" className={classes.fab} color="primary" onClick={() => {
                                if (!visFeilmelding) {
                                    sendDokumentasjonkrav();
                                }
                            }}>
                                <AddIcon/>
                            </Fab>
                            {(aktivtDokumentasjonkrav == null ? "Legg til dokumentasjonkrav" : "Endre dokumentasjonkrav")}
                        </Typography>
                    </div>
                </div>
            </Fade>
        </Modal>
    );
};

const mapStateToProps = (state: AppState) => ({
    visNyDokumentasjonkravModal: state.v2.visNyDokumentasjonkravModal,
    v2: state.v2,
    aktivtDokumentasjonkrav: state.v2.aktivtDokumentasjonkrav
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NyttDokumentasjonkravModal);
