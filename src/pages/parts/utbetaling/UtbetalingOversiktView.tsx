import React, {useState} from 'react';
import {DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import SwipeableViews from 'react-swipeable-views';
import {createStyles, makeStyles, Theme, useTheme} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Box from '@material-ui/core/Box';
import {setAktivUtbetaling, visNyUtbetalingModal} from "../../../redux/actions";
import UtbetalingTabView from "./UtbetalingTabView";
import {Utbetaling} from "../../../types/hendelseTypes";


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
            <Box p={0.5}>{children}</Box>
        </Typography>
    );
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            backgroundColor: theme.palette.background.paper,
            position: 'relative',
        },
        fab: {
            marginRight: theme.spacing(1),
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


interface OwnProps {
    utbetalingListe: Utbetaling[],
    saksreferanse: string|null
}

type Props = DispatchProps & OwnProps;


const UtbetalingOversiktView: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const theme = useTheme();
    const {utbetalingListe, dispatch, saksreferanse} = props;
    const [aktivUtbetalingIdx, setAktivUtbetalingIdx] = useState(0);
    const [antallUtbetalinger, setAntallUtbetalinger] = useState(0);

    if (antallUtbetalinger !== utbetalingListe.length) {
        if (antallUtbetalinger < utbetalingListe.length) {
            setAktivUtbetalingIdx(utbetalingListe.length - 1);
        }
        setAntallUtbetalinger(utbetalingListe.length);
    }

    const listTabs = utbetalingListe.map((utbetaling: Utbetaling, idx) => {
        return (
            <Tab key={"tab: " + utbetaling.utbetalingsreferanse} label={"Utbetaling " + (idx + 1)} />
        )
    });
    const listTabPanels = utbetalingListe.map((utbetaling: Utbetaling, idx) => {
        return(
            <TabPanel key={"tabPanel: " + utbetaling.utbetalingsreferanse}
                      value={aktivUtbetalingIdx < utbetalingListe.length ? aktivUtbetalingIdx : utbetalingListe.length - 1}
                      index={idx} dir={theme.direction}>
                <UtbetalingTabView utbetaling={utbetaling} />
            </TabPanel>
        )
    });

    return (
        <div>
            <Box className={classes.addbox}>
                <Typography>
                    <Fab aria-label="add" className={classes.fab} color="primary" onClick={() => {
                        dispatch(setAktivUtbetaling(null));
                        dispatch(visNyUtbetalingModal(saksreferanse));
                    }}>
                        <AddIcon/>
                    </Fab>
                    Ny utbetaling
                </Typography>
            </Box>

            {(utbetalingListe.length > 0) &&
            <>
                <AppBar position="static" color="default">
                    <Tabs
                        value={aktivUtbetalingIdx < utbetalingListe.length ? aktivUtbetalingIdx : utbetalingListe.length - 1}
                        onChange={(event: unknown, newValue: number) => setAktivUtbetalingIdx(newValue)}
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
                    index={aktivUtbetalingIdx < utbetalingListe.length ? aktivUtbetalingIdx : utbetalingListe.length - 1}
                    onChangeIndex={(newValue: number) => setAktivUtbetalingIdx(newValue)}
                >
                    { listTabPanels}
                </SwipeableViews>
            </>}
        </div>
    );
};

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapDispatchToProps
)(UtbetalingOversiktView);
