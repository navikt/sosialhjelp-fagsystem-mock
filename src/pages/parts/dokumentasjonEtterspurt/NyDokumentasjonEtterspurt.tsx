import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, Modal, Theme} from "@material-ui/core";
import {skjulNyDokumentasjonEtterspurtModal} from "../../../redux/v2/v2Actions";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Fade from "@material-ui/core/Fade";
import Backdrop from "@material-ui/core/Backdrop";
import {V2Model} from "../../../redux/v2/v2Types";
import {V3State} from "../../../redux/v3/v3Types";
import TextField from '@material-ui/core/TextField';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {KeyboardDatePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';
import Fab from "@material-ui/core/Fab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import AddIcon from '@material-ui/icons/Add';
import {Dokument} from "../../../types/hendelseTypes";
import Grid from "@material-ui/core/Grid";

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
        textField: {
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),
        },
        addbox: {
            margin: theme.spacing(2, 0, 2, 0),
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center'
        },
        krav: {
            backgroundColor: theme.palette.background.paper,
            border: '2px solid #000',
            boxShadow: theme.shadows[5],
        },
        fab: {
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),
            margin: theme.spacing(1),
        },
    }),
);


interface OwnProps {
}

interface StoreProps {
    visNyDokumentasjonEtterspurtModal: boolean;
    v2: V2Model;
    v3: V3State;
}

type Props = DispatchProps & OwnProps & StoreProps;


const NyDokumentasjonEtterspurtModal: React.FC<Props> = (props: Props) => {
    const [dokumenttype, setDokumenttype] = useState('');
    const [tilleggsinformasjon, setTilleggsinformasjon] = useState('');
    const initialDokumentListe: Dokument[] = [];
    const [dokumentListe, setDokumentListe] = useState(initialDokumentListe);
    const initialDate = new Date().setDate(new Date().getDate() + 7);
    const [innsendelsesfrist, setInnsendelsesfrist] = React.useState(initialDate);
    const classes = useStyles();
    const {visNyDokumentasjonEtterspurtModal, dispatch, v2, v3} = props;

    const leggTilDokument = () => {
        const nyttDokument: Dokument = {
            dokumenttype: dokumenttype,
            tilleggsinformasjon: tilleggsinformasjon,
            innsendelsesfrist: innsendelsesfrist.toString()
        };
        dokumentListe.push(nyttDokument);
        setDokumentListe(dokumentListe);
        setDokumenttype('')
        setTilleggsinformasjon('')
        setInnsendelsesfrist(initialDate)
    };

    function getAnies() {
        return <Grid container direction="column" justify="flex-start" alignItems="flex-start" spacing={3}>
            {dokumentListe.map((dokument: Dokument) => {
                return (
                    <Grid item xs={12} zeroMinWidth>
                        <Box className={classes.krav}>
                            <TextField
                                id="outlined-name"
                                label="DokumentType"
                                className={classes.textField}
                                value={dokument.dokumenttype}
                                margin="normal"
                                variant="outlined"
                            />
                            <TextField
                                id="outlined-name"
                                label="Tilleggsinfo"
                                className={classes.textField}
                                value={dokument.tilleggsinformasjon}
                                margin="normal"
                                variant="outlined"
                            />
                            <TextField
                                id="outlined-name"
                                label="Innsendelsesfrist"
                                className={classes.textField}
                                value={dokument.innsendelsesfrist}
                                margin="normal"
                                variant="outlined"
                            />
                        </Box>
                    </Grid>)
        })}
        </Grid>
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
            open={visNyDokumentasjonEtterspurtModal}
            onClose={() => props.dispatch(skjulNyDokumentasjonEtterspurtModal())}
        >
            <Fade in={visNyDokumentasjonEtterspurtModal}>
                <div className={classes.paper}>
                    <Box className={classes.addbox}>
                        <TextField
                            id="outlined-name"
                            label="DokumentType"
                            className={classes.textField}
                            value={dokumenttype}
                            onChange={(evt) => setDokumenttype(evt.target.value)}
                            margin="normal"
                            variant="outlined"
                        />
                        <TextField
                            id="outlined-name"
                            label="Tilleggsinfo"
                            className={classes.textField}
                            value={tilleggsinformasjon}
                            onChange={(evt) => setTilleggsinformasjon(evt.target.value)}
                            margin="normal"
                            variant="outlined"
                        />
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                                disableToolbar
                                variant="inline"
                                format="MM/dd/yyyy"
                                margin="normal"
                                id="date-picker-inline"
                                label="Date picker inline"
                                value={innsendelsesfrist}
                                onChange={(date: any) => setInnsendelsesfrist(date)}
                                KeyboardButtonProps={{
                                    'aria-label': 'change date',
                                }}
                            />
                        </MuiPickersUtilsProvider>

                        <Fab size="small" aria-label="add" className={classes.fab} color="primary" onClick={() => {
                            leggTilDokument();
                        }}>
                            <AddIcon/>
                        </Fab>
                        <Typography>
                            Legg til dokumentkrav
                        </Typography>
                    </Box>
                    {(dokumentListe.length == 0) && <div>Ingen elementer lagt til</div>}
                    {getAnies()}
                </div>
            </Fade>
        </Modal>
    );
};

const mapStateToProps = (state: AppState) => ({
    visNyDokumentasjonEtterspurtModal: state.v2.visNyDokumentasjonEtterspurtModal,
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
)(NyDokumentasjonEtterspurtModal);
