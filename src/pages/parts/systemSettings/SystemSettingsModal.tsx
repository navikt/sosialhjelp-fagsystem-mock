import React from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, Modal, Theme} from "@material-ui/core";
import {setBackendUrlTypeToUse, skjulSystemSettingsModal} from "../../../redux/v2/v2Actions";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Backdrop from "@material-ui/core/Backdrop/Backdrop";
import Fade from "@material-ui/core/Fade";
import {BackendUrls} from "../../../redux/v2/v2Types";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";


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
        formControl: {
            margin: theme.spacing(3)
        }
    }),
);

interface OwnProps {
}

interface StoreProps {
    visSystemSettingsModal: boolean;
    backendUrls: BackendUrls;
    backendUrlTypeToUse: string;
}

type Props = DispatchProps & OwnProps & StoreProps;


const SystemSettingsModal: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const {visSystemSettingsModal, dispatch, backendUrls, backendUrlTypeToUse} = props;

    const radios = Object.keys(backendUrls).map((backendUrlType: string) => {
        // @ts-ignore
        return (
            <FormControlLabel
                key={"urlLabel: " + backendUrlType}
                value={backendUrlType}
                control={<Radio/>}
                label={backendUrlType}
            />
        );
    });


    return (
        <Modal
            open={visSystemSettingsModal}
            onClose={() => props.dispatch(skjulSystemSettingsModal())}
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
            }}
        >
            <Fade in={visSystemSettingsModal}>
                <div className={classes.paper}>
                    <FormControl component="fieldset" className={classes.formControl}>
                        <FormLabel component="legend">Miljø</FormLabel>
                        <RadioGroup
                            aria-label="backend url"
                            name="miljo"
                            value={backendUrlTypeToUse}
                            onChange={
                                (event, value) => {
                                    console.warn("value: " + value);
                                    dispatch(setBackendUrlTypeToUse(value))
                                }}
                        >
                            {radios}
                        </RadioGroup>
                    </FormControl>
                </div>
            </Fade>
        </Modal>
    );
};

const mapStateToProps = (state: AppState) => ({
    visSystemSettingsModal: state.v2.visSystemSettingsModal,
    backendUrls: state.v2.backendUrls,
    backendUrlTypeToUse: state.v2.backendUrlTypeToUse
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
