import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, Modal, Theme} from "@material-ui/core";
import {
    nyttRammevedtak,
    oppdaterRammevedtak,
    sendNyHendelseOgOppdaterModel,
    setAktivtRammevedtak,
    skjulNyRammevedtakModal
} from "../../../redux/actions";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Fade from "@material-ui/core/Fade";
import Backdrop from "@material-ui/core/Backdrop";
import {FsSoknad, Model} from "../../../redux/types";
import {
    formatDateString,
    generateFilreferanseId,
    getNow,
    getRammevedtakByRammevedtaksreferanse,
    getSakTittelFraSaksreferanse,
    getShortDateISOString
} from "../../../utils/utilityFunctions";
import Grid from "@material-ui/core/Grid";
import {HendelseType, Rammevedtak} from "../../../types/hendelseTypes";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
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

interface OwnProps {
    soknad: FsSoknad
}

interface StoreProps {
    visNyRammevedtakModal: boolean;
    model: Model
    aktivtRammevedtak: string | undefined | null;
    modalSaksreferanse: string|null;
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
    const [referansefeltDisabled, setReferansefeltDisabled] = useState(false);

    const classes = useStyles();
    const {visNyRammevedtakModal, dispatch, model, soknad, aktivtRammevedtak, modalSaksreferanse} = props;

    const resetStateValues = () => {
        setModalRammevedtak({...initialRammevedtak, rammevedtaksreferanse: generateFilreferanseId()});

        setFomDatePickerIsOpen(false);
        setTomDatePickerIsOpen(false);
        setVisFeilmelding(false);
        setReferansefeltDisabled(false);

        dispatch(setAktivtRammevedtak(null));
    };

    const sendRammevedtak = () => {
        let nyHendelse: Rammevedtak = {...modalRammevedtak, belop: modalRammevedtak.belop ? modalRammevedtak.belop as number: null};
        if (modalSaksreferanse) {
            nyHendelse = {...nyHendelse, saksreferanse: modalSaksreferanse};
        }
        nyHendelse.hendelsestidspunkt = getNow();
        nyHendelse.fom = formatDateString(nyHendelse.fom);
        nyHendelse.tom = formatDateString(nyHendelse.tom);

        if (aktivtRammevedtak == null) {
            sendNyHendelseOgOppdaterModel(nyHendelse, model, dispatch, nyttRammevedtak(soknad.fiksDigisosId, nyHendelse));
        } else {
            sendNyHendelseOgOppdaterModel(nyHendelse, model, dispatch, oppdaterRammevedtak(soknad.fiksDigisosId, nyHendelse));
        }

        dispatch(dispatch(skjulNyRammevedtakModal()));

        setTimeout(() => {
            resetStateValues();
        }, 500);
    };

    const setDefaultRammevedtak = () => {
        setModalRammevedtak({...defaultRammevedtak, rammevedtaksreferanse: generateFilreferanseId(), saksreferanse: modalRammevedtak.saksreferanse});

        if (soknad.saker.length > 0 && modalRammevedtak.saksreferanse == null) {
            setModalRammevedtak({...defaultRammevedtak, saksreferanse: soknad.saker[0].referanse});
        }

        setFomDatePickerIsOpen(false);
        setTomDatePickerIsOpen(false);
        setVisFeilmelding(false);
        setReferansefeltDisabled(false);
    };

    const fyllInnAktivtRammevedtak = () => {
        if (aktivtRammevedtak) {
            const rammevedtak = getRammevedtakByRammevedtaksreferanse(soknad, aktivtRammevedtak);
            if (rammevedtak){
                setModalRammevedtak(rammevedtak);

                setTimeout(() => {
                    setReferansefeltDisabled(true);
                }, 10);
            }
        } else {
            setModalRammevedtak({...modalRammevedtak, saksreferanse: modalSaksreferanse});
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
            open={visNyRammevedtakModal}
            onRendered={() => fyllInnAktivtRammevedtak()}
            onClose={() => {
                props.dispatch(skjulNyRammevedtakModal());
                setTimeout(() => {
                    resetStateValues();
                }, 500);
            }}
        >
            <Fade in={visNyRammevedtakModal}>
                <div className={classes.papertowel}>
                    <div className={classes.paperback}>
                        <Grid container spacing={3} justify="center" alignItems="center">
                            <Grid item key={'Grid: Rammevedtakreferanse'} xs={6} zeroMinWidth>
                                <CustomTextField label={'Rammevedtakreferanse'} value={modalRammevedtak.rammevedtaksreferanse}
                                                 setValue={(verdi: string) => setModalRammevedtak({...modalRammevedtak, rammevedtaksreferanse: verdi})} required={true}
                                                 referansefeltDisabled={referansefeltDisabled} visFeilmelding={visFeilmelding} setVisFeilmelding={setVisFeilmelding} />
                            </Grid>
                            <Grid item key={'Saksreferanse'} xs={6} zeroMinWidth>
                                <FormControl className={classes.formControl2} disabled={modalSaksreferanse != null}>
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
                                            <MenuItem key={sak.referanse} value={sak.referanse}>
                                                {sak.referanse + ' ' + getSakTittelFraSaksreferanse(soknad, sak.referanse)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item key={'Grid: Beskrivelse'} xs={6} zeroMinWidth>
                                <CustomTextField label={'Beskrivelse'} value={modalRammevedtak.beskrivelse}
                                                 setValue={(verdi: string) => setModalRammevedtak({...modalRammevedtak, beskrivelse: verdi})}/>
                            </Grid>
                            <Grid item key={'Grid: Beløp'} xs={6} zeroMinWidth>
                                <CustomTextField label={'Beløp'} value={modalRammevedtak.belop} inputType={'number'}
                                                 setValue={(verdi: number) => setModalRammevedtak({...modalRammevedtak, belop: +verdi})}/>
                            </Grid>

                            <Grid item key={"grid: fom"} xs={6} zeroMinWidth>
                                <CustomKeyboardDatePicker label={"fom"} value={modalRammevedtak.fom} isOpen={fomDatePickerIsOpen} setIsOpen={setFomDatePickerIsOpen}
                                                          setValue={(verdi: string) => setModalRammevedtak({...modalRammevedtak, fom: verdi})}/>
                            </Grid>
                            <Grid item key={"grid: tom"} xs={6} zeroMinWidth>
                                <CustomKeyboardDatePicker label={"tom"} value={modalRammevedtak.tom} isOpen={tomDatePickerIsOpen} setIsOpen={setTomDatePickerIsOpen}
                                                          setValue={(verdi: string) => setModalRammevedtak({...modalRammevedtak, tom: verdi})}/>
                            </Grid>
                        </Grid>
                    </div>
                    <div className={classes.paperboys}>
                        {(aktivtRammevedtak == null) &&
                        <Button className={classes.finalButtons} variant="outlined" color={'default'} onClick={() => {
                            setDefaultRammevedtak();
                        }}>
                            Fyll ut alle felter
                        </Button>
                        }
                        <Button className={classes.finalButtons} variant={aktivtRammevedtak == null ? 'contained' : 'outlined'}
                                color={aktivtRammevedtak == null ? 'primary' : 'secondary'} onClick={() => {
                            if (!visFeilmelding) {
                                sendRammevedtak();
                            }
                        }}>
                            {(aktivtRammevedtak == null ? "Legg til rammevedtak" : "Endre rammevedtak")}
                        </Button>
                    </div>
                </div>
            </Fade>
        </Modal>
    );
};

const mapStateToProps = (state: AppState) => ({
    visNyRammevedtakModal: state.model.visNyRammevedtakModal,
    model: state.model,
    aktivtRammevedtak: state.model.aktivtRammevedtak,
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
)(NyttRammevedtakModal);
