import React from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import Typography from "@material-ui/core/Typography";
import EndreNavKontorModal from "./EndreNavKontorModal";
import {FsSoknad} from "../../../redux/v3/v3FsTypes";
import {makeStyles} from "@material-ui/core";


interface StoreProps {

}

interface OwnProps {
    soknad: FsSoknad
}

const useStyles = makeStyles(() => ({
    root: {
        position: 'relative',
        top: '25px'
    },
}));

type Props = DispatchProps & OwnProps & StoreProps;


const TildeldeltNavkontorView: React.FC<Props> = (props: Props) => {

    const {soknad, dispatch} = props;

    return (
        <div className={useStyles().root}>
            <Typography variant={"subtitle1"}>
                Tildel navkontor:
                <EndreNavKontorModal />
            </Typography>
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
