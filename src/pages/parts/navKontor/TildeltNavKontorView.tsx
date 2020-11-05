import React from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import Typography from "@material-ui/core/Typography";
import {FsSoknad, Model} from "../../../redux/types";
import {makeStyles} from "@material-ui/core";
import {NavKontor} from "../../../types/additionalTypes";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import {HendelseType, TildeltNavKontor} from "../../../types/hendelseTypes";
import {getNow} from "../../../utils/utilityFunctions";
import {sendNyHendelseOgOppdaterModel, oppdaterNavKontor, sendValgbareNavkontorTilMockBackend} from "../../../redux/actions";


interface OwnProps {
    soknad: FsSoknad
}

interface StoreProps {
    model: Model
}

const useStyles = makeStyles(theme => ({
    root: {
        display: 'inline',
        position: 'relative'
    },
    typography: {
        top: '25px'
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));

type Props = DispatchProps & OwnProps & StoreProps;


const TildeldeltNavkontorView: React.FC<Props> = (props: Props) => {
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
        <div className={classes.root}>
            <Typography variant={"subtitle1"} className={classes.typography}>
                Tildel navkontor:
            </Typography>
            <form autoComplete="off">
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

                            if (model.backendUrlTypeToUse !== 'q1') {
                                sendValgbareNavkontorTilMockBackend(navKontorListe, model, dispatch);
                            }

                            sendNyHendelseOgOppdaterModel(nyHendelse, model, dispatch, oppdaterNavKontor(soknad.fiksDigisosId, nyHendelse));
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
        </div>
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
)(TildeldeltNavkontorView);
