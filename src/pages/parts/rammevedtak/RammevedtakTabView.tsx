import React from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {Rammevedtak} from "../../../types/hendelseTypes";
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
import {setAktivtRammevedtak, visNyRammevedtakModal} from "../../../redux/v2/v2Actions";

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
    rammevedtak: Rammevedtak
}

interface StoreProps {
    v2: V2Model,
    v3: V3State
}

type Props = DispatchProps & OwnProps & StoreProps;


const RammevedtakTabView: React.FC<Props> = (props: Props) => {
    const {rammevedtak, dispatch, v2, v3}  = props;
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
                        {makeTableRow("Rammevedtakreferanse", rammevedtak.rammevedtaksreferanse)}
                        {makeTableRow("Saksreferanse", rammevedtak.saksreferanse == null || rammevedtak.saksreferanse.length == 0 ? null : rammevedtak.saksreferanse)}
                        {makeTableRow("Beskrivelse", rammevedtak.beskrivelse)}
                        {makeTableRow("Beløp", rammevedtak.belop)}
                        {makeTableRow("fom", rammevedtak.fom)}
                        {makeTableRow("tom", rammevedtak.tom)}
                    </TableBody>
                </Table>
                <Typography className={classes.paperRoute}>
                    <Fab size="small" aria-label="add" className={classes.fab} color="primary" onClick={() => {
                        dispatch(setAktivtRammevedtak(rammevedtak.rammevedtaksreferanse));
                        dispatch(visNyRammevedtakModal());
                    }}>
                        <AddIcon/>
                    </Fab>
                    Endre rammevedtak
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
)(RammevedtakTabView);