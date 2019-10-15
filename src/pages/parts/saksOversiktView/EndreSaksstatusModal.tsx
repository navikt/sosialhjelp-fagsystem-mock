import React from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {makeStyles} from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import {aiuuur, oppdaterFsSaksStatus} from "../../../redux/v3/v3Actions";
import Hendelse, {HendelseType, SaksStatus, SaksStatusType} from "../../../types/hendelseTypes";
import {getNow} from "../../../utils/utilityFunctions";
import {V2Model} from "../../../redux/v2/v2Types";
import {oHendelser} from "../../../redux/v3/v3Optics";
import {FsSaksStatus, FsSoknad} from "../../../redux/v3/v3FsTypes";


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
    soknad: FsSoknad,
    sak: FsSaksStatus
}

interface StoreProps {
    v2: V2Model
}

type Props = DispatchProps & OwnProps & StoreProps;


const EndreSaksstatusModal: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const {dispatch, soknad, v2, sak} = props;

    return (
        <form className={classes.root} autoComplete="off">
            <FormControl className={classes.formControl}>
                <InputLabel htmlFor="age-simple">Saksstatus</InputLabel>
                <Select
                    value={sak.status ? sak.status : ''}
                    onChange={(evt) => {
                        let value = evt.target.value;
                        if (value === SaksStatusType.UNDER_BEHANDLING
                            || value === SaksStatusType.BEHANDLES_IKKE
                            || value === SaksStatusType.FEILREGISTRERT
                            || value === SaksStatusType.IKKE_INNSYN
                        ) {

                            const nyHendelse: SaksStatus = {
                                type: HendelseType.SaksStatus,
                                hendelsestidspunkt: getNow(),
                                referanse: sak.referanse,
                                tittel: sak.tittel,
                                status: value
                            };
                            const soknadUpdated = oHendelser.modify((a: Hendelse[]) => [...a, nyHendelse])(soknad);

                            dispatch(
                                aiuuur(
                                    v2.aktivSoknad,
                                    soknadUpdated.fiksDigisosSokerJson,
                                    v2,
                                    oppdaterFsSaksStatus(
                                        v2.aktivSoknad,
                                        nyHendelse
                                    )
                                )
                            )
                        }
                    }}
                    inputProps={{
                        name: 'saksstatusSelect',
                        id: 'age-simple',
                    }}
                >
                    <MenuItem key={"saksstatusSelect: 0"} value={SaksStatusType.UNDER_BEHANDLING}>Under behandling</MenuItem>
                    <MenuItem key={"saksstatusSelect: 1"} value={SaksStatusType.IKKE_INNSYN}>Ikke innsyn</MenuItem>
                    <MenuItem key={"saksstatusSelect: 2"} value={SaksStatusType.FEILREGISTRERT}>Feilregistrert</MenuItem>
                    <MenuItem key={"saksstatusSelect: 3"} value={SaksStatusType.BEHANDLES_IKKE}>Behandles ikke</MenuItem>
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
)(EndreSaksstatusModal);
