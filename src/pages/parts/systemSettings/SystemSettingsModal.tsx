import React from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, Modal, Theme} from "@material-ui/core";
import {
    opprettDigisosSakHvisDenIkkeFinnes,
    setBackendUrlTypeToUse,
    skjulSystemSettingsModal
} from "../../../redux/actions";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Backdrop from "@material-ui/core/Backdrop/Backdrop";
import Fade from "@material-ui/core/Fade";
import {BackendUrls, FsSoknad, Model} from "../../../redux/types";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import {backendUrls} from "../../../redux/reducer";


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
    soknad: FsSoknad|undefined;
}

interface StoreProps {
    visSystemSettingsModal: boolean;
    model: Model
}

type Props = DispatchProps & OwnProps & StoreProps;


const SystemSettingsModal: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const {visSystemSettingsModal, dispatch, soknad, model} = props;

    const radios = Object.keys(backendUrls).map((backendUrlType: string) => {
        // @ts-ignore
        return (
            <FormControlLabel
                id={"system_settings_backend_url_radio_" + backendUrlType}
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
            onClose={() => dispatch(skjulSystemSettingsModal())}
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
                            value={model.backendUrlTypeToUse}
                            onClick={() => {
                                dispatch(skjulSystemSettingsModal());
                            }}
                            onChange={
                                (event, value) => {
                                    dispatch(setBackendUrlTypeToUse(value as keyof BackendUrls));
                                    if (soknad) {
                                        opprettDigisosSakHvisDenIkkeFinnes(soknad, value as keyof BackendUrls, dispatch, soknad.fiksDigisosId);
                                    }
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
    visSystemSettingsModal: state.model.visSystemSettingsModal,
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
)(SystemSettingsModal);
