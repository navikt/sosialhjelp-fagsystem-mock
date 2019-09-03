import {Reducer} from "redux";
import {V2Action, V2ActionTypeKeys, V2Model} from "./v2Types";

const minimal: any = require('../../digisos/fiks-minimal');

export const initialV2Model: V2Model = {
    fiksDigisosId: "",
    digisosSokerJson: minimal,
    loaderOn: false
};

const v2Reducer: Reducer<V2Model, V2Action> = (
    state: V2Model = initialV2Model,
    action: V2Action
) => {
    switch (action.type) {
        case V2ActionTypeKeys.SET_FIKS_DIGISOS_ID: return {...state, fiksDigisosId: action.fiksDigisosId};
        case V2ActionTypeKeys.SET_DIGISOS_SOKER_JSON: {
            return {
                ...state,
                digisosSokerJson: action.digisosSokerJson
            };
        }
        case V2ActionTypeKeys.TURN_ON_LOADER: return {...state, loaderOn: true};
        case V2ActionTypeKeys.TURN_OFF_LOADER: return {...state, loaderOn: false};
        default:
            return state;
    }
};

export default v2Reducer
