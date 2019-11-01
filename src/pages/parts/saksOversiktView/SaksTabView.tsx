import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import Typography from "@material-ui/core/Typography";
import Hendelse, {HendelseType, SaksStatus} from "../../../types/hendelseTypes";
import Box from "@material-ui/core/Box";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {createStyles} from "@material-ui/core";
import {V2Model} from "../../../redux/v2/v2Types";
import Button from "@material-ui/core/Button";
import {aiuuur, oppdaterFsSaksStatus} from "../../../redux/v3/v3Actions";
import {getNow} from "../../../utils/utilityFunctions";
import {FsSaksStatus, FsSoknad} from "../../../redux/v3/v3FsTypes";
import TextField from "@material-ui/core/TextField";
import EndreSaksstatusModal from "./EndreSaksstatusModal";
import VedtakFattetModal from "./VedtakFattetModal";
import {oHendelser} from "../../../redux/v3/v3Optics";
import RammevedtakOversiktView from "../rammevedtak/RammevedtakOversiktView";
import UtbetalingOversiktView from "../utbetaling/UtbetalingOversiktView";


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
            marginTop: theme.spacing(3),
            position: 'relative',
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
            marginRight: theme.spacing(1)
        },
        horizontalWrapper: {
            display: 'flex',
            flexDirection: 'column'
        },
        horizontalBox: {
            display: 'inline',
            position: 'relative',
        },
        tittelButton: {
            margin: theme.spacing(2, 1),
        }
    });
});

interface OwnProps {
    idx: number,
    sak: FsSaksStatus,
    soknad: FsSoknad
}

interface StoreProps {
    v2: V2Model
}

type Props = DispatchProps & OwnProps & StoreProps;


const SaksTabView: React.FC<Props> = (props: Props) => {
    const [tittel, setTittel] = useState('');
    const {sak, dispatch, v2, soknad}  = props;
    const classes = useStyles();

    return (
        <div>
            <br/>
            <TextField
                id="outlined-name"
                label={'Ny tittel på sak'}
                value={tittel}
                onChange={(evt) => setTittel(evt.target.value)}
                margin="dense"
                variant="filled"
                autoComplete="off"
            />
            <Button className={classes.tittelButton} variant="contained" onClick={() => {
                if (tittel.length > 0){
                    const nyHendelse: SaksStatus = {
                        type: HendelseType.SaksStatus,
                        hendelsestidspunkt: getNow(),
                        referanse: sak.referanse,
                        tittel: tittel,
                        status: sak.status
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
            } }>Oppdater tittel</Button>

            <br/>
            <Box className={classes.box}>
                <Typography variant={"subtitle1"}>
                    Endre saksstatus:
                    <EndreSaksstatusModal soknad={soknad} sak={sak}/>
                </Typography>
            </Box>

            <br/>
            <Typography>Utbetaling</Typography>
            <UtbetalingOversiktView utbetalingListe={sak.utbetalinger} saksreferanse={sak.referanse}/>
            <br/>
            <Typography>Vedtak fattet</Typography>
            <VedtakFattetModal soknad={soknad} sak={sak}/>
            <br/>
            <Typography>Rammevedtak</Typography>
            <RammevedtakOversiktView rammevedtakListe={sak.rammevedtak} saksreferanse={sak.referanse}/>
            <br/>
        </div>
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
)(SaksTabView);
