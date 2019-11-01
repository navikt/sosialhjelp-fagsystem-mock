import {Reducer} from "redux";
import {BackendUrls, Filreferanselager, V2Action, V2ActionTypeKeys, V2Model} from "./v2Types";
import {
    FiksDigisosSokerJson,
    FilreferanseType,
    HendelseType,
    SaksStatus,
    SaksStatusType,
    SoknadsStatus,
    SoknadsStatusType
} from "../../types/hendelseTypes";
import {
    generateFilreferanseId,
    getNow,
    getSoknadByFiksDigisosId,
    updateSoknadInSoknader
} from "../../utils/utilityFunctions";
import {soknadMockData} from "../../pages/parts/soknadsOversiktPanel/soknadsoversikt-mockdata";
import {Soknad} from "../../types/additionalTypes";
import {array} from "fp-ts/lib/Array";
import {fromTraversable, Lens, Prism, Traversal} from "monocle-ts/es6";


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
                    type: HendelseType.SoknadsStatus,
                    hendelsestidspunkt: getNow(),
                    status: SoknadsStatusType.MOTTATT
                } as SoknadsStatus
            ]
        }
    },
    type: "no.nav.digisos.digisos.soker.v1"
};

const initialFilreferanselager: Filreferanselager = {
    svarutlager: [
        {type: FilreferanseType.svarut, id: generateFilreferanseId(), nr: 1, tittel: "DOC1 - Nødhjelp innvilget - svarut"},
        {type: FilreferanseType.svarut, id: generateFilreferanseId(), nr: 2, tittel: "DOC2 - Vedtak om delvis innvilget - svarut"},
        {type: FilreferanseType.svarut, id: generateFilreferanseId(), nr: 3, tittel: "En random pdf fra fagsystemet - svarut"},
        {type: FilreferanseType.svarut, id: generateFilreferanseId(), nr: 4, tittel: "01 - vedtak - asdf - svarut"},
    ],
    dokumentlager: [
        // {type: FilreferanseType.dokumentlager, id: "12v915rd-l1b9-8xn7-z539-afuvtami0oc6", tittel: "Test_PDF"},
        {type: FilreferanseType.dokumentlager, id: "2c75227d-64f8-4db6-b718-3b6dd6beb450", tittel: "01 - qwer - dokumentalger"},
        {type: FilreferanseType.dokumentlager, id: generateFilreferanseId(), tittel: "02 - asdf - dokumentlager"},
        {type: FilreferanseType.dokumentlager, id: generateFilreferanseId(), tittel: "03 - zxcv - dokumentlager"},
    ]
};

export const backendUrlsLocalTemplate: string = "http://localhost:8080/sosialhjelp/innsyn-api";
export const backendUrlsDigisostestTemplate: string = "https://www.digisos-test.com/sosialhjelp/login-api/innsyn-api";
export const backendUrlsQTemplate: string = "https://www-q1.nav.no/sosialhjelp/innsyn-api";
export const backendUrlsQ0Template: string = "https://www-q0.nav.no/sosialhjelp/innsyn-api";

export const initialV2Model: V2Model = {
    fiksDigisosId: "1337",
    fiksDigisosSokerJson: minimal,
    loaderOn: false,
    setFiksDigisosIdIsEnabled: false,
    backendUrls: {
        lokalt: backendUrlsLocalTemplate,
        digisostest: backendUrlsDigisostestTemplate,
        q0: backendUrlsQ0Template,
        q1: backendUrlsQTemplate
    },
    backendUrlTypeToUse: 'lokalt',
    oppdaterDigisosSakUrl: '/api/v1/digisosapi/oppdaterDigisosSak',
    nyNavEnhetUrl: '/api/v1/mock/nyNavEnhet',
    filreferanselager: initialFilreferanselager,

    // V3
    soknader: soknadMockData.map(s => s) as Soknad[],

    // Visnings
    thememode: 'light',
    visNySakModal: false,
    visNyDokumentasjonEtterspurtModal: false,
    visNyUtbetalingModal: false,
    visNyVilkarModal: false,
    visNyDokumentasjonkravModal: false,
    visNyRammevedtakModal: false,
    modalSaksreferanse: null,
    visEndreNavKontorModal: false,
    visSystemSettingsModal: true,
    visSnackbar: false,
    snackbarVariant: 'success',

    // Aktive ting
    aktivSoknad: '001',
    aktivSak: null,
    aktivUtbetaling: null,
    aktivtVilkar: null,
    aktivtDokumentasjonkrav: null,
    aktivtRammevedtak: null
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
        case V2ActionTypeKeys.LEGG_TIL_NY_FIL_I_LAGER: {
            const {nyFilreferanse} = action;
            const filreferanselagerUpdated = {...state.filreferanselager};
            const svarutlagerUpdated = filreferanselagerUpdated.svarutlager.map((f) => f);
            const dokumentlagerUpdated = filreferanselagerUpdated.dokumentlager.map((f) => f);

            switch (nyFilreferanse.type) {
                case FilreferanseType.svarut: {svarutlagerUpdated.push(nyFilreferanse); break;}
                case FilreferanseType.dokumentlager: {dokumentlagerUpdated.push(nyFilreferanse); break;}
            }
            filreferanselagerUpdated.svarutlager = svarutlagerUpdated;
            filreferanselagerUpdated.dokumentlager = dokumentlagerUpdated;
            return {
                ...state,
                filreferanselager: filreferanselagerUpdated
            }
        }

        // Visnings ting
        case V2ActionTypeKeys.SWITCH_TO_LIGHT_MODE: {return {...state, thememode: 'light'}}
        case V2ActionTypeKeys.SWITCH_TO_DARK_MODE: {return {...state, thememode: 'dark'}}
        case V2ActionTypeKeys.VIS_NY_SAK_MODAL: {return {...state, visNySakModal: true}}
        case V2ActionTypeKeys.SKJUL_NY_SAK_MODAL: {return {...state, visNySakModal: false}}
        case V2ActionTypeKeys.VIS_NY_DOKUMENTASJON_ETTERSPURT_MODAL: {return {...state, visNyDokumentasjonEtterspurtModal: true}}
        case V2ActionTypeKeys.SKJUL_NY_DOKUMENTASJON_ETTERSPURT_MODAL: {return {...state, visNyDokumentasjonEtterspurtModal: false}}
        case V2ActionTypeKeys.VIS_NY_UTBETALING_MODAL: {return {...state, visNyUtbetalingModal: true, modalSaksreferanse: action.saksreferanse}}
        case V2ActionTypeKeys.SKJUL_NY_UTBETALING_MODAL: {return {...state, visNyUtbetalingModal: false}}
        case V2ActionTypeKeys.VIS_NY_VILKAR_MODAL: {return {...state, visNyVilkarModal: true}}
        case V2ActionTypeKeys.SKJUL_NY_VILKAR_MODAL: {return {...state, visNyVilkarModal: false}}
        case V2ActionTypeKeys.VIS_NY_DOKUMENTASJONKRAV_MODAL: {return {...state, visNyDokumentasjonkravModal: true}}
        case V2ActionTypeKeys.SKJUL_NY_DOKUMENTASJONKRAV_MODAL: {return {...state, visNyDokumentasjonkravModal: false}}
        case V2ActionTypeKeys.VIS_NY_RAMMEVEDTAK_MODAL: {return {...state, visNyRammevedtakModal: true, modalSaksreferanse: action.saksreferanse}}
        case V2ActionTypeKeys.SKJUL_NY_RAMMEVEDTAK_MODAL: {return {...state, visNyRammevedtakModal: false}}
        case V2ActionTypeKeys.VIS_ENDRE_NAV_KONTOR_MODAL: {return {...state, visEndreNavKontorModal: true}}
        case V2ActionTypeKeys.SKJUL_ENDRE_NAV_KONTOR_MODAL: {return {...state, visEndreNavKontorModal: false}}
        case V2ActionTypeKeys.VIS_SYSTEM_SETTINGS_MODAL: {return {...state, visSystemSettingsModal: true}}
        case V2ActionTypeKeys.SKJUL_SYSTEM_SETTINGS_MODAL: {return {...state, visSystemSettingsModal: false}}
        case V2ActionTypeKeys.VIS_SUCCESS_SNACKBAR: {return {...state, visSnackbar: true, snackbarVariant: 'success'}}
        case V2ActionTypeKeys.VIS_ERROR_SNACKBAR: {return {...state, visSnackbar: true, snackbarVariant: 'error'}}
        case V2ActionTypeKeys.SKJUL_SNACKBAR: {return {...state, visSnackbar: false}}

        // Aktive ting
        case V2ActionTypeKeys.SET_AKTIV_SOKNAD: {return {...state, aktivSoknad: action.fiksDigisosId}}
        case V2ActionTypeKeys.SET_AKTIV_UTBETALING: {return {...state, aktivUtbetaling: action.referanse}}
        case V2ActionTypeKeys.SET_AKTIVT_VILKAR: {return {...state, aktivtVilkar: action.referanse}}
        case V2ActionTypeKeys.SET_AKTIVT_DOKUMENTASJONKRAV: {return {...state, aktivtDokumentasjonkrav: action.referanse}}
        case V2ActionTypeKeys.SET_AKTIVT_RAMMEVEDTAK: {return {...state, aktivtRammevedtak: action.referanse}}
        case V2ActionTypeKeys.SET_AKTIV_SAK: {return {...state, aktivSak: action.referanse}}


        case V2ActionTypeKeys.SET_SOKNADS_STATUS: {
            const {soknadsStatus} = action;
            const soknad: Soknad | undefined = getSoknadByFiksDigisosId(state.soknader, state.aktivSoknad);
            if (soknad){
                const soknadUpdated: Soknad = {...soknad};
                soknadUpdated.soknadsStatus = soknadsStatus;
                const soknaderUpdated = updateSoknadInSoknader(soknadUpdated, state.soknader);
                return {...state, soknader: soknaderUpdated}
            }
            return state;
        }

        // Nye ting
        case V2ActionTypeKeys.NY_SAKS_STATUS: {
            const {saksStatus} = action;
            const aktivSoknad: Soknad | undefined = getSoknadByFiksDigisosId(state.soknader, state.aktivSoknad);
            if (aktivSoknad) {


                const sakerUpdated: SaksStatus[] = aktivSoknad.saker.map(s => s);
                sakerUpdated.push(saksStatus);


                const soknadUpdated: Soknad = {...aktivSoknad};
                soknadUpdated.saker = sakerUpdated;



                const hendelserUpdated = aktivSoknad.fiksDigisosSokerJson.sak.soker.hendelser.map(h => h);
                hendelserUpdated.push(saksStatus);
                soknadUpdated.fiksDigisosSokerJson.sak.soker.hendelser = hendelserUpdated;

                const soknaderUpdated = state.soknader.map((soknad: Soknad) => {
                    if (soknad.fnr === soknadUpdated.fnr){
                        return soknadUpdated
                    }
                    return soknad
                });


                return {...state, soknader: soknaderUpdated}
            }
            return {...state}
        }

        // Oppdatere ting (3 ekspempler på hvordan det kan gjøres
        case V2ActionTypeKeys.SETT_NY_SAKS_STATUS: {
            const {soknadFiksDigisosId, saksStatusReferanse, nySaksStatus} = action;

            // Example 1: Standard
            // return {
            //     ...state,
            //     soknader: {
            //         ...state.soknader.map((s: Soknad) => {
            //             if(s.fiksDigisosId === soknadFiksDigisosId){
            //                 return {...s,
            //                     saker: s.saker.map((sak: SaksStatus) => {
            //                         if (sak.referanse === saksStatusReferanse){
            //                             return { ...sak,
            //                                 status: action.nySaksStatus
            //                             }
            //                         } else {
            //                             return sak;
            //                         }
            //                     })
            //                 }
            //             } else {
            //                 return s;
            //             }
            //         })
            //     }
            // };

            // Example 2: fp-ts sin monocle-ts
            const soknader: Lens<V2Model, Soknad[]> = Lens.fromProp<V2Model>()('soknader');
            const soknadTraversal: Traversal<Soknad[], Soknad> = fromTraversable(array)<Soknad>();
            const getSoknadPrism: (soknadFiksDigisosId: string) => Prism<Soknad, Soknad> = (soknadFiksDigisosId: string): Prism<Soknad, Soknad> => Prism.fromPredicate(soknad => soknad.fiksDigisosId === soknadFiksDigisosId);
            const saker: Lens<Soknad, SaksStatus[]> = Lens.fromProp<Soknad>()('saker');
            const sakerTraversal: Traversal<SaksStatus[], SaksStatus> = fromTraversable(array)<SaksStatus>();
            const getSaksStatus: (saksStatusReferanse: string) => Prism<SaksStatus, SaksStatus> = (saksStatusReferanse: string): Prism<SaksStatus, SaksStatus> => Prism.fromPredicate(saksStatus => saksStatus.referanse === saksStatusReferanse);
            const status: Lens<SaksStatus, SaksStatusType|null> = Lens.fromProp<SaksStatus>()('status');

            const getSaksStatusStatusTraversal = (soknadFiksDigisosId: string, saksStatusReferanse: string): Traversal<V2Model, SaksStatusType|null> => {
                return soknader
                          .composeTraversal(soknadTraversal)
                          .composePrism(getSoknadPrism(soknadFiksDigisosId))
                          .composeLens(saker)
                          .composeTraversal(sakerTraversal)
                          .composePrism(getSaksStatus(saksStatusReferanse))
                          .composeLens(status);
            };

            return getSaksStatusStatusTraversal(soknadFiksDigisosId, saksStatusReferanse).set(nySaksStatus)(state);

            // debugger;
            // // Example 3: With immer
            // return produce(state, (draft: V2Model) => {
            //     const soknadToUpdate = draft
            //         .soknader
            //         .find((soknad: Soknad) => soknad.fiksDigisosId === soknadFiksDigisosId);
            //     if (soknadToUpdate){
            //         const saksStatusToUpdate = soknadToUpdate
            //             .saker
            //             .find((sak: SaksStatus) => sak.referanse === saksStatusReferanse);
            //         if (saksStatusToUpdate){
            //             saksStatusToUpdate.status = nySaksStatus;
            //         }
            //     }
            // })
        }
        default:
            return state;
    }
};





export default v2Reducer
