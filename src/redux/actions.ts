import {
    Action,
    ActionTypeKeys,
    BackendUrls,
    FsSaksStatus,
    FsSoknad,
    HentetFsSoknad,
    Model,
    NyFsSaksStatus,
    NyFsSoknad,
    NyttDokumentasjonkrav,
    NyttVilkar,
    NyUtbetaling,
    OppdaterDokumentasjonEtterspurt,
    OppdaterDokumentasjonkrav,
    OppdaterFiksDigisosId,
    OppdaterForelopigSvar,
    OppdaterFsSaksStatus,
    OppdaterNavKontor,
    OppdaterSoknadsStatus,
    OppdaterUtbetaling,
    OppdaterVedtakFattet,
    OppdaterVilkar,
    SlettFsSoknad
} from './types';
import Hendelse, {
    Dokument,
    DokumentasjonEtterspurt,
    Dokumentasjonkrav,
    FilreferanseType,
    ForelopigSvar,
    HendelseType,
    SaksStatus,
    SoknadsStatus,
    TildeltNavKontor,
    Utbetaling,
    Utfall,
    VedtakFattet,
    Vilkar
} from "../types/hendelseTypes";
import {AnyAction} from "redux";
import {getFsSoknadByFiksDigisosId, getNow, removeNullFieldsFromHendelser} from "../utils/utilityFunctions";
import {fetchPost} from "../utils/restUtils";
import {NavKontor} from "../types/additionalTypes";
import {oHendelser} from "./optics";
import {
    backendUrls,
    FIKSDIGISOSID_URL_PARAM,
    getInitialFsSoknad,
    nyNavEnhetUrl,
    oppdaterDigisosSakUrl
} from './reducer';
import {Dispatch} from "./reduxTypes";

export const sendNyHendelseOgOppdaterModel = (
    nyHendelse: Hendelse,
    model: Model,
    dispatch: Dispatch,
    actionToDispatchIfSuccess: AnyAction
) => {
    dispatch(turnOnLoader());
    const soknad = getFsSoknadByFiksDigisosId(model.soknader, model.aktivSoknad)!;
    const soknadUpdated = oHendelser.modify((a: Hendelse[]) => [...a, nyHendelse])(soknad);
    const fiksDigisosSokerJsonUtenNull = removeNullFieldsFromHendelser(soknadUpdated.fiksDigisosSokerJson);

    const backendUrl = backendUrls[model.backendUrlTypeToUse];
    const queryParam = `?${FIKSDIGISOSID_URL_PARAM}=${model.aktivSoknad}`;
    fetchPost(`${backendUrl}${oppdaterDigisosSakUrl}${queryParam}`, JSON.stringify(fiksDigisosSokerJsonUtenNull)).then(() => {
        dispatch(visSuccessSnackbar());
        dispatch(actionToDispatchIfSuccess);
    }).catch((reason) => runOnErrorResponse(reason, dispatch))
        .finally(() => dispatch(turnOffLoader()));
};

export const sendValgbareNavkontorTilMockBackend = (
    navKontorListe: NavKontor[],
    model: Model,
    dispatch: Dispatch
) => {
    dispatch(turnOnLoader());
    const backendUrl = backendUrls[model.backendUrlTypeToUse];
    fetch(`${backendUrl}${nyNavEnhetUrl}`, {
        method: 'POST',
        body: JSON.stringify(navKontorListe),
        headers: new Headers({
            "Content-Type": "application/json",
            "Authorization": "Bearer 1234",
            "Accept": "*/*"
        })
    }).catch((reason) => {
        runOnErrorResponse(reason, dispatch);
        dispatch(turnOffLoader());
    });
};

export const sendPdfOgLeggPdfRefTilHendelseOgSend = (
    formData: FormData,
    model: Model,
    dispatch: Dispatch,
    sendHendelseMedRef: (id: string) => void
) => {
    dispatch(turnOnLoader());
    const backendUrl = backendUrls[model.backendUrlTypeToUse];
    fetch(`${backendUrl}/api/v1/digisosapi/${model.aktivSoknad}/filOpplasting`, {
        method: 'POST',
        body: formData,
        headers: new Headers({
            "Authorization": "Bearer 1234",
            "Accept": "*/*"
        })
    }).then((response: Response) => {
        response.text().then((id: string) => {
            sendHendelseMedRef(id);
        });
    }).catch((reason) => {
        runOnErrorResponse(reason, dispatch);
        dispatch(turnOffLoader());
    });
};

export const sendPdfOgOppdaterForelopigSvar = (
    formData: FormData,
    model: Model,
    dispatch: Dispatch
) => {
    dispatch(turnOnLoader());

    const sendForelopigSvarMedRef = (id: string) => {
        const nyHendelse: ForelopigSvar = {
            type: HendelseType.ForelopigSvar,
            hendelsestidspunkt: getNow(),
            forvaltningsbrev: {
                referanse: {
                    type: FilreferanseType.dokumentlager,
                    id: id
                }
            },
            vedlegg: []
        };

        sendNyHendelseOgOppdaterModel(nyHendelse, model, dispatch, oppdaterForelopigSvar(model.aktivSoknad, nyHendelse));
    };

    sendPdfOgLeggPdfRefTilHendelseOgSend(formData, model, dispatch, sendForelopigSvarMedRef);
};

export const sendPdfOgOppdaterVedtakFattet = (
    formData: FormData,
    vedtakFattetUtfall: Utfall|null,
    saksreferanse: string,
    model: Model,
    dispatch: Dispatch
) => {
    dispatch(turnOnLoader());

    const sendForelopigSvarMedRef = (id: string) => {
        const nyHendelse: VedtakFattet = {
            type: HendelseType.VedtakFattet,
            hendelsestidspunkt: getNow(),
            saksreferanse: saksreferanse,
            utfall:  vedtakFattetUtfall ,
            vedtaksfil: {
                referanse: {
                    type: FilreferanseType.dokumentlager,
                    id: id
                }
            },
            vedlegg: [
                {tittel: '',
                    referanse: {
                        type: FilreferanseType.dokumentlager,
                        id: id
                    }}
            ]
        };
        sendNyHendelseOgOppdaterModel(nyHendelse, model, dispatch, oppdaterVedtakFattet(model.aktivSoknad, nyHendelse));
    };

    sendPdfOgLeggPdfRefTilHendelseOgSend(formData, model, dispatch, sendForelopigSvarMedRef);
};

export const sendPdfOgOppdaterDokumentasjonEtterspurt = (
    formData: FormData,
    dokumenter: Dokument[],
    model: Model,
    dispatch: Dispatch
) => {
    dispatch(turnOnLoader());

    const sendForelopigSvarMedRef = (id: string) => {
        const nyHendelse: DokumentasjonEtterspurt = {
            type: HendelseType.DokumentasjonEtterspurt,
            hendelsestidspunkt: getNow(),
            forvaltningsbrev: {
                referanse: {
                    type: FilreferanseType.dokumentlager,
                    id: id
                }
            },
            vedlegg: [],
            dokumenter: dokumenter
        };
        sendNyHendelseOgOppdaterModel(nyHendelse, model, dispatch, oppdaterDokumentasjonEtterspurt(model.aktivSoknad, nyHendelse));
    };

    sendPdfOgLeggPdfRefTilHendelseOgSend(formData, model, dispatch, sendForelopigSvarMedRef);
};

export const opprettDigisosSakHvisDenIkkeFinnes = (
    soknad: FsSoknad,
    backendUrlTypeToUse: keyof BackendUrls,
    dispatch: Dispatch,
    fiksDigisosId: string,
) => {
    dispatch(turnOnLoader());
    const backendUrl = backendUrls[backendUrlTypeToUse];
    if(!soknad) {
        soknad = getInitialFsSoknad(fiksDigisosId)
    }
    const fiksDigisosSokerJsonUtenNull = removeNullFieldsFromHendelser(soknad.fiksDigisosSokerJson);

    const queryParam = `?${FIKSDIGISOSID_URL_PARAM}=${fiksDigisosId}`;
    fetchPost(`${backendUrl}${oppdaterDigisosSakUrl}${queryParam}`, JSON.stringify(fiksDigisosSokerJsonUtenNull)).then((response: any) => {
        let fiksId = response.fiksDigisosId;
        dispatch(oppdaterFiksDigisosId(fiksDigisosId, fiksId));
        dispatch(setAktivSoknad(fiksId));
    }).catch((reason) => runOnErrorResponse(reason, dispatch))
        .finally(() => dispatch(turnOffLoader()));
};

export const hentFsSoknadFraFiksEllerOpprettNy = (
    fiksDigisosId: string,
    backendUrlTypeToUse: keyof BackendUrls,
    dispatch: Dispatch
) => {
    dispatch(turnOnLoader());
    const backendUrl = backendUrls[backendUrlTypeToUse];
    const url = `${backendUrl}/api/v1/digisosapi/${fiksDigisosId}/innsynsfil`
    fetch(url, {
       headers: new Headers({
           "Content-Type": "application/json",
           "Accept": "application/json, text/plain, */*"
        }),
        method: "GET",
        body: null
    }).then((response: Response) => {
       if(response.status === 200) {
            response.json().then((data: any) => {
                dispatch(hentetFsSoknad(fiksDigisosId, data));
                dispatch(setAktivSoknad(fiksDigisosId));
            }).catch((reason) =>  runOnErrorResponse(reason, dispatch))
                .finally(() => dispatch(turnOffLoader()));;
        } else {
            return opprettNyFsSoknadDersomDigisosIdEksistererHosFiks(fiksDigisosId, backendUrlTypeToUse, dispatch);
        }
    }).catch((reason) => runOnErrorResponse(reason, dispatch))
        .finally(() => dispatch(turnOffLoader()));
};

export const opprettNyFsSoknadDersomDigisosIdEksistererHosFiks = (
    fiksDigisosId: string,
    backendUrlTypeToUse: keyof BackendUrls,
    dispatch: Dispatch
) => {
    dispatch(turnOnLoader());
    const backendUrl = backendUrls[backendUrlTypeToUse];
    const fiksDigisosSokerJsonUtenNull = removeNullFieldsFromHendelser(getInitialFsSoknad(fiksDigisosId).fiksDigisosSokerJson);

    const queryParam = `?${FIKSDIGISOSID_URL_PARAM}=${fiksDigisosId}`;
    fetchPost(`${backendUrl}${oppdaterDigisosSakUrl}${queryParam}`, JSON.stringify(fiksDigisosSokerJsonUtenNull)).then((response: any) => {
        let fiksId = response.fiksDigisosId;
        dispatch(nyFsSoknad(fiksId));
        dispatch(setAktivSoknad(fiksId));
    }).catch((reason) => runOnErrorResponse(reason, dispatch))
        .finally(() => dispatch(turnOffLoader()));
};

const runOnErrorResponse = (reason: any, dispatch: Dispatch) => {
    dispatch(visErrorSnackbar());
    switch (reason.message) {
        case "Not Found": {
            console.warn("Got 404. Specify a valid backend url...");
            break;
        }
        case "Failed to fetch": {
            console.warn("Got 404. Specify a valid backend url...");
            break;
        }
        default: {
            console.warn("Unhandled reason with message: " + reason.message);
        }
    }
};

export const turnOnLoader = (): Action => {
    return {
        type: ActionTypeKeys.TURN_ON_LOADER
    }
};

export const turnOffLoader = (): Action => {
    return {
        type: ActionTypeKeys.TURN_OFF_LOADER
    }
};

export const setBackendUrlTypeToUse = (backendUrlTypeToUse: keyof BackendUrls): Action => {return {type: ActionTypeKeys.SET_BACKEND_URL_TYPE_TO_USE, backendUrlTypeToUse}};

export const switchToDarkMode = (): Action => {
    return {
        type: ActionTypeKeys.SWITCH_TO_DARK_MODE,
    }
};

export const switchToLightMode = (): Action => {
    return {
        type: ActionTypeKeys.SWITCH_TO_LIGHT_MODE,
    }
};

export const setAktivSoknad = (fiksDigisosId: string): Action => {
    return {
        type: ActionTypeKeys.SET_AKTIV_SOKNAD,
        fiksDigisosId
    }
};

export const setAktivUtbetaling = (referanse: string | null): Action => {
    return {
        type: ActionTypeKeys.SET_AKTIV_UTBETALING,
        referanse
    }
};

export const setAktivtVilkar = (referanse: string | null): Action => {
    return {
        type: ActionTypeKeys.SET_AKTIVT_VILKAR,
        referanse
    }
};

export const setAktivtDokumentasjonkrav = (referanse: string | null): Action => {
    return {
        type: ActionTypeKeys.SET_AKTIVT_DOKUMENTASJONKRAV,
        referanse
    }
};


export const visNySakModal = (): Action => {
    return {
        type: ActionTypeKeys.VIS_NY_SAK_MODAL
    }
};

export const skjulNySakModal = (): Action => {
    return {
        type: ActionTypeKeys.SKJUL_NY_SAK_MODAL
    }
};

export const visNyDokumentasjonEtterspurtModal = (): Action => {
    return {
        type: ActionTypeKeys.VIS_NY_DOKUMENTASJON_ETTERSPURT_MODAL
    }
};

export const visNyUtbetalingModal = (saksreferanse: string|null): Action => {
    return {
        type: ActionTypeKeys.VIS_NY_UTBETALING_MODAL,
        saksreferanse
    }
};

export const skjulNyUtbetalingModal = (): Action => {
    return {
        type: ActionTypeKeys.SKJUL_NY_UTBETALING_MODAL
    }
};

export const visNyVilkarModal = (): Action => {
    return {
        type: ActionTypeKeys.VIS_NY_VILKAR_MODAL
    }
};

export const skjulNyVilkarModal = (): Action => {
    return {
        type: ActionTypeKeys.SKJUL_NY_VILKAR_MODAL
    }
};

export const visNyDokumentasjonkravModal = (): Action => {
    return {
        type: ActionTypeKeys.VIS_NY_DOKUMENTASJONKRAV_MODAL
    }
};

export const skjulNyDokumentasjonkravModal = (): Action => {
    return {
        type: ActionTypeKeys.SKJUL_NY_DOKUMENTASJONKRAV_MODAL
    }
};

export const skjulNyDokumentasjonEtterspurtModal = (): Action => {
    return {
        type: ActionTypeKeys.SKJUL_NY_DOKUMENTASJON_ETTERSPURT_MODAL
    }
};

export const visSystemSettingsModal = () => {
    return {
        type: ActionTypeKeys.VIS_SYSTEM_SETTINGS_MODAL,
    }
};

export const skjulSystemSettingsModal = () => {
    return {
        type: ActionTypeKeys.SKJUL_SYSTEM_SETTINGS_MODAL,
    }
};

export const visSuccessSnackbar = () => {
    return {
        type: ActionTypeKeys.VIS_SUCCESS_SNACKBAR,
    }
};

export const visErrorSnackbar = () => {
    return {
        type: ActionTypeKeys.VIS_ERROR_SNACKBAR,
    }
};

export const skjulSnackbar = () => {
    return {
        type: ActionTypeKeys.SKJUL_SNACKBAR,
    }
};

export const nyFsSoknad = (nyFiksDigisosId: string): NyFsSoknad => {
    return {
        type: ActionTypeKeys.NY_SOKNAD,
        nyFiksDigisosId
    }
};
export const hentetFsSoknad = (fiksDigisosId: string, data: any): HentetFsSoknad => {
    return {
        type: ActionTypeKeys.HENTET_SOKNAD,
        fiksDigisosId,
        data
    }
};
export const slettFsSoknad = (forFiksDigisosId: string): SlettFsSoknad => {
    return {
        type: ActionTypeKeys.SLETT_SOKNAD,
        forFiksDigisosId
    }
};
export const oppdaterFiksDigisosId = (forFiksDigisosId: string, nyFiksDigisosId: string): OppdaterFiksDigisosId => {
    return {
        type: ActionTypeKeys.OPPDATER_FIKS_DIGISOS_ID,
        forFiksDigisosId,
        nyFiksDigisosId
    }
};
export const oppdaterSoknadsStatus = (forFiksDigisosId: string, nySoknadsStatus: SoknadsStatus): OppdaterSoknadsStatus => {
    return {
        type: ActionTypeKeys.OPPDATER_SOKNADS_STATUS,
        forFiksDigisosId,
        nySoknadsStatus
    }
};
export const oppdaterNavKontor = (forFiksDigisosId: string, nyttNavKontor: TildeltNavKontor): OppdaterNavKontor => {
    return {
        type: ActionTypeKeys.OPPDATER_NAV_KONTOR,
        forFiksDigisosId,
        nyttNavKontor
    }
};

export const oppdaterDokumentasjonEtterspurt = (forFiksDigisosId: string, nyDokumentasjonEtterspurt: DokumentasjonEtterspurt): OppdaterDokumentasjonEtterspurt => {
    return {
        type: ActionTypeKeys.OPPDATER_DOKUMENTASJON_ETTERSPURT,
        forFiksDigisosId,
        nyDokumentasjonEtterspurt
    }
};

export const oppdaterForelopigSvar = (forFiksDigisosId: string, nyttForelopigSvar: ForelopigSvar): OppdaterForelopigSvar => {
    return {
        type: ActionTypeKeys.OPPDATER_FORELOPIG_SVAR,
        forFiksDigisosId,
        nyttForelopigSvar
    }
};
export const nyFsSaksStatus = (forFiksDigisosId: string, nyFsSaksStatus: FsSaksStatus): NyFsSaksStatus => {
    return {
        type: ActionTypeKeys.NY_FS_SAKS_STATUS,
        forFiksDigisosId,
        nyFsSaksStatus
    }
};
export const oppdaterFsSaksStatus = (
    forFiksDigisosId: string,
    oppdatertSaksstatus: SaksStatus,
): OppdaterFsSaksStatus => {
    return {
        type: ActionTypeKeys.OPPDATER_FS_SAKS_STATUS,
        forFiksDigisosId,
        oppdatertSaksstatus
    }
};
export const nyUtbetaling = (forFiksDigisosId: string, nyUtbetaling: Utbetaling): NyUtbetaling => {
    return {
        type: ActionTypeKeys.NY_UTBETALING,
        forFiksDigisosId,
        nyUtbetaling
    }
};
export const oppdaterUtbetaling = (forFiksDigisosId: string, oppdatertUtbetaling: Utbetaling): OppdaterUtbetaling => {
    return {
        type: ActionTypeKeys.OPPDATER_UTBETALING,
        forFiksDigisosId,
        oppdatertUtbetaling
    }
};
export const nyttDokumentasjonkrav = (forFiksDigisosId: string, nyttDokumentasjonkrav: Dokumentasjonkrav): NyttDokumentasjonkrav => {
    return {
        type: ActionTypeKeys.NYTT_DOKUMENTASJONKRAV,
        forFiksDigisosId,
        nyttDokumentasjonkrav
    }
};
export const oppdaterDokumentasjonkrav = (forFiksDigisosId: string, oppdatertDokumentasjonkrav: Dokumentasjonkrav): OppdaterDokumentasjonkrav => {
    return {
        type: ActionTypeKeys.OPPDATER_DOKUMENTASJONKRAV,
        forFiksDigisosId,
        oppdatertDokumentasjonkrav
    }
};
export const oppdaterVedtakFattet = (forFiksDigisosId: string, oppdatertVedtakFattet: VedtakFattet): OppdaterVedtakFattet => {
    return {
        type: ActionTypeKeys.OPPDATER_VEDTAK_FATTET,
        forFiksDigisosId,
        oppdatertVedtakFattet
    }
};


export const nyttVilkar = (forFiksDigisosId: string, nyttVilkar: Vilkar): NyttVilkar => {
    return {
        type: ActionTypeKeys.NYTT_VILKAR,
        forFiksDigisosId,
        nyttVilkar
    }
};
export const oppdaterVilkar = (forFiksDigisosId: string, oppdatertVilkar: Vilkar): OppdaterVilkar => {
    return {
        type: ActionTypeKeys.OPPDATER_VILKAR,
        forFiksDigisosId,
        oppdatertVilkar
    }
};
