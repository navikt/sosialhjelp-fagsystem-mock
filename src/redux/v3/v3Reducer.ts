import {Reducer} from "redux";
import {V3Action, V3ActionTypeKeys, V3State} from "./v3Types";
import {getV3InitialState} from "./v3InitialState";
import {getInitialFsSoknad} from "./v3InitialFsSoknad";
import {FsSaksStatus, FsSoknad} from "./v3FsTypes";
import {
    oDokumentasjonEtterspurt,
    oForelopigSvar,
    oFsDokumentasjonkrav,
    oFsDokumentasjonkravPrism,
    oFsDokumentasjonkravTraversal, oFsRammevedtak, oFsRammevedtakPrism, oFsRammevedtakTraversal,
    oFsSaker,
    oFsSakerTraversal,
    oFsSaksStatusPrism,
    oFsSaksStatusUtbetalinger,
    oFsSaksStatusUtbetalingerTraversal,
    oFsUtbetalingPrism,
    oFsVilkar,
    oFsVilkarPrism,
    oFsVilkarTraversal,
    oGetSoknad,
    oHendelser,
    oNavKontor
} from "./v3Optics";
import Hendelse, {Dokumentasjonkrav, Rammevedtak, SaksStatusType, Utbetaling, Vilkar} from "../../types/hendelseTypes";
import {fsSaksStatusToSaksStatus} from "./v3UtilityFunctions";

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

            const s1 = oGetSoknad(forFiksDigisosId)
                .composeLens(oDokumentasjonEtterspurt)
                .set(nyDokumentasjonEtterspurt)(state);
            return oGetSoknad(forFiksDigisosId)
                .composeLens(oHendelser)
                .modify((a: Hendelse[]) => [...a, nyDokumentasjonEtterspurt])(s1);
        }
        case V3ActionTypeKeys.OPPDATER_FORELOPIG_SVAR: {
            const {forFiksDigisosId, nyttForelopigSvar} = action;

            const s1 = oGetSoknad(forFiksDigisosId)
                .composeLens(oForelopigSvar)
                .set(nyttForelopigSvar)(state);
            return oGetSoknad(forFiksDigisosId)
                .composeLens(oHendelser)
                .modify((a: Hendelse[]) => [...a, nyttForelopigSvar])(s1);
        }
        case V3ActionTypeKeys.NY_FS_SAKS_STATUS: {
            const {forFiksDigisosId, nyFsSaksStatus} = action;

            const s1 = oGetSoknad(forFiksDigisosId)
                .composeLens(oFsSaker)
                .modify((s: FsSaksStatus[]) => [...s, nyFsSaksStatus])(state);
            return oGetSoknad(forFiksDigisosId)
                .composeLens(oHendelser)
                .modify((a: Hendelse[]) => [...a, fsSaksStatusToSaksStatus(nyFsSaksStatus)])(s1)
        }
        case V3ActionTypeKeys.OPPDATER_FIKS_ID: {
            const {forFiksDigisosId, nyFiksId} = action;
            return {
                ...state,
                soknader: state.soknader.map((s: FsSoknad) => {
                    if (s.fiksDigisosId === forFiksDigisosId) {
                        s.fiksDigisosId = nyFiksId;
                    }
                    return s;
                })
            }
        }
        case V3ActionTypeKeys.OPPDATER_FS_SAKS_STATUS: {
            const {forFiksDigisosId, oppdatertSaksstatus} = action;
            const tittel: string = oppdatertSaksstatus.tittel;
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
        case V3ActionTypeKeys.NY_UTBETALING: {
            const {forFiksDigisosId, nyUtbetaling} = action;

            const s1 = oGetSoknad(forFiksDigisosId)
                .composeLens(oFsSaker)
                .composeTraversal(oFsSakerTraversal)
                .composePrism(oFsSaksStatusPrism(nyUtbetaling.saksreferanse))
                .composeLens(oFsSaksStatusUtbetalinger)
                .modify((utbetalinger: Utbetaling[]) => [...utbetalinger, nyUtbetaling])(state);

            return oGetSoknad(forFiksDigisosId)
                .composeLens(oHendelser)
                .modify((a: Hendelse[]) => [...a, nyUtbetaling])(s1);
        }
        case V3ActionTypeKeys.OPPDATER_UTBETALING: {
            const {forFiksDigisosId, oppdatertUtbetaling} = action;

            const s1 = oGetSoknad(forFiksDigisosId)
                .composeLens(oFsSaker)
                .composeTraversal(oFsSakerTraversal)
                .composePrism(oFsSaksStatusPrism(oppdatertUtbetaling.saksreferanse))
                .composeLens(oFsSaksStatusUtbetalinger)
                .composeTraversal(oFsSaksStatusUtbetalingerTraversal)
                .composePrism(oFsUtbetalingPrism(oppdatertUtbetaling.utbetalingsreferanse))
                .set(oppdatertUtbetaling)(state);

            return oGetSoknad(forFiksDigisosId)
                .composeLens(oHendelser)
                .modify((a: Hendelse[]) => [...a, oppdatertUtbetaling])(s1);
        }
        case V3ActionTypeKeys.NYTT_DOKUMENTASJONKRAV: {
            const {forFiksDigisosId, nyttDokumentasjonkrav} = action;

            const s1 = oGetSoknad(forFiksDigisosId)
                .composeLens(oFsDokumentasjonkrav)
                .modify((dokumentasjonkravListe: Dokumentasjonkrav[]) => [...dokumentasjonkravListe, nyttDokumentasjonkrav])(state);

            return oGetSoknad(forFiksDigisosId)
                .composeLens(oHendelser)
                .modify((a: Hendelse[]) => [...a, nyttDokumentasjonkrav])(s1);
        }
        case V3ActionTypeKeys.OPPDATER_DOKUMENTASJONKRAV: {
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
        case V3ActionTypeKeys.OPPDATER_VEDTAK_FATTET: {
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
        case V3ActionTypeKeys.NYTT_RAMMEVEDTAK: {
            const {forFiksDigisosId, nyttRammevedtak} = action;

            const s1 = oGetSoknad(forFiksDigisosId)
                .composeLens(oFsRammevedtak)
                .modify((rammevedtakListe: Rammevedtak[]) => [...rammevedtakListe, nyttRammevedtak])(state);

            return oGetSoknad(forFiksDigisosId)
                .composeLens(oHendelser)
                .modify((a: Hendelse[]) => [...a, nyttRammevedtak])(s1);
        }
        case V3ActionTypeKeys.OPPDATER_RAMMEVEDTAK: {
            const {forFiksDigisosId, oppdatertRammevedtak} = action;

            const s1 = oGetSoknad(forFiksDigisosId)
                .composeLens(oFsRammevedtak)
                .composeTraversal(oFsRammevedtakTraversal)
                .composePrism(oFsRammevedtakPrism(oppdatertRammevedtak.rammevedtaksreferanse))
                .set(oppdatertRammevedtak)(state);

            return oGetSoknad(forFiksDigisosId)
                .composeLens(oHendelser)
                .modify((a: Hendelse[]) => [...a, oppdatertRammevedtak])(s1);
        }
        case V3ActionTypeKeys.NYTT_VILKAR: {
            const {forFiksDigisosId, nyttVilkar} = action;

            const s1 = oGetSoknad(forFiksDigisosId)
                .composeLens(oFsVilkar)
                .modify((vilkarListe: Vilkar[]) => [...vilkarListe, nyttVilkar])(state);

            return oGetSoknad(forFiksDigisosId)
                .composeLens(oHendelser)
                .modify((a: Hendelse[]) => [...a, nyttVilkar])(s1);
        }
        case V3ActionTypeKeys.OPPDATER_VILKAR: {
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
        default: {
            return state;
        }

    }
};

export default v3Reducer;