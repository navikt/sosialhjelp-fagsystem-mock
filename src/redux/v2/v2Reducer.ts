import {Reducer} from "redux";
import {BackendUrls, Filreferanselager, V2Action, V2ActionTypeKeys, V2Model} from "./v2Types";
import {FiksDigisosSokerJson, FilreferanseType, SaksStatus, SoknadsStatus} from "../../types/hendelseTypes";
import {
    generateFilreferanseId,
    getSaksStatusByReferanse,
    getSoknadByFiksDigisosId,
    updateSoknadInSoknader
} from "../../utils/utilityFunctions";
import {soknadMockData} from "../../pages/parts/soknadsOversiktPanel/soknadsoversikt-mockdata";
import {Soknad} from "../../types/additionalTypes";


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
                    type: "SoknadsStatus",
                    hendelsestidspunkt: "2018-10-04T13:37:00.134Z",
                    status: "MOTTATT"
                } as SoknadsStatus
                // // FIXME: Husk å fjern denne. Lagt til kun for å lettere utvikle VedtakFattet.
                // {
                //     "type": "SaksStatus",
                //     "hendelsestidspunkt": "2019-09-06T10:03:18:169Z",
                //     "status": "UNDER_BEHANDLING",
                //     "referanse": "SAK1",
                //     "tittel": "Nødhjelp"
                // } as SaksStatus
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
        {type: FilreferanseType.dokumentlager, id: generateFilreferanseId(), tittel: "01 - qwer - dokumentalger"},
        {type: FilreferanseType.dokumentlager, id: generateFilreferanseId(), tittel: "02 - asdf - dokumentlager"},
        {type: FilreferanseType.dokumentlager, id: generateFilreferanseId(), tittel: "03 - zxcv - dokumentlager"},
    ]
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
    backendUrlTypeToUse: "local",
    filreferanselager: initialFilreferanselager,

    // V3
    soknader: soknadMockData.map(s => s) as Soknad[],

    // Visnings
    thememode: 'light',
    visNySakModal: false,
    visEndreNavKontorModal: false,
    visSystemSettingsModal: false,

    // Aktive ting
    aktivSoknad: '001',
    aktivSakIndex: 0
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
        case V2ActionTypeKeys.VIS_ENDRE_NAV_KONTOR_MODAL: {return {...state, visEndreNavKontorModal: true}}
        case V2ActionTypeKeys.SKJUL_ENDRE_NAV_KONTOR_MODAL: {return {...state, visEndreNavKontorModal: false}}
        case V2ActionTypeKeys.VIS_SYSTEM_SETTINGS_MODAL: {return {...state, visSystemSettingsModal: true}}
        case V2ActionTypeKeys.SKJUL_SYSTEM_SETTINGS_MODAL: {return {...state, visSystemSettingsModal: false}}

        // Aktive ting
        case V2ActionTypeKeys.SET_AKTIV_SOKNAD: {return {...state, aktivSoknad: action.fiksDigisosId}}
        case V2ActionTypeKeys.SET_AKTIV_SAK: {return {...state, aktivSakIndex: action.saksIndex}}


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

        // Oppdatere ting
        case V2ActionTypeKeys.SETT_NY_SAKS_STATUS: {
            const {referanse, status} = action;
            const aktivSoknad: Soknad | undefined = getSoknadByFiksDigisosId(state.soknader, state.aktivSoknad);
            if (aktivSoknad) {
                const aktivSak: SaksStatus | undefined = getSaksStatusByReferanse(aktivSoknad, referanse);
                if (aktivSak) {
                    const aktivSakUpdated = {...aktivSak};
                    aktivSakUpdated.status = status;

                    const sakerUpdated = aktivSoknad.saker.map((sak: SaksStatus) => {
                        if (sak.referanse === referanse){
                            return aktivSakUpdated;
                        }
                        return sak;
                    });

                    const hendelserUpdated = aktivSoknad.fiksDigisosSokerJson.sak.soker.hendelser.map(h => h);
                    hendelserUpdated.push(aktivSakUpdated);

                    const soknadUpdated: Soknad = {...aktivSoknad, saker: sakerUpdated};
                    soknadUpdated.fiksDigisosSokerJson.sak.soker.hendelser = hendelserUpdated;

                    const soknaderUpdated = state.soknader.map((soknad: Soknad) => {
                        if(soknad.fiksDigisosId === aktivSoknad.fiksDigisosId){
                            return soknadUpdated;
                        }
                        return soknad;
                    });
                    return {...state, soknader: soknaderUpdated};
                }
            }
            return state;
        }
        default:
            return state;
    }
};





export default v2Reducer
