import Hendelse, {
  DokumentasjonEtterspurt,
  Dokumentasjonkrav,
  FiksDigisosSokerJson,
  ForelopigSvar,
  HendelseType,
  SaksStatus,
  SoknadsStatus,
  TildeltNavKontor,
  Utbetaling,
  VedtakFattet,
  Vilkar,
} from "../types/hendelseTypes";
import { FsSaksStatus, FsSoknad } from "../redux/types";

const mergeSaksStatuserMedSammeReferanse = (saksStatuser: SaksStatus[]) => {
  const mergetSaksStatuser = new Map();
  saksStatuser.forEach((item: SaksStatus) => {
    const propertyValue = item["referanse"];
    if (mergetSaksStatuser.has(propertyValue)) {
      mergetSaksStatuser.set(propertyValue, {
        ...mergetSaksStatuser.get(propertyValue),
        ...item,
      });
    } else {
      mergetSaksStatuser.set(propertyValue, item);
    }
  });
  return Array.from(mergetSaksStatuser.values());
};

const manglerUtbetalingsReferanse = (utbetalingsreferanse: string[] | null) => {
  return !utbetalingsreferanse || utbetalingsreferanse.length === 0;
};

const getSisteUnikeElement = <T>(
  array: T[],
  getTextProperty: (object: T) => string,
) => {
  const arrayOfKeys = array.map((el) => getTextProperty(el));
  return array.filter(
    (element, i) => arrayOfKeys.lastIndexOf(getTextProperty(element)) === i,
  );
};
export const sorterEtterDatoStigende = <T>(
  array: T[],
  getTextProperty: (object: T) => string,
) => {
  return array.sort(function (a, b) {
    const keyA = new Date(getTextProperty(a)),
      keyB = new Date(getTextProperty(b));
    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  });
};

export const createFsSoknadFromHendelser = (
  hendelser: Hendelse[],
  fiksDigisosSokerJson: FiksDigisosSokerJson,
  fiksDigisosId: string,
) => {
  const sisteSoknadsStatus = hendelser
    .slice()
    .reverse()
    .find((hendelse: Hendelse) => {
      return hendelse.type === HendelseType.SoknadsStatus;
    }) as SoknadsStatus;

  const sisteTildeltNavkontor = hendelser
    .slice()
    .reverse()
    .find((hendelse: Hendelse) => {
      return hendelse.type === HendelseType.TildeltNavKontor;
    }) as TildeltNavKontor;

  const sisteDokumentasjonEtterspurt = hendelser
    .slice()
    .reverse()
    .find((hendelse: Hendelse) => {
      return hendelse.type === HendelseType.DokumentasjonEtterspurt;
    }) as DokumentasjonEtterspurt;

  const sisteForelopigSvar = hendelser
    .slice()
    .reverse()
    .find((hendelse: Hendelse) => {
      return hendelse.type === HendelseType.ForelopigSvar;
    }) as ForelopigSvar;

  const utbetalingerUtenSak = hendelser.filter((hendelse: Hendelse) => {
    return hendelse.type === HendelseType.Utbetaling && !hendelse.saksreferanse;
  }) as Utbetaling[];

  const vilkarUtenUtbetaling = hendelser.filter((hendelse: Hendelse) => {
    return (
      hendelse.type === HendelseType.Vilkar &&
      manglerUtbetalingsReferanse(hendelse.utbetalingsreferanse)
    );
  }) as Vilkar[];

  const dokKravUtenUtbetaling = hendelser.filter((hendelse: Hendelse) => {
    return (
      hendelse.type === HendelseType.Dokumentasjonkrav &&
      manglerUtbetalingsReferanse(hendelse.utbetalingsreferanse)
    );
  }) as Dokumentasjonkrav[];

  const unikeVilkar = getSisteUnikeElement(
    vilkarUtenUtbetaling,
    (vilkar: Vilkar) => vilkar.vilkarreferanse,
  );
  const unikeDokkrav = getSisteUnikeElement(
    dokKravUtenUtbetaling,
    (dokkrav: Dokumentasjonkrav) => dokkrav.dokumentasjonkravreferanse,
  );
  const unikeUtbetalinger = getSisteUnikeElement(
    utbetalingerUtenSak,
    (utbetaling: Utbetaling) => utbetaling.utbetalingsreferanse,
  );

  const saksStatuser = hendelser.filter((hendelse: Hendelse) => {
    return hendelse.type === HendelseType.SaksStatus;
  }) as SaksStatus[];

  const unikeSaksHendelser = mergeSaksStatuserMedSammeReferanse(saksStatuser);

  const saker: FsSaksStatus[] = unikeSaksHendelser.map((sak: SaksStatus) => {
    const alleUtbetalingerTilSak = hendelser.filter((hendelse: Hendelse) => {
      return (
        hendelse.type === HendelseType.Utbetaling &&
        hendelse.saksreferanse === sak.referanse
      );
    }) as Utbetaling[];

    const utbetalingerTilSak = getSisteUnikeElement(
      alleUtbetalingerTilSak,
      (utbetaling: Utbetaling) => utbetaling.utbetalingsreferanse,
    );

    const sisteVedtakTilSak = hendelser
      .slice()
      .reverse()
      .find((hendelse: Hendelse) => {
        return (
          hendelse.type === HendelseType.VedtakFattet &&
          hendelse.saksreferanse === sak.referanse
        );
      }) as VedtakFattet;

    const vilkarTilSak = hendelser.filter((hendelse: Hendelse) => {
      if (hendelse.type !== HendelseType.Vilkar) {
        return false;
      }
      return utbetalingerTilSak.find((utbetaling) => {
        return hendelse.utbetalingsreferanse?.includes(
          utbetaling.utbetalingsreferanse,
        );
      });
    }) as Vilkar[];

    const dokumentasjonskravTilSak = hendelser.filter((hendelse: Hendelse) => {
      if (hendelse.type !== HendelseType.Dokumentasjonkrav) {
        return false;
      }
      return utbetalingerTilSak.find((utbetaling) => {
        return hendelse.utbetalingsreferanse?.includes(
          utbetaling.utbetalingsreferanse,
        );
      });
    }) as Dokumentasjonkrav[];

    const fsSaksStatus: FsSaksStatus = {
      ...sak,
      utbetalinger: utbetalingerTilSak,
      vedtakFattet: sisteVedtakTilSak,
      vilkar: vilkarTilSak,
      dokumentasjonskrav: dokumentasjonskravTilSak,
    };

    return fsSaksStatus;
  });

  const fsSoknad: FsSoknad = {
    fiksDigisosId,
    soknadsStatus: sisteSoknadsStatus,
    navKontor: sisteTildeltNavkontor,
    dokumentasjonEtterspurt: sisteDokumentasjonEtterspurt,
    forelopigSvar: sisteForelopigSvar,
    vilkar: [...unikeVilkar, ...saker.flatMap((sak) => sak.vilkar)],
    dokumentasjonkrav: [
      ...unikeDokkrav,
      ...saker.flatMap((sak) => sak.dokumentasjonskrav),
    ],
    utbetalingerUtenSaksreferanse: unikeUtbetalinger,
    saker: saker || [],
    fiksDigisosSokerJson: fiksDigisosSokerJson,
  };

  return fsSoknad;
};
