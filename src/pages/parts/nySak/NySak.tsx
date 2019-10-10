import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, Modal, Theme} from "@material-ui/core";
import {skjulNySakModal} from "../../../redux/v2/v2Actions";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Fade from "@material-ui/core/Fade";
import Backdrop from "@material-ui/core/Backdrop";
import {aiuuur, nyFsSaksStatus, oppdaterFsSaksStatus} from "../../../redux/v3/v3Actions";
import {SkjulNySakModal, V2Model} from "../../../redux/v2/v2Types";
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
    visNySakModal: boolean;
    v2: V2Model;
    v3: V3State;
}

const initialTittel = '';

type Props = DispatchProps & OwnProps & StoreProps;


const NySakModal: React.FC<Props> = (props: Props) => {
    const [tittel, setTittel] = useState(initialTittel);
    const classes = useStyles();
    const {visNySakModal, dispatch, v2, v3} = props;


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
                    <input onChange={(evt) => setTittel(evt.target.value)} />
                    <button onClick={() => {
                        if (tittel.length > 0){
                            const fsSoknader = v3.soknader;
                            if (fsSoknader){
                                const fsSoknad: FsSoknad | undefined = getFsSoknadByFiksDigisosId(fsSoknader, v2.aktivSoknad);
                                if (fsSoknad && tittel.length > 0){
                                    dispatch(
                                        aiuuur(
                                            v2.aktivSoknad,
                                            fsSoknad.fiksDigisosSokerJson,
                                            v2,
                                            nyFsSaksStatus(v2.aktivSoknad, generateNyFsSaksStatus(tittel))
                                        )
                                    )
                                }
                            }
                            dispatch(skjulNySakModal());
                        } else {
                            console.warn("Spesifiser en tittel.")
                        }
                    }}>Opprett</button>
                </div>
            </Fade>
        </Modal>
    );
};

const mapStateToProps = (state: AppState) => ({
    visNySakModal: state.v2.visNySakModal,
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
)(NySakModal);
