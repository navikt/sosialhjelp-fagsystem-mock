import {V2Action, V2ActionTypeKeys} from "./v2Types";
import {Dispatch} from "redux";
import {fetchPost, getDigisosApiControllerPath} from "../../utils/restUtils";
import {FiksDigisosSokerJson} from "../../types/hendelseTypes";

export const setfiksDigisosId = (fiksDigisosId: string): V2Action => {
    return {
        type: V2ActionTypeKeys.SET_FIKS_DIGISOS_ID,
        fiksDigisosId
    }
};

export const setFiksDigisosSokerJson = (fiksDigisosSokerJson: any): V2Action => {
    return {
        type: V2ActionTypeKeys.SET_FIKS_DIGISOS_SOKER_JSON,
        fiksDigisosSokerJson: fiksDigisosSokerJson
    }
};


export function sendFiksDigisosSokerJson(fiksDigisosId: string, fiksDigisosSokerJson: FiksDigisosSokerJson) {
    return (dispatch: Dispatch) => {
        dispatch(turnOnLoader());
        const url = getDigisosApiControllerPath();
        const queryParam = `?fiksDigisosId=${fiksDigisosId}`;
        fetchPost(`${url}${queryParam}`, JSON.stringify(fiksDigisosSokerJson)).then((response: any) => {
            dispatch(setFiksDigisosSokerJson(fiksDigisosSokerJson));
            dispatch(turnOffLoader());
        }).catch((reason) => {
            // TODO: Handle it!
        });
    }
}

export const turnOnLoader = (): V2Action => {
    return {
        type: V2ActionTypeKeys.TURN_ON_LOADER
    }
};

export const turnOffLoader = (): V2Action => {
    return {
        type: V2ActionTypeKeys.TURN_OFF_LOADER
    }
};

export const enableSetFiksDigisosId = (): V2Action => { return {type: V2ActionTypeKeys.ENABLE_SET_FIKS_DIGISOS_ID}};
export const disableSetFiksDigisosId = (): V2Action => { return {type: V2ActionTypeKeys.DISABLE_SET_FIKS_DIGISOS_ID}};

