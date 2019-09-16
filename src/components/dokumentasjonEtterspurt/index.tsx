import * as React from 'react';
import {useState} from 'react';
import {Panel} from "nav-frontend-paneler";
import Hendelse, {
    Dokument,
    dokumentasjonEtterspurt,
    FilreferanseType,
    Forvaltningsbrev,
    HendelseType,
    Vedlegg
} from "../../types/hendelseTypes";
import {getNow} from "../../utils/utilityFunctions";
import {connect} from "react-redux";
import {AppState} from "../../redux/reduxTypes";
import {Filreferanselager} from "../../redux/v2/v2Types";
import Filreferanse from '../Filreferanse';


// const dokumentasjonEtterspurtTemplate2: dokumentasjonEtterspurt = {
//     "type": "dokumentasjonEtterspurt",
//     "hendelsestidspunkt": "2018-10-11T13:42:00.134Z",
//     "forvaltningsbrev": {
//         "referanse": {
//             "type": "dokumentlager",
//             "id": "12345678-9abc-def0-1234-56789abcdea1"
//         }
//     },
//     "vedlegg": [
//         {
//             "tittel": "dokumentasjon etterspurt dokumentlager",
//             "referanse": {
//                 "type": "dokumentlager",
//                 "id": "12345678-9abc-def0-1234-56789abcdea2"
//             }
//         },
//         {
//             "tittel": "dokumentasjon etterspurt svarut",
//             "referanse": {
//                 "type": "svarut",
//                 "id": "12345678-9abc-def0-1234-56789abcdea3",
//                 "nr": 1
//             }
//         }
//     ],
//     "dokumenter": [
//         {
//             "dokumenttype": "Strømfaktura",
//             "tilleggsinformasjon": "For periode 01.01.2019 til 01.02.2019",
//             "innsendelsesfrist": "2018-10-20T07:37:00.134Z"
//         },
//         {
//             "dokumenttype": "Kopi av depositumskonto",
//             "tilleggsinformasjon": "Signert av både deg og utleier",
//             "innsendelsesfrist": "2018-10-20T07:37:30.000Z"
//         }
//     ]
// }


interface State {
    nyDokumentasjonEtterspurt: dokumentasjonEtterspurt;
    // nytt vedlegg:
    nyttVedlegg: Vedlegg | undefined;
    nyttDokument: DokumentExtended | undefined;
}

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

const initialState: State = {
    nyDokumentasjonEtterspurt: {...dokumentasjonEtterspurtTemplate},
    nyttVedlegg: undefined,
    nyttDokument: {...nyttDokumentTemplate}
};

interface OwnProps {

}

interface StoreProps {
    hendelser: Hendelse[],
    filreferanselager: Filreferanselager
}

type Props = OwnProps & StoreProps;

// export interface dokumentasjonEtterspurt {
//     type: HendelseType.dokumentasjonEtterspurt;
//     hendelsestidspunkt: string;
//     forvaltningsbrev: Forvaltningsbrev;
//     vedlegg: Vedlegg[];
//     dokumenter: Dokument[];
// }

interface dokumentasjonEtterspurtExtended {
    forvaltningsbrev: Forvaltningsbrev | undefined;
    vedlegg: Vedlegg[];
    dokumenter: Dokument[];
}



const DokumentasjonEtterspurt = (props: Props) => {

    const [state, setState]: [State, (state: State) => void] = useState(initialState);

    console.warn(JSON.stringify(state));
    console.warn(JSON.stringify(setState));

    return (
        <div>
            Etterspør dokumentasjon
            <Panel>
                <div className={"dokumentasjonEtterspurt-row"}>
                    <Filreferanse onVelgFilreferanse={() => console.warn("On submit file")} />
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