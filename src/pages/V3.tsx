import React, {useState} from 'react';
import {V2Model} from "../redux/v2/v2Types";
import Hendelse from "../types/hendelseTypes";
import {AppState, DispatchProps} from "../redux/reduxTypes";
import {connect} from "react-redux";
import SoknadsOversiktPanel from "./parts/soknadsOversiktPanel/SoknadsOversiktPanel";
import BehandleSoknadPanel from "./parts/behandleSoknadPanel/BehandleSoknadPanel";
import {createStyles, CssBaseline, MuiThemeProvider, Theme} from "@material-ui/core";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import AppBarView from "./parts/appBarView/AppBarView";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Grid from "@material-ui/core/Grid";
import SystemSettingsModal from "./parts/systemSettings/SystemSettingsModal";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        maingrid: {
            justifyContent: 'space-evenly'
        },
        paper: {
            padding: theme.spacing(2),
            textAlign: 'center',
            color: theme.palette.text.secondary
        },
        left: {
            // border: "1px dotted red"
        },
        right: {
            padding: theme.spacing(2, 2),
            // border: "1px dotted red"
        }
    }),
);

interface V3Props {
    v2: V2Model
    hendelserUpdated: Hendelse[]
}

interface V3State {
    input: string;
}

const initialState: V3State = {
    input: ''
};

type Props = DispatchProps & V3Props;
type State = V3State;


const V3: React.FC<Props> = (props: Props) => {
    const [state, setState] = useState(initialState);

    const theme = { palette: {type: props.v2.thememode}};
    const muiTheme = createMuiTheme(theme);
    const classes = useStyles();

    return (
        <MuiThemeProvider theme={muiTheme}>
            <CssBaseline />
            <AppBarView />
            <div className={classes.root}>
                <Grid container={true} spacing={8} className={classes.maingrid}>
                    <Grid item sm={3} className={classes.left}>
                        <SoknadsOversiktPanel />
                    </Grid>
                    <Grid item sm={9} className={classes.right}>
                        <BehandleSoknadPanel />
                    </Grid>
                </Grid>
            </div>
            <SystemSettingsModal />
        </MuiThemeProvider>
    );
};

const mapStateToProps = (state: AppState) => ({
    v2: state.v2,
    hendelserUpdated: JSON.parse(JSON.stringify(state.v2.fiksDigisosSokerJson.sak.soker.hendelser))
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(V3);

