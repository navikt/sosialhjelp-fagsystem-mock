import {SaksStatusType, SoknadsStatusType} from "./hendelseTypes";

export interface Soknad {
    fiksDigisosId: string,
    fnr: string,
    name: string,
    navKontor: NavKontor,
    saker: Sak[],
    soknadsStatus: SoknadsStatusType
}

export interface NavKontor {
    id: number,
    name: string
}

export interface Sak {
    tittel: string;
    referanse: string;
    status: SaksStatusType;
}