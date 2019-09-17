import React, {useState} from 'react';
import {V2Model} from "../../../redux/v2/v2Types";
import Hendelse from "../../../types/hendelseTypes";
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import makeStyles from "@material-ui/core/styles/makeStyles";
import ListItemText from "@material-ui/core/ListItemText";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import {soknadMockData} from "./soknadsoversikt-mockdata";
import {Soknad} from "../../../types/additionalTypes";
import {Typography} from "@material-ui/core";
import Paper from "@material-ui/core/Paper";

const soknaderMockData: Soknad[] = soknadMockData.map(s => s);

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        maxWidth: 360,
        // color: 'white',
        // backgroundColor: 'white',
    },
    card: {
        padding: theme.spacing(3, 2)
    }
}));

interface SoknadsOversiktPanelProps {
    v2: V2Model
    hendelserUpdated: Hendelse[]
}

interface SoknadsOversiktPanelState {
    input: string;
}

const initialState: SoknadsOversiktPanelState = {
    input: ''
};


type Props = DispatchProps & SoknadsOversiktPanelProps;
type State = SoknadsOversiktPanelState;


const SoknadsOversiktPanel: React.FC<Props> = (props: Props) => {
    const [state, setState] = useState(initialState);

    const classes = useStyles();



    return (
        <div>
            <Paper className={classes.card}>
                <Typography variant="h5" component="h3">
                    Inboks
                </Typography>
                <Typography component="p">
                    Oversikt over søknader i systemet
                </Typography>
            </Paper>
            <List component="nav"  aria-label="mailbox folders">
                { getSoknadListItems(soknaderMockData) }
            </List>
        </div>
    );
};

const getSoknadListItems = (soknader: Soknad[]): JSX.Element[] => {
    return soknader.map((soknad: Soknad) => {
        return (
            <ListItem button divider>
                <ListItemText primary={soknad.name} />
            </ListItem>

        )
    });
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
)(SoknadsOversiktPanel);
