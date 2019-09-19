import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, Paper, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import {SoknadsStatusType} from "../../../types/hendelseTypes";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import {setSoknadsStatus} from "../../../redux/v2/v2Actions";
import {Soknad} from "../../../types/additionalTypes";

const useStyles = makeStyles((theme) => {
    return createStyles({
        paper: {
            marginTop: theme.spacing(2),
            padding: theme.spacing(2,2)
        },
        formControl: {
            margin: theme.spacing(3)
        }
    });
});

interface OwnProps {
    soknad: Soknad
}

interface StoreProps {
}

interface State {
    input: string;
}

const initialState: State = {
    input: ''
};

type Props = DispatchProps & OwnProps & StoreProps;


const SoknadStatusView: React.FC<Props> = (props: Props) => {
    const [state, setState] = useState(initialState);
    const classes = useStyles();
    const {dispatch, soknad} = props;

    return (
        <>
            <Paper className={classes.paper}>
                <FormControl component="fieldset" className={classes.formControl}>
                    <FormLabel component="legend">Status på sak</FormLabel>
                    <RadioGroup aria-label="soknadsStatus" name="soknadsStatus1" value={soknad.soknadsStatus}
                                onChange={(event, value) => {
                                    if (
                                        value === SoknadsStatusType.MOTTATT ||
                                        value === SoknadsStatusType.UNDER_BEHANDLING ||
                                        value === SoknadsStatusType.FERDIGBEHANDLET ||
                                        value === SoknadsStatusType.BEHANDLES_IKKE
                                    ){
                                        dispatch(setSoknadsStatus(value as SoknadsStatusType));
                                    }
                                }}
                    >
                        <FormControlLabel value={SoknadsStatusType.MOTTATT} control={<Radio />} label={"Mottatt"} />
                        <FormControlLabel value={SoknadsStatusType.UNDER_BEHANDLING} control={<Radio />} label={"Under behandling"} />
                        <FormControlLabel value={SoknadsStatusType.FERDIGBEHANDLET} control={<Radio />} label={"Ferdigbehandlet"} />
                        <FormControlLabel value={SoknadsStatusType.BEHANDLES_IKKE} control={<Radio />} label={"Behandles ikke"} />
                    </RadioGroup>
                </FormControl>
            </Paper>
        </>
    );
};

const mapStateToProps = (state: AppState) => ({
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SoknadStatusView);
