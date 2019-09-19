import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, Modal, Theme} from "@material-ui/core";
import {skjulNySakModal, visNySakModal} from "../../../redux/v2/v2Actions";
import makeStyles from "@material-ui/core/styles/makeStyles";

const modalStyle = {
    top: `50%`,
    left: `50%`,
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            position: 'absolute',
            width: 400,
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
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            open={visNySakModal}
            onClose={() => props.dispatch(skjulNySakModal())}
        >
            <div style={modalStyle} className={classes.paper}>
                Opprett ny sak her.
            </div>
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
