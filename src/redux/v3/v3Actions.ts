import {
    NyFsSaksStatus,
    NyFsSoknad, NyttDokumentasjonkrav, NyttVilkar, NyUtbetaling,
    OppdaterDokumentasjonEtterspurt, OppdaterDokumentasjonkrav, OppdaterForelopigSvar,
    OppdaterNavKontor, OppdaterRammevedtak, OppdaterFsSaksStatus,
    OppdaterSoknadsStatus, OppdaterUtbetaling, OppdaterVedtakFattet, OppdaterVilkar,
    SlettFsSoknad, V3ActionTypeKeys
} from "./v3Types";
import {
    DokumentasjonEtterspurt, Dokumentasjonkrav, FiksDigisosSokerJson,
    ForelopigSvar, Rammevedtak,
    SaksStatus, SaksStatusType,
    SoknadsStatus,
    TildeltNavKontor, Utbetaling, VedtakFattet, Vilkar
} from "../../types/hendelseTypes";
import {AnyAction, Dispatch} from "redux";
import {fetchPost} from "../../utils/restUtils";
import {setFiksDigisosSokerJson, skjulSnackbar, turnOffLoader, turnOnLoader, visSnackbar} from "../v2/v2Actions";
import {V2Model} from "../v2/v2Types";
import {FsSaksStatus} from "./v3FsTypes";
import {NavKontor} from "../../types/additionalTypes";


export const aiuuur = (
    fiksDigisosId: string,
    fiksDigisosSokerJson: FiksDigisosSokerJson,
    v2: V2Model,
    actionToDispatchIfSuccess: AnyAction
): (dispatch: Dispatch<AnyAction>) => void => {

    // @ts-ignore
    const backendUrl = v2.backendUrls[v2.backendUrlTypeToUse];
    const oppdaterDigisosSakUrl = v2.oppdaterDigisosSakUrl;

    return (dispatch: Dispatch) => {
        dispatch(turnOnLoader());
        // const url = getDigisosApiControllerPath();
        const queryParam = `?fiksDigisosId=${fiksDigisosId}`;
        fetchPost(`${backendUrl}${oppdaterDigisosSakUrl}${queryParam}`, JSON.stringify(fiksDigisosSokerJson)).then((response: any) => {
            dispatch(setFiksDigisosSokerJson(fiksDigisosSokerJson));
            if (v2.fiksDigisosSokerJson.sak.soker.hendelser.length < fiksDigisosSokerJson.sak.soker.hendelser.length) {
                dispatch(visSnackbar());
            }
            dispatch(actionToDispatchIfSuccess);
            setTimeout(() => {
                dispatch(turnOffLoader());

            }, 1000);

        }).catch((reason) => {
            switch (reason.message) {
                case "Not Found": {
                    console.warn("Got 404. Specify a valid backend url...");
                    setTimeout(() => {
                        dispatch(turnOffLoader());
                    }, 1000);
                    break;
                }
                case "Failed to fetch": {
                    console.warn("Got 404. Specify a valid backend url...");
                    setTimeout(() => {
                        dispatch(turnOffLoader());
                    }, 1000);
                    break;
                }
                default: {
                    console.warn("Unhandled reason with message: " + reason.message);
                }
            }
        });
    }
};

export const zeruuus = (
    navKontorListe: NavKontor[],
    v2: V2Model
): (dispatch: Dispatch<AnyAction>) => void => {

    // @ts-ignore
    const backendUrl = v2.backendUrls[v2.backendUrlTypeToUse];
    const nyNavEnhetUrl = v2.nyNavEnhetUrl;

    return (dispatch: Dispatch) => {
        dispatch(turnOnLoader());
        fetchPost(`${backendUrl}${nyNavEnhetUrl}`, JSON.stringify(navKontorListe)).then((response: any) => {
            setTimeout(() => {
                dispatch(turnOffLoader());

            }, 1000);

        }).catch((reason) => {
            switch (reason.message) {
                case "Not Found": {
                    console.warn("Got 404. Specify a valid backend url...");
                    setTimeout(() => {
                        dispatch(turnOffLoader());
                    }, 1000);
                    break;
                }
                case "Failed to fetch": {
                    console.warn("Got 404. Specify a valid backend url...");
                    setTimeout(() => {
                        dispatch(turnOffLoader());
                    }, 1000);
                    break;
                }
                default: {
                    console.warn("Unhandled reason with message: " + reason.message);
                }
            }
        });
    }
};


export const nyFsSoknad = (nyFiksDigisosId: string, nyttFnr: string, nyttNavn: string): NyFsSoknad => {
    return {
        type: V3ActionTypeKeys.NY_SOKNAD,
        nyFiksDigisosId,
        nyttFnr,
        nyttNavn
    }
};
export const slettFsSoknad = (forFiksDigisosId: string): SlettFsSoknad => {
    return {
        type: V3ActionTypeKeys.SLETT_SOKNAD,
        forFiksDigisosId
    }
};
export const oppdaterSoknadsStatus = (forFiksDigisosId: string, nySoknadsStatus: SoknadsStatus): OppdaterSoknadsStatus => {
    return {
        type: V3ActionTypeKeys.OPPDATER_SOKNADS_STATUS,
        forFiksDigisosId,
        nySoknadsStatus
    }
};
export const oppdaterNavKontor = (forFiksDigisosId: string, nyttNavKontor: TildeltNavKontor): OppdaterNavKontor => {
    return {
        type: V3ActionTypeKeys.OPPDATER_NAV_KONTOR,
        forFiksDigisosId,
        nyttNavKontor
    }
};
export const oppdaterDokumentasjonEtterspurt = (forFiksDigisosId: string, nyDokumentasjonEtterspurt: DokumentasjonEtterspurt): OppdaterDokumentasjonEtterspurt => {
    return {
        type: V3ActionTypeKeys.OPPDATER_DOKUMENTASJON_ETTERSPURT,
        forFiksDigisosId,
        nyDokumentasjonEtterspurt
    }
};
export const oppdaterForelopigSvar = (forFiksDigisosId: string, nyttForelopigSvar: ForelopigSvar): OppdaterForelopigSvar => {
    return {
        type: V3ActionTypeKeys.OPPDATER_FORELOPIG_SVAR,
        forFiksDigisosId,
        nyttForelopigSvar
    }
};
export const nyFsSaksStatus = (forFiksDigisosId: string, nyFsSaksStatus: FsSaksStatus): NyFsSaksStatus => {
    return {
        type: V3ActionTypeKeys.NY_FS_SAKS_STATUS,
        forFiksDigisosId,
        nyFsSaksStatus
    }
};
export const oppdaterFsSaksStatus = (
    forFiksDigisosId: string,
    oppdatertSaksstatus: SaksStatus,
): OppdaterFsSaksStatus => {
    return {
        type: V3ActionTypeKeys.OPPDATER_FS_SAKS_STATUS,
        forFiksDigisosId,
        oppdatertSaksstatus
    }
};
export const nyUtbetaling = (forFiksDigisosId: string, forSaksStatusReferanse: string, nyUtbetaling: Utbetaling): NyUtbetaling => {
    return {
        type: V3ActionTypeKeys.NY_UTBETALING,
        forFiksDigisosId,
        forSaksStatusReferanse,
        nyUtbetaling
    }
};
export const oppdaterUtbetaling = (forFiksDigisosId: string, oppdatertUtbetaling: Utbetaling): OppdaterUtbetaling => {
    return {
        type: V3ActionTypeKeys.OPPDATER_UTBETALING,
        forFiksDigisosId,
        oppdatertUtbetaling
    }
};
export const nyttDokumentasjonkrav = (forFiksDigisosId: string, nyttDokumentasjonkrav: Dokumentasjonkrav): NyttDokumentasjonkrav => {
    return {
        type: V3ActionTypeKeys.NYTT_DOKUMENTASJONKRAV,
        forFiksDigisosId,
        nyttDokumentasjonkrav
    }
};
export const oppdaterDokumentasjonkrav = (forFiksDigisosId: string, oppdatertDokumentasjonkrav: Dokumentasjonkrav): OppdaterDokumentasjonkrav => {
    return {
        type: V3ActionTypeKeys.OPPDATER_DOKUMENTASJONKRAV,
        forFiksDigisosId,
        oppdatertDokumentasjonkrav
    }
};
export const oppdaterVedtakFattet = (forFiksDigisosId: string, oppdatertVedtakFattet: VedtakFattet): OppdaterVedtakFattet => {
    return {
        type: V3ActionTypeKeys.OPPDATER_VEDTAK_FATTET,
        forFiksDigisosId,
        oppdatertVedtakFattet
    }
};
export const oppdaterRammevedtak = (forFiksDigisosId: string, oppdatertRammeVedtak: Rammevedtak): OppdaterRammevedtak => {
    return {
        type: V3ActionTypeKeys.OPPDATER_RAMMEVEDTAK,
        forFiksDigisosId,
        oppdatertRammeVedtak
    }
};
export const nyttVilkar = (forFiksDigisosId: string, nyttVilkar: Vilkar): NyttVilkar => {
    return {
        type: V3ActionTypeKeys.NYTT_VILKAR,
        forFiksDigisosId,
        nyttVilkar
    }
};
export const oppdaterVilkar = (forFiksDigisosId: string, oppdatertVilkar: Vilkar): OppdaterVilkar => {
    return {
        type: V3ActionTypeKeys.OPPDATER_VILKAR,
        forFiksDigisosId,
        oppdatertVilkar
    }
};





