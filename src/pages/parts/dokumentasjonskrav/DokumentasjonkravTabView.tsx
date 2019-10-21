import React from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {Dokumentasjonkrav, DokumentasjonkravStatus} from "../../../types/hendelseTypes";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {createStyles} from "@material-ui/core";
import {V2Model} from "../../../redux/v2/v2Types";
import {V3State} from "../../../redux/v3/v3Types";
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

interface StoreProps {
    v2: V2Model,
    v3: V3State
}

type Props = DispatchProps & OwnProps & StoreProps;


const DokumentasjonkravTabView: React.FC<Props> = (props: Props) => {
    const {dokumentasjonkrav, dispatch, v2, v3}  = props;
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

    const makeTableRowOfList = (type:string, list:string[]|null) => {
        if (list == null || list.length == 0) {
            return <TableRow key={type}>
                <TableCell component="th" scope="row">{type}</TableCell>
                <TableCell variant={'footer'} align="right">Ikke utfylt</TableCell>
            </TableRow>
        } else if (list.length == 1) {
            return <TableRow key={type}>
                <TableCell component="th" scope="row">{type}</TableCell>
                <TableCell align="right">{list[0]}</TableCell>
            </TableRow>
        }
        return (<div><TableRow key={type}>
            <TableCell rowSpan={list.length} component="th" scope="row">{type}</TableCell>
            <TableCell variant={'footer'} align="right">{list[0]}</TableCell>
        </TableRow>
            {list.map(((value, idx) => {
                    if (idx == 0) {
                        return;
                    }
                    return (<TableRow key={type + idx}>
                        <TableCell variant={'footer'}  align="right">{value}</TableCell>
                    </TableRow>)
                }
            ))}</div>)
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

                        <TableRow key={"Utbetalingsreferanse"}>
                            <TableCell rowSpan={dokumentasjonkrav.utbetalingsreferanse.length} component="th" scope="row">{"Utbetalingsreferanse"}</TableCell>
                            <TableCell align="right">{dokumentasjonkrav.utbetalingsreferanse[0]}</TableCell>
                        </TableRow>
                        {dokumentasjonkrav.utbetalingsreferanse.map(((value, idx) => {
                            if (idx == 0) {
                                return;
                            }
                            return (<TableRow key={"Utbetalingsreferanse" + idx}>
                                <TableCell align="right">{value}</TableCell>
                            </TableRow>)
                        }))}
                        {makeTableRow("Beskrivelse", dokumentasjonkrav.beskrivelse)}
                        {makeTableRowOfStatus("Status", dokumentasjonkrav.status)}
                    </TableBody>
                    }
                    {(dokumentasjonkrav.utbetalingsreferanse == null || dokumentasjonkrav.utbetalingsreferanse.length <= 1) &&
                    <TableBody>
                        {makeTableRow("Dokumentasjonkravreferanse", dokumentasjonkrav.dokumentasjonkravreferanse)}
                        {makeTableRow("Utbetalingsreferanse", dokumentasjonkrav.utbetalingsreferanse == null || dokumentasjonkrav.utbetalingsreferanse.length == 0 ? null : dokumentasjonkrav.utbetalingsreferanse)}
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

const mapStateToProps = (state: AppState) => ({
    v2: state.v2,
    v3: state.v3,
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DokumentasjonkravTabView);
