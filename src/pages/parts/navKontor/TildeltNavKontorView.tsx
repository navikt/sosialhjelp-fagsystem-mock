import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {Edit} from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import EndreNavKontorModal from "./EndreNavKontorModal";
import {visEndreNavKontorModal} from "../../../redux/v2/v2Actions";
import {FsSoknad} from "../../../redux/v3/v3FsTypes";

const useStyle = makeStyles((theme) => {
    return {
        paper: {
            padding: theme.spacing(2, 2),
            marginTop: theme.spacing(2),
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between'
        },
        col: {

        },
        colJson: {
            marginTop: theme.spacing(2)
        }
    }
});

interface StoreProps {

}

interface OwnProps {
    soknad: FsSoknad
}

interface State {
    input: string;
}

const initialState: State = {
    input: ''
};

type Props = DispatchProps & OwnProps & StoreProps;


const TildeldeltNavkontorView: React.FC<Props> = (props: Props) => {
    const [state, setState] = useState(initialState);

    const classes = useStyle();
    const {soknad, dispatch} = props;

    return (
        <div>
            <Typography variant={"subtitle1"}>
                Behandles av: {soknad.navKontor ? soknad.navKontor.navKontor : "Default navkontor. Ingen TildeltNavkontorHendelse har skjedd."}
                <IconButton color="inherit" aria-label="menu" onClick={() => dispatch(visEndreNavKontorModal())}>
                    <Edit />
                </IconButton>
            </Typography>
            <EndreNavKontorModal />
        </div>
    );
};

const mapStateToProps = (state: AppState) => ({});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TildeldeltNavkontorView);
