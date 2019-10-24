import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, Modal, Theme} from "@material-ui/core";
import {setAktivSak, skjulNySakModal} from "../../../redux/v2/v2Actions";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Fade from "@material-ui/core/Fade";
import Backdrop from "@material-ui/core/Backdrop";
import {aiuuur, nyFsSaksStatus} from "../../../redux/v3/v3Actions";
import {V2Model} from "../../../redux/v2/v2Types";
import {fsSaksStatusToSaksStatus, generateNyFsSaksStatus} from "../../../redux/v3/v3UtilityFunctions";
import {FsSoknad} from "../../../redux/v3/v3FsTypes";
import {getFsSoknadByFiksDigisosId} from "../../../utils/utilityFunctions";
import {V3State} from "../../../redux/v3/v3Types";
import {oHendelser} from "../../../redux/v3/v3Optics";
import Hendelse from "../../../types/hendelseTypes";

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

type Props = DispatchProps & OwnProps & StoreProps;


const NySakModal: React.FC<Props> = (props: Props) => {
    const [tittel, setTittel] = useState('');
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
                        const fsSoknader = v3.soknader;
                        if (fsSoknader){
                            const fsSoknad: FsSoknad | undefined = getFsSoknadByFiksDigisosId(fsSoknader, v2.aktivSoknad);
                            if (fsSoknad) {
                                const fsSaksStatus = generateNyFsSaksStatus(tittel.length !== 0 ? tittel : null);
                                const nyHendelse = fsSaksStatusToSaksStatus(fsSaksStatus);
                                const soknadUpdated = oHendelser.modify((a: Hendelse[]) => [...a, nyHendelse])(fsSoknad);

                                dispatch(
                                    aiuuur(
                                        v2.aktivSoknad,
                                        soknadUpdated.fiksDigisosSokerJson,
                                        v2,
                                        nyFsSaksStatus(v2.aktivSoknad, fsSaksStatus)
                                    )
                                );

                                if (soknadUpdated.saker.length === 0) {
                                    dispatch(setAktivSak(fsSaksStatus.referanse));
                                }
                            }
                        }
                        dispatch(skjulNySakModal());
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
