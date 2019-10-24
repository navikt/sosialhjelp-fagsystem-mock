import {Soknad} from "../../../types/additionalTypes";
import {HendelseType, SaksStatus, SaksStatusType, SoknadsStatusType} from "../../../types/hendelseTypes";
import {minimal} from "../../../digisos/fiksDigisosSokerJsonMinimal";


// const vedtakReferanse: Dokumentlager = {
//     type: FilreferanseType.dokumentlager,
//     id: "3h3960yd-2562-0x96-dv7r-5m78yc2cn57l"
// };
//
// const vedlegg1ref: Dokumentlager = {
//     type: FilreferanseType.dokumentlager,
//     id: "4h3960yd-2562-0x96-dv7r-5m78yc2cn57l"
// };
//
// const vedlegg2ref: Dokumentlager = {
//     type: FilreferanseType.dokumentlager,
//     id: "5h3960yd-2562-0x96-dv7r-5m78yc2cn57l"
// };
//
// const vedlegg1: Vedlegg = {
//     tittel: "Veien videre",
//     referanse: vedlegg1ref
// };
//
// const vedlegg2: Vedlegg = {
//     tittel: "Veien videre",
//     referanse: vedlegg2ref
// };
//
// const vedtak: VedtakFattet = {
//     type: HendelseType.VedtakFattet,
//     hendelsestidspunkt: "2018-10-08T21:47:00.134Z",
//     saksreferanse: "sak1",
//     utfall: { utfall: Utfall.INNVILGET },
//     vedtaksfil: { referanse: vedtakReferanse},
//     vedlegg: [vedlegg1, vedlegg2]
// };

const saker: SaksStatus[] = [
    {
        type: HendelseType.SaksStatus,
        hendelsestidspunkt: "2018-10-08T21:47:00.134Z",
        tittel: "Nødhjelp",
        referanse: "sak1",
        status: SaksStatusType.UNDER_BEHANDLING
    },
    {
        type: HendelseType.SaksStatus,
        hendelsestidspunkt: "2018-10-08T21:47:00.134Z",
        tittel: "Livsopphold",
        referanse: "sak2",
        status: SaksStatusType.UNDER_BEHANDLING
    },
    {
        type: HendelseType.SaksStatus,
        hendelsestidspunkt: "2018-10-08T21:47:00.134Z",
        tittel: "Penger til skateboard",
        referanse: "sak3",
        status: SaksStatusType.UNDER_BEHANDLING
    }
];

export const soknadMockData: Soknad[] =
[
    {
        "fiksDigisosId": "001",
        "fnr": "14029311223",
        "name": "Donald Duck",
        "navKontor": {
            id: 1234,
            name: "Nav Frogner"
        },
        "saker": saker,
        "soknadsStatus": SoknadsStatusType.MOTTATT,
        "fiksDigisosSokerJson": {...minimal}
    },
    {
        "fiksDigisosId": "002",
        "fnr": "13096911223",
        "name": "Reynor Sc2",
        "navKontor": {
            id: 1337,
            name: "Nav Kautokeino"
        },
        "saker": [],
        "soknadsStatus": SoknadsStatusType.MOTTATT,
        "fiksDigisosSokerJson": {...minimal}
    },
    {
        "fiksDigisosId": "003",
        "fnr": "02027311223",
        "name": "Luke Skywalker",
        "navKontor": {
            id: 1337,
            name: "Nav Kautokeino"
        },
        "saker": [],
        "soknadsStatus": SoknadsStatusType.MOTTATT,
        "fiksDigisosSokerJson": {...minimal}
    },
    {
        "fiksDigisosId": "004",
        "fnr": "02058011223",
        "name": "Mr. Anderson",
        "navKontor": {
            id: 1234,
            name: "Nav Frogner"
        },
        "saker": [],
        "soknadsStatus": SoknadsStatusType.MOTTATT,
        "fiksDigisosSokerJson": {...minimal}
    },
    {
        "fiksDigisosId": "005",
        "fnr": "01026411223",
        "name": "Han Solo",
        "navKontor": {
            id: 1234,
            name: "Nav Frogner"
        },
        "saker": [],
        "soknadsStatus": SoknadsStatusType.MOTTATT,
        "fiksDigisosSokerJson": {...minimal}
    }
];



