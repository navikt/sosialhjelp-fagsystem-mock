import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, Modal, Theme} from "@material-ui/core";
import {skjulEndreNavKontorModal} from "../../../redux/v2/v2Actions";
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
    visEndreNavKontorModal: boolean;
}

interface State {
    input: string;
}

const initialState: State = {
    input: ''
};

type Props = DispatchProps & OwnProps & StoreProps;


const EndreNavKontorModal: React.FC<Props> = (props: Props) => {
    const [state, setState] = useState(initialState);
    const classes = useStyles();
    const {visEndreNavKontorModal} = props;


    return (
        <Modal
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            open={visEndreNavKontorModal}
            onClose={() => props.dispatch(skjulEndreNavKontorModal())}
        >
            <div style={modalStyle} className={classes.paper}>
                Endre Nav Kontor her
            </div>
        </Modal>
    );
};

const mapStateToProps = (state: AppState) => ({
    visEndreNavKontorModal: state.v2.visEndreNavKontorModal
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EndreNavKontorModal);
