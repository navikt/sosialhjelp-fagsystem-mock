import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, Modal, Theme} from "@material-ui/core";
import {setAktivtVilkar, skjulNyVilkarModal} from "../../../redux/v2/v2Actions";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Fade from "@material-ui/core/Fade";
import Backdrop from "@material-ui/core/Backdrop";
import {V2Model} from "../../../redux/v2/v2Types";
import {generateFilreferanseId, getNow, getVilkarByVilkarreferanse} from "../../../utils/utilityFunctions";
import {V3State} from "../../../redux/v3/v3Types";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Hendelse, {HendelseType, Vilkar, VilkarStatus} from "../../../types/hendelseTypes";
import {oHendelser} from "../../../redux/v3/v3Optics";
import {aiuuur, nyttVilkar, oppdaterVilkar} from "../../../redux/v3/v3Actions";
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

const names = [
    'Oliver Hansen',
    'Van Henry',
    'April Tucker',
    'Ralph Hubbard',
    'Omar Alexander',
    'Carlos Abbott',
    'Miriam Wagner',
    'Bradley Wilkerson',
    'Virginia Andrews',
    'Kelly Snyder',
];


interface OwnProps {
    soknad: FsSoknad
}

interface StoreProps {
    visNyVilkarModal: boolean;
    v2: V2Model;
    v3: V3State;
    aktivtVilkar: string | undefined | null;
}

type Props = DispatchProps & OwnProps & StoreProps;

const initialVilkar: Vilkar = {
    type: HendelseType.Vilkar,
    hendelsestidspunkt: '',
    vilkarreferanse: generateFilreferanseId(),
    utbetalingsreferanse: null,
    beskrivelse: null,
    status: null,
};

const defaultVilkar: Vilkar = {
    type: HendelseType.Vilkar,
    hendelsestidspunkt: '',
    vilkarreferanse: generateFilreferanseId(),
    utbetalingsreferanse: [],
    beskrivelse: 'Du må kjøpe flere kort til MTG',
    status: VilkarStatus.IKKE_OPPFYLT,
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

const NyttVilkarModal: React.FC<Props> = (props: Props) => {
    const [modalVilkar, setModalVilkar] = useState<Vilkar>(initialVilkar);
    const [visFeilmelding, setVisFeilmelding] = useState(false);
    const theme = useTheme();

    const classes = useStyles();
    const {visNyVilkarModal, dispatch, v2, v3, soknad, aktivtVilkar} = props;

    function resetStateValues() {
        setModalVilkar({...initialVilkar, vilkarreferanse: generateFilreferanseId()});
        setVisFeilmelding(false);

        dispatch(setAktivtVilkar(null));
    }

    const sendVilkar = () => {
        const nyHendelse: Vilkar = {...modalVilkar};
        nyHendelse.hendelsestidspunkt = getNow();

        const soknadUpdated = oHendelser.modify((a: Hendelse[]) => [...a, nyHendelse])(soknad);

        if (aktivtVilkar == null) {
            dispatch(
                aiuuur(
                    soknad.fiksDigisosId,
                    soknadUpdated.fiksDigisosSokerJson,
                    v2,
                    nyttVilkar(soknad.fiksDigisosId, nyHendelse)
                )
            );
        } else {
            dispatch(
                aiuuur(
                    soknad.fiksDigisosId,
                    soknadUpdated.fiksDigisosSokerJson,
                    v2,
                    oppdaterVilkar(soknad.fiksDigisosId, nyHendelse)
                )
            );
        }

        resetStateValues();

        dispatch(dispatch(skjulNyVilkarModal()));
    };

    const setDefaultVilkar = () => {
        setModalVilkar({...defaultVilkar, vilkarreferanse: generateFilreferanseId()});

        setVisFeilmelding(false);
    };

    const getAllUtbetalingsreferanser = () => {
        let referanser: string[] = [];

        soknad.saker.map(sak => (sak.utbetalinger.map(utbetaling => (referanser.push(utbetaling.utbetalingsreferanse)))));

        return referanser;
    };

    const fyllInnAktivtVilkar = () => {
        if (aktivtVilkar) {
            let vilkar = getVilkarByVilkarreferanse(soknad.vilkar, aktivtVilkar);
            if (vilkar){
                setModalVilkar(vilkar);
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
            open={visNyVilkarModal}
            onRendered={() => fyllInnAktivtVilkar()}
            onClose={() => {
                resetStateValues();
                props.dispatch(skjulNyVilkarModal());
            }}
        >
            <Fade in={visNyVilkarModal}>
                <div className={classes.papertowel}>
                    <div className={classes.paperback}>
                        <Grid container spacing={3} justify="center" alignItems="center">
                            {(aktivtVilkar == null) ?
                                getTextFieldGrid("Vilkårreferanse", modalVilkar.vilkarreferanse, (verdi: string) => {
                                    setModalVilkar({...modalVilkar, vilkarreferanse: verdi})
                                }, true)
                                : (<Grid item key={'Grid: Vilkarreferanse'} xs={6} zeroMinWidth>
                                    <TextField
                                        disabled
                                        id="Vilkarreferanse-disabled"
                                        label="Vilkårreferanse"
                                        className={classes.textField}
                                        required={true}
                                        defaultValue={modalVilkar.vilkarreferanse}
                                        margin="normal"
                                        variant="filled"
                                    />
                                </Grid>)}
                            <Grid item key={'Utbetalingsreferanse'} xs={6} zeroMinWidth>
                                <FormControl className={classes.formControl2}>
                                    <InputLabel htmlFor="age-simple" shrink={true}>Utbetalingsreferanse</InputLabel>
                                    <Select
                                        multiple
                                        value={modalVilkar.utbetalingsreferanse ? modalVilkar.utbetalingsreferanse : []}
                                        onChange={(event: any) => {
                                            setModalVilkar({...modalVilkar, utbetalingsreferanse: event.target.value as string[]})
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
                                        {getAllUtbetalingsreferanser().map(referanse => (
                                            <MenuItem
                                                key={referanse} value={referanse}
                                                style={getStyles(referanse, modalVilkar.utbetalingsreferanse ? modalVilkar.utbetalingsreferanse : [], theme)}>
                                                {referanse}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {getTextFieldGrid("Beskrivelse", modalVilkar.beskrivelse, (verdi: string) => setModalVilkar({...modalVilkar, beskrivelse: verdi}))}

                            <Grid item key={'Status'} xs={6} zeroMinWidth>
                                <FormControl className={classes.formControl}>
                                    <InputLabel htmlFor="age-simple" shrink={true}>Status</InputLabel>
                                    <Select
                                        value={modalVilkar.status ? modalVilkar.status : ''}
                                        onChange={(evt) => setModalVilkar({...modalVilkar, status: evt.target.value as VilkarStatus})}
                                        inputProps={{
                                            name: 'setStatus',
                                            id: 'status',
                                        }}
                                    >
                                        <MenuItem value={VilkarStatus.OPPFYLT}>Oppfylt</MenuItem>
                                        <MenuItem value={VilkarStatus.IKKE_OPPFYLT}>Ikke oppfylt</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </div>
                    <div className={classes.paperboys}>
                        {(aktivtVilkar == null) &&
                        <Typography className={classes.finalButtons}>
                            <Fab size="small" aria-label="add" className={classes.fab} color="primary" onClick={() => {
                                setDefaultVilkar();
                            }}>
                                <AddIcon/>
                            </Fab>
                            Fyll ut alle felter
                        </Typography>
                        }
                        <Typography className={classes.finalButtons}>
                            <Fab size="small" aria-label="add" className={classes.fab} color="primary" onClick={() => {
                                if (!visFeilmelding) {
                                    sendVilkar();
                                }
                            }}>
                                <AddIcon/>
                            </Fab>
                            {(aktivtVilkar == null ? "Legg til vilkår" : "Endre vilkår")}
                        </Typography>
                    </div>
                </div>
            </Fade>
        </Modal>
    );
};

const mapStateToProps = (state: AppState) => ({
    visNyVilkarModal: state.v2.visNyVilkarModal,
    v2: state.v2,
    v3: state.v3,
    aktivtVilkar: state.v2.aktivtVilkar
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NyttVilkarModal);
