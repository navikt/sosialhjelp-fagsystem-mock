import * as React from 'react';
import {useState} from 'react';
import {Panel} from "nav-frontend-paneler";
import {connect} from "react-redux";
import {AppState, DispatchProps} from "../../redux/reduxTypes";
import {Filreferanselager} from "../../redux/v2/v2Types";
import {DokumentlagerExtended, FilreferanseType, SvarutExtended} from "../../types/hendelseTypes";
import {Input, Select} from "nav-frontend-skjema";
import {generateFilreferanseId} from "../../utils/utilityFunctions";
import {leggTilNyFilILager} from "../../redux/v2/v2Actions";


interface StoreProps {
    filreferanselager: Filreferanselager;
    dispatch: any;
}

type Props = StoreProps & DispatchProps;

interface State {
    nyFil: NyFil;
    nyFilValidering: NyFilValidering;
}

interface NyFilValidering {
    typeIsValid: boolean;
    tittelIsValid: boolean;
    nrIsValid: boolean;
}

interface FilreferanseValidering {
    isValid: boolean;
    nyFilValidering: NyFilValidering;
}

interface NyFil {
    type: FilreferanseType | undefined;
    tittel: string;
    nr: string;
}

const initialState: State = {
    nyFil: {
        type: undefined,
        tittel: "",
        nr: ""
    },
    nyFilValidering: {
        typeIsValid: true,
        tittelIsValid: true,
        nrIsValid: true
    }
};

const FilreferanseLager: React.FC<Props> = (props: Props) => {

    const [state, setState]: [State, (state: State) => void] = useState(initialState as State);

    const {svarutlager, dokumentlager} = props.filreferanselager;
    // const {nyFil} = state;

    return (
        <div>
            <Panel>
                <h3>Filreferanselager</h3>
                <div className={'margin-top-3'}>
                    <h4>Svarut</h4>
                    <ol>
                        {svarutlager.map((docref: SvarutExtended, idx) => {
                            return <li key={idx}>
                                <div>Doc tittel: {docref.tittel}. Id: {docref.id}. Nr: {docref.nr}</div>
                            </li>
                        })}
                    </ol>
                </div>

                <div>
                    <h4>Dokumentlager</h4>
                    <ol>
                        {
                            dokumentlager.map(((docref: DokumentlagerExtended, idx: number) => {
                                return <li key={idx}>
                                    <div>Doc tittel: {docref.tittel}. Id: {docref.id}</div>
                                </li>
                            }))
                        }
                    </ol>
                </div>
                <div className={"margin-top-3"}>
                    <h4>Last opp nytt dokument</h4>
                    <span>(id genereres automatisk av svarut og dokumentlager ved opplasting)</span>
                    <div className={'margin-top'}>
                        {/* Tittel */}
                        <Input
                            feil={state.nyFilValidering.tittelIsValid ? undefined : {feilmelding: "Tittel kan ikke være tom."}}
                            label={"Tittel"}
                            onChange={(evt) => {
                                const stateUpdated = {...state};
                                const nyfilUpdated = {...state.nyFil};
                                nyfilUpdated.tittel = evt.target.value;
                                stateUpdated.nyFil = nyfilUpdated;
                                const nyFilValideringUpdated = {...stateUpdated.nyFilValidering};
                                nyFilValideringUpdated.tittelIsValid = true;
                                stateUpdated.nyFilValidering = nyFilValideringUpdated;
                                setState(stateUpdated);
                            }}/>
                    </div>
                    <div>
                        {/* Type */}
                        <Select
                            label={'Opplastingssted'}
                            feil={state.nyFilValidering.typeIsValid ? undefined : {feilmelding: 'Du må velge et lagringssted'}}
                            onChange={(evt: any) => {
                                const nyFilUpdated = {...state.nyFil};
                                switch (evt.target.value) {
                                    case "svarut": {
                                        nyFilUpdated.type = FilreferanseType.svarut;
                                        break;
                                    }
                                    case "dokumentlager": {
                                        nyFilUpdated.type = FilreferanseType.dokumentlager;
                                        break;
                                    }
                                    default: {
                                        nyFilUpdated.type = undefined;
                                        break;
                                    }
                                }
                                setState({
                                    ...state,
                                    nyFil: nyFilUpdated,
                                    nyFilValidering: {...state.nyFilValidering, nrIsValid: true, typeIsValid: true}
                                });
                            }}>
                            <option selected={state.nyFil.type === undefined} value={''}>Velg opplasting sted
                            </option>
                            <option selected={state.nyFil.type === FilreferanseType.svarut}
                                    value={FilreferanseType.svarut}>svarut
                            </option>
                            <option selected={state.nyFil.type === FilreferanseType.dokumentlager}
                                    value={FilreferanseType.dokumentlager}>dokumentlager
                            </option>
                        </Select>
                        {/*{!state.nyFilValidering.typeIsValid && (*/}
                        {/*    <div className={"feil-span"}>Du må velge et lagringssted</div>*/}
                        {/*)}*/}
                    </div>
                    <div>
                        {/* Nummer */}
                        {state.nyFil.type === FilreferanseType.svarut && (
                            <Input
                                feil={!state.nyFilValidering.nrIsValid ? {feilmelding: "nummeret er ikke gyldig"} : undefined}
                                label={"Nummer"} value={state.nyFil.nr}
                                onChange={(evt) => {
                                    const nyFilUpdated = {...state.nyFil};
                                    nyFilUpdated.nr = evt.target.value;
                                    setState({
                                        ...state,
                                        nyFil: nyFilUpdated,
                                        nyFilValidering: {...state.nyFilValidering, nrIsValid: true}
                                    });
                                }}/>
                        )}
                    </div>
                    <button className={"btn btn-primary"} onClick={() => {
                        const nyFil = {...state.nyFil};


                        const validation: FilreferanseValidering = validerNyFil(nyFil);


                        if (validation.isValid) {
                            const nr: number = parseInt(nyFil.nr, 10);

                            switch (nyFil.type) {
                                case FilreferanseType.svarut: {
                                    const nySvarutFilreferanse: SvarutExtended = {
                                        tittel: nyFil.tittel,
                                        type: FilreferanseType.svarut,
                                        id: generateFilreferanseId(),
                                        nr: nr
                                    };
                                    props.dispatch(leggTilNyFilILager(nySvarutFilreferanse));
                                    break;
                                }
                                case FilreferanseType.dokumentlager: {
                                    const nyDokumentlagerFilreferanse: DokumentlagerExtended = {
                                        tittel: nyFil.tittel,
                                        type: FilreferanseType.dokumentlager,
                                        id: generateFilreferanseId()
                                    };
                                    props.dispatch(leggTilNyFilILager(nyDokumentlagerFilreferanse));
                                    break;
                                }
                            }
                        } else {
                            setState({...state, nyFilValidering: validation.nyFilValidering});
                        }
                    }}>
                        Legg til<span className="glyphicon glyphicon-ok" aria-hidden="true"/>
                    </button>
                </div>
            </Panel>
        </div>
    )
};


const validerNyFil: (nyFil: NyFil) => FilreferanseValidering = (nyFil) => {
    let filreferanseValidation: FilreferanseValidering = {
        isValid: true,
        nyFilValidering: {
            typeIsValid: true,
            tittelIsValid: true,
            nrIsValid: true,
        }
    };
    if (nyFil.tittel.length === 0) {
        filreferanseValidation.isValid = false;
        filreferanseValidation.nyFilValidering.tittelIsValid = false;
    }
    const nrIsValid = nyFil.nr.match(/^\d+$/);
    if (!nrIsValid && nyFil.type === FilreferanseType.svarut) {
        filreferanseValidation.isValid = false;
        filreferanseValidation.nyFilValidering.nrIsValid = false;
    }
    if (nyFil.type !== FilreferanseType.dokumentlager && nyFil.type !== FilreferanseType.svarut) {
        filreferanseValidation.isValid = false;
        filreferanseValidation.nyFilValidering.typeIsValid = false;
    }
    return filreferanseValidation
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