import React, {SyntheticEvent} from 'react';
import clsx from 'clsx';
import Button from '@material-ui/core/Button';
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
import {V2Model} from "../../../redux/v2/v2Types";
import {V3State} from "../../../redux/v3/v3Types";
import {connect} from "react-redux";
import {skjulSnackbar} from "../../../redux/v2/v2Actions";

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
    v2: V2Model;
    v3: V3State;
}

export interface InterfaceProps {
    className?: string;
    message?: string;
    onClose?: () => void;
    variant: keyof typeof variantIcon;
}

type Props = DispatchProps & InterfaceProps & StoreProps;

function MySnackbarContentWrapper(props: InterfaceProps) {
    const classes = useStyles();
    const {className, message, onClose, variant, ...other} = props;
    const Icon = variantIcon[variant];

    return (
        <SnackbarContent
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
    const {visSnackbar, dispatch} = props;

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
                    variant="success"
                    message="En hendelse er registrert i innsyn"
                />
            </Snackbar>
        </div>
    );
};

const mapStateToProps = (state: AppState) => ({
    visSnackbar: state.v2.visSnackbar,
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
)(StatusSnackBarView)