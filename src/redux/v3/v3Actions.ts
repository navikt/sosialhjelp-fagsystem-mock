import {
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
    SlettFsSoknad,
    V3ActionTypeKeys
} from "./v3Types";
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
} from "../../types/hendelseTypes";
import {AnyAction, Dispatch} from "redux";
import {fetchPost} from "../../utils/restUtils";
import {
    setAktivSoknad,
    setFiksDigisosSokerJson,
    turnOffLoader,
    turnOnLoader,
    visErrorSnackbar,
    visSuccessSnackbar
} from "../v2/v2Actions";
import {BackendUrls, V2Model} from "../v2/v2Types";
import {FsSaksStatus, FsSoknad} from "./v3FsTypes";
import {NavKontor} from "../../types/additionalTypes";
import {getNow} from "../../utils/utilityFunctions";
import {oHendelser} from "./v3Optics";


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
        let hednelserUtenNull = JSON.parse(JSON.stringify(fiksDigisosSokerJson.sak.soker.hendelser, (key, value) => {
            if (value !== null) return value
        }));
        let fiksDigisosSokerJsonUtenNull = {...fiksDigisosSokerJson, sak: {...fiksDigisosSokerJson.sak, soker: {...fiksDigisosSokerJson.sak.soker, hendelser: hednelserUtenNull}}};
        fetchPost(`${backendUrl}${oppdaterDigisosSakUrl}${queryParam}`, JSON.stringify(fiksDigisosSokerJsonUtenNull)).then((response: any) => {
            if (v2.fiksDigisosSokerJson.sak.soker.hendelser.length < fiksDigisosSokerJson.sak.soker.hendelser.length) {
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
    v2: V2Model
): (dispatch: Dispatch<AnyAction>) => void => {

    // @ts-ignore
    const backendUrl = v2.backendUrls[v2.backendUrlTypeToUse];
    const nyNavEnhetUrl = v2.nyNavEnhetUrl;

    return (dispatch: Dispatch) => {
        dispatch(turnOnLoader());
        fetchPost(`${backendUrl}${nyNavEnhetUrl}`, JSON.stringify(navKontorListe))
            .catch((reason) => runOnErrorResponse(reason, dispatch))
            .finally(() => dispatch(turnOffLoader()));
    }
};

export const chaaar = (
    fiksDigisosId: string,
    formData: FormData,
    v2: V2Model,
    soknad: FsSoknad
): (dispatch: Dispatch<AnyAction>) => void => {

    const backendUrl = v2.backendUrls[v2.backendUrlTypeToUse];

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

                const backendUrl = v2.backendUrls[v2.backendUrlTypeToUse];
                const oppdaterDigisosSakUrl = v2.oppdaterDigisosSakUrl;

                const queryParam = `?fiksDigisosId=${fiksDigisosId}`;
                const fiksDigisosSokerJson = soknadUpdated.fiksDigisosSokerJson;

                fetchPost(`${backendUrl}${oppdaterDigisosSakUrl}${queryParam}`, JSON.stringify(fiksDigisosSokerJson)).then((response: any) => {
                    if (v2.fiksDigisosSokerJson.sak.soker.hendelser.length < fiksDigisosSokerJson.sak.soker.hendelser.length) {
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
    v2: V2Model,
    soknad: FsSoknad
): (dispatch: Dispatch<AnyAction>) => void => {

    const backendUrl = v2.backendUrls[v2.backendUrlTypeToUse];

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

                const backendUrl = v2.backendUrls[v2.backendUrlTypeToUse];
                const oppdaterDigisosSakUrl = v2.oppdaterDigisosSakUrl;

                const queryParam = `?fiksDigisosId=${fiksDigisosId}`;
                const fiksDigisosSokerJson = soknadUpdated.fiksDigisosSokerJson;

                let hednelserUtenNull = JSON.parse(JSON.stringify(fiksDigisosSokerJson.sak.soker.hendelser, (key, value) => {
                    if (value !== null) return value
                }));
                let fiksDigisosSokerJsonUtenNull = {...fiksDigisosSokerJson, sak: {...fiksDigisosSokerJson.sak, soker: {...fiksDigisosSokerJson.sak.soker, hendelser: hednelserUtenNull}}};

                fetchPost(`${backendUrl}${oppdaterDigisosSakUrl}${queryParam}`, JSON.stringify(fiksDigisosSokerJsonUtenNull)).then((response: any) => {
                    if (v2.fiksDigisosSokerJson.sak.soker.hendelser.length < fiksDigisosSokerJson.sak.soker.hendelser.length) {
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
    v2: V2Model,
    soknad: FsSoknad
): (dispatch: Dispatch<AnyAction>) => void => {

    const backendUrl = v2.backendUrls[v2.backendUrlTypeToUse];

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

                const backendUrl = v2.backendUrls[v2.backendUrlTypeToUse];
                const oppdaterDigisosSakUrl = v2.oppdaterDigisosSakUrl;

                const queryParam = `?fiksDigisosId=${fiksDigisosId}`;
                const fiksDigisosSokerJson = soknadUpdated.fiksDigisosSokerJson;

                let hednelserUtenNull = JSON.parse(JSON.stringify(fiksDigisosSokerJson.sak.soker.hendelser, (key, value) => {
                    if (value !== null) return value
                }));
                let fiksDigisosSokerJsonUtenNull = {...fiksDigisosSokerJson, sak: {...fiksDigisosSokerJson.sak, soker: {...fiksDigisosSokerJson.sak.soker, hendelser: hednelserUtenNull}}};

                fetchPost(`${backendUrl}${oppdaterDigisosSakUrl}${queryParam}`, JSON.stringify(fiksDigisosSokerJsonUtenNull)).then((response: any) => {
                    if (v2.fiksDigisosSokerJson.sak.soker.hendelser.length < fiksDigisosSokerJson.sak.soker.hendelser.length) {
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
    v2: V2Model,
    backendUrlTypeToUse: keyof BackendUrls
): (dispatch: Dispatch<AnyAction>) => void => {

    const backendUrl = v2.backendUrls[backendUrlTypeToUse];
    const oppdaterDigisosSakUrl = v2.oppdaterDigisosSakUrl;

    return (dispatch: Dispatch) => {
        dispatch(turnOnLoader());
        const queryParam = `?fiksDigisosId=${soknad.fiksDigisosId}`;

        let hednelserUtenNull = JSON.parse(JSON.stringify(soknad.fiksDigisosSokerJson.sak.soker.hendelser, (key, value) => {
            if (value !== null) return value
        }));
        let fiksDigisosSokerJsonUtenNull = {...soknad.fiksDigisosSokerJson, sak: {...soknad.fiksDigisosSokerJson.sak, soker: {...soknad.fiksDigisosSokerJson.sak.soker, hendelser: hednelserUtenNull}}};

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
    return (reason: any) => {
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

export const oppdaterFixId = (forFiksDigisosId: string, nyFiksId: string): OppdaterFiksId => {
    return {
        type: V3ActionTypeKeys.OPPDATER_FIKS_ID,
        forFiksDigisosId,
        nyFiksId
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
export const nyUtbetaling = (forFiksDigisosId: string, nyUtbetaling: Utbetaling): NyUtbetaling => {
    return {
        type: V3ActionTypeKeys.NY_UTBETALING,
        forFiksDigisosId,
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
export const nyttRammevedtak = (forFiksDigisosId: string, nyttRammevedtak: Rammevedtak): NyttRammevedtak => {
    return {
        type: V3ActionTypeKeys.NYTT_RAMMEVEDTAK,
        forFiksDigisosId,
        nyttRammevedtak
    }
};
export const oppdaterRammevedtak = (forFiksDigisosId: string, oppdatertRammevedtak: Rammevedtak): OppdaterRammevedtak => {
    return {
        type: V3ActionTypeKeys.OPPDATER_RAMMEVEDTAK,
        forFiksDigisosId,
        oppdatertRammevedtak
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
