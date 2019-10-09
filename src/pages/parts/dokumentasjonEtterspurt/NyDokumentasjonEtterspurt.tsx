import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, Modal, Theme} from "@material-ui/core";
import {skjulNyDokumentasjonEtterspurtModal} from "../../../redux/v2/v2Actions";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Fade from "@material-ui/core/Fade";
import Backdrop from "@material-ui/core/Backdrop";
import {aiuuur, nyFsSaksStatus} from "../../../redux/v3/v3Actions";
import {V2Model} from "../../../redux/v2/v2Types";
import {generateNyFsSaksStatus} from "../../../redux/v3/v3UtilityFunctions";
import {FsSoknad} from "../../../redux/v3/v3FsTypes";
import {getFsSoknadByFiksDigisosId} from "../../../utils/utilityFunctions";
import {V3State} from "../../../redux/v3/v3Types";

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
    const [visVedlegg, setVisVedlegg] = useState(false);
    const [dokumenttype, setDokumenttype] = useState('');
    const [tilleggsinformasjon, setTilleggsinformasjon] = useState('');
    const [innsendelsesfrist, setInnsendelsesfrist] = useState('');
    const classes = useStyles();
    const {visNyDokumentasjonEtterspurtModal, dispatch, v2, v3} = props;


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
                    {!visVedlegg && <button onClick={() => {
                        if (!visVedlegg) {
                            setVisVedlegg(true);
                        }

                    }}>Opprett</button>}
                    {visVedlegg && (
                        <input onChange={(evt) => setDokumenttype(evt.target.value)} /> &&
                        <button onClick={() => {
                        setVisVedlegg(false);
                    }}>Lagre</button>
                    )}
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
