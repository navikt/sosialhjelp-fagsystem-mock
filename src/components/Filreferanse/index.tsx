import * as React from 'react';
import {useState} from 'react';
import {connect} from "react-redux";
import {AppState} from "../../redux/reduxTypes";
import {
    DokumentlagerExtended,
    FilreferanseType,
    SvarutExtended
} from "../../types/hendelseTypes";
import {Filreferanselager} from "../../redux/v2/v2Types";
import {getFilreferanseExtended} from "../../utils/utilityFunctions";

interface OwnProps {
    onVelgFilreferanse: (filreferanse: SvarutExtended | DokumentlagerExtended) => void;
}

interface StateProps {
    filreferanselager: Filreferanselager;
}

interface State {
    visLeggTilVedlegg: boolean;
    vedleggOptionsValg: FilreferanseType | undefined;
    valgtFilreferanse: SvarutExtended | DokumentlagerExtended | undefined
}

const initialState: State = {
    visLeggTilVedlegg: false,
    vedleggOptionsValg: undefined,
    valgtFilreferanse: undefined
};

type Props = OwnProps & StateProps

const Filreferanse: React.FC<Props> = (props: Props) => {

    const [state, setState] = useState(initialState as State);


    const insertVedleggContent: () => JSX.Element = () => {
        const {visLeggTilVedlegg} = state;
        const {svarutlager, dokumentlager} = props.filreferanselager;
        const {vedleggOptionsValg} = state;


        return (
            <div>
                <div>
                    {visLeggTilVedlegg && (
                        <div>
                            <select onChange={(evt) => {
                                switch (evt.target.value) {
                                    case "svarut": {
                                        setState({...state, vedleggOptionsValg: FilreferanseType.svarut});
                                        break;
                                    }
                                    case "dokumentlager": {
                                        setState({...state, vedleggOptionsValg: FilreferanseType.dokumentlager});
                                        break;
                                    }
                                    default: {
                                        setState({...state, vedleggOptionsValg: undefined});
                                        break;
                                    }
                                }
                            }}>
                                <option selected={(vedleggOptionsValg === undefined)} value={''}>
                                    Velg lagrings sted
                                </option>
                                <option selected={vedleggOptionsValg === FilreferanseType.svarut}
                                        value={FilreferanseType.svarut}>
                                    svarut
                                </option>
                                <option selected={vedleggOptionsValg === FilreferanseType.dokumentlager}
                                        value={FilreferanseType.dokumentlager}>
                                    dokumentlager
                                </option>
                            </select>
                            <select onChange={(evt) => {
                                const filreferanse: SvarutExtended | DokumentlagerExtended | undefined = getFilreferanseExtended(evt.target.value, props.filreferanselager);
                                if (filreferanse) {
                                    setState({
                                        ...state,
                                        valgtFilreferanse: filreferanse
                                    });
                                }
                            }}>
                                {vedleggOptionsValg !== undefined &&
                                <option value={''}>Velg fil som skal legges ved</option>
                                }
                                {vedleggOptionsValg === FilreferanseType.svarut && svarutlager.map((s: SvarutExtended) => {
                                    return <option value={s.id}>{s.tittel}</option>
                                })}
                                {vedleggOptionsValg === FilreferanseType.dokumentlager && dokumentlager.map((s: DokumentlagerExtended) => {
                                    return <option value={s.id}>{s.tittel}</option>
                                })}
                            </select>
                            <button
                                className={"btn btn-primary"}
                                disabled={!state.valgtFilreferanse}
                                onClick={() => {
                                    if (state.valgtFilreferanse) {
                                        props.onVelgFilreferanse(state.valgtFilreferanse);
                                    }
                                }}
                            >
                                <span className={"glyphicon glyphicon-ok"} aria-hidden={"true"}/>
                            </button>

                            <button className={"btn btn-danger"}
                                    onClick={() => setState({
                                        ...state,
                                        visLeggTilVedlegg: false,
                                        valgtFilreferanse: undefined,
                                        vedleggOptionsValg: undefined

                                    })}
                            >
                                <span className={"glyphicon glyphicon-remove"} aria-hidden="true"/>
                            </button>
                        </div>

                    )}
                    {!visLeggTilVedlegg && (
                        <button
                            onClick={() => {
                                setState({...state, visLeggTilVedlegg: true})
                            }}
                            className={"btn btn-primary"}>
                            <span className="glyphicon glyphicon-plus" aria-hidden="true"/>
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div>
            Velg filreferanse:
            {insertVedleggContent()}
            <img src={'image3.png'} alt={''}/>
        </div>
    )
};

const mapStateToProps = (state: AppState) => ({
    filreferanselager: state.v2.filreferanselager
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Filreferanse);