import React, {useState} from 'react';
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
import {visNyVilkarModal} from "../../../redux/v2/v2Actions";
import {FsSoknad} from "../../../redux/v3/v3FsTypes";
import VilkarTabView from "./VilkarTabView";
import {Vilkar} from "../../../types/hendelseTypes";
import NyttVilkarModal from "./NyttVilkarModal";


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


const VilkarOgDokumentasjonskravOversiktView: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const theme = useTheme();
    const {soknad, dispatch, aktivSakIndex} = props;
    const [aktivtVilkarIdx, setAktivtVilkarIdx] = useState(0);

    const addNyttVilkarButton = () => {
        return (
            <Box className={classes.addbox}>
                <Typography>
                    <Fab aria-label="add" className={classes.fab} color="primary" onClick={() => {
                        dispatch(visNyVilkarModal());
                    }}>
                        <AddIcon/>
                    </Fab>
                    Nytt Vilkar
                </Typography>
            </Box>
        )
    };

    const insertVilkarOversikt = () => {

        if (soknad.vilkar.length > 0){
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
            );
        } else {
            return (
                <>
                    <br/>
                    <Typography variant={"subtitle1"}>
                        Ingen vilkår er opprettet for denne søknaden ennå.
                    </Typography>
                </>
            )
        }
    };


    return (
        <div className={classes.root}>
            <Paper className={classes.paper}>
                <Typography variant={"h5"}>Vilkår</Typography>
                {addNyttVilkarButton()}

                { insertVilkarOversikt() }
                <NyttVilkarModal soknad={soknad}/>
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
)(VilkarOgDokumentasjonskravOversiktView);