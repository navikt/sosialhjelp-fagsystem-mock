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
import {visNyDokumentasjonkravModal} from "../../../redux/v2/v2Actions";
import {FsSoknad} from "../../../redux/v3/v3FsTypes";
import DokumentasjonkravTabView from "./DokumentasjonkravTabView";
import {Dokumentasjonkrav} from "../../../types/hendelseTypes";
import NyttDokumentasjonkravModal from "./NyttDokumentasjonkravModal";


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
    soknad: FsSoknad
}

type Props = DispatchProps & OwnProps;


const DokumentasjonkravOversiktView: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const theme = useTheme();
    const {soknad, dispatch} = props;
    const [aktivtDokumentasjonkravIdx, setAktivtDokumentasjonkravIdx] = useState(0);

    const addNyttDokumentasjonkravButton = () => {
        return (
            <Box className={classes.addbox}>
                <Typography>
                    <Fab aria-label="add" className={classes.fab} color="primary" onClick={() => {
                        dispatch(visNyDokumentasjonkravModal());
                    }}>
                        <AddIcon/>
                    </Fab>
                    Nytt dokumentasjonkrav
                </Typography>
            </Box>
        )
    };

    const insertDokumentasjonkravOversikt = () => {

        if (soknad.dokumentasjonkrav.length > 0){
            const listTabs = soknad.dokumentasjonkrav.map((dokumentasjonkrav: Dokumentasjonkrav, idx) => {
                return (
                    <Tab key={"tab: " + dokumentasjonkrav.dokumentasjonkravreferanse} label={"Dokumentasjonkrav " + (idx + 1)} />
                )
            });
            const listTabPanels = soknad.dokumentasjonkrav.map((dokumentasjonkrav: Dokumentasjonkrav, idx) => {
                return(
                    <TabPanel key={"tabPanel: " + dokumentasjonkrav.dokumentasjonkravreferanse} value={aktivtDokumentasjonkravIdx} index={idx} dir={theme.direction}>
                        <DokumentasjonkravTabView dokumentasjonkrav={dokumentasjonkrav} />
                    </TabPanel>
                )
            });
            return (
                <>
                    <AppBar position="static" color="default">
                        <Tabs
                            value={aktivtDokumentasjonkravIdx}
                            onChange={(event: unknown, newValue: number) => setAktivtDokumentasjonkravIdx(newValue)}
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
                        index={aktivtDokumentasjonkravIdx}
                        onChangeIndex={(newValue: number) => setAktivtDokumentasjonkravIdx(newValue)}
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
                        Ingen dokumentasjonkrav er opprettet for denne søknaden ennå.
                    </Typography>
                </>
            )
        }
    };


    return (
        <div className={classes.root}>
            <Paper className={classes.paper}>
                <Typography variant={"h5"}>Dokumentasjonkrav</Typography>
                {addNyttDokumentasjonkravButton()}

                { insertDokumentasjonkravOversikt() }
                <NyttDokumentasjonkravModal soknad={soknad}/>
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
)(DokumentasjonkravOversiktView);
