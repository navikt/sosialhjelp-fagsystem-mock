import React, {useState} from 'react';
import {V2Model} from "../../../redux/v2/v2Types";
import Hendelse from "../../../types/hendelseTypes";
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {Icon} from "@material-ui/core";
import SvgIcon from "@material-ui/core/SvgIcon";
import {Bathtub, Build} from "@material-ui/icons";


interface DarkHeaderProps {
    v2: V2Model
    hendelserUpdated: Hendelse[]
}

interface DarkHeaderState {
    input: string;
}

const initialState: DarkHeaderState = {
    input: ''
};

type Props = DispatchProps & DarkHeaderProps;
type State = DarkHeaderState;


const DarkHeader: React.FC<Props> = (props: Props) => {
    const [state, setState] = useState(initialState);

    return (
        <div className={"dark-header-wrapper"}>
            <div className={"dark-header-left-wrapper"}>
                <Bathtub />
            </div>
            <div className={"dark-header-center-wrapper"}>
                WOLDENA TM - Fagsystem mock
            </div>
            <div className={"dark-header-right-wrapper"}>
                <Build />
            </div>
        </div>
    );
};

const mapStateToProps = (state: AppState) => ({
    v2: state.v2,
    hendelserUpdated: JSON.parse(JSON.stringify(state.v2.fiksDigisosSokerJson.sak.soker.hendelser))
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DarkHeader);
