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
import {visNyVilkarModal} from "../../../redux/actions";
import {FsSoknad} from "../../../redux/types";
import VilkarTabView from "./VilkarTabView";
import {Vilkar} from "../../../types/hendelseTypes";


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
            position: 'relative',
        },
        fab: {
            marginRight: theme.spacing(1),
        },
        paper: {
            padding: theme.spacing(2, 2),
            marginTop: theme.spacing(2),
            backgroundColor: theme.palette.background.paper
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
    soknad: FsSoknad
}

type Props = DispatchProps & OwnProps;


const VilkarOversiktView: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const theme = useTheme();
    const {soknad, dispatch} = props;
    const [aktivtVilkarIdx, setAktivtVilkarIdx] = useState(0);
    const [antallVilkar, setAntallVilkar] = useState(0);

    if (antallVilkar !== soknad.vilkar.length) {
        setAktivtVilkarIdx(soknad.vilkar.length - 1);
        setAntallVilkar(soknad.vilkar.length);
    }

    const listTabs = soknad.vilkar.map((vilkar: Vilkar, idx) => {
        return (
            <Tab key={"tab: " + vilkar.vilkarreferanse} label={"Vilkår " + (idx + 1)} />
        )
    });
    const listTabPanels = soknad.vilkar.map((vilkar: Vilkar, idx) => {
        return(
            <TabPanel key={"tabPanel: " + vilkar.vilkarreferanse} value={aktivtVilkarIdx} index={idx} dir={theme.direction}>
                <VilkarTabView vilkar={vilkar} />
            </TabPanel>
        )
    });

    return (
        <div className={classes.root}>
            <Paper className={classes.paper}>
                <Typography variant={"h5"}>Vilkår</Typography>
                <Box className={classes.addbox}>
                    <Typography>
                        <Fab aria-label="add" className={classes.fab} color="primary" onClick={() => {
                            dispatch(visNyVilkarModal());
                        }}>
                            <AddIcon/>
                        </Fab>
                        Nytt vilkår
                    </Typography>
                </Box>

                {(soknad.vilkar.length > 0) &&
                <>
                    <AppBar position="static" color="default">
                        <Tabs
                            value={aktivtVilkarIdx}
                            onChange={(event: unknown, newValue: number) => setAktivtVilkarIdx(newValue)}
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
                        index={aktivtVilkarIdx}
                        onChangeIndex={(newValue: number) => setAktivtVilkarIdx(newValue)}
                    >
                        { listTabPanels}
                    </SwipeableViews>
                </>
                }
            </Paper>
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
)(VilkarOversiktView);
