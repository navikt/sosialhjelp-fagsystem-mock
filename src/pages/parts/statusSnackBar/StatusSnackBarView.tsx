import React, {SyntheticEvent} from 'react';
import clsx from 'clsx';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import {amber, green} from '@material-ui/core/colors';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import WarningIcon from '@material-ui/icons/Warning';
import {makeStyles, Theme} from '@material-ui/core/styles';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {Model} from "../../../redux/types";
import {connect} from "react-redux";
import {skjulSnackbar} from "../../../redux/actions";

const variantIcon = {
    success: CheckCircleIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon,
};

const useStyles = makeStyles((theme: Theme) => ({
    success: {
        backgroundColor: green[600],
    },
    error: {
        backgroundColor: theme.palette.error.dark,
    },
    info: {
        backgroundColor: theme.palette.primary.main,
    },
    warning: {
        backgroundColor: amber[700],
    },
    icon: {
        fontSize: 20,
    },
    iconVariant: {
        opacity: 0.9,
        marginRight: theme.spacing(1),
    },
    message: {
        display: 'flex',
        alignItems: 'center',
    },
}));

interface StoreProps {
    visSnackbar: boolean;
    snackbarVariant: 'success'|'warning'|'error'|'info';
    model: Model
}

export interface InterfaceProps {
    className?: string;
    message?: string;
    onClose?: () => void;
    variant: keyof typeof variantIcon;
}

type Props = DispatchProps & StoreProps;

function MySnackbarContentWrapper(props: InterfaceProps) {
    const classes = useStyles();
    const {className, message, onClose, variant, ...other} = props;
    const Icon = variantIcon[variant];

    return (
        <SnackbarContent
            id={'innsyn_status_snackbar'}
            className={clsx(classes[variant], className)}
            aria-describedby="client-snackbar"
            message={
                <span id="client-snackbar" className={classes.message}>
          <Icon className={clsx(classes.icon, classes.iconVariant)}/>
                    {message}
        </span>
            }
            action={[
                <IconButton key="close" aria-label="close" color="inherit" onClick={onClose}>
                    <CloseIcon className={classes.icon}/>
                </IconButton>,
            ]}
            {...other}
        />
    );
}


const StatusSnackBarView: React.FC<Props> = (props: Props) => {
    const {visSnackbar, snackbarVariant, dispatch} = props;

    function handleClose(event?: SyntheticEvent, reason?: string) {
        if (reason === 'clickaway') {
            return;
        }

        dispatch(skjulSnackbar());
    }

    return (
        <div>
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={visSnackbar}
                autoHideDuration={2000}
                onClose={handleClose}
            >
                <MySnackbarContentWrapper
                    onClose={handleClose}
                    variant={snackbarVariant}
                    message={snackbarVariant === 'error' ? "Noe gikk galt i kall mot server" : "En hendelse er registrert i innsyn"}
                />
            </Snackbar>
        </div>
    );
};

const mapStateToProps = (state: AppState) => ({
    visSnackbar: state.model.visSnackbar,
    snackbarVariant: state.model.snackbarVariant,
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
)(StatusSnackBarView)