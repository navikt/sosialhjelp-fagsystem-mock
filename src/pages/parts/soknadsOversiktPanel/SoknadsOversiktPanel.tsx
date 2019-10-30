import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import makeStyles from "@material-ui/core/styles/makeStyles";
import ListItemText from "@material-ui/core/ListItemText";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import {Button, Input, Typography} from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import {FsSoknad} from "../../../redux/v3/v3FsTypes";
import {V2Model} from "../../../redux/v2/v2Types";
import {nyFsSoknad, opprettEllerOppdaterDigisosSakOgSettAktivSak} from "../../../redux/v3/v3Actions";

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
    v2: V2Model
}

type Props = DispatchProps & StoreProps;


const SoknadsOversiktPanel: React.FC<Props> = (props: Props) => {
    const {soknader, aktivSoknad, v2} = props;

    const classes = useStyles();

    const [fiksDigisosId, setFiksDigisosId] = useState("");

    const getSoknadListItems = (soknader: FsSoknad[]): JSX.Element[] => {
        return soknader.map((soknad: FsSoknad) => {
            return (
                <ListItem key={"SoknadItem: " + soknad.navn} selected={ soknad.fiksDigisosId === aktivSoknad} button divider
                          onClick={() => props.dispatch(opprettEllerOppdaterDigisosSakOgSettAktivSak(soknad, v2, v2.backendUrlTypeToUse))}>
                    <ListItemText primary={soknad.navn} />
                </ListItem>
            )
        });
    };



    return (
        <Paper className={classes.paper}>
            <Typography variant="h5" component="h3">
                Søknadvelger
            </Typography>
            <List className={classes.soknadliste} component="nav"  aria-label="mailbox folders">
                { getSoknadListItems(soknader) }
            </List>
            <Input
                onChange={(evt) => {
                    setFiksDigisosId(evt.target.value);
                }}
           />
           <Button onClick={() => {
               props.dispatch(nyFsSoknad(fiksDigisosId, '26104500284', 'Natalie Emberland'))
           }}> Opprett</Button>
        </Paper>
    );
};



const mapStateToProps = (state: AppState) => ({
    soknader: state.v3.soknader,
    aktivSoknad: state.v2.aktivSoknad,
    v2: state.v2
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
