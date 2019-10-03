import React from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import Typography from "@material-ui/core/Typography";
import {Edit} from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import EndreNavKontorModal from "./EndreNavKontorModal";
import {visEndreNavKontorModal} from "../../../redux/v2/v2Actions";
import {FsSoknad} from "../../../redux/v3/v3FsTypes";


interface StoreProps {

}

interface OwnProps {
    soknad: FsSoknad
}


type Props = DispatchProps & OwnProps & StoreProps;


const TildeldeltNavkontorView: React.FC<Props> = (props: Props) => {

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
