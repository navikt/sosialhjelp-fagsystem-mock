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


export function sendFiksDigisosSokerJson(fiksDigisosId: string, fiksDigisosSokerJson: FiksDigisosSokerJson, backendUrl: string) {
    return (dispatch: Dispatch) => {
        dispatch(turnOnLoader());
        // const url = getDigisosApiControllerPath();
        const queryParam = `?fiksDigisosId=${fiksDigisosId}`;
        fetchPost(`${backendUrl}${queryParam}`, JSON.stringify(fiksDigisosSokerJson)).then((response: any) => {
            dispatch(setFiksDigisosSokerJson(fiksDigisosSokerJson));
            dispatch(turnOffLoader());
        }).catch((reason) => {
            switch (reason.message) {
                case "Not Found": {
                    console.warn("Got 404. Specify a valid backend url...");
                    dispatch(turnOffLoader());
                    break;
                }
                default: {
                    console.warn("Unhandled reason with message: " + reason.message);
                }
            }
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
export const setBackendUrlTypeToUse = (backendUrlTypeToUse: string): V2Action => {return {type: V2ActionTypeKeys.SET_BACKEND_URL_TYPE_TO_USE, backendUrlTypeToUse}};
export const editBackendUrlForType = (backendUrlType: string, backendUrlUpdated: string): V2Action => {
    return {
        type: V2ActionTypeKeys.EDIT_BACKEND_URL_FOR_TYPE,
        backendUrlType,
        backendUrlUpdated
    }
};
