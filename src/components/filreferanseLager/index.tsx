import * as React from 'react';
import {useState} from 'react';
import {Panel} from "nav-frontend-paneler";
import {connect} from "react-redux";
import {AppState, DispatchProps} from "../../redux/reduxTypes";
import {Filreferanselager} from "../../redux/v2/v2Types";
import {DokumentlagerExtended, FilreferanseType, SvarutExtended} from "../../types/hendelseTypes";
import {Input} from "nav-frontend-skjema";
import {generateFilreferanseId} from "../../utils/utilityFunctions";
import {leggTilNyFilILager} from "../../redux/v2/v2Actions";


interface StoreProps {
    filreferanselager: Filreferanselager;
    dispatch: any;
}

type Props = StoreProps & DispatchProps;

interface OwnState {
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

const initialOwnState: OwnState = {
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

    const [ownstate, setState]: [OwnState, (state: OwnState) => void] = useState(initialOwnState as OwnState);

    const {svarutlager, dokumentlager} = props.filreferanselager;
    const {nyFil} = ownstate;

    return (
        <div>
            <Panel>
                Filreferanselager
                <div>
                    Svarut
                    {svarutlager.map((docref: SvarutExtended) => {
                        return <div>Doc tittel: {docref.tittel}. Id: {docref.id}. Nr: {docref.nr}</div>
                    })}
                </div>

                <div>
                    Dokumentlager
                    {
                        dokumentlager.map(((docref: DokumentlagerExtended) => {
                            return <div>Doc tittel: {docref.tittel}. Id: {docref.id}</div>
                        }))
                    }
                </div>
                <div>
                    Last opp nytt dokument
                    (id genereres automatisk av svarut og dokumentlager ved opplasting)
                    <div>
                        <Input feil={ownstate.nyFilValidering.tittelIsValid ? undefined : {feilmelding: "Tittel kan ikke være tom."}}
                               label={"Tittel"}
                               onChange={(evt) => {
                                   const ownstateUpdated = {...ownstate};
                                   const nyfilUpdated = {...ownstate.nyFil};
                                   nyfilUpdated.tittel = evt.target.value;
                                   ownstateUpdated.nyFil = nyfilUpdated;
                                   setState(ownstateUpdated);
                               }}/>
                    </div>
                    <div>
                        {/* Type */}
                        <select onChange={(evt: any) => {
                            const nyFilUpdated = {...ownstate.nyFil};
                            switch (evt.target.value) {
                                case "svarut": {
                                    nyFilUpdated.type = FilreferanseType.svarut;
                                    break;
                                }
                                case "dokumentlager": {
                                    nyFilUpdated.type = FilreferanseType.dokumentlager;
                                    break;
                                }
                            }
                            setState({...ownstate, nyFil: nyFilUpdated, nyFilValidering: {...ownstate.nyFilValidering, nrIsValid: true}});
                        }}>
                            <option selected={ownstate.nyFil.type === undefined} value={''}>Velg opplasting sted
                            </option>
                            <option selected={ownstate.nyFil.type === FilreferanseType.svarut}
                                    value={FilreferanseType.svarut}>svarut
                            </option>
                            <option selected={ownstate.nyFil.type === FilreferanseType.dokumentlager}
                                    value={FilreferanseType.dokumentlager}>dokumentlager
                            </option>
                        </select>
                        { !ownstate.nyFilValidering.typeIsValid && (
                           <span className={"feil-span"}>Du må velge et lagringssted</span>
                        )}
                    </div>
                    <div>
                        {/* Nummer */}
                        {ownstate.nyFil.type === FilreferanseType.svarut && (
                            <Input
                                feil={!ownstate.nyFilValidering.nrIsValid ? {feilmelding: "nummeret er ikke gyldig"} : undefined}
                                label={"Nummer"} value={ownstate.nyFil.nr}
                                onChange={(evt) => {
                                    const nyFilUpdated = {...ownstate.nyFil};
                                    nyFilUpdated.nr = evt.target.value;
                                    setState({
                                        ...ownstate,
                                        nyFil: nyFilUpdated,
                                        nyFilValidering: {...ownstate.nyFilValidering, nrIsValid: true}
                                    });
                                }}/>
                        )}
                    </div>
                    <button className={"btn btn-default"} onClick={() => {
                        const nyFil = {...ownstate.nyFil};


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
                            setState({...ownstate, nyFilValidering: validation.nyFilValidering});
                        }
                    }}>
                        Legg til<span className="glyphicon glyphicon-ok" aria-hidden="true"/>
                    </button>
                </div>
                <div>
                    Own state test:
                    <div>Ny fil tittel: {nyFil.tittel}</div>
                    <div>Nr: {nyFil.nr}</div>
                    <div>Type: {nyFil.type}</div>
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
    if (!nrIsValid) {
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