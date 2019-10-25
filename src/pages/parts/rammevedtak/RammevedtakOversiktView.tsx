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
import {Paper} from "@material-ui/core";
import {setAktivtRammevedtak, visNyRammevedtakModal} from "../../../redux/v2/v2Actions";
import RammevedtakTabView from "./RammevedtakTabView";
import {Rammevedtak} from "../../../types/hendelseTypes";


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
    rammevedtakListe: Rammevedtak[]
}

type Props = DispatchProps & OwnProps;


const RammevedtakOversiktView: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const theme = useTheme();
    const {rammevedtakListe, dispatch} = props;
    const [aktivtRammevedtakIdx, setAktivtRammevedtakIdx] = useState(0);

    const addNyttRammevedtakButton = () => {
        return (
            <Box className={classes.addbox}>
                <Typography>
                    <Fab aria-label="add" className={classes.fab} color="primary" onClick={() => {
                        dispatch(setAktivtRammevedtak(null));
                        dispatch(visNyRammevedtakModal());
                    }}>
                        <AddIcon/>
                    </Fab>
                    Nytt rammevedtak
                </Typography>
            </Box>
        )
    };

    const insertRammevedtakOversikt = () => {

        if (rammevedtakListe.length > 0){
            const listTabs = rammevedtakListe.map((rammevedtak: Rammevedtak, idx) => {
                return (
                    <Tab key={"tab: " + rammevedtak.rammevedtaksreferanse} label={"Rammevedtak " + (idx + 1)} />
                )
            });
            const listTabPanels = rammevedtakListe.map((rammevedtak: Rammevedtak, idx) => {
                return(
                    <TabPanel key={"tabPanel: " + rammevedtak.rammevedtaksreferanse} value={aktivtRammevedtakIdx} index={idx} dir={theme.direction}>
                        <RammevedtakTabView rammevedtak={rammevedtak} />
                    </TabPanel>
                )
            });
            return (
                <>
                    <AppBar position="static" color="default">
                        <Tabs
                            value={aktivtRammevedtakIdx}
                            onChange={(event: unknown, newValue: number) => setAktivtRammevedtakIdx(newValue)}
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
                        index={aktivtRammevedtakIdx}
                        onChangeIndex={(newValue: number) => setAktivtRammevedtakIdx(newValue)}
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
                        Ingen rammevedtak er opprettet for denne søknaden ennå.
                    </Typography>
                </>
            )
        }
    };


    return (
        <div>
            {addNyttRammevedtakButton()}

            { insertRammevedtakOversikt() }
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
)(RammevedtakOversiktView);
