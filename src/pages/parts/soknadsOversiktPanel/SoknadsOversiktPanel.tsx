import React, {useState} from 'react';
import {V2Model} from "../../../redux/v2/v2Types";
import Hendelse from "../../../types/hendelseTypes";
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {Box} from "@material-ui/core";
import Container from "@material-ui/core/Container";
import makeStyles from "@material-ui/core/styles/makeStyles";
import ListItemText from "@material-ui/core/ListItemText";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        maxWidth: 360,
        color: 'white',
        backgroundColor: 'black',
    },
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
        <div className={"soknads-oversikt-panel-wrapper"}>
            SoknadsOversiktPanel
            <Box color="primary.main">
                <Container className={"dark-container"}>
                    <List component="nav" className={classes.root} aria-label="mailbox folders">
                        <ListItem button>
                            <ListItemText primary="Inbox" />
                        </ListItem>
                        <Divider />
                        <ListItem button divider>
                            <ListItemText primary="Drafts" />
                        </ListItem>
                        <ListItem button>
                            <ListItemText primary="Trash" />
                        </ListItem>
                        <Divider light />
                        <ListItem button>
                            <ListItemText primary="Spam" />
                        </ListItem>
                    </List>
                </Container>
            </Box>
        </div>
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
)(SoknadsOversiktPanel);
