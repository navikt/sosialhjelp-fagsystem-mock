import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import Typography from "@material-ui/core/Typography";
import {SaksStatus, SaksStatusType} from "../../../types/hendelseTypes";
import FormControl from "@material-ui/core/FormControl";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import Box from "@material-ui/core/Box";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {createStyles} from "@material-ui/core";
import SimpleSelect from "../simpleSelect/SimpleSelect";
import {settNySaksStatus} from "../../../redux/v2/v2Actions";

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: theme.spacing(2)
        },
        paper: {
            padding: theme.spacing(2,2),
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center'
        },
        paper2: {
            padding: theme.spacing(2,2),
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            marginLeft: theme.spacing(2)
        },
        box: {
            marginTop: theme.spacing(1),
            padding: theme.spacing(1),
        },
        formControl: {
            margin: theme.spacing(3)
        },
        addbox: {
            margin: theme.spacing(2, 0, 2, 0),
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            color: 'inherit'

        },
        fab: {
            marginRight: theme.spacing(1),
            color: 'inherit'
        },
        horizontalWrapper: {
            display: 'flex',
            flexDirection: 'column'
        },
        horizontalBox: {
            // display: 'inline-block'
        }
    });
});

interface OwnProps {
    idx: number,
    sak: SaksStatus
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


const SaksTabView: React.FC<Props> = (props: Props) => {
    const [state, setState] = useState(initialState);
    const {idx, sak, dispatch}  = props;
    const classes = useStyles();


    return (
        <div>
            <Typography>Tittel: {sak.tittel}. Status: {sak.status}.</Typography>
            Aktiv sak index: {idx}

            <Typography>Status på sak:</Typography>
            <Box className={classes.box}>

                <SimpleSelect
                    onSelect={(value) => {
                        if (value === SaksStatusType.UNDER_BEHANDLING
                            || value === SaksStatusType.BEHANDLES_IKKE
                            || value === SaksStatusType.FEILREGISTRERT
                            || value === SaksStatusType.IKKE_INNSYN
                        ) {
                            dispatch(settNySaksStatus(sak.referanse, value));
                        }
                    }}
                    label={'Saksstatus'}
                    selected={sak.status}
                    values={[
                        {value: SaksStatusType.UNDER_BEHANDLING, label: "Under behandling"},
                        {value: SaksStatusType.IKKE_INNSYN, label: "Ikke innsyn"},
                        {value: SaksStatusType.FEILREGISTRERT, label: "Feilregistrert"},
                        {value: SaksStatusType.BEHANDLES_IKKE, label: "Behandles ikke"}
                    ]}
                />
            </Box>



            <Typography>Vilkår</Typography>

            <Typography>Dokumentasjonskrav</Typography>
            <Typography></Typography>
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
)(SaksTabView);
