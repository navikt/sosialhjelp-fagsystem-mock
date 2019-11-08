import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, Modal, Theme} from "@material-ui/core";
import {
    nyttVilkar,
    oppdaterVilkar,
    sendNyHendelseOgOppdaterModel,
    setAktivtVilkar,
    skjulNyVilkarModal
} from "../../../redux/actions";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Fade from "@material-ui/core/Fade";
import Backdrop from "@material-ui/core/Backdrop";
import {FsSoknad, Model} from "../../../redux/types";
import {
    generateFilreferanseId,
    getAllUtbetalingsreferanser,
    getNow,
    getSakTittelOgNrFraUtbetalingsreferanse,
    getVilkarByVilkarreferanse
} from "../../../utils/utilityFunctions";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import {HendelseType, Vilkar, VilkarStatus} from "../../../types/hendelseTypes";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Input from '@material-ui/core/Input';
import Chip from '@material-ui/core/Chip';
import useTheme from "@material-ui/core/styles/useTheme";
import Button from "@material-ui/core/Button";

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
            marginLeft: theme.spacing(2),
            marginRight: theme.spacing(2),
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
    visNyVilkarModal: boolean;
    model: Model
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
    const [referansefeltDisabled, setReferansefeltDisabled] = useState(false);
    const theme = useTheme();

    const classes = useStyles();
    const {visNyVilkarModal, dispatch, model, soknad, aktivtVilkar} = props;

    function resetStateValues() {
        setModalVilkar({...initialVilkar, vilkarreferanse: generateFilreferanseId()});
        setVisFeilmelding(false);
        setReferansefeltDisabled(false);

        dispatch(setAktivtVilkar(null));
    }

    const sendVilkar = () => {
        const nyHendelse: Vilkar = {...modalVilkar};
        nyHendelse.hendelsestidspunkt = getNow();

        if (aktivtVilkar == null) {
            sendNyHendelseOgOppdaterModel(nyHendelse, model, dispatch, nyttVilkar(soknad.fiksDigisosId, nyHendelse));
        } else {
            sendNyHendelseOgOppdaterModel(nyHendelse, model, dispatch, oppdaterVilkar(soknad.fiksDigisosId, nyHendelse));
        }

        dispatch(dispatch(skjulNyVilkarModal()));

        setTimeout(() => {
            resetStateValues();
        }, 500);
    };

    const setDefaultVilkar = () => {
        setModalVilkar({...defaultVilkar, vilkarreferanse: generateFilreferanseId()});

        const alleUtbetalingsreferanser = getAllUtbetalingsreferanser(soknad);
        if (alleUtbetalingsreferanser.length > 0) {
            setModalVilkar({...defaultVilkar, vilkarreferanse: generateFilreferanseId(), utbetalingsreferanse: [alleUtbetalingsreferanser[0]]});
        }

        setVisFeilmelding(false);
        setReferansefeltDisabled(false);
    };

    const fyllInnAktivtVilkar = () => {
        if (aktivtVilkar) {
            let vilkar = getVilkarByVilkarreferanse(soknad.vilkar, aktivtVilkar);
            if (vilkar){
                setModalVilkar(vilkar);

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
            open={visNyVilkarModal}
            onRendered={() => fyllInnAktivtVilkar()}
            onClose={() => {
                props.dispatch(skjulNyVilkarModal());
                setTimeout(() => {
                    resetStateValues();
                }, 500);
            }}
        >
            <Fade in={visNyVilkarModal}>
                <div className={classes.papertowel}>
                    <div className={classes.paperback}>
                        <Grid container spacing={3} justify="center" alignItems="center">
                            {getTextFieldGrid("Vilkårreferanse", modalVilkar.vilkarreferanse,
                                (verdi: string) => setModalVilkar({...modalVilkar, vilkarreferanse: verdi}), true)}
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
                                        {getAllUtbetalingsreferanser(soknad).map(referanse => (
                                            <MenuItem
                                                key={referanse} value={referanse}
                                                style={getStyles(referanse, modalVilkar.utbetalingsreferanse ? modalVilkar.utbetalingsreferanse : [], theme)}>
                                                {referanse + ' ' + getSakTittelOgNrFraUtbetalingsreferanse(soknad, referanse)}
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
                        <Button className={classes.finalButtons} variant="outlined" color={'default'} onClick={() => {
                            setDefaultVilkar();
                        }}>
                            Fyll ut alle felter
                        </Button>
                        }
                        <Button className={classes.finalButtons} variant={aktivtVilkar == null ? 'contained' : 'outlined'}
                                color={aktivtVilkar == null ? 'primary' : 'secondary'} onClick={() => {
                                    if (!visFeilmelding) {
                                        sendVilkar();
                                    }
                                }}>
                            {(aktivtVilkar == null ? "Legg til vilkår" : "Endre vilkår")}
                        </Button>
                    </div>
                </div>
            </Fade>
        </Modal>
    );
};

const mapStateToProps = (state: AppState) => ({
    visNyVilkarModal: state.model.visNyVilkarModal,
    model: state.model,
    aktivtVilkar: state.model.aktivtVilkar
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
