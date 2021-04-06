import React, {useState} from 'react';
import { AppState, Dispatch, DispatchProps } from '../../../redux/reduxTypes';
import {connect} from "react-redux";
import makeStyles from "@material-ui/core/styles/makeStyles";
import ListItemText from "@material-ui/core/ListItemText";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import {Button, Typography} from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import {FsSoknad, Model} from "../../../redux/types";
import {
    hentFsSoknadFraFiksEllerOpprettNy,
    setAktivSoknad
} from '../../../redux/actions';
import TextField from "@material-ui/core/TextField";
import {generateRandomId} from "../../../utils/utilityFunctions";
import { FIKSDIGISOSID_URL_PARAM } from '../../../redux/reducer';

const useStyles = makeStyles(theme => ({
    paper: {
        margin: theme.spacing(2, 2, 2, 0),
        padding: theme.spacing(2, 2),
        // width: '100%'
    },
    soknadliste: {
        // padding: theme.spacing(2, 0, 2, 0)
    }
}));

interface StoreProps {
    soknader: FsSoknad[],
    aktivSoknad: string,
    model: Model
}

type Props = DispatchProps & StoreProps;


const onSoknadClick = (dispatch: Dispatch, fiksDigisosId: string) => {
    /*
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set(FIKSDIGISOSID_URL_PARAM, fiksDigisosId.trim());
    window.location.search = urlParams.toString();


    if ('URLSearchParams' in window) {
        const urlParams = new URLSearchParams(window.location.search)
        urlParams.set(FIKSDIGISOSID_URL_PARAM, fiksDigisosId.trim());
        const newRelativePathQuery = window.location.pathname + '?' + urlParams.toString();
        window.history.pushState(null, '', newRelativePathQuery);
    }

     */
    dispatch(setAktivSoknad(fiksDigisosId.trim()))
}

const SoknadsOversiktPanel: React.FC<Props> = (props: Props) => {
    const {soknader, aktivSoknad, model} = props;

    const classes = useStyles();

    const [fiksDigisosId, setFiksDigisosId] = useState("");

    const getSoknadListItems = (soknader: FsSoknad[]): JSX.Element[] => {
        return soknader.map((soknad: FsSoknad, index: number) => {
            return (
                <ListItem id={"soknad_" + index} key={"SoknadItem: " + soknad.fiksDigisosId} selected={soknad.fiksDigisosId === aktivSoknad} button
                          divider
                          onClick={() => onSoknadClick(props.dispatch, soknad.fiksDigisosId)}>
                    <ListItemText primary={soknad.fiksDigisosId}/>
                </ListItem>
            )
        });
    };


    return (
        <Paper className={classes.paper}>
            <Typography variant="h5" component="h3">
                Søknadvelger
            </Typography>
            <List className={classes.soknadliste} component="nav" aria-label="mailbox folders">
                {getSoknadListItems(soknader)}
            </List>
            <TextField
                id='ny_soknad_input'
                label={model.backendUrlTypeToUse === 'devSbs' ? 'DigisosId på søknad' : 'FiksDigisosId'}
                value={fiksDigisosId}
                onChange={(evt) => setFiksDigisosId(evt.target.value)}
                margin="dense"
                autoComplete="off"
            />
            <Button
                id='opprett_ny_soknad_knapp'
                onClick={() => {
                    if (fiksDigisosId.length !== 0 && !model.soknader.find(soknad => soknad.fiksDigisosId === fiksDigisosId)) {
                        hentFsSoknadFraFiksEllerOpprettNy(fiksDigisosId, model.backendUrlTypeToUse, props.dispatch);
                    } else if(fiksDigisosId.length !== 0 && model.soknader.find(soknad => soknad.fiksDigisosId === fiksDigisosId)){
                        props.dispatch(setAktivSoknad(fiksDigisosId));
                    } else {
                        hentFsSoknadFraFiksEllerOpprettNy(generateRandomId(11), model.backendUrlTypeToUse, props.dispatch);
                    }
                    setFiksDigisosId('');
                }}
            >
                Hent / Opprett
            </Button>
        </Paper>
    );
};


const mapStateToProps = (state: AppState) => ({
    soknader: state.model.soknader,
    aktivSoknad: state.model.aktivSoknad,
    model: state.model
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
