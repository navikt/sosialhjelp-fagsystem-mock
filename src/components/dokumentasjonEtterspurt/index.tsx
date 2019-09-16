import * as React from 'react';
import {useState} from 'react';
import {Panel} from "nav-frontend-paneler";
import Hendelse, {
    Dokument,
    dokumentasjonEtterspurt, DokumentlagerExtended,
    FilreferanseType,
    Forvaltningsbrev,
    HendelseType, SvarutExtended,
    Vedlegg
} from "../../types/hendelseTypes";
import {formatDate, getNow} from "../../utils/utilityFunctions";
import {connect} from "react-redux";
import {AppState} from "../../redux/reduxTypes";
import {Filreferanselager} from "../../redux/v2/v2Types";
import Filreferanse from '../Filreferanse';
import {Input, SkjemaGruppe} from "nav-frontend-skjema";
import DayPickerInput from 'react-day-picker/DayPickerInput';


interface DokumentExtended {
    dokumenttype: string;
    tilleggsinformasjon: string;
    innsendelsesfrist: string;
}

const dokumentasjonEtterspurtTemplate: dokumentasjonEtterspurt = {
    type: HendelseType.dokumentasjonEtterspurt,
    hendelsestidspunkt: getNow(),
    forvaltningsbrev: {referanse: {type: FilreferanseType.svarut, id: "12345678-9abc-def0-1234-56789abcdea1", nr: 1}},
    vedlegg: [], // Vedlegg[]
    dokumenter: [], // Dokument[]
};

const nyttDokumentTemplate: DokumentExtended = {
    dokumenttype: '',
    tilleggsinformasjon: '',
    innsendelsesfrist: ''
};


// export interface dokumentasjonEtterspurt {
//     type: HendelseType.dokumentasjonEtterspurt;
//     hendelsestidspunkt: string;
//     forvaltningsbrev: Forvaltningsbrev;
//     vedlegg: Vedlegg[];
//     dokumenter: Dokument[];
// }


interface OwnProps {

}

interface StoreProps {
    hendelser: Hendelse[],
    filreferanselager: Filreferanselager
}

type Props = OwnProps & StoreProps;


interface State {
    forvaltningsbrev: SvarutExtended | DokumentlagerExtended | undefined;
    dokumenter: DokumentExtended[];
    vedlegg: Vedlegg[];
    nyttDokumentkrav: DokumentExtended;
}

const initialState: State = {
    forvaltningsbrev: undefined,
    dokumenter: [],
    vedlegg: [],
    nyttDokumentkrav: {...nyttDokumentTemplate}
};


const DokumentasjonEtterspurt = (props: Props) => {

    const [state, setState]: [State, (state: State) => void] = useState(initialState);

    const visValgtForvaltningsbre = () => {
        const {forvaltningsbrev} = state;
        return forvaltningsbrev ? (<div>{forvaltningsbrev.tittel}</div>) : null;
    };

    const settInnListeOverDokumenterSomKreves = () => {
        return state.dokumenter.map((dokument: DokumentExtended) => {
            return (
                <div>Dokumenttype: {dokument.dokumenttype}. Tilleggsinformasjon: {dokument.tilleggsinformasjon}.
                    Frist: {dokument.innsendelsesfrist}</div>
            )
        })
    };

    return (
        <div>
            Etterspør dokumentasjon
            <Panel>
                <div className={"dokumentasjonEtterspurt-row"}>
                    Forvaltningsbrev:
                    <span>{visValgtForvaltningsbre()}</span>
                    <Filreferanse
                        onVelgFilreferanse={(filreferanse: SvarutExtended | DokumentlagerExtended) => {
                            setState({
                                ...state,
                                forvaltningsbrev: filreferanse
                            })
                        }}
                    />
                    Liste over dokumenter som kreves:
                    {settInnListeOverDokumenterSomKreves()}
                    Legg til nytt dokumentasjonskrav:
                    <SkjemaGruppe>
                        <Input value={state.nyttDokumentkrav.dokumenttype} label="Dokumenttype"
                               onChange={(evt) => setState({
                                   ...state,
                                   nyttDokumentkrav: {...state.nyttDokumentkrav, dokumenttype: evt.target.value}
                               })}/>
                        <Input value={state.nyttDokumentkrav.tilleggsinformasjon} label="Tilleggsinformasjon"
                               onChange={(evt) => setState({
                                   ...state,
                                   nyttDokumentkrav: {...state.nyttDokumentkrav, tilleggsinformasjon: evt.target.value}
                               })}/>
                        <DayPickerInput
                            format={'MM/dd/yyyy'}
                            onDayChange={(date: Date) => {
                                const frist: string = formatDate(date);
                                setState({...state, nyttDokumentkrav: {...state.nyttDokumentkrav, innsendelsesfrist: frist}})
                            }}
                        />
                        <div className={"margin-top"}>
                            <button
                                className={"btn btn-primary"}
                                onClick={() => {
                                    const dokumenterUpdated = state.dokumenter.map(d => d);
                                    dokumenterUpdated.push(state.nyttDokumentkrav);
                                    setState({...state, dokumenter: dokumenterUpdated, nyttDokumentkrav: {...nyttDokumentTemplate}})
                                }}
                            >
                                Legg til dokumentkrav
                            </button>
                        </div>
                    </SkjemaGruppe>
                </div>
            </Panel>
        </div>
    )
};

const mapStateToProps = (state: AppState) => ({
    hendelser: state.v2.fiksDigisosSokerJson.sak.soker.hendelser,
    filreferanselager: state.v2.filreferanselager
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(DokumentasjonEtterspurt)