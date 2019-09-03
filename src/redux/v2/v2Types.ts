export interface V2Model {
    fiksDigisosId: string,
    digisosSokerJson: any,
    loaderOn: boolean
}


export type V2Action
    = SetFiksDigisosId
    | SetDigisosSokerJson
    | TurnOnLoader
    | TurnOffLoader

export enum V2ActionTypeKeys {
    SET_FIKS_DIGISOS_ID = "v2/SET_DIGISOS_FIKS_ID",
    SET_DIGISOS_SOKER_JSON = "v2/UPDATE_DIGISOS_SOKER_JSON",
    TURN_ON_LOADER = "v2/TURN_ON_LOADER",
    TURN_OFF_LOADER = "v2/TURN_OFF_LOADER"
}

export interface SetFiksDigisosId {
    type: V2ActionTypeKeys.SET_FIKS_DIGISOS_ID,
    fiksDigisosId: string
}

export interface SetDigisosSokerJson {
    type: V2ActionTypeKeys.SET_DIGISOS_SOKER_JSON,
    digisosSokerJson: any
}

export interface TurnOnLoader {
    type: V2ActionTypeKeys.TURN_ON_LOADER
}

export interface TurnOffLoader {
    type: V2ActionTypeKeys.TURN_OFF_LOADER
}