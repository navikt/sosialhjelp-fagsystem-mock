import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, Modal, Theme} from "@material-ui/core";
import {sendNyHendelseOgOppdaterModel, nyFsSaksStatus, skjulNySakModal} from "../../../redux/actions";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Fade from "@material-ui/core/Fade";
import Backdrop from "@material-ui/core/Backdrop";
import {FsSoknad, Model} from "../../../redux/types";
import {
    fsSaksStatusToSaksStatus,
    generateNyFsSaksStatus,
    getFsSoknadByFiksDigisosId
} from "../../../utils/utilityFunctions";
import TextField from "@material-ui/core/TextField";
import Fab from "@material-ui/core/Fab";
import Box from "@material-ui/core/Box";
import AddIcon from '@material-ui/icons/Add';
import Typography from "@material-ui/core/Typography";

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
            marginRight: theme.spacing(2),
        },
        addbox: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center'
        },
        fab: {
            marginRight: theme.spacing(1),
        },
    }),
);


interface OwnProps {
}

interface StoreProps {
    visNySakModal: boolean;
    model: Model
}

type Props = DispatchProps & OwnProps & StoreProps;


const NySakModal: React.FC<Props> = (props: Props) => {
    const [tittel, setTittel] = useState('');
    const classes = useStyles();
    const {visNySakModal, dispatch, model} = props;


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
            open={visNySakModal}
            onClose={() => props.dispatch(skjulNySakModal())}
        >
            <Fade in={visNySakModal}>
                <div className={classes.paper}>
                    <Box className={classes.addbox}>
                        <TextField
                            id="nySakTittel"
                            label={'Tittel på ny sak'}
                            className={classes.textField}
                            value={tittel}
                            onChange={(evt) => setTittel(evt.target.value)}
                            // InputLabelProps={{
                            //     shrink: true,
                            // }}
                            margin="dense"
                            variant="filled"
                            autoComplete="off"
                        />
                        <Fab size={'small'} aria-label='Add' className={classes.fab} color='primary' onClick={() => {
                            const fsSoknader = model.soknader;
                            if (fsSoknader){
                                const fsSoknad: FsSoknad | undefined = getFsSoknadByFiksDigisosId(fsSoknader, model.aktivSoknad);
                                if (fsSoknad) {
                                    const fsSaksStatus = generateNyFsSaksStatus(tittel.length !== 0 ? tittel : null);
                                    const nyHendelse = fsSaksStatusToSaksStatus(fsSaksStatus);

                                    sendNyHendelseOgOppdaterModel(nyHendelse, model, dispatch, nyFsSaksStatus(model.aktivSoknad, fsSaksStatus));

                                    setTittel('');
                                }
                            }
                            dispatch(skjulNySakModal());
                        }}>
                            <AddIcon/>
                        </Fab>
                        <Typography>
                            Opprett sak
                        </Typography>
                    </Box>
                </div>
            </Fade>
        </Modal>
    );
};

const mapStateToProps = (state: AppState) => ({
    visNySakModal: state.model.visNySakModal,
    model: state.model
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NySakModal);
