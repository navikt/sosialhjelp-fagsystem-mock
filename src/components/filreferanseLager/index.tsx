import * as React from 'react';
import {Panel} from "nav-frontend-paneler";
import {generateFilreferanseId} from "../../utils/utilityFunctions";
import {connect} from "react-redux";
import {AppState} from "../../redux/reduxTypes";
import {Filreferanselager} from "../../redux/v2/v2Types";
import {Dokumentlager, Svarut} from "../../types/hendelseTypes";


interface State {
    filreferanselager: Filreferanselager
}

const FilreferanseLager: React.FC<State> = (state: State) => {

    const {svarutlager, dokumentlager}= state.filreferanselager;

    return (
        <div>
            <Panel>
                Filreferanselager
                <div>
                    Svarut
                    { svarutlager.map((docref: Svarut) => {
                        return <div>Id: {docref.id}. Nr: {docref.nr}</div>
                    })}
                </div>

                <div>
                    Dokumentlager
                    {
                        dokumentlager.map(((docref: Dokumentlager) => {
                            return <div>Id: {docref.id}</div>
                        }))
                    }
                </div>
            </Panel>
        </div>
    )
};

const handleClick = () => {
    const r = generateFilreferanseId();
};



const mapStateToProps = (state: AppState) => ({
    filreferanselager: state.v2.filreferanselager,
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};


export default connect(mapStateToProps, mapDispatchToProps)(FilreferanseLager);