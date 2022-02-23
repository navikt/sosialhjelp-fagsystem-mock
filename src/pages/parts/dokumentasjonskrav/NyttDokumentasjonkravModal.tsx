import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, Modal, Theme} from "@material-ui/core";
import {
    nyttDokumentasjonkrav,
    oppdaterDokumentasjonkrav,
    sendNyHendelseOgOppdaterModel,
    setAktivtDokumentasjonkrav,
    skjulNyDokumentasjonkravModal
} from "../../../redux/actions";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Fade from "@material-ui/core/Fade";
import Backdrop from "@material-ui/core/Backdrop";
import {FsSoknad, Model} from "../../../redux/types";
import {
    generateFilreferanseId,
    getAllUtbetalingsreferanser,
    getDokumentasjonkravByDokumentasjonkravreferanse,
    getNow,
    getSakTittelOgNrFraUtbetalingsreferanse, getShortDateISOString
} from "../../../utils/utilityFunctions";
import Grid from "@material-ui/core/Grid";
import {Dokumentasjonkrav, DokumentasjonkravStatus, HendelseType} from "../../../types/hendelseTypes";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Input from '@material-ui/core/Input';
import Chip from '@material-ui/core/Chip';
import useTheme from "@material-ui/core/styles/useTheme";
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
    visNyDokumentasjonkravModal: boolean;
    model: Model
    aktivtDokumentasjonkrav: string | undefined | null;
}

type Props = DispatchProps & OwnProps & StoreProps;

const initialDokumentasjonkrav: Dokumentasjonkrav = {
    type: HendelseType.Dokumentasjonkrav,
    hendelsestidspunkt: '',
    dokumentasjonkravreferanse: generateFilreferanseId(),
    utbetalingsreferanse: null,
    tittel: '',
    beskrivelse: null,
    frist: '',
    status: null,
};

let date = new Date();
date.setDate(new Date().getDate() + 7); // En uke fram i tid
date.setHours(12);
const defaultFrist = getShortDateISOString(date);

const defaultDokumentasjonkrav: Dokumentasjonkrav = {
    type: HendelseType.Dokumentasjonkrav,
    hendelsestidspunkt: '',
    dokumentasjonkravreferanse: generateFilreferanseId(),
    utbetalingsreferanse: [],
    tittel: 'Husleie for forrige måned',
    beskrivelse: 'Du må levere kopi av faktura for husleien din.',
    frist: defaultFrist,
    status: DokumentasjonkravStatus.RELEVANT,
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
    const [fristDatePickerIsOpen, setFristDatePickerIsOpen] = useState(false);
    const theme = useTheme();

    const classes = useStyles();
    const {visNyDokumentasjonkravModal, dispatch, model, soknad, aktivtDokumentasjonkrav} = props;

    const resetStateValues = () => {
        setModalDokumentasjonkrav({...initialDokumentasjonkrav, dokumentasjonkravreferanse: generateFilreferanseId()});
        setVisFeilmelding(false);
        setReferansefeltDisabled(false);
        setFristDatePickerIsOpen(false);

        dispatch(setAktivtDokumentasjonkrav(null));
    };

    const sendDokumentasjonkrav = () => {
        const nyHendelse: Dokumentasjonkrav = {...modalDokumentasjonkrav};
        nyHendelse.hendelsestidspunkt = getNow();

        if (aktivtDokumentasjonkrav == null) {
            sendNyHendelseOgOppdaterModel(nyHendelse, model, dispatch, nyttDokumentasjonkrav(soknad.fiksDigisosId, nyHendelse));
        } else {
            sendNyHendelseOgOppdaterModel(nyHendelse, model, dispatch, oppdaterDokumentasjonkrav(soknad.fiksDigisosId, nyHendelse));
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
        setFristDatePickerIsOpen(false);
    };

    const fyllInnAktivtDokumentasjonkrav = () => {
        if (aktivtDokumentasjonkrav) {
            let dokumentasjonkrav = getDokumentasjonkravByDokumentasjonkravreferanse(soknad.dokumentasjonkrav, aktivtDokumentasjonkrav);
            if (dokumentasjonkrav){
                setModalDokumentasjonkrav(dokumentasjonkrav);
                setFristDatePickerIsOpen(false);
                setTimeout(() => {
                    setReferansefeltDisabled(true);
                }, 10);
            }
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
                        <Grid container spacing={3} justifyContent="center" alignItems="center">
                            <Grid item key={'Grid: Dokumentasjonkravreferanse'} xs={6} zeroMinWidth>
                                <CustomTextField label={'Dokumentasjonkravreferanse'} value={modalDokumentasjonkrav.dokumentasjonkravreferanse}
                                                 setValue={(verdi: string) => setModalDokumentasjonkrav({...modalDokumentasjonkrav, dokumentasjonkravreferanse: verdi})}
                                                 required={true} referansefeltDisabled={referansefeltDisabled}
                                                 visFeilmelding={visFeilmelding} setVisFeilmelding={setVisFeilmelding} />
                            </Grid>
                            <Grid item key={'Grid: Tittel'} xs={6} zeroMinWidth>
                                <CustomTextField label={'Tittel'} value={modalDokumentasjonkrav.tittel}
                                                 setValue={(verdi: string) => setModalDokumentasjonkrav({...modalDokumentasjonkrav, tittel: verdi})} />
                            </Grid>
                            <Grid item key={'Grid: Beskrivelse'} xs={6} zeroMinWidth>
                                <CustomTextField label={'Beskrivelse'} value={modalDokumentasjonkrav.beskrivelse}
                                                 setValue={(verdi: string) => setModalDokumentasjonkrav({...modalDokumentasjonkrav, beskrivelse: verdi})}/>
                            </Grid>
                            <Grid item key={'Grid: Frist'} xs={6} zeroMinWidth>
                                <CustomKeyboardDatePicker label={'Frist'} value={modalDokumentasjonkrav.frist}
                                                          setValue={(verdi: string) => setModalDokumentasjonkrav({...modalDokumentasjonkrav, frist: verdi})}
                                                          isOpen={fristDatePickerIsOpen} setIsOpen={setFristDatePickerIsOpen} />
                            </Grid>
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
                                        <MenuItem value={DokumentasjonkravStatus.RELEVANT}>Relevant</MenuItem>
                                        <MenuItem value={DokumentasjonkravStatus.LEVERT_TIDLIGERE}>Levert tidligere</MenuItem>
                                        <MenuItem value={DokumentasjonkravStatus.ANNULLERT}>Annullert</MenuItem>
                                        <MenuItem value={DokumentasjonkravStatus.OPPFYLT}>Oppfylt</MenuItem>
                                        <MenuItem value={DokumentasjonkravStatus.IKKE_OPPFYLT}>Ikke oppfylt</MenuItem>

                                    </Select>
                                </FormControl>
                            </Grid>
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
                        </Grid>
                    </div>
                    <div className={classes.paperboys}>
                        {(aktivtDokumentasjonkrav == null) &&
                        <Button className={classes.finalButtons} variant="outlined" color={'default'} onClick={() => {
                            setDefaultDokumentasjonkrav();
                        }}>
                            Fyll ut alle felter
                        </Button>
                        }
                        <Button className={classes.finalButtons} variant={aktivtDokumentasjonkrav == null ? 'contained' : 'outlined'}
                                color={aktivtDokumentasjonkrav == null ? 'primary' : 'secondary'} onClick={() => {
                                    if (!visFeilmelding) {
                                        sendDokumentasjonkrav();
                                    }
                                }}>
                            {(aktivtDokumentasjonkrav == null ? "Legg til dokumentasjonkrav" : "Endre dokumentasjonkrav")}
                        </Button>
                    </div>
                </div>
            </Fade>
        </Modal>
    );
};

const mapStateToProps = (state: AppState) => ({
    visNyDokumentasjonkravModal: state.model.visNyDokumentasjonkravModal,
    model: state.model,
    aktivtDokumentasjonkrav: state.model.aktivtDokumentasjonkrav
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
