import React from 'react';
import {DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {Utbetaling, UtbetalingStatus} from "../../../types/hendelseTypes";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {createStyles} from "@material-ui/core";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {setAktivUtbetaling, visNyUtbetalingModal} from "../../../redux/actions";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";

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
            '@media (max-width: 500px)': {
                maxWidth: 280,
            },
        },
        table: {
            '@media (min-width: 860px)': {
                minWidth: '650px',
            },
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
    utbetaling: Utbetaling
}

type Props = DispatchProps & OwnProps;


const UtbetalingTabView: React.FC<Props> = (props: Props) => {
    const {utbetaling, dispatch}  = props;
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

    const makeTableRowOfStatus = (type:string, value:UtbetalingStatus|null) => {
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
                    <TableBody>
                        {makeTableRow("Utbetalingsreferanse", utbetaling.utbetalingsreferanse)}
                        {makeTableRow("Saksreferanse", utbetaling.saksreferanse)}
                        {makeTableRowOfStatus("Status", utbetaling.status)}
                        {makeTableRow("Beløp", utbetaling.belop)}
                        {makeTableRow("Beskrivelse", utbetaling.beskrivelse)}
                        {makeTableRow("Forfallsdato", utbetaling.forfallsdato)}
                        {makeTableRow("Utbetalingsdato", utbetaling.utbetalingsdato)}
                        {makeTableRow("fom", utbetaling.fom)}
                        {makeTableRow("tom", utbetaling.tom)}
                        {makeTableRow("Annen mottaker", utbetaling.annenMottaker)}
                        {makeTableRow("Mottaker", utbetaling.mottaker)}
                        {makeTableRow("Kontonummer", utbetaling.kontonummer)}
                        {makeTableRow("Utbetalingsmetode", utbetaling.utbetalingsmetode)}
                    </TableBody>
                </Table>
                <Box className={classes.paperRoute}>
                    <Button color={'secondary'} onClick={() => {
                        dispatch(setAktivUtbetaling(utbetaling.utbetalingsreferanse));
                        dispatch(visNyUtbetalingModal(utbetaling.saksreferanse));
                    }}>
                        Endre utbetaling
                    </Button>
                </Box>
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
)(UtbetalingTabView);
