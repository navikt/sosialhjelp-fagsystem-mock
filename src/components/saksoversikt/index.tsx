import * as React from 'react';
import {AppState, DispatchProps} from "../../redux/reduxTypes";
import {connect} from "react-redux";
import {Panel} from "nav-frontend-paneler";
import Hendelse from "../../types/hendelseTypes";

interface OwnProps {

}

interface StoreProps {
    hendelser: Hendelse[];
}

type Props = OwnProps & StoreProps & DispatchProps


const Saksoversikt: React.FC<{}> = (props: {}) => {

    const settInnListeAvSaker = () => {

        props

        return

    };

    return (
        <div>

            Saksoversikt
            <Panel>
                <ul>
                    {settInnListeAvSaker()}
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

export default connect(mapStateToProps, mapDispatchToProps)(Saksoversikt);