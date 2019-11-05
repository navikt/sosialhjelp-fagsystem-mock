import React, {useRef, useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {makeStyles} from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import {aiuuur, oppdaterVedtakFattet, tarsoniiis} from "../../../redux/v3/v3Actions";
import Hendelse, {HendelseType, Utfall, VedtakFattet} from "../../../types/hendelseTypes";
import {getNow} from "../../../utils/utilityFunctions";
import {V2Model} from "../../../redux/v2/v2Types";
import {oHendelser} from "../../../redux/v3/v3Optics";
import {FsSaksStatus, FsSoknad} from "../../../redux/v3/v3FsTypes";
import Box from "@material-ui/core/Box";
import Fab from "@material-ui/core/Fab";
import AddIcon from '@material-ui/icons/Add';
import Typography from "@material-ui/core/Typography";


const useStyles = makeStyles(theme => ({
    root: {
        display: 'inline',
        position: 'relative',
        top: '-5px'
    },
    formControl: {
        '@media (min-width: 860px)': {
            minWidth: 120,
        },
        '@media (max-width: 859px)': {
            minWidth: 40,
        },
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
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
        marginLeft: theme.spacing(2)
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


const VedtakFattetModal: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const [vedtakFattetUtfall, setVedtakFattetUtfall] = useState<Utfall|null>(null);
    const {dispatch, soknad, v2, sak} = props;
    const filreferanselager = v2.filreferanselager;
    const inputEl = useRef<HTMLInputElement>(null);

    const handleFileUpload = (files: FileList) => {
        if (files.length !== 1) {
            return;
        }
        const formData = new FormData();
        formData.append("file", files[0], files[0].name);

        dispatch(tarsoniiis(soknad.fiksDigisosId, formData, vedtakFattetUtfall, sak.referanse, v2, soknad));
    };

    return (
        <Box className={classes.addbox}>
            <form className={classes.root} autoComplete="off">
                <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="age-simple">Utfall</InputLabel>
                    <Select
                        value={vedtakFattetUtfall ? vedtakFattetUtfall : ''}
                        onChange={(evt) => {
                            let value = evt.target.value;
                            if (value === Utfall.INNVILGET
                                || value === Utfall.DELVIS_INNVILGET
                                || value === Utfall.AVSLATT
                                || value === Utfall.AVVIST
                            ) {
                                setVedtakFattetUtfall(value);
                            }
                        }}
                        inputProps={{
                            name: 'saksstatusSelect',
                            id: 'age-simple',
                        }}
                    >
                        <MenuItem key={"vedtakFattetStatusSelect: 0"} value={Utfall.INNVILGET}>Innvilget</MenuItem>
                        <MenuItem key={"vedtakFattetStatusSelect: 1"} value={Utfall.DELVIS_INNVILGET}>Delvis innvilget</MenuItem>
                        <MenuItem key={"vedtakFattetStatusSelect: 2"} value={Utfall.AVSLATT}>Avslått</MenuItem>
                        <MenuItem key={"vedtakFattetStatusSelect: 3"} value={Utfall.AVVIST}>Avvist</MenuItem>
                    </Select>
                </FormControl>
            </form>
            <Fab size="small" aria-label="add" className={classes.fab} color="primary"
                 onClick={() => {
                     if((v2.backendUrlTypeToUse === 'q0' || v2.backendUrlTypeToUse === 'q1') && inputEl && inputEl.current) {
                         inputEl.current.click();
                     } else {
                         const nyHendelse: VedtakFattet = {
                             type: HendelseType.VedtakFattet,
                             hendelsestidspunkt: getNow(),
                             saksreferanse: sak.referanse,
                             utfall:  vedtakFattetUtfall ,
                             vedtaksfil: {
                                 referanse: {
                                     type: filreferanselager.dokumentlager[0].type,
                                     id: filreferanselager.dokumentlager[0].id
                                 }
                             },
                             vedlegg: []
                         };
                         const soknadUpdated = oHendelser.modify((a: Hendelse[]) => [...a, nyHendelse])(soknad);

                         dispatch(
                             aiuuur(
                                 v2.aktivSoknad,
                                 soknadUpdated.fiksDigisosSokerJson,
                                 v2,
                                 oppdaterVedtakFattet(v2.aktivSoknad, nyHendelse)
                             )
                         );
                     }
                 }}>
                <AddIcon/>
            </Fab>
            <Typography>{(v2.backendUrlTypeToUse === 'q0' || v2.backendUrlTypeToUse === 'q1') ? "Send vedtak fattet og velg vedtaksbrev" : "Send vedtak fattet"}</Typography>
            <input
                id={'inputField vedtakFattet'}
                ref={inputEl}
                onChange={(e) => {
                    if (e.target.files) {
                        handleFileUpload(e.target.files)
                    }
                }}
                onClick={( event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
                    const element = event.target as HTMLInputElement;
                    element.value = '';
                }}
                type="file"
                hidden={true}
                className="visuallyhidden"
                tabIndex={-1}
                accept={window.navigator.platform.match(/iPad|iPhone|iPod/) !== null ? "*" : "application/pdf"}
            />
        </Box>
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
)(VedtakFattetModal);
