import * as React from 'react';
import {useState} from 'react';
import {Panel} from "nav-frontend-paneler";
import Hendelse, {
    Dokument,
    dokumentasjonEtterspurt,
    DokumentlagerExtended,
    Forvaltningsbrev,
    HendelseType,
    SvarutExtended,
    Vedlegg
} from "../../types/hendelseTypes";
import {convertToFilreferanse, formatDate, getNow} from "../../utils/utilityFunctions";
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

interface VedleggExtended {
    tittel: string;
    referanse: SvarutExtended | DokumentlagerExtended | undefined;
}

// const dokumentasjonEtterspurtTemplate: dokumentasjonEtterspurt = {
//     type: HendelseType.dokumentasjonEtterspurt,
//     hendelsestidspunkt: getNow(),
//     forvaltningsbrev: {referanse: {type: FilreferanseType.svarut, id: "12345678-9abc-def0-1234-56789abcdea1", nr: 1}},
//     vedlegg: [], // Vedlegg[]
//     dokumenter: [], // Dokument[]
// };

const nyttDokumentTemplate: DokumentExtended = {
    dokumenttype: '',
    tilleggsinformasjon: '',
    innsendelsesfrist: ''
};

const nyttVedleggTemplate: VedleggExtended = {
    tittel: '',
    referanse: undefined
};


interface asdfdokumentasjonEtterspurt {
    type: HendelseType.dokumentasjonEtterspurt;
    hendelsestidspunkt: string;
    forvaltningsbrev: Forvaltningsbrev;
    vedlegg: Vedlegg[];
    dokumenter: Dokument[];
}


interface OwnProps {
    onLeggTilDokumentasjonEtterspurt: (hendelse: dokumentasjonEtterspurt) => void;
}

interface StoreProps {
    hendelser: Hendelse[],
    filreferanselager: Filreferanselager
}

type Props = OwnProps & StoreProps;


interface State {
    forvaltningsbrev: SvarutExtended | DokumentlagerExtended | undefined;
    dokumenter: Dokument[];
    vedlegg: Vedlegg[];
    nyttDokumentkrav: DokumentExtended;
    nyttVedlegg: VedleggExtended;
}

const initialState: State = {
    forvaltningsbrev: undefined,
    dokumenter: [],
    vedlegg: [],
    nyttDokumentkrav: {...nyttDokumentTemplate},
    nyttVedlegg: {...nyttVedleggTemplate}
};


const DokumentasjonEtterspurt = (props: Props) => {

    const [state, setState]: [State, (state: State) => void] = useState(initialState);

    const dokumentkravErGyldig = (): boolean => {
        return true;
    };

    const visValgtForvaltningsbrev = () => {
        const {forvaltningsbrev} = state;
        return forvaltningsbrev ? (<div>{forvaltningsbrev.tittel}</div>) :
            <div>Du må spesifisere et forvaltningsbrev</div>;
    };

    const settInnListeOverDokumenterSomKreves = () => {
        return state.dokumenter.map((dokument: DokumentExtended) => {
            return (
                <div>Dokumenttype: {dokument.dokumenttype}. Tilleggsinformasjon: {dokument.tilleggsinformasjon}.
                    Frist: {dokument.innsendelsesfrist}</div>
            )
        })
    };

    const settInnListeOverVedleggSomErLagtTil = () => {
        return state.vedlegg.map((vedlegg: Vedlegg) => {
            return (
                <div>Vedlegg: {vedlegg.tittel} </div>
            )
        })

    };

    return (
        <div>
            Etterspør dokumentasjon
            <Panel>
                <div className={"margin-top-3"}>
                    {/* FORVALTNINGSBREV*/}
                    <h4>Velg forvaltningsbrev</h4>
                    {state.forvaltningsbrev && <span>{visValgtForvaltningsbrev()}</span>}
                    {!state.forvaltningsbrev && (
                        <Filreferanse
                            onVelgFilreferanse={(filreferanse: SvarutExtended | DokumentlagerExtended) => {
                                setState({
                                    ...state,
                                    forvaltningsbrev: filreferanse
                                })
                            }}
                        />
                    )}
                </div>
                <div className={"margin-top-3"}>
                    {/* Dokumenter */}
                    <div>
                        Spesifiserte dokumentasjonskrav:
                        {settInnListeOverDokumenterSomKreves()}
                    </div>
                    <div className={"margin-top"}>
                        Spesifiser nytt dokumentasjonskrav:
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
                            Leveringsfrist for vedlegg:
                            <DayPickerInput
                                format={'MM/dd/yyyy'}
                                onDayChange={(date: Date) => {
                                    const frist: string = formatDate(date);
                                    setState({
                                        ...state,
                                        nyttDokumentkrav: {...state.nyttDokumentkrav, innsendelsesfrist: frist}
                                    })
                                }}
                            />
                            <div className={"margin-top"}>
                                <button
                                    className={"btn btn-primary"}
                                    onClick={() => {
                                        const dokumenterUpdated: Dokument[] = state.dokumenter.map(d => d);
                                        dokumenterUpdated.push(state.nyttDokumentkrav);
                                        setState({
                                            ...state,
                                            dokumenter: dokumenterUpdated,
                                            nyttDokumentkrav: {...nyttDokumentTemplate}
                                        })
                                    }}
                                >
                                    Legg til dokumentkrav
                                </button>
                            </div>
                        </SkjemaGruppe>
                    </div>
                </div>
                <div>
                    {/* VEDLEGG */}
                    <div className={"margin-top-3"}>
                        <h4>Liste over vedlegg som er lagt til:</h4>
                        {settInnListeOverVedleggSomErLagtTil()}
                        <Filreferanse
                            onVelgFilreferanse={(filreferanse: SvarutExtended | DokumentlagerExtended) => {
                                const vedleggUpdated = state.vedlegg.map(v => v);
                                const nyttVedlegg: Vedlegg = {
                                    tittel: filreferanse.tittel,
                                    referanse: convertToFilreferanse(filreferanse)
                                };
                                vedleggUpdated.push(nyttVedlegg);
                                setState({...state, vedlegg: vedleggUpdated})
                            }}
                        />
                    </div>
                </div>

                <div className={"margin-top-3"}>
                    <button
                        className={"btn btn-primary"}
                        onClick={() => {
                            if (
                                // FIXME: implementer validering
                                dokumentkravErGyldig() &&
                                state.forvaltningsbrev
                            ) {
                                const forvaltningsbrevFilreferanseExtended: SvarutExtended | DokumentlagerExtended = {...state.forvaltningsbrev};

                                const forvaltningsbrevFilreferanse = convertToFilreferanse(forvaltningsbrevFilreferanseExtended);
                                const vedleggUpdated = state.vedlegg.map(v => v);
                                const dokumenterUpdated = state.dokumenter.map(d => d);


                                const hendelse: dokumentasjonEtterspurt = {
                                    type: HendelseType.dokumentasjonEtterspurt,
                                    hendelsestidspunkt: getNow(),
                                    forvaltningsbrev: {
                                        referanse: forvaltningsbrevFilreferanse,

                                    },
                                    vedlegg: vedleggUpdated,
                                    dokumenter: dokumenterUpdated,
                                };
                                props.onLeggTilDokumentasjonEtterspurt(hendelse);
                            }
                        }}
                    >
                        Lagre dokumentkrav
                    </button>
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