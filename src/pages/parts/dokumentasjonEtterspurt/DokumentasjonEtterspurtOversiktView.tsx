import React from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Box from '@material-ui/core/Box';
import {Paper} from "@material-ui/core";
import {visNyDokumentasjonEtterspurtModal} from "../../../redux/actions";
import {FsSoknad} from "../../../redux/types";
import Hendelse, {Dokument, DokumentasjonEtterspurt, HendelseType} from "../../../types/hendelseTypes";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import {getNow, getShortDateISOString} from "../../../utils/utilityFunctions";
import {oHendelser} from "../../../redux/optics";
import {aiuuur, oppdaterDokumentasjonEtterspurt} from "../../../redux/actions";
import {Model} from "../../../redux/types";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            position: 'relative',
        },
        fab: {
            marginRight: theme.spacing(1),
        },
        fab2: {
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),
            margin: theme.spacing(1),
        },
        paper: {
            padding: theme.spacing(2, 2),
            marginTop: theme.spacing(2),
            backgroundColor: theme.palette.background.paper
        },
        tablePaper: {
            marginTop: theme.spacing(3),
            overflowX: 'auto',
            marginBottom: theme.spacing(2),
        },
        tableBox: {
            padding: theme.spacing(2, 2),
            marginTop: theme.spacing(2),
            position: 'relative',
            display: 'flex',
            flexDirection: 'row',
            paddingTop: theme.spacing(2),
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: theme.spacing(2),
        },
        addbox: {
            margin: theme.spacing(2, 0, 2, 0),
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center'
        },
        table: {
            '@media (min-width: 860px)': {
                minWidth: '650px',
            },
        },
        paperRoute: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexwrap: 'wrap',
        }
    }),
);


interface StoreProps {
    model: Model
}

interface OwnProps {
    soknad: FsSoknad
}

type Props = DispatchProps & StoreProps & OwnProps;


const DokumentasjonEtterspurtOversiktView: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const {soknad, model, dispatch} = props;

    const makeTableRow = (dokument: Dokument) => {
        return <TableRow key={dokument.dokumenttype + dokument.tilleggsinformasjon}>
            <TableCell component="th" scope="row">
                {dokument.dokumenttype}
            </TableCell>
            {dokument.tilleggsinformasjon != null ?
                <TableCell>{dokument.tilleggsinformasjon}</TableCell> :
                <TableCell variant={'footer'}>Ikke utfylt</TableCell>
            }
            {dokument.innsendelsesfrist != null ?
                <TableCell align="right">{getShortDateISOString(new Date(dokument.innsendelsesfrist))}</TableCell> :
                <TableCell variant={'footer'} align="right">Ikke utfylt</TableCell>
            }
        </TableRow>
    };

    function dispatchNyHendelseMedTomDokumentasjonEtterspurt() {
        if (soknad.dokumentasjonEtterspurt) {
            const nyHendelse: DokumentasjonEtterspurt = {
                type: HendelseType.DokumentasjonEtterspurt,
                hendelsestidspunkt: getNow(),
                forvaltningsbrev: soknad.dokumentasjonEtterspurt.forvaltningsbrev,
                vedlegg: [],
                dokumenter: []
            };

            const soknadUpdated = oHendelser.modify((a: Hendelse[]) => [...a, nyHendelse])(soknad);

            dispatch(
                aiuuur(
                    soknad.fiksDigisosId,
                    soknadUpdated.fiksDigisosSokerJson,
                    model,
                    oppdaterDokumentasjonEtterspurt(soknad.fiksDigisosId, nyHendelse)
                )
            );
        }
    }

    return (
        <div className={classes.root}>
            <Paper className={classes.paper}>
                <Typography variant={"h5"}>Dokumentasjon som er etterspurt</Typography>
                <Box className={classes.addbox}>
                    <Typography>
                        <Fab id={'etterspor_mer_dokumentasjon_knapp'} aria-label="add" className={classes.fab} color="primary" onClick={() => {
                            if (soknad.dokumentasjonEtterspurt && soknad.dokumentasjonEtterspurt.dokumenter.length > 0) {
                                dispatchNyHendelseMedTomDokumentasjonEtterspurt();
                            } else {
                                dispatch(visNyDokumentasjonEtterspurtModal());
                            }
                        }}>
                            <AddIcon/>
                        </Fab>
                        {(soknad.dokumentasjonEtterspurt && soknad.dokumentasjonEtterspurt.dokumenter.length > 0) ? "Slett etterspurt dokumentasjon" : "Etterspør mer dokumentasjon"}
                    </Typography>
                </Box>

                {(soknad.dokumentasjonEtterspurt && soknad.dokumentasjonEtterspurt.dokumenter.length > 0) &&
                <Box className={classes.tableBox}>
                    <Paper className={classes.tablePaper}>
                        <Table className={classes.table} size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Tilleggsinformasjon</TableCell>
                                    <TableCell align="right">Innsendelsesfrist</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {soknad.dokumentasjonEtterspurt && soknad.dokumentasjonEtterspurt.dokumenter.map(dokument => makeTableRow(dokument))}
                            </TableBody>
                        </Table>
                        <Typography className={classes.paperRoute}>
                            <Fab size="small" aria-label="add" className={classes.fab2} color="primary" onClick={() => {
                                dispatch(visNyDokumentasjonEtterspurtModal());
                            }}>
                                <AddIcon/>
                            </Fab>
                            Endre etterspurt dokumentasjon
                        </Typography>
                    </Paper>
                </Box>}
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
)(DokumentasjonEtterspurtOversiktView);
