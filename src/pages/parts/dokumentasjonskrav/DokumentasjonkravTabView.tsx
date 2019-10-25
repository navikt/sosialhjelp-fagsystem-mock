import React from 'react';
import {DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {Dokumentasjonkrav, DokumentasjonkravStatus} from "../../../types/hendelseTypes";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {createStyles} from "@material-ui/core";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Fab from "@material-ui/core/Fab";
import AddIcon from '@material-ui/icons/Add';
import Typography from "@material-ui/core/Typography";
import {setAktivtDokumentasjonkrav, visNyDokumentasjonkravModal} from "../../../redux/v2/v2Actions";

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            display: 'flex',
            flexDirection: 'row',
            paddingTop: theme.spacing(2),
            alignItems: 'center',
            justifyContent: 'center',
        },
        paper: {
            marginTop: theme.spacing(3),
            overflowX: 'auto',
            marginBottom: theme.spacing(2),
        },
        table: {
            minWidth: 650,
        },
        fab: {
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),
            margin: theme.spacing(1),
        },
        paperRoute: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexwrap: 'wrap',
        }
    });
});

interface OwnProps {
    dokumentasjonkrav: Dokumentasjonkrav
}

type Props = DispatchProps & OwnProps;


const DokumentasjonkravTabView: React.FC<Props> = (props: Props) => {
    const {dokumentasjonkrav, dispatch}  = props;
    const classes = useStyles();

    const makeTableRow = (type:string, value:any) => {
        if (typeof value === "boolean") {
            value = value ? "Ja" : "Nei";
        }
        return <TableRow key={type}>
            <TableCell component="th" scope="row">
                {type}
            </TableCell>
            {value != null ?
                <TableCell align="right">{value.toString()}</TableCell> :
                <TableCell variant={'footer'} align="right">Ikke utfylt</TableCell>
            }
        </TableRow>
    };

    const makeTableRowOfStatus = (type: string, value: DokumentasjonkravStatus|null) => {
        let status = '';
        if (value != null) {
            status = value.toString();
            status = status.toLowerCase();
            status = status[0].toUpperCase() + status.slice(1);
            status = status.replace('_', ' ');
        }
        return <TableRow key={type}>
            <TableCell component="th" scope="row">
                {type}
            </TableCell>
            {value != null ?
                <TableCell align="right">{status.toString()}</TableCell> :
                <TableCell variant={'footer'} align="right">Ikke utfylt</TableCell>
            }
        </TableRow>
    };


    return (
        <div className={classes.root}>
            <Paper className={classes.paper}>
                <Table className={classes.table} size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell align="right">Verdi</TableCell>
                        </TableRow>
                    </TableHead>
                    {(dokumentasjonkrav.utbetalingsreferanse != null && dokumentasjonkrav.utbetalingsreferanse.length > 1) &&
                    <TableBody>
                        {makeTableRow("Dokumentasjonkravreferanse", dokumentasjonkrav.dokumentasjonkravreferanse)}

                        {dokumentasjonkrav.utbetalingsreferanse.map(((value, idx) => {
                            if (idx === 0) {
                                return <TableRow key={"Utbetalingsreferanse"}>
                                    <TableCell rowSpan={dokumentasjonkrav.utbetalingsreferanse ? dokumentasjonkrav.utbetalingsreferanse.length : 1} component="th" scope="row">{"Utbetalingsreferanser"}</TableCell>
                                    <TableCell align="right">{value}</TableCell>
                                </TableRow>
                            } else {
                                return <TableRow key={"Utbetalingsreferanse" + idx}>
                                    <TableCell align="right">{value}</TableCell>
                                </TableRow>
                            }
                        }))}
                        {makeTableRow("Beskrivelse", dokumentasjonkrav.beskrivelse)}
                        {makeTableRowOfStatus("Status", dokumentasjonkrav.status)}
                    </TableBody>
                    }
                    {(dokumentasjonkrav.utbetalingsreferanse == null || dokumentasjonkrav.utbetalingsreferanse.length <= 1) &&
                    <TableBody>
                        {makeTableRow("Dokumentasjonkravreferanse", dokumentasjonkrav.dokumentasjonkravreferanse)}
                        {makeTableRow("Utbetalingsreferanse", dokumentasjonkrav.utbetalingsreferanse == null || dokumentasjonkrav.utbetalingsreferanse.length === 0 ? null : dokumentasjonkrav.utbetalingsreferanse)}
                        {makeTableRow("Beskrivelse", dokumentasjonkrav.beskrivelse)}
                        {makeTableRowOfStatus("Status", dokumentasjonkrav.status)}
                    </TableBody>
                    }
                </Table>
                <Typography className={classes.paperRoute}>
                    <Fab size="small" aria-label="add" className={classes.fab} color="primary" onClick={() => {
                        dispatch(setAktivtDokumentasjonkrav(dokumentasjonkrav.dokumentasjonkravreferanse));
                        dispatch(visNyDokumentasjonkravModal());
                    }}>
                        <AddIcon/>
                    </Fab>
                    Endre dokumentasjonkrav
                </Typography>
            </Paper>
        </div>
    );
};

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapDispatchToProps
)(DokumentasjonkravTabView);
