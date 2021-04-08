import Hendelse, {
    DokumentasjonEtterspurt, Dokumentasjonkrav,
    FiksDigisosSokerJson, ForelopigSvar,
    HendelseType,
    SaksStatus,
    SoknadsStatus,
    TildeltNavKontor, Utbetaling, VedtakFattet, Vilkar
} from '../types/hendelseTypes';
import { FsSaksStatus, FsSoknad } from '../redux/types';

const mergeSaksStatuserMedSammeReferanse = (saksStatuser: SaksStatus[]) => {
    const mergetSaksStatuser= new Map();
    saksStatuser.forEach((item: SaksStatus) => {
        const propertyValue = item['referanse'];
        mergetSaksStatuser.has(propertyValue) ?
            mergetSaksStatuser.set(propertyValue, { ...mergetSaksStatuser.get(propertyValue), ...item })
            : mergetSaksStatuser.set(propertyValue, item);
    });
    return Array.from(mergetSaksStatuser.values())
}

export const createFsSoknadFromHendelser = (hendelser: Hendelse[], fiksDigisosSokerJson: FiksDigisosSokerJson, fiksDigisosId: string) => {
    const sisteSoknadsStatus = hendelser.slice().reverse().find((hendelse: Hendelse )=> {
        return hendelse.type === HendelseType.SoknadsStatus;
    }) as SoknadsStatus;

    const sisteTildeltNavkontor = hendelser.slice().reverse().find((hendelse: Hendelse )=> {
        return hendelse.type === HendelseType.TildeltNavKontor;
    }) as TildeltNavKontor;

    const sisteDokumentasjonEtterspurt = hendelser.slice().reverse().find((hendelse: Hendelse )=> {
        return hendelse.type === HendelseType.DokumentasjonEtterspurt;
    }) as DokumentasjonEtterspurt;

    const sisteForelopigSvar= hendelser.slice().reverse().find((hendelse: Hendelse )=> {
        return hendelse.type === HendelseType.ForelopigSvar;
    }) as ForelopigSvar;

    const utbetalingerUtenSak = hendelser.filter((hendelse: Hendelse )=> {
        return hendelse.type === HendelseType.Utbetaling && !hendelse.saksreferanse;
    }) as Utbetaling[];

    const vilkarUtenUtbetaling = hendelser.filter((hendelse: Hendelse )=> {
        return hendelse.type === HendelseType.Vilkar && !hendelse.utbetalingsreferanse;
    }) as Vilkar[];

    const dokKravUtenUtbetaling = hendelser.filter((hendelse: Hendelse )=> {
        return hendelse.type === HendelseType.Dokumentasjonkrav && !hendelse.utbetalingsreferanse;
    }) as Dokumentasjonkrav[];

    const saksStatuser= hendelser.filter((hendelse: Hendelse )=> {
        return hendelse.type === HendelseType.SaksStatus ;
    }) as SaksStatus[]

    const unikeSaksHendelser = mergeSaksStatuserMedSammeReferanse(saksStatuser);

    const saker: FsSaksStatus[] = unikeSaksHendelser.map((sak: SaksStatus) => {
        const utbetalingerTilSak = hendelser.filter((hendelse: Hendelse )=> {
            return hendelse.type === HendelseType.Utbetaling && (hendelse.saksreferanse === sak.referanse);
        }) as Utbetaling[];

        const sisteVedtakTilSak = hendelser.slice().reverse().find((hendelse: Hendelse )=> {
            return hendelse.type === HendelseType.VedtakFattet && (hendelse.saksreferanse === sak.referanse);
        }) as VedtakFattet;

        const vilkarTilSak = hendelser.filter((hendelse: Hendelse )=> {
            if(hendelse.type !== HendelseType.Vilkar) {
                return false;
            }
            return utbetalingerTilSak.find( utbetaling => {
                return hendelse.utbetalingsreferanse?.includes(utbetaling.utbetalingsreferanse)
            })
        }) as Vilkar[];

        const dokumentasjonskravTilSak = hendelser.filter((hendelse: Hendelse )=> {
            if(hendelse.type !== HendelseType.Dokumentasjonkrav) {
                return false;
            }
            return utbetalingerTilSak.find( utbetaling => {
                return hendelse.utbetalingsreferanse?.includes(utbetaling.utbetalingsreferanse)
            })
        }) as Dokumentasjonkrav[];

        const fsSaksStatus: FsSaksStatus = {
            ...sak,
            utbetalinger: utbetalingerTilSak,
            vedtakFattet: sisteVedtakTilSak,
            vilkar: vilkarTilSak,
            dokumentasjonskrav: dokumentasjonskravTilSak
        }

        return fsSaksStatus;
    })

    const fsSoknad: FsSoknad = {
        fiksDigisosId,
        soknadsStatus:  sisteSoknadsStatus,
        navKontor: sisteTildeltNavkontor,
        dokumentasjonEtterspurt: sisteDokumentasjonEtterspurt,
        forelopigSvar: sisteForelopigSvar,
        vilkar: vilkarUtenUtbetaling,
        dokumentasjonkrav: dokKravUtenUtbetaling,
        utbetalingerUtenSaksreferanse: utbetalingerUtenSak,
        saker: saker || [],
        fiksDigisosSokerJson: fiksDigisosSokerJson
    }

    return fsSoknad;
}

