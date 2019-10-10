import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {makeStyles} from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import {aiuuur, oppdaterNavKontor, zeruuus} from "../../../redux/v3/v3Actions";
import Hendelse, {HendelseType, TildeltNavKontor} from "../../../types/hendelseTypes";
import {getNow} from "../../../utils/utilityFunctions";
import {V2Model} from "../../../redux/v2/v2Types";
import {oHendelser} from "../../../redux/v3/v3Optics";
import {FsSoknad} from "../../../redux/v3/v3FsTypes";
import {NavKontor} from "../../../types/additionalTypes";


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
    const {dispatch, soknad, v2} = props;

    const navKontor0: NavKontor = {
        id: 1208,
        name: "NAV Årstad"
    };
    const navKontor1: NavKontor = {
        id: 1209,
        name: "NAV Bergenhus"
    };
    const navKontor2: NavKontor = {
        id: 1210,
        name: "NAV Ytrebygda"
    };
    const navKontorListe = [navKontor0, navKontor1, navKontor2];

    const menuItems = navKontorListe.map((navKontor: NavKontor) => {
        return (<MenuItem value={navKontor.id}>{navKontor.name}</MenuItem>)
    });

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
                        if (v2.backendUrlTypeToUse != 'q') {
                            dispatch(zeruuus(navKontorListe, v2));
                        }

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
                    {menuItems}
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
