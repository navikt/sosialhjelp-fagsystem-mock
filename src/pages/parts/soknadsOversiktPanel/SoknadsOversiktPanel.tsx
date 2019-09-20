import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import makeStyles from "@material-ui/core/styles/makeStyles";
import ListItemText from "@material-ui/core/ListItemText";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import {Soknad} from "../../../types/additionalTypes";
import {Typography} from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import {setAktivSoknad} from "../../../redux/v2/v2Actions";

const useStyles = makeStyles(theme => ({
    paper: {
        margin: theme.spacing(2),
        padding: theme.spacing(3, 2),
    },
    soknadliste: {
        padding: theme.spacing(4, 0, 2, 0)
    }
}));

interface StoreProps {
    soknader: Soknad[],
    aktivSoknad: string
}

interface State {
    input: string;
}

const initialState: State = {
    input: ''
};


type Props = DispatchProps & StoreProps;


const SoknadsOversiktPanel: React.FC<Props> = (props: Props) => {
    const [state, setState] = useState(initialState);
    const {soknader, aktivSoknad} = props;

    const classes = useStyles();

    const getSoknadListItems = (soknader: Soknad[]): JSX.Element[] => {
        return soknader.map((soknad: Soknad) => {
            return (
                <ListItem selected={ soknad.fiksDigisosId === aktivSoknad} button divider onClick={() => props.dispatch(setAktivSoknad(soknad.fiksDigisosId))}>
                    <ListItemText primary={soknad.name} />
                </ListItem>
            )
        });
    };



    return (
        <Paper className={classes.paper}>
            <Typography variant="h5" component="h3">
                Inboks
            </Typography>
            <Typography component="p">
                Oversikt over søknader i systemet
            </Typography>
            <List className={classes.soknadliste} component="nav"  aria-label="mailbox folders">
                { getSoknadListItems(soknader) }
            </List>
        </Paper>
    );
};



const mapStateToProps = (state: AppState) => ({
    soknader: state.v2.soknader,
    aktivSoknad: state.v2.aktivSoknad
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
