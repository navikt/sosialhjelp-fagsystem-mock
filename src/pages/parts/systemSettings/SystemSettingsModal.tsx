import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, Modal, Theme} from "@material-ui/core";
import {setBackendUrlTypeToUse, skjulSystemSettingsModal} from "../../../redux/v2/v2Actions";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Backdrop from "@material-ui/core/Backdrop/Backdrop";
import Fade from "@material-ui/core/Fade";
import {BackendUrls, V2Model} from "../../../redux/v2/v2Types";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import {FsSoknad} from "../../../redux/v3/v3FsTypes";
import {opprettEllerOppdaterDigisosSak} from "../../../redux/v3/v3Actions";


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
    backendUrls: BackendUrls;
    backendUrlTypeToUse: keyof BackendUrls;
    v2: V2Model;
}

type Props = DispatchProps & OwnProps & StoreProps;


const SystemSettingsModal: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const {visSystemSettingsModal, dispatch, backendUrls, backendUrlTypeToUse, soknad, v2} = props;
    const [typeToUse, setTypeToUse] = useState<keyof BackendUrls | null>(null);

    const radios = Object.keys(backendUrls).map((backendUrlType: string) => {
        // @ts-ignore
        return (
            <FormControlLabel
                key={"urlLabel: " + backendUrlType}
                value={backendUrlType}
                control={<Radio/>}
                label={backendUrlType === 'digisostest' ? 'digisos-test.com' : backendUrlType}
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
            disableBackdropClick
            disableEscapeKeyDown
        >
            <Fade in={visSystemSettingsModal}>
                <div className={classes.paper}>
                    <FormControl component="fieldset" className={classes.formControl}>
                        <FormLabel component="legend">Miljø</FormLabel>
                        <RadioGroup
                            aria-label="backend url"
                            name="miljo"
                            value={typeToUse}
                            onClick={() => {
                                dispatch(skjulSystemSettingsModal());
                            }}
                            onChange={
                                (event, value) => {
                                    setTypeToUse(value as keyof BackendUrls);
                                    dispatch(setBackendUrlTypeToUse(value as keyof BackendUrls));
                                    if (soknad) {
                                        dispatch(opprettEllerOppdaterDigisosSak(soknad, v2, value as keyof BackendUrls));
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
    visSystemSettingsModal: state.v2.visSystemSettingsModal,
    backendUrls: state.v2.backendUrls,
    backendUrlTypeToUse: state.v2.backendUrlTypeToUse,
    v2: state.v2
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
