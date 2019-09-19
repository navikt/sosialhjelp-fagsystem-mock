import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, Modal, Theme} from "@material-ui/core";
import {skjulNySakModal, visNySakModal} from "../../../redux/v2/v2Actions";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Fade from "@material-ui/core/Fade";
import Backdrop from "@material-ui/core/Backdrop";
import OpprettNySaksStatus from "../../../components/opprettNySaksStatus";
import {SaksStatus} from "../../../types/hendelseTypes";

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
}

interface State {
    input: string;
}

const initialState: State = {
    input: ''
};

type Props = DispatchProps & OwnProps & StoreProps;


const NySakModal: React.FC<Props> = (props: Props) => {
    const [state, setState] = useState(initialState);
    const classes = useStyles();
    const {visNySakModal} = props;


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
                    <OpprettNySaksStatus onClick={(nySaksStatus: SaksStatus) => console.warn("Ny sak: " + JSON.stringify(nySaksStatus))} />
                </div>
            </Fade>
        </Modal>
    );
};

const mapStateToProps = (state: AppState) => ({
    visNySakModal: state.v2.visNySakModal
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
