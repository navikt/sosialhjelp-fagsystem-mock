import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {makeStyles} from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import {aiuuur, oppdaterNavKontor} from "../../../redux/v3/v3Actions";
import Hendelse, {HendelseType, TildeltNavKontor} from "../../../types/hendelseTypes";
import {getNow} from "../../../utils/utilityFunctions";
import {V2Model} from "../../../redux/v2/v2Types";
import {oHendelser} from "../../../redux/v3/v3Optics";
import {FsSoknad} from "../../../redux/v3/v3FsTypes";


const useStyles = makeStyles(theme => ({
    root: {
        display: 'inline',
        position: 'relative',
        top: '-25px'
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));

interface OwnProps {
    soknad: FsSoknad
}

interface StoreProps {
    v2: V2Model
}

type Props = DispatchProps & OwnProps & StoreProps;


const EndreNavKontorModal: React.FC<Props> = (props: Props) => {
    const [navKontor, setNavKontor] = useState('');
    const classes = useStyles();
    const {dispatch, soknad} = props;


    return (
        <form className={classes.root} autoComplete="off">
            <FormControl className={classes.formControl}>
                <InputLabel htmlFor="age-simple">Navkontor</InputLabel>
                <Select
                    value={navKontor}
                    onChange={(evt) => {
                        let navKontorEnhetsNr = evt.target.value as string;
                        setNavKontor(navKontorEnhetsNr);

                        const nyHendelse: TildeltNavKontor = {
                            type: HendelseType.TildeltNavKontor,
                            hendelsestidspunkt: getNow(),
                            navKontor: navKontorEnhetsNr
                        };

                        const soknadUpdated = oHendelser.modify((a: Hendelse[]) => [...a, nyHendelse])(soknad);

                        dispatch(
                            aiuuur(
                                soknad.fiksDigisosId,
                                soknadUpdated.fiksDigisosSokerJson,
                                props.v2,
                                oppdaterNavKontor(soknad.fiksDigisosId, nyHendelse)
                            )
                        )
                    }}
                    inputProps={{
                        name: 'tildeltNavKontor',
                        id: 'age-simple',
                    }}
                >
                    <MenuItem value={"1209"}>NAV Bergenhus</MenuItem>
                    <MenuItem value={"1208"}>NAV Årstad</MenuItem>
                    <MenuItem value={"0315"}>NAV Grünerløkka</MenuItem>
                </Select>
            </FormControl>
        </form>
    );
};

const mapStateToProps = (state: AppState) => ({
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
)(EndreNavKontorModal);
