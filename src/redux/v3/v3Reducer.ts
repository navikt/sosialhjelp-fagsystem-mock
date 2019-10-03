import {Reducer} from "redux";
import {V3Action, V3ActionTypeKeys, V3State} from "./v3Types";
import {getV3InitialState} from "./v3InitialState";
import {getInitialFsSoknad} from "./v3InitialFsSoknad";
import {FsSoknad} from "./v3FsTypes";
import {oGetSoknad, oHendelser, oNavKontor} from "./v3Optics";
import Hendelse from "../../types/hendelseTypes";


const v3Reducer: Reducer<V3State, V3Action> = (
    state: V3State = getV3InitialState(),
    action: V3Action
) => {
    switch (action.type) {
        case V3ActionTypeKeys.NY_SOKNAD: {
            const {nyFiksDigisosId, nyttFnr, nyttNavn} = action;

            const newFsSoknad: FsSoknad = getInitialFsSoknad(nyFiksDigisosId, nyttFnr, nyttNavn);

            return {
                ...state,
                soknader: [...state.soknader, newFsSoknad]
            }
        }
        case V3ActionTypeKeys.SLETT_SOKNAD: {
            const {forFiksDigisosId} = action;

            return {
                ...state,
                soknader: state.soknader.filter((s: FsSoknad) => {
                    return s.fiksDigisosId !== forFiksDigisosId;
                })
            }
        }
        case V3ActionTypeKeys.OPPDATER_SOKNADS_STATUS: {


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
        case V3ActionTypeKeys.OPPDATER_NAV_KONTOR: {
            const {forFiksDigisosId, nyttNavKontor} = action;

            const s1 = oGetSoknad(forFiksDigisosId)
                .composeLens(oNavKontor)
                .set(nyttNavKontor)(state);

            return oGetSoknad(forFiksDigisosId)
                .composeLens(oHendelser)
                .modify((a: Hendelse[]) => [...a, nyttNavKontor])(s1);
        }

        case V3ActionTypeKeys.OPPDATER_DOKUMENTASJON_ETTERSPURT: {
            const {forFiksDigisosId, nyDokumentasjonEtterspurt} = action;

            return state;
        }
        case V3ActionTypeKeys.OPPDATER_FORELOPIG_SVAR: {
            const {} = action;

            return {
                ...state
            }
        }
        case V3ActionTypeKeys.NY_SAKS_STATUS: {
            const {} = action;

            return {
                ...state
            }
        }
        case V3ActionTypeKeys.OPPDATER_SAKS_STATUS: {
            const {} = action;

            return {
                ...state
            }
        }
        case V3ActionTypeKeys.NY_UTBETALING: {
            const {} = action;

            return {
                ...state
            }
        }
        case V3ActionTypeKeys.OPPDATER_UTBETALING: {
            const {} = action;

            return {
                ...state
            }
        }
        case V3ActionTypeKeys.NYTT_DOKUMENTASJONKRAV: {
            const {} = action;

            return {
                ...state
            }
        }
        case V3ActionTypeKeys.OPPDATER_DOKUMENTASJONKRAV: {
            const {} = action;

            return {
                ...state
            }
        }
        case V3ActionTypeKeys.OPPDATER_VEDTAK_FATTET: {
            const {} = action;

            return {
                ...state
            }
        }
        case V3ActionTypeKeys.OPPDATER_RAMMEVEDTAK: {
            const {} = action;

            return {
                ...state
            }
        }
        case V3ActionTypeKeys.NYTT_VILKAR: {
            const {} = action;

            return {
                ...state
            }
        }
        case V3ActionTypeKeys.OPPDATER_VILKAR: {
            const {} = action;

            return {
                ...state
            }
        }
        default: {
            return state;
        }

    }
};

export default v3Reducer;