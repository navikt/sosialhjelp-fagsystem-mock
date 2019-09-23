import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {Soknad} from "../../../types/additionalTypes";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {Build, Edit} from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import EndreNavKontorModal from "./EndreNavKontorModal";
import {visEndreNavKontorModal} from "../../../redux/v2/v2Actions";
import ReactJsonView from "../reactJsonView/ReactJsonView";

const useStyle = makeStyles((theme) => {
    return {
        paper: {
            padding: theme.spacing(2, 2),
            marginTop: theme.spacing(2),
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between'
        },
        col: {

        },
        colJson: {
            marginTop: theme.spacing(2)
        }
    }
});

interface StoreProps {

}

interface OwnProps {
    soknad: Soknad
}

interface State {
    input: string;
}

const initialState: State = {
    input: ''
};

type Props = DispatchProps & OwnProps & StoreProps;


const SoknadOversiktView: React.FC<Props> = (props: Props) => {
    const [state, setState] = useState(initialState);

    const classes = useStyle();
    const {soknad, dispatch} = props;

    return (
        <Paper className={classes.paper}>
            <div className={classes.col}>
                <Typography variant={"h5"} component={"h3"}>
                    Oversikt over søknaden
                </Typography>
                <Typography variant={"subtitle1"}>
                    Navn på søker: {soknad.name}
                </Typography>
                <Typography variant={"subtitle1"}>
                    Behandles av: {soknad.navKontor.name}
                    <IconButton color="inherit" aria-label="menu" onClick={() => dispatch(visEndreNavKontorModal())}>
                        <Edit />
                    </IconButton>
                </Typography>
                <EndreNavKontorModal />
            </div>
            <div className={classes.colJson}>
                <ReactJsonView json={soknad.fiksDigisosSokerJson}/>
            </div>
        </Paper>
    );
};

const mapStateToProps = (state: AppState) => ({});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SoknadOversiktView);
