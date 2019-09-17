import * as React from 'react';
import {AppState, DispatchProps} from "../../redux/reduxTypes";
import {connect} from "react-redux";
import {Panel} from "nav-frontend-paneler";
import Hendelse from "../../types/hendelseTypes";
import {Button} from "@material-ui/core";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";
import SvgIcon from "@material-ui/core/SvgIcon";
import Link from "@material-ui/core/Link";
import {Copyright} from "@material-ui/icons";



function LightBulbIcon(props: any) {
    return (
        <SvgIcon {...props}>
            <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
        </SvgIcon>
    );
}

const useStyles = makeStyles(theme => ({
    root: {
        margin: theme.spacing(6, 0, 3),
    },
    lightBulb: {
        verticalAlign: 'middle',
        marginRight: theme.spacing(1),
    },
}));




interface OwnProps {

}

interface StoreProps {
    hendelser: Hendelse[];
}

type Props = OwnProps & StoreProps & DispatchProps


const SaksoversiktView: React.FC<{}> = (props: {}) => {

    const settInnListeAvSaker = () => {

        return (
            <div>asdf</div>
        )

    };

    const classes = useStyles();

    return (
        <div>

            <Container maxWidth="sm">
                <Box my={4}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Create React App v4-beta example
                    </Typography>
                    <Typography className={classes.root} color="textSecondary">
                        <LightBulbIcon className={classes.lightBulb} />
                        Pro tip: See more{' '}
                        <Link href="https://material-ui.com/getting-started/templates/">templates</Link> on the
                        Material-UI documentation.
                    </Typography>
                    <Copyright />
                </Box>
            </Container>

            Saksoversikt
            <Panel>
                <ul>
                    {settInnListeAvSaker()}
                    <Button variant={"contained"} color="primary">
                        Hello world
                    </Button>
                </ul>
            </Panel>
        </div>
    )
};

const mapStateToProps = (state: AppState) => ({
    hendelser: state.v2.fiksDigisosSokerJson.sak.soker.hendelser,
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(SaksoversiktView);