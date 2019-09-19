import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, Modal, Theme} from "@material-ui/core";
import {skjulSystemSettingsModal, skjulNySakModal, visNySakModal} from "../../../redux/v2/v2Actions";
import makeStyles from "@material-ui/core/styles/makeStyles";

const modalStyle = {
    top: `40%`,
    left: `40%`,
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
    visSystemSettingsModal: boolean;
}

interface State {
    input: string;
}

const initialState: State = {
    input: ''
};

type Props = DispatchProps & OwnProps & StoreProps;


const SystemSettingsModal: React.FC<Props> = (props: Props) => {
    const [state, setState] = useState(initialState);
    const classes = useStyles();
    const {visSystemSettingsModal} = props;


    return (
        <Modal
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            open={visSystemSettingsModal}
            onClose={() => props.dispatch(skjulSystemSettingsModal())}
        >
            <div style={modalStyle} className={classes.paper}>
                Endre systemsettings her
            </div>
        </Modal>
    );
};

const mapStateToProps = (state: AppState) => ({
    visSystemSettingsModal: state.v2.visSystemSettingsModal
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SystemSettingsModal);
