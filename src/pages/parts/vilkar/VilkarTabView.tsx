import React from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {Vilkar, VilkarStatus} from "../../../types/hendelseTypes";
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
import {setAktivtVilkar, visNyVilkarModal} from "../../../redux/v2/v2Actions";

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
    vilkar: Vilkar
}

interface StoreProps {
    v2: V2Model,
    v3: V3State
}

type Props = DispatchProps & OwnProps & StoreProps;


const VilkarTabView: React.FC<Props> = (props: Props) => {
    const {vilkar, dispatch, v2, v3}  = props;
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

    const makeTableRowOfStatus = (type: string, value: VilkarStatus|null) => {
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
                    {(vilkar.utbetalingsreferanse != null && vilkar.utbetalingsreferanse.length > 1) &&
                    <TableBody>
                        {makeTableRow("Vilkårreferanse", vilkar.vilkarreferanse)}

                        <TableRow key={"Utbetalingsreferanse"}>
                            <TableCell rowSpan={vilkar.utbetalingsreferanse.length} component="th" scope="row">{"Utbetalingsreferanse"}</TableCell>
                            <TableCell align="right">{vilkar.utbetalingsreferanse[0]}</TableCell>
                        </TableRow>
                        {vilkar.utbetalingsreferanse.map(((value, idx) => {
                            if (idx == 0) {
                            return;
                        }
                            return (<TableRow key={"Utbetalingsreferanse" + idx}>
                            <TableCell align="right">{value}</TableCell>
                            </TableRow>)
                        }))}
                        {makeTableRow("Beskrivelse", vilkar.beskrivelse)}
                        {makeTableRowOfStatus("Status", vilkar.status)}
                    </TableBody>
                    }
                    {(vilkar.utbetalingsreferanse == null || vilkar.utbetalingsreferanse.length <= 1) &&
                    <TableBody>
                        {makeTableRow("Vilkårreferanse", vilkar.vilkarreferanse)}
                        {makeTableRow("Utbetalingsreferanse", vilkar.utbetalingsreferanse == null || vilkar.utbetalingsreferanse.length == 0 ? null : vilkar.utbetalingsreferanse)}
                        {makeTableRow("Beskrivelse", vilkar.beskrivelse)}
                        {makeTableRowOfStatus("Status", vilkar.status)}
                    </TableBody>
                    }
                </Table>
                <Typography className={classes.paperRoute}>
                    <Fab size="small" aria-label="add" className={classes.fab} color="primary" onClick={() => {
                        dispatch(setAktivtVilkar(vilkar.vilkarreferanse));
                        dispatch(visNyVilkarModal());
                    }}>
                        <AddIcon/>
                    </Fab>
                    Endre vilkår
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
)(VilkarTabView);
