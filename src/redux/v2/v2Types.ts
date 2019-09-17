import {
    DokumentlagerExtended,
    FiksDigisosSokerJson,
    SvarutExtended
} from "../../types/hendelseTypes";
import {PaletteType} from "@material-ui/core";

export interface V2Model {
    fiksDigisosId: string;
    fiksDigisosSokerJson: FiksDigisosSokerJson;
    loaderOn: boolean;
    setFiksDigisosIdIsEnabled: boolean;
    backendUrls: BackendUrls;
    backendUrlTypeToUse: string;
    filreferanselager: Filreferanselager;
    thememode: PaletteType;
}

export interface BackendUrls {
    local: string,
    digisostest: string,
    q: string
}

export interface Filreferanselager {
    svarutlager: SvarutExtended[],
    dokumentlager: DokumentlagerExtended[]
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
    | LeggTilNyFilILager
    | SwitchToDarkMode
    | SwitchToLightMode

export enum V2ActionTypeKeys {
    SET_FIKS_DIGISOS_ID = "v2/SET_DIGISOS_FIKS_ID",
    SET_FIKS_DIGISOS_SOKER_JSON = "v2/UPDATE_DIGISOS_SOKER_JSON",
    TURN_ON_LOADER = "v2/TURN_ON_LOADER",
    TURN_OFF_LOADER = "v2/TURN_OFF_LOADER",
    ENABLE_SET_FIKS_DIGISOS_ID = "v2/ENABLE_SET_FIKS_DIGISOS_ID",
    DISABLE_SET_FIKS_DIGISOS_ID = "v2/DISABLE_SET_FIKS_DIGISOS_ID",
    SET_BACKEND_URL_TYPE_TO_USE = "v2/SET_BACKEND_URL_TYPE_TO_USE",
    EDIT_BACKEND_URL_FOR_TYPE = "v2/EDIT_BACKEND_URL_FOR_TYPE",
    LEGG_TIL_NY_FIL_I_LAGER = "v2/LEGG_TIL_NY_TIL_I_LAGER",
    SWITCH_TO_DARK_MODE = "v2/SWITCH_TO_DARK_MODE",
    SWITCH_TO_LIGHT_MODE = "v2/SWITCH_TO_LIGHT_MODE",
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

export interface LeggTilNyFilILager {
    type: V2ActionTypeKeys.LEGG_TIL_NY_FIL_I_LAGER;
    nyFilreferanse: SvarutExtended | DokumentlagerExtended;
}

export interface SwitchToDarkMode {
    type: V2ActionTypeKeys.SWITCH_TO_DARK_MODE;
}

export interface SwitchToLightMode {
    type: V2ActionTypeKeys.SWITCH_TO_LIGHT_MODE;
}