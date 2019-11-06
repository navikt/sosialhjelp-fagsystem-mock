import {
    Action,
    ActionTypeKeys,
    BackendUrls,
    FsSaksStatus,
    FsSoknad,
    Model,
    NyFsSaksStatus,
    NyFsSoknad,
    NyttDokumentasjonkrav,
    NyttRammevedtak,
    NyttVilkar,
    NyUtbetaling,
    OppdaterDokumentasjonEtterspurt,
    OppdaterDokumentasjonkrav,
    OppdaterFiksId,
    OppdaterForelopigSvar,
    OppdaterFsSaksStatus,
    OppdaterNavKontor,
    OppdaterRammevedtak,
    OppdaterSoknadsStatus,
    OppdaterUtbetaling,
    OppdaterVedtakFattet,
    OppdaterVilkar,
    SlettFsSoknad
} from "./types";
import Hendelse, {
    Dokument,
    DokumentasjonEtterspurt,
    Dokumentasjonkrav,
    FiksDigisosSokerJson,
    FilreferanseType,
    ForelopigSvar,
    HendelseType,
    Rammevedtak,
    SaksStatus,
    SoknadsStatus,
    TildeltNavKontor,
    Utbetaling,
    Utfall,
    VedtakFattet,
    Vilkar
} from "../types/hendelseTypes";
import {AnyAction, Dispatch} from "redux";
import {getNow, removeNullFieldsFromHendelser} from "../utils/utilityFunctions";
import {fetchPost} from "../utils/restUtils";
import {NavKontor} from "../types/additionalTypes";
import {oHendelser} from "./optics";

export enum NotificationLevel {
    INFO = "INFO",
    SUCCESS = "SUCCESS",
    ERROR = "ERROR",
    WARNING = "WARNING"
}

export const aiuuur = (
    fiksDigisosId: string,
    fiksDigisosSokerJson: FiksDigisosSokerJson,
    model: Model,
    actionToDispatchIfSuccess: AnyAction
): (dispatch: Dispatch<AnyAction>) => void => {

    const backendUrl = model.backendUrls[model.backendUrlTypeToUse];
    const oppdaterDigisosSakUrl = model.oppdaterDigisosSakUrl;

    return (dispatch: Dispatch) => {
        dispatch(turnOnLoader());
        const queryParam = `?fiksDigisosId=${fiksDigisosId}`;
        const fiksDigisosSokerJsonUtenNull = removeNullFieldsFromHendelser(fiksDigisosSokerJson);
        fetchPost(`${backendUrl}${oppdaterDigisosSakUrl}${queryParam}`, JSON.stringify(fiksDigisosSokerJsonUtenNull)).then((response: any) => {
            if (model.fiksDigisosSokerJson.sak.soker.hendelser.length < fiksDigisosSokerJson.sak.soker.hendelser.length) {
                dispatch(visSuccessSnackbar());
            }
            dispatch(setFiksDigisosSokerJson(fiksDigisosSokerJson));
            let fiksId = response.fiksDigisosId;
            dispatch(oppdaterFixId(fiksDigisosId, fiksId.toString()));
            dispatch(setAktivSoknad(fiksId.toString()));
            dispatch(actionToDispatchIfSuccess);
        }).catch((reason) => runOnErrorResponse(reason, dispatch))
            .finally(() => dispatch(turnOffLoader()));
    }
};

export const zeruuus = (
    navKontorListe: NavKontor[],
    model: Model
): (dispatch: Dispatch<AnyAction>) => void => {

    const backendUrl = model.backendUrls[model.backendUrlTypeToUse];
    const nyNavEnhetUrl = model.nyNavEnhetUrl;

    return (dispatch: Dispatch) => {
        dispatch(turnOnLoader());
        fetch(`${backendUrl}${nyNavEnhetUrl}`, {
            method: 'POST',
            body: JSON.stringify(navKontorListe),
            headers: new Headers({
                "Content-Type": "application/json",
                "Authorization": "Bearer 1234",
                "Accept": "*/*"
            })
        }).catch((reason) => runOnErrorResponse(reason, dispatch))
            .finally(() => dispatch(turnOffLoader()));
    }
};

export const chaaar = (
    fiksDigisosId: string,
    formData: FormData,
    model: Model,
    soknad: FsSoknad
): (dispatch: Dispatch<AnyAction>) => void => {

    const backendUrl = model.backendUrls[model.backendUrlTypeToUse];

    return (dispatch: Dispatch) => {
        dispatch(turnOnLoader());

        fetch(`${backendUrl}/api/v1/digisosapi/${fiksDigisosId}/filOpplasting`, {
            method: 'POST',
            body: formData,
            headers: new Headers({
                "Authorization": "Bearer 1234",
                "Accept": "*/*"
            })
        }).then((response: Response) => {
            response.text().then((id: string) => {

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

                const soknadUpdated = oHendelser.modify((a: Hendelse[]) => [...a, nyHendelse])(soknad);

                const backendUrl = model.backendUrls[model.backendUrlTypeToUse];
                const oppdaterDigisosSakUrl = model.oppdaterDigisosSakUrl;

                const queryParam = `?fiksDigisosId=${fiksDigisosId}`;
                const fiksDigisosSokerJson = soknadUpdated.fiksDigisosSokerJson;

                const fiksDigisosSokerJsonUtenNull = removeNullFieldsFromHendelser(fiksDigisosSokerJson);

                fetchPost(`${backendUrl}${oppdaterDigisosSakUrl}${queryParam}`, JSON.stringify(fiksDigisosSokerJsonUtenNull)).then((response: any) => {
                    if (model.fiksDigisosSokerJson.sak.soker.hendelser.length < fiksDigisosSokerJson.sak.soker.hendelser.length) {
                        dispatch(visSuccessSnackbar());
                    }
                    dispatch(setFiksDigisosSokerJson(fiksDigisosSokerJson));
                    let fiksId = response.fiksDigisosId;
                    dispatch(
                        oppdaterFixId(fiksDigisosId, fiksId.toString()));
                    dispatch(setAktivSoknad(fiksId.toString()));
                    dispatch(oppdaterForelopigSvar(soknad.fiksDigisosId, nyHendelse));

                }).catch((reason) => runOnErrorResponse(reason, dispatch));
            });
        }).catch((reason) => runOnErrorResponse(reason, dispatch))
            .finally(() => dispatch(turnOffLoader()));
    }
};

export const tarsoniiis = (
    fiksDigisosId: string,
    formData: FormData,
    vedtakFattetUtfall: Utfall|null,
    saksreferanse: string,
    model: Model,
    soknad: FsSoknad
): (dispatch: Dispatch<AnyAction>) => void => {

    const backendUrl = model.backendUrls[model.backendUrlTypeToUse];

    return (dispatch: Dispatch) => {
        dispatch(turnOnLoader());

        fetch(`${backendUrl}/api/v1/digisosapi/${fiksDigisosId}/filOpplasting`, {
            method: 'POST',
            body: formData,
            headers: new Headers({
                "Authorization": "Bearer 1234",
                "Accept": "*/*"
            })
        }).then((response: Response) => {
            response.text().then((id: string) => {

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

                const soknadUpdated = oHendelser.modify((a: Hendelse[]) => [...a, nyHendelse])(soknad);

                const backendUrl = model.backendUrls[model.backendUrlTypeToUse];
                const oppdaterDigisosSakUrl = model.oppdaterDigisosSakUrl;

                const queryParam = `?fiksDigisosId=${fiksDigisosId}`;
                const fiksDigisosSokerJson = soknadUpdated.fiksDigisosSokerJson;

                const fiksDigisosSokerJsonUtenNull = removeNullFieldsFromHendelser(fiksDigisosSokerJson);

                fetchPost(`${backendUrl}${oppdaterDigisosSakUrl}${queryParam}`, JSON.stringify(fiksDigisosSokerJsonUtenNull)).then((response: any) => {
                    if (model.fiksDigisosSokerJson.sak.soker.hendelser.length < fiksDigisosSokerJson.sak.soker.hendelser.length) {
                        dispatch(visSuccessSnackbar());
                    }
                    dispatch(setFiksDigisosSokerJson(fiksDigisosSokerJson));
                    let fiksId = response.fiksDigisosId;
                    dispatch(
                        oppdaterFixId(fiksDigisosId, fiksId.toString()));
                    dispatch(setAktivSoknad(fiksId.toString()));
                    dispatch(oppdaterVedtakFattet(soknad.fiksDigisosId, nyHendelse));
                }).catch((reason) => runOnErrorResponse(reason, dispatch));
            });
        }).catch((reason) => runOnErrorResponse(reason, dispatch))
            .finally(() => dispatch(turnOffLoader()));
    }
};

export const shakuraaas = (
    fiksDigisosId: string,
    formData: FormData,
    dokumenter: Dokument[],
    model: Model,
    soknad: FsSoknad
): (dispatch: Dispatch<AnyAction>) => void => {

    const backendUrl = model.backendUrls[model.backendUrlTypeToUse];

    return (dispatch: Dispatch) => {
        dispatch(turnOnLoader());

        fetch(`${backendUrl}/api/v1/digisosapi/${fiksDigisosId}/filOpplasting`, {
            method: 'POST',
            body: formData,
            headers: new Headers({
                "Authorization": "Bearer 1234",
                "Accept": "*/*"
            })
        }).then((response: Response) => {
            response.text().then((id: string) => {

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

                const soknadUpdated = oHendelser.modify((a: Hendelse[]) => [...a, nyHendelse])(soknad);

                const backendUrl = model.backendUrls[model.backendUrlTypeToUse];
                const oppdaterDigisosSakUrl = model.oppdaterDigisosSakUrl;

                const queryParam = `?fiksDigisosId=${fiksDigisosId}`;
                const fiksDigisosSokerJson = soknadUpdated.fiksDigisosSokerJson;

                const fiksDigisosSokerJsonUtenNull = removeNullFieldsFromHendelser(fiksDigisosSokerJson);

                fetchPost(`${backendUrl}${oppdaterDigisosSakUrl}${queryParam}`, JSON.stringify(fiksDigisosSokerJsonUtenNull)).then((response: any) => {
                    if (model.fiksDigisosSokerJson.sak.soker.hendelser.length < fiksDigisosSokerJson.sak.soker.hendelser.length) {
                        dispatch(visSuccessSnackbar());
                    }
                    dispatch(setFiksDigisosSokerJson(fiksDigisosSokerJson));
                    let fiksId = response.fiksDigisosId;
                    dispatch(
                        oppdaterFixId(fiksDigisosId, fiksId.toString()));
                    dispatch(setAktivSoknad(fiksId.toString()));
                    dispatch(oppdaterDokumentasjonEtterspurt(soknad.fiksDigisosId, nyHendelse));
                }).catch((reason) => runOnErrorResponse(reason, dispatch));
            });
        }).catch(reason => runOnErrorResponse(reason, dispatch))
            .finally(() => dispatch(turnOffLoader()));
    }
};

export const opprettEllerOppdaterDigisosSak = (
    soknad: FsSoknad,
    model: Model,
    backendUrlTypeToUse: keyof BackendUrls
): (dispatch: Dispatch<AnyAction>) => void => {

    const backendUrl = model.backendUrls[backendUrlTypeToUse];
    const oppdaterDigisosSakUrl = model.oppdaterDigisosSakUrl;

    return (dispatch: Dispatch) => {
        dispatch(turnOnLoader());
        const queryParam = `?fiksDigisosId=${soknad.fiksDigisosId}`;

        const fiksDigisosSokerJsonUtenNull = removeNullFieldsFromHendelser(soknad.fiksDigisosSokerJson);

        fetchPost(`${backendUrl}${oppdaterDigisosSakUrl}${queryParam}`, JSON.stringify(fiksDigisosSokerJsonUtenNull)).then((response: any) => {
            let fiksId = response.fiksDigisosId;
            dispatch(oppdaterFixId(soknad.fiksDigisosId, fiksId.toString()));
            dispatch(setAktivSoknad(fiksId.toString()));
        }).catch((reason) => runOnErrorResponse(reason, dispatch))
            .finally(() => dispatch(turnOffLoader()));
    }
};

const runOnErrorResponse = (reason: any, dispatch: Dispatch) => {
    dispatch(visErrorSnackbar());
    console.warn("RunOnErrorResponse");
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

export const setFiksDigisosSokerJson = (fiksDigisosSokerJson: any): Action => {
    return {
        type: ActionTypeKeys.SET_FIKS_DIGISOS_SOKER_JSON,
        fiksDigisosSokerJson: fiksDigisosSokerJson
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

export const setAktivtRammevedtak = (referanse: string | null): Action => {
    return {
        type: ActionTypeKeys.SET_AKTIVT_RAMMEVEDTAK,
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

export const visNyRammevedtakModal = (saksreferanse: string|null): Action => {
    return {
        type: ActionTypeKeys.VIS_NY_RAMMEVEDTAK_MODAL,
        saksreferanse
    }
};

export const skjulNyRammevedtakModal = (): Action => {
    return {
        type: ActionTypeKeys.SKJUL_NY_RAMMEVEDTAK_MODAL
    }
};

export const skjulNyDokumentasjonEtterspurtModal = (): Action => {
    return {
        type: ActionTypeKeys.SKJUL_NY_DOKUMENTASJON_ETTERSPURT_MODAL
    }
};

export const visEndreNavKontorModal = (): Action => {
    return {
        type: ActionTypeKeys.VIS_ENDRE_NAV_KONTOR_MODAL
    }
};

export const skjulEndreNavKontorModal = (): Action => {
    return {
        type: ActionTypeKeys.SKJUL_ENDRE_NAV_KONTOR_MODAL
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

export const nyFsSoknad = (nyFiksDigisosId: string, nyttFnr: string, nyttNavn: string): NyFsSoknad => {
    return {
        type: ActionTypeKeys.NY_SOKNAD,
        nyFiksDigisosId,
        nyttFnr,
        nyttNavn
    }
};
export const slettFsSoknad = (forFiksDigisosId: string): SlettFsSoknad => {
    return {
        type: ActionTypeKeys.SLETT_SOKNAD,
        forFiksDigisosId
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

export const oppdaterFixId = (forFiksDigisosId: string, nyFiksId: string): OppdaterFiksId => {
    return {
        type: ActionTypeKeys.OPPDATER_FIKS_ID,
        forFiksDigisosId,
        nyFiksId
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
export const nyttRammevedtak = (forFiksDigisosId: string, nyttRammevedtak: Rammevedtak): NyttRammevedtak => {
    return {
        type: ActionTypeKeys.NYTT_RAMMEVEDTAK,
        forFiksDigisosId,
        nyttRammevedtak
    }
};
export const oppdaterRammevedtak = (forFiksDigisosId: string, oppdatertRammevedtak: Rammevedtak): OppdaterRammevedtak => {
    return {
        type: ActionTypeKeys.OPPDATER_RAMMEVEDTAK,
        forFiksDigisosId,
        oppdatertRammevedtak
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
