import {Reducer} from "redux";
import {Action, ActionTypeKeys, BackendUrls, FsSaksStatus, FsSoknad, Model} from "./types";
import Hendelse, {
    Dokumentasjonkrav,
    DokumentlagerExtended,
    FiksDigisosSokerJson,
    FilreferanseType,
    HendelseType,
    SaksStatusType,
    SoknadsStatus,
    SoknadsStatusType,
    SvarutExtended,
    Utbetaling,
    Vilkar
} from '../types/hendelseTypes';
import {
    fsSaksStatusToSaksStatus,
    generateFilreferanseId,
    generateRandomId,
    getNow
} from '../utils/utilityFunctions';
import {
    oDokumentasjonEtterspurt,
    oForelopigSvar,
    oFsDokumentasjonkrav,
    oFsDokumentasjonkravPrism,
    oFsDokumentasjonkravTraversal,
    oFsSaker,
    oFsSakerTraversal,
    oFsSaksStatusPrism,
    oFsSaksStatusUtbetalinger,
    oFsUtbetalinger,
    oFsUtbetalingerTraversal,
    oFsUtbetalingPrism,
    oFsVilkar,
    oFsVilkarPrism,
    oFsVilkarTraversal,
    oGetSoknad,
    oHendelser,
    oNavKontor
} from "./optics";
import { createFsSoknadFromHendelser, sorterEtterDatoStigende } from '../utils/hentSoknadUtils';


export const defaultDokumentlagerRef: DokumentlagerExtended = {
    type: FilreferanseType.dokumentlager, id: "2c75227d-64f8-4db6-b718-3b6dd6beb450", tittel: "01 - qwer - dokumentalger"
};

// OBS: defaultSvarutRef er ikke testet
export const defaultSvarutRef: SvarutExtended = {
    type: FilreferanseType.svarut, id: generateFilreferanseId(), nr: 1, tittel: "DOC1 - Nødhjelp innvilget - svarut"
};

export const backendUrlsLocalTemplate: string = "http://localhost:8080/sosialhjelp/innsyn-api";
export const backendUrlsLabsTemplate: string = "https://digisos.labs.nais.io/sosialhjelp/mock-alt-api/innsyn-api";
export const backendUrlsMockTemplate: string = "https://digisos.ekstern.dev.nav.no/sosialhjelp/mock-alt-api/innsyn-api";
export const backendUrlMockAltLocal: string = "http://localhost:8989/sosialhjelp/mock-alt-api/innsyn-api";

export const oppdaterDigisosSakUrl: string = '/api/v1/digisosapi/oppdaterDigisosSak';
export const hentDigisosSakUrl: string = '/fiks/digisos/api/v1/soknader/';
export const nyNavEnhetUrl: string = '/api/v1/mock/nyNavEnhet';

export const FIKSDIGISOSID_URL_PARAM = "fiksDigisosId";

export const backendUrls: BackendUrls = {
    lokalt: backendUrlsLocalTemplate,
    labs: backendUrlsLabsTemplate,
    mock: backendUrlsMockTemplate,
    mockalt: backendUrlMockAltLocal,
};

export const getInitialFsSoknad = (
    fiksDigisosId: string
): FsSoknad => {

    const initialSoknadsStatusHendelse: SoknadsStatus = {
        type: HendelseType.SoknadsStatus,
        hendelsestidspunkt: getNow(),
        status: SoknadsStatusType.MOTTATT
    };

    return {
        fiksDigisosId,
        soknadsStatus: initialSoknadsStatusHendelse,
        navKontor: undefined,
        dokumentasjonEtterspurt: undefined,
        forelopigSvar: undefined,
        vilkar: [],
        dokumentasjonkrav: [],
        utbetalingerUtenSaksreferanse: [],
        saker: [],
        fiksDigisosSokerJson: {
            sak: {
                soker: {
                    version: "1.0.0",
                    avsender: {
                        systemnavn: "Testsystemet",
                        systemversjon: "1.0.0"
                    },
                    hendelser: [
                        initialSoknadsStatusHendelse
                    ]
                }
            },
            type: "no.nav.digisos.digisos.soker.v1"
        } as FiksDigisosSokerJson,
    }
};

const idFromQueryOrRandomId = (): string => {
    const query = new URLSearchParams(window.location.search);
    const fiksdigisosid = query.get(FIKSDIGISOSID_URL_PARAM);

    if(fiksdigisosid && fiksdigisosid.length > 0) {
        return fiksdigisosid;
    }
    return generateRandomId(11);
};

const initialId: string = idFromQueryOrRandomId();

const getBackendUrlTypeToUse = (): keyof BackendUrls => {
    const windowUrl = window.location.href;
    if (windowUrl.includes('labs.nais.io')) {
        return 'labs';
    } else if (windowUrl.includes('ekstern.dev.nav.no')) {
        return 'mock';
    } else {
        return 'mockalt';
    }
};

export const initialModel: Model = {
    loaderOn: false,
    backendUrlTypeToUse: getBackendUrlTypeToUse(),

    //
    soknader: [],

    // Visnings
    thememode: 'light',
    visNySakModal: false,
    visNyDokumentasjonEtterspurtModal: false,
    visNyUtbetalingModal: false,
    visNyVilkarModal: false,
    visNyDokumentasjonkravModal: false,
    modalSaksreferanse: null,
    visSystemSettingsModal: false,
    visSnackbar: false,
    snackbarVariant: 'success',

    // Aktive ting
    aktivSoknad: window.location.href.includes('www-q') ? '001' : initialId,
    aktivUtbetaling: null,
    aktivtVilkar: null,
    aktivtDokumentasjonkrav: null,
};


const reducer: Reducer<Model, Action> = (
    state: Model = initialModel,
    action: Action
) => {
    switch (action.type) {
        case ActionTypeKeys.SET_AKTIV_SOKNAD: {return {...state, aktivSoknad: action.fiksDigisosId}}
        case ActionTypeKeys.SET_AKTIV_UTBETALING: {return {...state, aktivUtbetaling: action.referanse}}
        case ActionTypeKeys.SET_AKTIVT_VILKAR: {return {...state, aktivtVilkar: action.referanse}}
        case ActionTypeKeys.SET_AKTIVT_DOKUMENTASJONKRAV: {return {...state, aktivtDokumentasjonkrav: action.referanse}}
        case ActionTypeKeys.SET_BACKEND_URL_TYPE_TO_USE: return {...state, backendUrlTypeToUse: action.backendUrlTypeToUse};
        case ActionTypeKeys.TURN_ON_LOADER: return {...state, loaderOn: true};
        case ActionTypeKeys.TURN_OFF_LOADER: return {...state, loaderOn: false};
        case ActionTypeKeys.SWITCH_TO_LIGHT_MODE: {return {...state, thememode: 'light'}}
        case ActionTypeKeys.SWITCH_TO_DARK_MODE: {return {...state, thememode: 'dark'}}
        case ActionTypeKeys.VIS_NY_SAK_MODAL: {return {...state, visNySakModal: true}}
        case ActionTypeKeys.VIS_NY_DOKUMENTASJON_ETTERSPURT_MODAL: {return {...state, visNyDokumentasjonEtterspurtModal: true}}
        case ActionTypeKeys.VIS_NY_UTBETALING_MODAL: {return {...state, visNyUtbetalingModal: true, modalSaksreferanse: action.saksreferanse}}
        case ActionTypeKeys.VIS_NY_VILKAR_MODAL: {return {...state, visNyVilkarModal: true}}
        case ActionTypeKeys.VIS_NY_DOKUMENTASJONKRAV_MODAL: {return {...state, visNyDokumentasjonkravModal: true}}
        case ActionTypeKeys.VIS_SYSTEM_SETTINGS_MODAL: {return {...state, visSystemSettingsModal: true}}
        case ActionTypeKeys.VIS_SUCCESS_SNACKBAR: {return {...state, visSnackbar: true, snackbarVariant: 'success'}}
        case ActionTypeKeys.VIS_ERROR_SNACKBAR: {return {...state, visSnackbar: true, snackbarVariant: 'error'}}
        case ActionTypeKeys.SKJUL_NY_SAK_MODAL: {return {...state, visNySakModal: false}}
        case ActionTypeKeys.SKJUL_NY_DOKUMENTASJON_ETTERSPURT_MODAL: {return {...state, visNyDokumentasjonEtterspurtModal: false}}
        case ActionTypeKeys.SKJUL_NY_UTBETALING_MODAL: {return {...state, visNyUtbetalingModal: false}}
        case ActionTypeKeys.SKJUL_NY_VILKAR_MODAL: {return {...state, visNyVilkarModal: false}}
        case ActionTypeKeys.SKJUL_NY_DOKUMENTASJONKRAV_MODAL: {return {...state, visNyDokumentasjonkravModal: false}}
        case ActionTypeKeys.SKJUL_SYSTEM_SETTINGS_MODAL: {return {...state, visSystemSettingsModal: false}}
        case ActionTypeKeys.SKJUL_SNACKBAR: {return {...state, visSnackbar: false}}

        case ActionTypeKeys.NY_SOKNAD: {
            const {nyFiksDigisosId} = action;

            const newFsSoknad: FsSoknad = getInitialFsSoknad(nyFiksDigisosId);

            return {
                ...state,
                soknader: [...state.soknader, newFsSoknad]
            }
        }
        case ActionTypeKeys.HENTET_SOKNAD: {
            const {fiksDigisosId, data} = action;

            const soknadFinnes = state.soknader.find( (soknad : FsSoknad )=> {
                return soknad.fiksDigisosId === fiksDigisosId;
            })
            if(soknadFinnes) {
                return state;
            }
            const fiksDigisosSokerJson = {
                sak: {
                    soker: {
                        ...data
                    }
                },
                type: "no.nav.digisos.digisos.soker.v1"
            } as FiksDigisosSokerJson


            const sorterteHendelser = sorterEtterDatoStigende(data.hendelser, (hendelser) => hendelser.hendelsestidspunkt);
            const fsSoknad = createFsSoknadFromHendelser(sorterteHendelser,fiksDigisosSokerJson, fiksDigisosId);


            return {
                ...state,
                soknader: [...state.soknader, fsSoknad]
            }
        }
        case ActionTypeKeys.SLETT_SOKNAD: {
            const {forFiksDigisosId} = action;

            return {
                ...state,
                soknader: state.soknader.filter((s: FsSoknad) => {
                    return s.fiksDigisosId !== forFiksDigisosId;
                })
            }
        }
        case ActionTypeKeys.OPPDATER_FIKS_DIGISOS_ID: {
            const {forFiksDigisosId, nyFiksDigisosId} = action;

            return {
                ...state,
                soknader: state.soknader.map((s: FsSoknad) => {
                    if (s.fiksDigisosId === forFiksDigisosId) {
                        return {
                            ...s,
                            fiksDigisosId: nyFiksDigisosId
                        }
                    } else {
                        return s;
                    }
                })
            };
        }
        case ActionTypeKeys.OPPDATER_SOKNADS_STATUS: {
            const {forFiksDigisosId, nySoknadsStatus} = action;

            return {
                ...state,
                soknader: state.soknader.map((s: FsSoknad) => {
                    if (s.fiksDigisosId === forFiksDigisosId) {
                        return {
                            ...s,
                            soknadsStatus: nySoknadsStatus,
                            fiksDigisosSokerJson: {
                                ...s.fiksDigisosSokerJson,
                                sak: {
                                    ...s.fiksDigisosSokerJson.sak,
                                    soker: {
                                        ...s.fiksDigisosSokerJson.sak.soker,
                                        hendelser: [
                                            ...s.fiksDigisosSokerJson.sak.soker.hendelser,
                                            nySoknadsStatus
                                        ]
                                    }
                                }
                            }
                        }
                    } else {
                        return s;
                    }
                })
            };
        }
        case ActionTypeKeys.OPPDATER_NAV_KONTOR: {
            const {forFiksDigisosId, nyttNavKontor} = action;

            const s1 = oGetSoknad(forFiksDigisosId)
                .composeLens(oNavKontor)
                .set(nyttNavKontor)(state);

            return oGetSoknad(forFiksDigisosId)
                .composeLens(oHendelser)
                .modify((a: Hendelse[]) => [...a, nyttNavKontor])(s1);
        }
        case ActionTypeKeys.OPPDATER_DOKUMENTASJON_ETTERSPURT: {
            const {forFiksDigisosId, nyDokumentasjonEtterspurt} = action;

            const s1 = oGetSoknad(forFiksDigisosId)
                .composeLens(oDokumentasjonEtterspurt)
                .set(nyDokumentasjonEtterspurt)(state);
            return oGetSoknad(forFiksDigisosId)
                .composeLens(oHendelser)
                .modify((a: Hendelse[]) => [...a, nyDokumentasjonEtterspurt])(s1);
        }
        case ActionTypeKeys.OPPDATER_FORELOPIG_SVAR: {
            const {forFiksDigisosId, nyttForelopigSvar} = action;

            const s1 = oGetSoknad(forFiksDigisosId)
                .composeLens(oForelopigSvar)
                .set(nyttForelopigSvar)(state);
            return oGetSoknad(forFiksDigisosId)
                .composeLens(oHendelser)
                .modify((a: Hendelse[]) => [...a, nyttForelopigSvar])(s1);
        }
        case ActionTypeKeys.NY_FS_SAKS_STATUS: {
            const {forFiksDigisosId, nyFsSaksStatus} = action;

            const s1 = oGetSoknad(forFiksDigisosId)
                .composeLens(oFsSaker)
                .modify((s: FsSaksStatus[]) => [...s, nyFsSaksStatus])(state);
            return oGetSoknad(forFiksDigisosId)
                .composeLens(oHendelser)
                .modify((a: Hendelse[]) => [...a, fsSaksStatusToSaksStatus(nyFsSaksStatus)])(s1)
        }
        case ActionTypeKeys.OPPDATER_FS_SAKS_STATUS: {
            const {forFiksDigisosId, oppdatertSaksstatus} = action;
            const tittel: string|null = oppdatertSaksstatus.tittel;
            const status: SaksStatusType | null = oppdatertSaksstatus.status;

            const s1 = oGetSoknad(forFiksDigisosId)
                .composeLens(oFsSaker)
                .composeTraversal(oFsSakerTraversal)
                .composePrism(oFsSaksStatusPrism(oppdatertSaksstatus.referanse))
                .modify((fsSaksStatus: FsSaksStatus) => {return {...fsSaksStatus, tittel, status}})(state);

            return oGetSoknad(forFiksDigisosId)
                .composeLens(oHendelser)
                .modify((a: Hendelse[]) => [...a, oppdatertSaksstatus])(s1)
        }
        case ActionTypeKeys.NY_UTBETALING: {
            const {forFiksDigisosId, nyUtbetaling} = action;

            const s1 = oGetSoknad(forFiksDigisosId)
                .composeLens(oHendelser)
                .modify((a: Hendelse[]) => [...a, nyUtbetaling])(state);

            if (nyUtbetaling.saksreferanse) {
                return oGetSoknad(forFiksDigisosId)
                    .composeLens(oFsSaker)
                    .composeTraversal(oFsSakerTraversal)
                    .composePrism(oFsSaksStatusPrism(nyUtbetaling.saksreferanse))
                    .composeLens(oFsSaksStatusUtbetalinger)
                    .modify((utbetalinger: Utbetaling[]) => [...utbetalinger, nyUtbetaling])(s1);
            } else {
                return oGetSoknad(forFiksDigisosId)
                    .composeLens(oFsUtbetalinger)
                    .modify((utbetalingListe: Utbetaling[]) => [...utbetalingListe, nyUtbetaling])(s1);
            }
        }
        case ActionTypeKeys.OPPDATER_UTBETALING: {
            const {forFiksDigisosId, oppdatertUtbetaling} = action;

            const s1 = oGetSoknad(forFiksDigisosId)
                .composeLens(oHendelser)
                .modify((a: Hendelse[]) => [...a, oppdatertUtbetaling])(state);

            if (oppdatertUtbetaling.saksreferanse) {
                if (state.soknader.find(s => s.fiksDigisosId === forFiksDigisosId)!.utbetalingerUtenSaksreferanse
                    .find(r => r.utbetalingsreferanse === oppdatertUtbetaling.utbetalingsreferanse)) {
                    // Fjern fra liste over utbetalinger uten saksreferanse
                    const s2 = oGetSoknad(forFiksDigisosId)
                        .composeLens(oFsUtbetalinger)
                        .modify((utbetalingliste) => utbetalingliste.filter(
                            (utbetaling) => utbetaling.utbetalingsreferanse !== oppdatertUtbetaling.utbetalingsreferanse))(s1);
                    // Legg til i liste over utbetalinger under den valgte saken
                    return oGetSoknad(forFiksDigisosId)
                        .composeLens(oFsSaker)
                        .composeTraversal(oFsSakerTraversal)
                        .composePrism(oFsSaksStatusPrism(oppdatertUtbetaling.saksreferanse))
                        .composeLens(oFsSaksStatusUtbetalinger)
                        .modify((utbetaling: Utbetaling[]) => [...utbetaling, oppdatertUtbetaling])(s2);
                } else {
                    return oGetSoknad(forFiksDigisosId)
                        .composeLens(oFsSaker)
                        .composeTraversal(oFsSakerTraversal)
                        .composePrism(oFsSaksStatusPrism(oppdatertUtbetaling.saksreferanse))
                        .composeLens(oFsSaksStatusUtbetalinger)
                        .composeTraversal(oFsUtbetalingerTraversal)
                        .composePrism(oFsUtbetalingPrism(oppdatertUtbetaling.utbetalingsreferanse))
                        .set(oppdatertUtbetaling)(s1);
                }
            } else {
                return oGetSoknad(forFiksDigisosId)
                    .composeLens(oFsUtbetalinger)
                    .composeTraversal(oFsUtbetalingerTraversal)
                    .composePrism(oFsUtbetalingPrism(oppdatertUtbetaling.utbetalingsreferanse))
                    .set(oppdatertUtbetaling)(s1);
            }
        }
        case ActionTypeKeys.NYTT_DOKUMENTASJONKRAV: {
            const {forFiksDigisosId, nyttDokumentasjonkrav} = action;

            const s1 = oGetSoknad(forFiksDigisosId)
                .composeLens(oFsDokumentasjonkrav)
                .modify((dokumentasjonkravListe: Dokumentasjonkrav[]) => [...dokumentasjonkravListe, nyttDokumentasjonkrav])(state);

            return oGetSoknad(forFiksDigisosId)
                .composeLens(oHendelser)
                .modify((a: Hendelse[]) => [...a, nyttDokumentasjonkrav])(s1);
        }
        case ActionTypeKeys.OPPDATER_DOKUMENTASJONKRAV: {
            const {forFiksDigisosId, oppdatertDokumentasjonkrav} = action;

            const s1 = oGetSoknad(forFiksDigisosId)
                .composeLens(oFsDokumentasjonkrav)
                .composeTraversal(oFsDokumentasjonkravTraversal)
                .composePrism(oFsDokumentasjonkravPrism(oppdatertDokumentasjonkrav.dokumentasjonkravreferanse))
                .set(oppdatertDokumentasjonkrav)(state);

            return oGetSoknad(forFiksDigisosId)
                .composeLens(oHendelser)
                .modify((a: Hendelse[]) => [...a, oppdatertDokumentasjonkrav])(s1);
        }
        case ActionTypeKeys.OPPDATER_VEDTAK_FATTET: {
            const {forFiksDigisosId, oppdatertVedtakFattet} = action;

            const s1 = oGetSoknad(forFiksDigisosId)
                .composeLens(oFsSaker)
                .composeTraversal(oFsSakerTraversal)
                .composePrism(oFsSaksStatusPrism(oppdatertVedtakFattet.saksreferanse))
                .modify((fsSaksStatus: FsSaksStatus) => {return {...fsSaksStatus, oppdatertVedtakFattet}})(state);

            return oGetSoknad(forFiksDigisosId)
                .composeLens(oHendelser)
                .modify((a: Hendelse[]) => [...a, oppdatertVedtakFattet])(s1)

        }

        case ActionTypeKeys.NYTT_VILKAR: {
            const {forFiksDigisosId, nyttVilkar} = action;

            const s1 = oGetSoknad(forFiksDigisosId)
                .composeLens(oFsVilkar)
                .modify((vilkarListe: Vilkar[]) => [...vilkarListe, nyttVilkar])(state);

            return oGetSoknad(forFiksDigisosId)
                .composeLens(oHendelser)
                .modify((a: Hendelse[]) => [...a, nyttVilkar])(s1);
        }
        case ActionTypeKeys.OPPDATER_VILKAR: {
            const {forFiksDigisosId, oppdatertVilkar} = action;

            const s1 = oGetSoknad(forFiksDigisosId)
                .composeLens(oFsVilkar)
                .composeTraversal(oFsVilkarTraversal)
                .composePrism(oFsVilkarPrism(oppdatertVilkar.vilkarreferanse))
                .set(oppdatertVilkar)(state);

            return oGetSoknad(forFiksDigisosId)
                .composeLens(oHendelser)
                .modify((a: Hendelse[]) => [...a, oppdatertVilkar])(s1);
        }

        default:
            return state;
    }
};

export default reducer
