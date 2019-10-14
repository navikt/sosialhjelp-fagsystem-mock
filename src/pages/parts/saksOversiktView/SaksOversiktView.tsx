import React from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import SwipeableViews from 'react-swipeable-views';
import {createStyles, makeStyles, Theme, useTheme} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import {green} from '@material-ui/core/colors';
import Box from '@material-ui/core/Box';
import {Paper} from "@material-ui/core";
import {setAktivSak, visNySakModal} from "../../../redux/v2/v2Actions";
import NySakModal from "../nySak/NySak";
import SaksTabView from "./SaksTabView";
import {FsSaksStatus, FsSoknad} from "../../../redux/v3/v3FsTypes";
import NyUtbetalingModal from "../utbetaling/NyUtbetaling";


interface TabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: any;
    value: any;
}

function TabPanel(props: TabPanelProps) {
    const {children, value, index, ...other} = props;

    return (
        <Typography
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`action-tabpanel-${index}`}
            aria-labelledby={`action-tab-${index}`}
            {...other}
        >
            <Box p={3}>{children}</Box>
        </Typography>
    );
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            backgroundColor: theme.palette.background.paper,
            // width: 500,
            position: 'relative',
            minHeight: 200,
        },
        fab: {
            marginRight: theme.spacing(1),
            // position: 'absolute',
            // bottom: theme.spacing(5),
            // top: theme.spacing(2),
            // marginBottom: theme.spacing(4),
            // right: theme.spacing(2),
        },
        fabGreen: {
            color: theme.palette.common.white,
            backgroundColor: green[500],
            '&:hover': {
                backgroundColor: green[600],
            },
        },
        paper: {
            padding: theme.spacing(2, 2),
            marginTop: theme.spacing(2)

        },
        addbox: {
            margin: theme.spacing(2, 0, 2, 0),
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center'
        }
    }),
);


interface StoreProps {
    aktivSakIndex: number | undefined;
}

interface OwnProps {
    soknad: FsSoknad
}

type Props = DispatchProps & StoreProps & OwnProps;


const SaksOversiktView: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const theme = useTheme();
    const {soknad, dispatch, aktivSakIndex} = props;

    function handleChange(event: unknown, newValue: number) {
        dispatch(setAktivSak(newValue));
    }

    function handleChangeIndex(index: number) {
        dispatch(setAktivSak(index));
    }

    const addNySakButton = () => {
        return (
            <Box className={classes.addbox}>
                <Fab aria-label='Add' className={classes.fab} color='primary' onClick={() => dispatch(visNySakModal())}>
                    <AddIcon/>
                </Fab>
                <Typography>
                    Opprett sak
                </Typography>
            </Box>
        )
    };

    const insertSaksOversikt = () => {

        if (soknad.saker.length > 0){
            const listTabs = soknad.saker.map((sak: FsSaksStatus) => {
                return (
                    <Tab key={"tab: " + sak.referanse} label={sak.tittel} />
                )
            });
            const listTabPanels = soknad.saker.map((sak: FsSaksStatus, idx) => {
                return(
                    <TabPanel key={"tabPanel: " + sak.referanse} value={aktivSakIndex} index={idx} dir={theme.direction}>
                        <SaksTabView idx={idx} sak={sak} soknad={soknad} />
                    </TabPanel>
                )
            });
            return (
                <>
                    <AppBar position="static" color="default">
                        <Tabs
                            value={aktivSakIndex}
                            onChange={handleChange}
                            indicatorColor="primary"
                            textColor="primary"
                            variant="fullWidth"
                            aria-label="action tabs example"
                        >
                            { listTabs }
                        </Tabs>
                    </AppBar>
                    <SwipeableViews
                        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                        index={aktivSakIndex}
                        onChangeIndex={handleChangeIndex}
                    >
                        { listTabPanels}
                    </SwipeableViews>
                </>
            );
        } else {
            return (
                <>
                    <br/>
                    <Typography variant={"subtitle1"}>
                        Ingen saker er opprettet for denne søknaden ennå. Opprett en eller flere saker for å kunne gå videre med å behandle søknaden.
                    </Typography>
                </>
            )
        }
    };


    return (
        <div className={classes.root}>
            <Paper className={classes.paper}>
                <Typography variant={"h5"}>
                    Saksoversikt:
                </Typography>
                { addNySakButton() }

                { insertSaksOversikt() }
                <NySakModal />
                {(soknad.saker.length > 0) && <NyUtbetalingModal soknad={soknad}/>
                }
            </Paper>
        </div>
    );
};

const mapStateToProps = (state: AppState) => ({
    aktivSakIndex: state.v2.aktivSakIndex
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SaksOversiktView);
