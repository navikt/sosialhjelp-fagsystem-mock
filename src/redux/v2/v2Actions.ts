import {V2Action, V2ActionTypeKeys} from "./v2Types";
import {Dispatch} from "redux";
import {fetchPost, getDigisosApiControllerPath} from "../../utils/restUtils";

export const setfiksDigisosId = (fiksDigisosId: string): V2Action => {
    return {
        type: V2ActionTypeKeys.SET_FIKS_DIGISOS_ID,
        fiksDigisosId
    }
};

export const setDigisosSokerJson = (digisosSokerJson: any): V2Action => {
    return {
        type: V2ActionTypeKeys.SET_DIGISOS_SOKER_JSON,
        digisosSokerJson
    }
};


export function sendDigisosSokerJson(fiksDigisosId: string, digisosSokerJson: string) {
    return (dispatch: Dispatch) => {
        dispatch(turnOnLoader());
        const url = getDigisosApiControllerPath();
        const queryParam = `?fiksDigisosId=${fiksDigisosId}`;
        fetchPost(`${url}${queryParam}`, digisosSokerJson).then((response: any) => {
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