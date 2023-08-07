import Hendelse, {
  Dokumentasjonkrav,
  FiksDigisosSokerJson,
  HendelseType,
  SaksStatus,
  Utbetaling,
  Vilkar,
} from "../types/hendelseTypes";
import { FsSaksStatus, FsSoknad } from "../redux/types";

export const removeNullFieldsFromHendelser = (
  fiksDigisosSokerJson: FiksDigisosSokerJson,
): FiksDigisosSokerJson => {
  let hednelserUtenNull = JSON.parse(
    JSON.stringify(fiksDigisosSokerJson.sak.soker.hendelser, (key, value) => {
      if (value !== null) return value;
    }),
  );
  return {
    ...fiksDigisosSokerJson,
    sak: {
      ...fiksDigisosSokerJson.sak,
      soker: {
        ...fiksDigisosSokerJson.sak.soker,
        hendelser: hednelserUtenNull,
      },
    },
  };
};

export const getLastHendelseOfType = (
  fiksDigisosSokerJson: FiksDigisosSokerJson,
  hendelseType: HendelseType,
): Hendelse | undefined => {
  const hendelser: Hendelse[] = fiksDigisosSokerJson.sak.soker.hendelser;
  const hendelserCopied: Hendelse[] = hendelser.slice();
  return hendelserCopied
    .reverse()
    .find((hendelse: Hendelse) => hendelse.type === hendelseType);
};

export const getShortDateISOString = (date: Date) =>
  date.toISOString().substring(0, date.toISOString().search("T"));

export const formatDateString = (dateString: string | null) => {
  const date = getDateOrNullFromDateString(dateString);
  return date ? getShortDateISOString(date) : null;
};

const isValidDate = (str: string | null) => {
  return str ? !isNaN(Date.parse(str)) : false;
};

export const getDateOrNullFromDateString = (date: string | null) => {
  if (date === null || !isValidDate(date)) {
    return null;
  } else {
    let dateNumber = Date.parse(date);
    let newDate = new Date(dateNumber);
    newDate.setHours(12);
    return newDate;
  }
};

export function getNow(): string {
  return new Date().toISOString();
}

export const getAllUtbetalingsreferanser = (soknad: FsSoknad) => {
  let referanser: string[] = [];

  soknad.saker.map((sak) =>
    sak.utbetalinger.map((utbetaling) =>
      referanser.push(
        utbetaling.utbetalingsreferanse +
          getSakTittelFraSaksreferanse(soknad, utbetaling.utbetalingsreferanse),
      ),
    ),
  );

  return referanser;
};

export const getSakTittelOgNrFraUtbetalingsreferanse = (
  soknad: FsSoknad,
  referanse: string,
) => {
  let tittel = "";

  soknad.saker.forEach((sak) =>
    sak.utbetalinger.forEach((utbetaling, idx) => {
      if (utbetaling.utbetalingsreferanse === referanse) {
        tittel = "(sak: " + sak.tittel + ", utbetaling: " + (idx + 1) + ")";
      }
    }),
  );

  return tittel;
};

export const getSakTittelFraSaksreferanse = (
  soknad: FsSoknad,
  referanse: string,
) => {
  let tittel = "";

  soknad.saker.forEach((sak) => {
    if (sak.referanse === referanse) {
      tittel = "(sak: " + sak.tittel + ")";
    }
  });

  return tittel;
};

export const getAllSaksStatuser = (hendelser: Hendelse[]): SaksStatus[] => {
  return hendelser
    .filter((hendelse: Hendelse) => {
      switch (hendelse.type) {
        case HendelseType.SaksStatus: {
          return true;
        }
        default: {
          return false;
        }
      }
    })
    .map((saksStatusHendelse: Hendelse) => {
      return saksStatusHendelse as SaksStatus;
    });
};

export const generateFilreferanseId = (): string => {
  const listOfCharacters: string[] = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "0",
  ];
  const n = listOfCharacters.length;

  const r: string[] = [];
  for (let i = 0; i < 32; i++) {
    const idx = Math.floor(Math.random() * n);
    const randomCharacter = listOfCharacters[idx];
    r.push(randomCharacter);
  }
  const jp = "";
  return `${r.slice(0, 8).join(jp)}-${r.slice(8, 12).join(jp)}-${r
    .slice(12, 16)
    .join(jp)}-${r.slice(16, 20).join(jp)}-${r.slice(20).join(jp)}`;
};

export const generateRandomId = (length: number) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const getFsSoknadByFiksDigisosId = (
  soknader: FsSoknad[],
  fiksDigisosId: string,
): FsSoknad | undefined => {
  return soknader.find((s) => {
    return s.fiksDigisosId === fiksDigisosId;
  });
};

export const fsSaksStatusToSaksStatus = (
  fsSaksStatus: FsSaksStatus,
): SaksStatus => {
  return {
    type: HendelseType.SaksStatus,
    hendelsestidspunkt: fsSaksStatus.hendelsestidspunkt,
    referanse: fsSaksStatus.referanse,
    tittel: fsSaksStatus.tittel,
    status: fsSaksStatus.status,
  } as SaksStatus;
};

export const generateNyFsSaksStatus = (tittel: string | null): FsSaksStatus => {
  return {
    type: HendelseType.SaksStatus,
    hendelsestidspunkt: getNow(),
    referanse: generateFilreferanseId(),
    tittel: tittel,
    status: null,
    utbetalinger: [],
    vedtakFattet: undefined,
    vilkar: [],
    dokumentasjonskrav: [],
  } as FsSaksStatus;
};

export const getAlleUtbetalingerFraSaker = (
  saker: FsSaksStatus[],
): Utbetaling[] => {
  let utbetalingerListe: Utbetaling[] = [];
  saker.forEach((sak) =>
    sak.utbetalinger.forEach(
      (utbetalinger) =>
        (utbetalingerListe = [...utbetalingerListe, utbetalinger]),
    ),
  );
  return utbetalingerListe;
};

export const getAlleUtbetalinger = (soknad: FsSoknad): Utbetaling[] => {
  let alleUtbetalinger: Utbetaling[] = [
    ...soknad.utbetalingerUtenSaksreferanse,
  ];
  const alleUtbetalingerFraSaker = getAlleUtbetalingerFraSaker(soknad.saker);
  alleUtbetalingerFraSaker.forEach(
    (utbetalinger) => (alleUtbetalinger = [...alleUtbetalinger, utbetalinger]),
  );
  return alleUtbetalinger.concat(alleUtbetalingerFraSaker);
};

export const getUtbetalingByUtbetalingsreferanse = (
  soknad: FsSoknad,
  referanse: string,
): Utbetaling | undefined => {
  let alleUtbetalinger = getAlleUtbetalinger(soknad);
  return alleUtbetalinger.find((s) => s.utbetalingsreferanse === referanse);
};

export const getVilkarByVilkarreferanse = (
  vilkar: Vilkar[],
  referanse: string,
): Vilkar | undefined => {
  return vilkar.find((s) => {
    return s.vilkarreferanse === referanse;
  });
};

export const getDokumentasjonkravByDokumentasjonkravreferanse = (
  dokumentasjonkrav: Dokumentasjonkrav[],
  referanse: string,
): Dokumentasjonkrav | undefined => {
  return dokumentasjonkrav.find((s) => {
    return s.dokumentasjonkravreferanse === referanse;
  });
};
