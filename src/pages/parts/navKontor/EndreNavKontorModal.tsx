import React from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {makeStyles} from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import {aiuuur, oppdaterNavKontor, zeruuus} from "../../../redux/actions";
import Hendelse, {HendelseType, TildeltNavKontor} from "../../../types/hendelseTypes";
import {getNow} from "../../../utils/utilityFunctions";
import {Model} from "../../../redux/types";
import {oHendelser} from "../../../redux/optics";
import {FsSoknad} from "../../../redux/types";
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
    model: Model
}

type Props = DispatchProps & OwnProps & StoreProps;


const EndreNavKontorModal: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const {dispatch, soknad, model} = props;

    const navKontor0: NavKontor = {
        id: '1208',
        name: "NAV Årstad"
    };
    const navKontor1: NavKontor = {
        id: '1209',
        name: "NAV Bergenhus"
    };
    const navKontor2: NavKontor = {
        id: '1210',
        name: "NAV Ytrebygda"
    };
    const navKontorListe = [navKontor0, navKontor1, navKontor2];

    const getNavkontorFromId = (id: string|null) => {
        if (id == null) {
            return '';
        }
        const navKontoret = navKontorListe.filter(navkontor => navkontor.id === id);
        if (navKontoret.length === 0) {
            return '';
        } else {
            return navKontoret[0].id;
        }
    };

    const menuItems = navKontorListe.map((navKontor: NavKontor) => {
        return (<MenuItem key={"navKontorItem: " + navKontor.id} value={navKontor.id}>{navKontor.name}</MenuItem>)
    });

    return (
        <form className={classes.root} autoComplete="off">
            <FormControl className={classes.formControl}>
                <InputLabel htmlFor="age-simple">Navkontor</InputLabel>
                <Select
                    value={getNavkontorFromId(soknad.navKontor ? soknad.navKontor.navKontor : null)}
                    onChange={(evt) => {
                        let navKontorEnhetsNr = evt.target.value as string;

                        const nyHendelse: TildeltNavKontor = {
                            type: HendelseType.TildeltNavKontor,
                            hendelsestidspunkt: getNow(),
                            navKontor: navKontorEnhetsNr.toString()
                        };

                        const soknadUpdated = oHendelser.modify((a: Hendelse[]) => [...a, nyHendelse])(soknad);
                        if (model.backendUrlTypeToUse !== 'q0' && model.backendUrlTypeToUse !== 'q1') {
                            dispatch(zeruuus(navKontorListe, model));
                        }

                        dispatch(
                            aiuuur(
                                soknad.fiksDigisosId,
                                soknadUpdated.fiksDigisosSokerJson,
                                props.model,
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
)(EndreNavKontorModal);
