import {Dokumentlager, FiksDigisosSokerJson, Svarut} from "../../types/hendelseTypes";

export interface V2Model {
    fiksDigisosId: string;
    fiksDigisosSokerJson: FiksDigisosSokerJson;
    loaderOn: boolean;
    setFiksDigisosIdIsEnabled: boolean;
    backendUrls: BackendUrls;
    backendUrlTypeToUse: string;
    filreferanselager: Filreferanselager;
}

export interface BackendUrls {
    local: string,
    digisostest: string,
    q: string
}

export interface Filreferanselager {
    svarutlager: Svarut[],
    dokumentlager: Dokumentlager[]
}

export type V2Action
    = SetFiksDigisosId
    | SetDigisosSokerJson
    | TurnOnLoader
    | TurnOffLoader
    | EnableSetFiksDigisosId
    | DisableSetFiksDigisosId
    | SetBackendUrlTypeToUse
    | EditBackendUrlForType

export enum V2ActionTypeKeys {
    SET_FIKS_DIGISOS_ID = "v2/SET_DIGISOS_FIKS_ID",
    SET_FIKS_DIGISOS_SOKER_JSON = "v2/UPDATE_DIGISOS_SOKER_JSON",
    TURN_ON_LOADER = "v2/TURN_ON_LOADER",
    TURN_OFF_LOADER = "v2/TURN_OFF_LOADER",
    ENABLE_SET_FIKS_DIGISOS_ID = "v2/ENABLE_SET_FIKS_DIGISOS_ID",
    DISABLE_SET_FIKS_DIGISOS_ID = "v2/DISABLE_SET_FIKS_DIGISOS_ID",
    SET_BACKEND_URL_TYPE_TO_USE = "v2/SET_BACKEND_URL_TYPE_TO_USE",
    EDIT_BACKEND_URL_FOR_TYPE = "v2/EDIT_BACKEND_URL_FOR_TYPE"
}

export interface SetFiksDigisosId {
    type: V2ActionTypeKeys.SET_FIKS_DIGISOS_ID;
    fiksDigisosId: string;
}

export interface SetDigisosSokerJson {
    type: V2ActionTypeKeys.SET_FIKS_DIGISOS_SOKER_JSON;
    fiksDigisosSokerJson: any;
}

export interface TurnOnLoader {
    type: V2ActionTypeKeys.TURN_ON_LOADER;
}

export interface TurnOffLoader {
    type: V2ActionTypeKeys.TURN_OFF_LOADER;
}

export interface EnableSetFiksDigisosId {
    type: V2ActionTypeKeys.ENABLE_SET_FIKS_DIGISOS_ID;
}

export interface DisableSetFiksDigisosId {
    type: V2ActionTypeKeys.DISABLE_SET_FIKS_DIGISOS_ID;
}

export interface SetBackendUrlTypeToUse {
    type: V2ActionTypeKeys.SET_BACKEND_URL_TYPE_TO_USE;
    backendUrlTypeToUse: string
}

export interface EditBackendUrlForType {
    type: V2ActionTypeKeys.EDIT_BACKEND_URL_FOR_TYPE;
    backendUrlType: string;
    backendUrlUpdated: string;
}
