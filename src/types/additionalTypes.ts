import {FiksDigisosSokerJson, SaksStatus, SoknadsStatusType} from "./hendelseTypes";

export interface Soknad {
    fiksDigisosId: string,
    fnr: string,
    name: string,
    navKontor: NavKontor,
    saker: SaksStatus[],
    soknadsStatus: SoknadsStatusType,
    fiksDigisosSokerJson: FiksDigisosSokerJson
}

export interface NavKontor {
    id: string,
    name: string
}
