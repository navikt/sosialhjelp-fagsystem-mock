import {Reducer} from "redux";
import {V2Action, V2ActionTypeKeys, V2Model} from "./v2Types";
import {FiksDigisosSokerJson, soknadsStatus} from "../../types/hendelseTypes";


const minimal: FiksDigisosSokerJson = {
    sak: {
        soker: {
            version: "1.0.0",
            avsender: {
                systemnavn: "Testsystemet",
                systemversjon: "1.0.0"
            },
            hendelser: [
                {
                    type: "soknadsStatus",
                    hendelsestidspunkt: "2018-10-04T13:37:00.134Z",
                    status: "MOTTATT"
                } as soknadsStatus
            ]
        }
    },
    type: "no.nav.digisos.digisos.soker.v1"
};

export const initialV2Model: V2Model = {
    fiksDigisosId: "1234",
    fiksDigisosSokerJson: minimal,
    loaderOn: false,
    setFiksDigisosIdIsEnabled: false
};

const v2Reducer: Reducer<V2Model, V2Action> = (
    state: V2Model = initialV2Model,
    action: V2Action
) => {
    switch (action.type) {
        case V2ActionTypeKeys.SET_FIKS_DIGISOS_ID: return {...state, fiksDigisosId: action.fiksDigisosId};
        case V2ActionTypeKeys.SET_FIKS_DIGISOS_SOKER_JSON: {
            return {
                ...state,
                fiksDigisosSokerJson: action.fiksDigisosSokerJson
            };
        }
        case V2ActionTypeKeys.TURN_ON_LOADER: return {...state, loaderOn: true};
        case V2ActionTypeKeys.TURN_OFF_LOADER: return {...state, loaderOn: false};
        case V2ActionTypeKeys.ENABLE_SET_FIKS_DIGISOS_ID: return {...state, setFiksDigisosIdIsEnabled: true};
        case V2ActionTypeKeys.DISABLE_SET_FIKS_DIGISOS_ID: return {...state, setFiksDigisosIdIsEnabled: false};
        default:
            return state;
    }
};

export default v2Reducer
