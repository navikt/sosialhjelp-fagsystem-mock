import React from 'react';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import {Brightness2, Brightness4, Build} from "@material-ui/icons";
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {V2Model} from "../../../redux/v2/v2Types";
import {switchToDarkMode, switchToLightMode, visSystemSettingsModal} from "../../../redux/v2/v2Actions";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        menuButton: {
            marginRight: theme.spacing(2),
        },
        title: {
            flexGrow: 1,
        },
    }),
);

interface OwnProps {

}

interface StoreProps {
    v2: V2Model
}

type Props = OwnProps & StoreProps & DispatchProps;

const AppBarView: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const {dispatch} = props;

    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        Woldena™
                    </Typography>
                    {!window.location.href.includes('https://www.digisos-test.com/') &&
                    <IconButton className={classes.menuButton} color="inherit" aria-label="menu"
                                onClick={() => dispatch(visSystemSettingsModal())}
                    >
                        <Build/>
                    </IconButton>
                    }
                    <IconButton
                        color="inherit"
                        onClick={() => {
                            props.v2.thememode === 'light'
                                ? props.dispatch(switchToDarkMode())
                                : props.dispatch(switchToLightMode());
                        }}
                    >
                        { props.v2.thememode === 'light' ? <Brightness2/> : <Brightness4/>}
                    </IconButton>
                </Toolbar>
            </AppBar>
        </div>
    );
}

const mapStateToProps = (state: AppState) => ({
    v2: state.v2,
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AppBarView);
