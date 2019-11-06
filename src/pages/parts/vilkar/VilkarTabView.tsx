import React from 'react';
import {DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {Vilkar, VilkarStatus} from "../../../types/hendelseTypes";
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
import {setAktivtVilkar, visNyVilkarModal} from "../../../redux/actions";

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
    vilkar: Vilkar
}

interface StoreProps {
}

type Props = DispatchProps & OwnProps & StoreProps;


const VilkarTabView: React.FC<Props> = (props: Props) => {
    const {vilkar, dispatch}  = props;
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
                        {makeTableRow("Vilkårreferanse *", vilkar.vilkarreferanse)}

                        {vilkar.utbetalingsreferanse.map(((value, idx) => {
                            if (idx === 0) {
                            return <TableRow key={"Utbetalingsreferanse"}>
                                <TableCell rowSpan={vilkar.utbetalingsreferanse ? vilkar.utbetalingsreferanse.length : 1} component="th" scope="row">{"Utbetalingsreferanser"}</TableCell>
                                <TableCell align="right">{value}</TableCell>
                            </TableRow>
                        } else {
                                return <TableRow key={"Utbetalingsreferanse" + idx}>
                                    <TableCell align="right">{value}</TableCell>
                                </TableRow>
                            }
                        }))}
                        {makeTableRow("Beskrivelse", vilkar.beskrivelse)}
                        {makeTableRowOfStatus("Status", vilkar.status)}
                    </TableBody>
                    }
                    {(vilkar.utbetalingsreferanse == null || vilkar.utbetalingsreferanse.length <= 1) &&
                    <TableBody>
                        {makeTableRow("Vilkårreferanse", vilkar.vilkarreferanse)}
                        {makeTableRow("Utbetalingsreferanse", vilkar.utbetalingsreferanse == null || vilkar.utbetalingsreferanse.length === 0 ? null : vilkar.utbetalingsreferanse)}
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

const mapStateToProps = () => ({
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
