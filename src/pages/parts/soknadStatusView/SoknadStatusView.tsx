import React, {useRef} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, Paper} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import FormControl from "@material-ui/core/FormControl";
import RadioGroup from "@material-ui/core/RadioGroup";
import {ForelopigSvar, HendelseType, SoknadsStatus, SoknadsStatusType} from "../../../types/hendelseTypes";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import {FsSoknad, Model} from "../../../redux/types";
import {
    oppdaterForelopigSvar,
    oppdaterSoknadsStatus,
    sendNyHendelseOgOppdaterModel,
    sendPdfOgOppdaterForelopigSvar
} from "../../../redux/actions";
import {getNow} from "../../../utils/utilityFunctions";
import {defaultDokumentlagerRef} from "../../../redux/reducer";
import Button from "@material-ui/core/Button";


const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            display: 'flex',
            '@media (min-width: 520px)': {
                flexDirection: 'row',
                justifyContent: 'space-between',
            },
            '@media (max-width: 519px)': {
                flexDirection: 'column',
                alignItems: 'center',
                width:'100%'
            },
        },
        paper: {
            '@media (min-width: 1130px)': {
                margin: theme.spacing(2, 2),
            },
            '@media (min-width: 520px)': {
                '@media (max-width: 1129px)': {
                    margin: theme.spacing(2, 2, 2,0),
                },
            },
            '@media (max-width: 519px)': {
                margin: theme.spacing(2, 2),
            },
            padding: theme.spacing(3, 2),
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
        },
        paper2: {
            margin: theme.spacing(2, 0),
            padding: theme.spacing(3, 2),
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
        },
        box: {
            padding: theme.spacing(0, 1, 0, 1),
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
        },
        horizontalWrapper: {
            display: 'flex',
            flexDirection: 'column'
        }
    });
});

interface OwnProps {
    soknad: FsSoknad
}

interface StoreProps {
    model: Model
}

type Props = DispatchProps & OwnProps & StoreProps;


const SoknadStatusView: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const {dispatch, soknad, model} = props;
    const inputEl = useRef<HTMLInputElement>(null);

    const handleFileUpload = (files: FileList) => {
        if (files.length !== 1) {
            return;
        }
        const formData = new FormData();
        formData.append("file", files[0], files[0].name);

        dispatch(sendPdfOgOppdaterForelopigSvar(formData, model, dispatch));
    };

    const addNyttForelopigSvarButton = () => {
        return (
            <Box className={classes.addbox}>
                <Button variant="contained" color={'primary'} onClick={() => {
                         const nyHendelse: ForelopigSvar = {
                             type: HendelseType.ForelopigSvar,
                             hendelsestidspunkt: getNow(),
                             forvaltningsbrev: {
                                 referanse: {
                                     type: defaultDokumentlagerRef.type,
                                     id: defaultDokumentlagerRef.id
                                 }
                             },
                             vedlegg: []
                         };

                         sendNyHendelseOgOppdaterModel(nyHendelse, model, dispatch, oppdaterForelopigSvar(soknad.fiksDigisosId, nyHendelse));
                     }}>
                    {"Send foreløpig svar"}
                </Button>
            </Box>
        )
    };

    function getAntallForelopigSvarHendelser() {
        return soknad.fiksDigisosSokerJson.sak.soker.hendelser.filter(hendelse => hendelse.type === HendelseType.ForelopigSvar).length;
    }

    return (
        <div className={classes.root}>
            <Paper className={classes.paper}>
                <Box className={classes.box}>
                    <FormControl component="fieldset" className={classes.formControl}>
                        <Typography variant={'h5'}>Status på Søknaden</Typography>
                        <RadioGroup aria-label="soknadsStatus" name="soknadsStatus1" value={soknad.soknadsStatus.status}
                                    onChange={(event, value) => {
                                        if (
                                            value === SoknadsStatusType.MOTTATT ||
                                            value === SoknadsStatusType.UNDER_BEHANDLING ||
                                            value === SoknadsStatusType.FERDIGBEHANDLET ||
                                            value === SoknadsStatusType.BEHANDLES_IKKE
                                        ) {

                                            const nyHendelse: SoknadsStatus = {
                                                type: HendelseType.SoknadsStatus,
                                                hendelsestidspunkt: getNow(),
                                                status: value
                                            };

                                            sendNyHendelseOgOppdaterModel(nyHendelse, model, dispatch, oppdaterSoknadsStatus(soknad.fiksDigisosId, nyHendelse));
                                        }
                                    }}
                        >
                            <FormControlLabel value={SoknadsStatusType.MOTTATT} control={<Radio/>} label={"Mottatt"}/>
                            <FormControlLabel value={SoknadsStatusType.UNDER_BEHANDLING} control={<Radio/>}
                                              label={"Under behandling"}/>
                            <FormControlLabel value={SoknadsStatusType.FERDIGBEHANDLET} control={<Radio/>}
                                              label={"Ferdigbehandlet"}/>
                            <FormControlLabel value={SoknadsStatusType.BEHANDLES_IKKE} control={<Radio/>}
                                              label={"Behandles ikke"}/>
                        </RadioGroup>
                    </FormControl>
                </Box>
            </Paper>
            <Paper className={classes.paper2}>
                <div className={classes.horizontalWrapper}>
                    <Box>
                        <Typography variant={'h5'}>Foreløpig svar</Typography>
                        {addNyttForelopigSvarButton()}
                        <Typography>{"Antall sendt: " + getAntallForelopigSvarHendelser()}</Typography>
                        <input
                            id={'inputField'}
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
                </div>
            </Paper>
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
)(SoknadStatusView);
