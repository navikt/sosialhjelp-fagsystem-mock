import React from 'react';
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
import StatusSnackBarView from "./parts/statusSnackBar/StatusSnackBarView";
import {V3State} from "../redux/v3/v3Types";
import ReactJsonView from "./parts/reactJsonView/ReactJsonView";
import {getFsSoknadByFiksDigisosId} from "../utils/utilityFunctions";
import ToppPanel from "./parts/panel/ToppPanel";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop/Backdrop";
import {skjulNyRammevedtakModal} from "../redux/v2/v2Actions";
import CircularProgress from "@material-ui/core/CircularProgress";
// import {PacmanLoader} from "react-spinners";
// import Modal from 'nav-frontend-modal';
// import {css} from '@emotion/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            padding: theme.spacing(0, 4, 0, 4)
        },
        maingrid: {
            justifyContent: 'center'
        },
        left: {
            display: 'flex',
            flexDirection: 'row',
            // justifyContent: 'center',
            // border: "1px dotted red"
        },
        right: {
            paddingRight: 0
            // padding: theme.spacing(2, 2),
            // border: "1px dotted red"
        },
        colJson: {
            position: 'fixed',
            bottom: '1rem',
            right: '1rem'
        },
        modal: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
    }),
);

// const override = css`
//     display: block;
//     margin: 0 auto;
//     border-color: red;
// `;

interface V3Props {
    v2: V2Model;
    v3: V3State;
    hendelserUpdated: Hendelse[];
}

type Props = DispatchProps & V3Props;

const V3: React.FC<Props> = (props: Props) => {

    const theme = { palette: {type: props.v2.thememode}};
    const muiTheme = createMuiTheme(theme);
    const classes = useStyles();

    return (
        <MuiThemeProvider theme={muiTheme}>
            <CssBaseline />
            <AppBarView />
            <div className={classes.root}>
                <Grid container={true} spacing={6} className={classes.maingrid}>
                    <Grid item sm={2} className={classes.left}>
                        <SoknadsOversiktPanel />
                    </Grid>
                    <Grid item sm={1} className={classes.left}>
                        <br />
                    </Grid>
                    <Grid item sm={9} className={classes.right}>
                        <ToppPanel />
                    </Grid>
                </Grid>
                <Grid container={true} spacing={6} className={classes.maingrid}>
                    <Grid item sm={12} className={classes.right}>
                        <BehandleSoknadPanel />
                    </Grid>
                </Grid>
            </div>

            <SystemSettingsModal />

            {/* FIXME: Ta i bruk denne senere.*/}
            <StatusSnackBarView />

            <div className={classes.colJson}>
                <ReactJsonView json={getFsSoknadByFiksDigisosId(props.v3.soknader,props.v2.aktivSoknad)}/>
            </div>

            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className={classes.modal}
                closeAfterTransition
                // BackdropComponent={Backdrop}
                // BackdropProps={{
                //     timeout: 500,
                // }}
                open={props.v2.loaderOn}
            >
                <CircularProgress />
            </Modal>

            {/*<Modal*/}
            {/*    isOpen={props.v2.loaderOn}*/}
            {/*    contentLabel=""*/}
            {/*    onRequestClose={() => console.warn("aksjdn")}*/}
            {/*    closeButton={false}*/}
            {/*    shouldCloseOnOverlayClick={false}*/}
            {/*    className={"modal-style-override"}*/}
            {/*>*/}
            {/*    <div className="application-spinner">*/}
            {/*        /!*<div style={{padding:'2rem 2.5rem'}}>Innhold her</div>*!/*/}
            {/*        /!*<NavFrontendSpinner type="XXL"/>*!/*/}
            {/*        <div className='sweet-loading pacmanloader'>*/}
            {/*            <PacmanLoader*/}
            {/*                css={override}*/}
            {/*                sizeUnit={"px"}*/}
            {/*                size={50}*/}
            {/*                color={'#000'}*/}
            {/*                loading={props.v2.loaderOn}*/}
            {/*            />*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</Modal>*/}

        </MuiThemeProvider>
    );
};





const mapStateToProps = (state: AppState) => ({
    v2: state.v2,
    v3: state.v3,
    hendelserUpdated: JSON.parse(JSON.stringify(state.v2.fiksDigisosSokerJson.sak.soker.hendelser)) // brukes ikke
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


