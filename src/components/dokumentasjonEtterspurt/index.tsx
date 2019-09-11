import * as React from 'react';
import {useState} from 'react';
import {Panel} from "nav-frontend-paneler";
import {Dokument, dokumentasjonEtterspurt, FilreferanseType, HendelseType, Vedlegg} from "../../types/hendelseTypes";
import {getNow} from "../../utils/utilityFunctions";


interface State {
    nyDokumentasjonEtterspurt: dokumentasjonEtterspurt;
}

const dokumentasjonEtterspurtTemplate: dokumentasjonEtterspurt = {
    type: HendelseType.dokumentasjonEtterspurt,
    hendelsestidspunkt: getNow(),
    forvaltningsbrev: {referanse: {type: FilreferanseType.svarut, id: "12345678-9abc-def0-1234-56789abcdea1", nr: 1}},
    vedlegg: [], // Vedlegg[]
    dokumenter: [], // Dokument[]
};

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

const dokumentTemplate: Dokument = {
    dokumenttype: "Verdivurdering for Black Lotus",
    tilleggsinformasjon: "Antatt mint condition",
    innsendelsesfrist: "millisToLocalDate(Date.now() + daysToMillis(30))"
};

const vedleggTemplate: Vedlegg = {
    tittel: "dokumentasjon etterspurt dokumentlager",
    referanse: {type: FilreferanseType.dokumentlager, id: "12345678-9abc-def0-1234-56789abcdea2"}
};

const initialState: State = {
    nyDokumentasjonEtterspurt: {...dokumentasjonEtterspurtTemplate}
};


const DokumentasjonEtterspurt= () => {

    const [state, setState]: [State, (state: State) => void] = useState(initialState);


    return (
        <div>
            Etterspør dokumentasjon
            <Panel>
                <div className={"dokumentasjonEtterspurt-row"}>
                    asdf
                </div>
            </Panel>
        </div>
    )
};

export default DokumentasjonEtterspurt;