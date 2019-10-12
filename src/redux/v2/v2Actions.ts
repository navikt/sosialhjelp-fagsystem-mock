import {V2Action, V2ActionTypeKeys} from "./v2Types";
import {Dispatch} from "redux";
import {fetchPost} from "../../utils/restUtils";
import {
    DokumentlagerExtended,
    FiksDigisosSokerJson,
    SaksStatus,
    SaksStatusType,
    SoknadsStatusType,
    SvarutExtended
} from "../../types/hendelseTypes";
import {NotificationLevel} from "../../pages/V2";

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


export function sendFiksDigisosSokerJson(fiksDigisosId: string, fiksDigisosSokerJson: FiksDigisosSokerJson, backendUrl: string, notification: (level: NotificationLevel, text: string, options: any) => void) {
    return (dispatch: Dispatch) => {
        dispatch(turnOnLoader());
        // const url = getDigisosApiControllerPath();
        const queryParam = `?fiksDigisosId=${fiksDigisosId}`;
        fetchPost(`${backendUrl}${queryParam}`, JSON.stringify(fiksDigisosSokerJson)).then((response: any) => {
            dispatch(setFiksDigisosSokerJson(fiksDigisosSokerJson));
            setTimeout(() => {
                dispatch(turnOffLoader());
                notification(NotificationLevel.SUCCESS, "Successfully posted data to fiks", {containerId: 'A'});
            }, 1000);

        }).catch((reason) => {
            switch (reason.message) {
                case "Not Found": {
                    console.warn("Got 404. Specify a valid backend url...");
                    setTimeout(() => {
                        dispatch(turnOffLoader());
                        notification(NotificationLevel.ERROR, "Failed. Got 404. Specify a valid backend url.", {containerId: 'A'});
                    }, 1000);

                    break;
                }
                case "Failed to fetch": {
                    console.warn("Got 404. Specify a valid backend url...");
                    setTimeout(() => {
                        dispatch(turnOffLoader());
                        notification(NotificationLevel.ERROR, "Failed. Got 404. Specify a valid backend url.", {containerId: 'A'});
                    }, 1000);

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

export const leggTilNyFilILager = (nyFilreferanse: SvarutExtended | DokumentlagerExtended): V2Action => {
    return {
        type: V2ActionTypeKeys.LEGG_TIL_NY_FIL_I_LAGER,
        nyFilreferanse
    }
};

export const switchToDarkMode = (): V2Action => {
    return {
        type: V2ActionTypeKeys.SWITCH_TO_DARK_MODE,
    }
};

export const switchToLightMode = (): V2Action => {
    return {
        type: V2ActionTypeKeys.SWITCH_TO_LIGHT_MODE,
    }
};

export const setAktivSoknad = (fiksDigisosId: string): V2Action => {
    return {
        type: V2ActionTypeKeys.SET_AKTIV_SOKNAD,
        fiksDigisosId
    }
};

export const setAktivUtbetaling = (referanse: string | null): V2Action => {
    return {
        type: V2ActionTypeKeys.SET_AKTIV_UTBETALING,
        referanse
    }
};

export const visNySakModal = (): V2Action => {
    return {
        type: V2ActionTypeKeys.VIS_NY_SAK_MODAL
    }
};

export const skjulNySakModal = (): V2Action => {
    return {
        type: V2ActionTypeKeys.SKJUL_NY_SAK_MODAL
    }
};

export const visNyDokumentasjonEtterspurtModal = (): V2Action => {
    return {
        type: V2ActionTypeKeys.VIS_NY_DOKUMENTASJON_ETTERSPURT_MODAL
    }
};

export const visNyUtbetalingModal = (): V2Action => {
    return {
        type: V2ActionTypeKeys.VIS_NY_UTBETALING_MODAL
    }
};

export const skjulNyUtbetalingModal = (): V2Action => {
    return {
        type: V2ActionTypeKeys.SKJUL_NY_UTBETALING_MODAL
    }
};

export const skjulNyDokumentasjonEtterspurtModal = (): V2Action => {
    return {
        type: V2ActionTypeKeys.SKJUL_NY_DOKUMENTASJON_ETTERSPURT_MODAL
    }
};

export const setSoknadsStatus = (soknadsStatus: SoknadsStatusType): V2Action => {
    return {
        type: V2ActionTypeKeys.SET_SOKNADS_STATUS,
        soknadsStatus
    }
};

export const visEndreNavKontorModal = (): V2Action => {
    return {
        type: V2ActionTypeKeys.VIS_ENDRE_NAV_KONTOR_MODAL
    }
};

export const skjulEndreNavKontorModal = (): V2Action => {
    return {
        type: V2ActionTypeKeys.SKJUL_ENDRE_NAV_KONTOR_MODAL
    }
};

export const visSystemSettingsModal = () => {
    return {
        type: V2ActionTypeKeys.VIS_SYSTEM_SETTINGS_MODAL,
    }
};

export const skjulSystemSettingsModal = () => {
    return {
        type: V2ActionTypeKeys.SKJUL_SYSTEM_SETTINGS_MODAL,
    }
};

export const setAktivSak = (saksIndex: number): V2Action => {
    return {
        type: V2ActionTypeKeys.SET_AKTIV_SAK,
        saksIndex: saksIndex
    }
};

export const nySaksStatus = (saksStatus: SaksStatus): V2Action => {
    return {
        type: V2ActionTypeKeys.NY_SAKS_STATUS,
        saksStatus: saksStatus
    }
};

export const settNySaksStatus = (soknadFiksDigisosId: string, saksStatusReferanse: string, nySaksStatus: SaksStatusType): V2Action => {
    return {
        type: V2ActionTypeKeys.SETT_NY_SAKS_STATUS,
        soknadFiksDigisosId,
        saksStatusReferanse,
        nySaksStatus
    }
};
