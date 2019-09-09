import {Reducer} from "redux";
import {BackendUrls, V2Action, V2ActionTypeKeys, V2Model} from "./v2Types";
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

export const backendUrlsLocalTemplate: string = "http://localhost:8080/sosialhjelp/innsyn-api/api/v1/digisosapi/oppdaterDigisosSak";
export const backendUrlsDigisostestTemplate: string = "https://www.digisos-test.com/sosialhjelp/login-api/innsyn-api/api/v1/digisosapi/oppdaterDigisosSak";
export const backendUrlsQTemplate: string = "https://www-q1.nav.no/sosialhjelp/innsyn/innsyn-api/api/v1/digisosapi/oppdaterDigisosSak";

export const initialV2Model: V2Model = {
    fiksDigisosId: "1337",
    fiksDigisosSokerJson: minimal,
    loaderOn: false,
    setFiksDigisosIdIsEnabled: false,
    backendUrls: {
        local: backendUrlsLocalTemplate,
        digisostest: backendUrlsDigisostestTemplate,
        q: backendUrlsQTemplate
    },
    backendUrlTypeToUse: "local"
};

const v2Reducer: Reducer<V2Model, V2Action> = (
    state: V2Model = initialV2Model,
    action: V2Action
) => {
    switch (action.type) {
        case V2ActionTypeKeys.SET_FIKS_DIGISOS_ID: return {...state, fiksDigisosId: action.fiksDigisosId, fiksDigisosSokerJson: minimal};
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
        case V2ActionTypeKeys.SET_BACKEND_URL_TYPE_TO_USE: return {...state, backendUrlTypeToUse: action.backendUrlTypeToUse};
        case V2ActionTypeKeys.EDIT_BACKEND_URL_FOR_TYPE: {
            const backendUrlsUpdated: BackendUrls = {...state.backendUrls};
            // @ts-ignore
            backendUrlsUpdated[action.backendUrlType] = action.backendUrlUpdated;
            return {...state, backendUrls: backendUrlsUpdated}
        }
        default:
            return state;
    }
};

export default v2Reducer
