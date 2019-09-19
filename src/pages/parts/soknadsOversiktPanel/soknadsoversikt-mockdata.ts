import {Sak, Soknad} from "../../../types/additionalTypes";
import {SaksStatusType, SoknadsStatusType} from "../../../types/hendelseTypes";


const saker: Sak[] = [
    {
        tittel: "Nødhjelp",
        referanse: "sak1",
        status: SaksStatusType.UNDER_BEHANDLING
    },
    {
        tittel: "Livsopphold",
        referanse: "sak2",
        status: SaksStatusType.UNDER_BEHANDLING
    },
    {
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
        "soknadsStatus": SoknadsStatusType.MOTTATT
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
        "soknadsStatus": SoknadsStatusType.MOTTATT
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
        "soknadsStatus": SoknadsStatusType.MOTTATT
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
        "soknadsStatus": SoknadsStatusType.MOTTATT
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
        "soknadsStatus": SoknadsStatusType.MOTTATT
    }
];



