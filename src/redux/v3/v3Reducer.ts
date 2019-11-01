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
    oFsSaksStatusPrism, oFsSaksStatusRammevedtak,
    oFsSaksStatusUtbetalinger,
    oFsUtbetalingerTraversal, oFsUtbetalinger,
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
        case V3ActionTypeKeys.NY_UTBETALING: {
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
        case V3ActionTypeKeys.OPPDATER_UTBETALING: {
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
            // const {forFiksDigisosId, oppdatertUtbetaling} = action;
            //
            // const s1 = oGetSoknad(forFiksDigisosId)
            //     .composeLens(oFsSaker)
            //     .composeTraversal(oFsSakerTraversal)
            //     .composePrism(oFsSaksStatusPrism(oppdatertUtbetaling.saksreferanse))
            //     .composeLens(oFsSaksStatusUtbetalinger)
            //     .composeTraversal(oFsUtbetalingerTraversal)
            //     .composePrism(oFsUtbetalingPrism(oppdatertUtbetaling.utbetalingsreferanse))
            //     .set(oppdatertUtbetaling)(state);
            //
            // return oGetSoknad(forFiksDigisosId)
            //     .composeLens(oHendelser)
            //     .modify((a: Hendelse[]) => [...a, oppdatertUtbetaling])(s1);
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
                .composeLens(oHendelser)
                .modify((a: Hendelse[]) => [...a, nyttRammevedtak])(state);

            if (nyttRammevedtak.saksreferanse) {
                return oGetSoknad(forFiksDigisosId)
                    .composeLens(oFsSaker)
                    .composeTraversal(oFsSakerTraversal)
                    .composePrism(oFsSaksStatusPrism(nyttRammevedtak.saksreferanse))
                    .composeLens(oFsSaksStatusRammevedtak)
                    .modify((rammevedtak: Rammevedtak[]) => [...rammevedtak, nyttRammevedtak])(s1);
            } else {
                return oGetSoknad(forFiksDigisosId)
                    .composeLens(oFsRammevedtak)
                    .modify((rammevedtakListe: Rammevedtak[]) => [...rammevedtakListe, nyttRammevedtak])(s1);
            }
        }
        case V3ActionTypeKeys.OPPDATER_RAMMEVEDTAK: {
            const {forFiksDigisosId, oppdatertRammevedtak} = action;

            const s1 = oGetSoknad(forFiksDigisosId)
                .composeLens(oHendelser)
                .modify((a: Hendelse[]) => [...a, oppdatertRammevedtak])(state);

            if (oppdatertRammevedtak.saksreferanse) {
                if (state.soknader.find(s => s.fiksDigisosId === forFiksDigisosId)!.rammevedtakUtenSaksreferanse
                    .find(r => r.rammevedtaksreferanse === oppdatertRammevedtak.rammevedtaksreferanse)) {
                    // Fjern fra liste over rammevedtak uten saksreferanse
                    const s2 = oGetSoknad(forFiksDigisosId)
                        .composeLens(oFsRammevedtak)
                        .modify((rammevedtakliste) => rammevedtakliste.filter(
                            (rammevedtak) => rammevedtak.rammevedtaksreferanse !== oppdatertRammevedtak.rammevedtaksreferanse))(s1);
                    // Legg til i liste over rammevedtak under den valgte saken
                    return oGetSoknad(forFiksDigisosId)
                        .composeLens(oFsSaker)
                        .composeTraversal(oFsSakerTraversal)
                        .composePrism(oFsSaksStatusPrism(oppdatertRammevedtak.saksreferanse))
                        .composeLens(oFsSaksStatusRammevedtak)
                        .modify((rammevedtak: Rammevedtak[]) => [...rammevedtak, oppdatertRammevedtak])(s2);
                } else {
                    return oGetSoknad(forFiksDigisosId)
                        .composeLens(oFsSaker)
                        .composeTraversal(oFsSakerTraversal)
                        .composePrism(oFsSaksStatusPrism(oppdatertRammevedtak.saksreferanse))
                        .composeLens(oFsSaksStatusRammevedtak)
                        .composeTraversal(oFsRammevedtakTraversal)
                        .composePrism(oFsRammevedtakPrism(oppdatertRammevedtak.rammevedtaksreferanse))
                        .set(oppdatertRammevedtak)(s1);
                }
            } else {
                return oGetSoknad(forFiksDigisosId)
                    .composeLens(oFsRammevedtak)
                    .composeTraversal(oFsRammevedtakTraversal)
                    .composePrism(oFsRammevedtakPrism(oppdatertRammevedtak.rammevedtaksreferanse))
                    .set(oppdatertRammevedtak)(s1);
            }
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