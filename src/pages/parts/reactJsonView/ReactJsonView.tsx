import React, {useState} from "react";
import Fab from "@material-ui/core/Fab";
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {createStyles, makeStyles, Theme} from "@material-ui/core";
import {green} from "@material-ui/core/colors";
import {Code, Inbox, Mail} from "@material-ui/icons";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import ReactJson from "react-json-view";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            position: 'relative',
            bottom: theme.spacing(2),
            right: theme.spacing(2),
        },
        fab: {
        },
        fabGreen: {
            color: theme.palette.common.white,
            backgroundColor: green[500],
            '&:hover': {
                backgroundColor: green[600],
            },
        },
        paper: {
            padding: theme.spacing(2, 2),
            marginTop: theme.spacing(2)

        },
        addbox: {
            margin: theme.spacing(2, 0, 2, 0),
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center'
        },
        list: {
            width: 'auto',
            padding: theme.spacing(2, 2)
        },
        fullList: {
            width: 'auto',
        },
        drawer: {
            minWidth: '40%'
        },
    }),
);


interface OwnProps {
    json?: any
}

interface StoreProps {
}

interface State {
    top: boolean,
    left: boolean,
    bottom: boolean,
    right: boolean,
}

const initialState: State = {
    top: false,
    left: false,
    bottom: false,
    right: false,
};

type Props = DispatchProps & OwnProps & StoreProps;


const ReactJsonView: React.FC<Props> = (props: Props) => {
    const [state, setState] = useState(initialState);
    
    const {json} = props;
    
    const classes = useStyles();


    const fab = {
        color: 'primary' as 'primary',
        className: classes.fab,
        icon: <Code/>,
        label: 'Add',
    };

    type DrawerSide = 'top' | 'left' | 'bottom' | 'right';

    const toggleDrawer = (side: DrawerSide, open: boolean) => (
        event: React.KeyboardEvent | React.MouseEvent,
    ) => {
        if (
            event.type === 'keydown' &&
            ((event as React.KeyboardEvent).key === 'Tab' ||
                (event as React.KeyboardEvent).key === 'Shift')
        ) {
            return;
        }

        setState({ ...state, [side]: open });
    };

    const sideList = (side: DrawerSide) => (
        <div
            className={classes.list}
            role="presentation"
            onBlur={() => setState({ ...state, [side]: false })}
        >
            <Divider />
            { json ? (<ReactJson src={json} enableClipboard={false}/>) : (<div>Ingen json tilgjengelig.</div>)}
            <Divider />
        </div>
    );

    const fullList = (side: DrawerSide) => (
        <div
            className={classes.fullList}
            role="presentation"
            onClick={toggleDrawer(side, false)}
            onKeyDown={toggleDrawer(side, false)}
        >
            <List>
                {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
                    <ListItem button key={text}>
                        <ListItemIcon>{index % 2 === 0 ? <Inbox /> : <Mail />}</ListItemIcon>
                        <ListItemText primary={text} />
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                {['All mail', 'Trash', 'Spam'].map((text, index) => (
                    <ListItem button key={text}>
                        <ListItemIcon>{index % 2 === 0 ? <Inbox /> : <Mail />}</ListItemIcon>
                        <ListItemText primary={text} />
                    </ListItem>
                ))}
            </List>
        </div>
    );



    return (
        <div className={classes.root}>
            <Fab aria-label={fab.label} className={fab.className} color={fab.color} onClick={toggleDrawer('right', true)}>
                {fab.icon}
            </Fab>
            <div>
                {/*<Button onClick={toggleDrawer('left', true)}>Open raw</Button>*/}
                {/*<Button onClick={toggleDrawer('right', true)}>Open Right</Button>*/}
                {/*<Button onClick={toggleDrawer('top', true)}>Open Top</Button>*/}
                {/*<Button onClick={toggleDrawer('bottom', true)}>Open Bottom</Button>*/}
                <Drawer open={state.left} onClose={toggleDrawer('left', false)}>
                    {sideList('left')}
                </Drawer>
                <Drawer anchor="top" open={state.top} onClose={toggleDrawer('top', false)}>
                    {fullList('top')}
                </Drawer>
                <Drawer anchor="bottom" open={state.bottom} onClose={toggleDrawer('bottom', false)}>
                    {fullList('bottom')}
                </Drawer>
                <Drawer classes={{paper: classes.drawer}} anchor="right" open={state.right} onClose={toggleDrawer('right', false)}>
                    {sideList('right')}
                </Drawer>
            </div>
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
)(ReactJsonView);
