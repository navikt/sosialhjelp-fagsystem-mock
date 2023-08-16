import { FiksDigisosSokerJson } from "../types/hendelseTypes";
import { HentetFsSoknad } from "../redux/types";
import {
  createFsSoknadFromHendelser,
  sorterEtterDatoStigende,
} from "./hentSoknadUtils";

it("adds a FsSoknadObject to state based on DigisosSokerJson", () => {
  const dokKrav = {
    dokumentasjonkravreferanse: "qufzd0xg-heh7-8olr-tu37-bq70lfdti01e",
    utbetalingsreferanse: ["uvn122qk-ap3y-1v1u-jzeb-4uqo0t4esktq"],
    beskrivelse: "Du må kjøpe flere kort til MTG",
    status: "IKKE_OPPFYLT",
    type: "dokumentasjonkrav",
    hendelsestidspunkt: "2021-04-07T09:40:04.862Z",
  };

  const sak1 = {
    referanse: "hdso93xj-t42m-kx07-dqnb-c5aqb0j8r1az",
    tittel: "sak1",
    type: "saksStatus",
    hendelsestidspunkt: "2021-04-07T09:39:37.144Z",
  };

  const sistevedtakSak1 = {
    saksreferanse: "hdso93xj-t42m-kx07-dqnb-c5aqb0j8r1az",
    utfall: "AVVIST",
    vedtaksfil: {
      referanse: {
        id: "2c75227d-64f8-4db6-b718-3b6dd6beb450",
        type: "dokumentlager",
      },
    },
    vedlegg: [],
    type: "vedtakFattet",
    hendelsestidspunkt: "2021-04-07T09:39:43.510Z",
  };
  const vilkarSak1 = {
    vilkarreferanse: "a6dsq1ux-d49v-vqzs-a8qp-bbg2n0v1m4ag",
    utbetalingsreferanse: ["uvn122qk-ap3y-1v1u-jzeb-4uqo0t4esktq"],
    beskrivelse: "Du må kjøpe flere kort til MTG",
    status: "IKKE_OPPFYLT",
    type: "vilkar",
    hendelsestidspunkt: "2021-04-07T09:40:00.456Z",
  };
  const utbetaling1 = {
    utbetalingsreferanse: "1gddrq9p-dgfc-577g-dw1j-8ov7ly94fd9m",
    saksreferanse: "hdso93xj-t42m-kx07-dqnb-c5aqb0j8r1az",
    status: "PLANLAGT_UTBETALING",
    belop: 1337,
    beskrivelse: "Midler til å kjøpe utvidelsespakker til Starcraft",
    forfallsdato: "2021-04-14",
    utbetalingsdato: "2021-04-13",
    fom: "2021-03-31",
    tom: "2021-03-21",
    annenMottaker: false,
    mottaker: "Jim Raynor",
    kontonummer: "12345678903",
    utbetalingsmetode: "Kronekort",
    type: "utbetaling",
    hendelsestidspunkt: "2021-04-07T09:40:15.306Z",
  };

  const utbetaling2 = {
    utbetalingsreferanse: "uvn122qk-ap3y-1v1u-jzeb-4uqo0t4esktq",
    saksreferanse: "hdso93xj-t42m-kx07-dqnb-c5aqb0j8r1az",
    status: "PLANLAGT_UTBETALING",
    belop: 1337,
    beskrivelse: "Midler til å kjøpe utvidelsespakker til Starcraft",
    forfallsdato: "2021-04-14",
    utbetalingsdato: "2021-04-13",
    fom: "2021-03-31",
    tom: "2021-03-21",
    annenMottaker: false,
    mottaker: "Jim Raynor",
    kontonummer: "12345678903",
    utbetalingsmetode: "Kronekort",
    type: "utbetaling",
    hendelsestidspunkt: "2021-04-07T09:39:55.690Z",
  };

  const vilkarUtenUtbetaling1 = {
    vilkarreferanse: "r1elcres-y179-cz8c-522n-rjnit3gaagsr",
    utbetalingsreferanse: [],
    tittel: "Betale husleie",
    beskrivelse: "Du må betale din husleie hver måned.",
    status: "RELEVANT",
    type: "vilkar",
    hendelsestidspunkt: "2022-07-08T12:19:17.856Z",
  };
  const vilkarUtenUtbetaling1Endret = {
    vilkarreferanse: "r1elcres-y179-cz8c-522n-rjnit3gaagsr",
    utbetalingsreferanse: [],
    tittel: "efsdfdsf",
    beskrivelse: "Du må betale din husleie hver måned.",
    status: "RELEVANT",
    type: "vilkar",
    hendelsestidspunkt: "2022-07-08T12:19:23.014Z",
  };
  const vilkarUtenUtbetaling2 = {
    vilkarreferanse: "2nzx03iu-ti8q-epqs-8joe-txm2nlkg8y6e",
    saksreferanse: "",
    utbetalingsreferanse: [],
    tittel: "",
    type: "vilkar",
    hendelsestidspunkt: "2022-07-08T12:19:27.374Z",
  };
  const dokKravUtenUtbetaling1 = {
    dokumentasjonkravreferanse: "ke5e9hlb-ztkm-8ow4-36pn-xn7poiksv85y",
    utbetalingsreferanse: [],
    tittel: "Husleie for forrige måned",
    beskrivelse:
      "Du må levere kopi av kvittering for betalt husleie forrige måned.",
    frist: "2022-07-15T10:19:01.026Z",
    status: "RELEVANT",
    type: "dokumentasjonkrav",
    hendelsestidspunkt: "2022-07-08T12:19:33.808Z",
  };
  const dokKravUtenUtbetaling1Endret = {
    dokumentasjonkravreferanse: "ke5e9hlb-ztkm-8ow4-36pn-xn7poiksv85y",
    utbetalingsreferanse: [],
    tittel: "fsdfdsf",
    beskrivelse:
      "Du må levere kopi av kvittering for betalt husleie forrige måned.",
    frist: "2022-07-15T10:19:01.026Z",
    status: "RELEVANT",
    type: "dokumentasjonkrav",
    hendelsestidspunkt: "2022-07-08T12:19:38.463Z",
  };
  const dokKravUtenUtbetaling2 = {
    dokumentasjonkravreferanse: "jjlhzs3w-rmcw-7q8j-1voe-7mqfnzk4noiw",
    utbetalingsreferanse: [],
    tittel: "Husleie for forrige måned",
    beskrivelse:
      "Du må levere kopi av kvittering for betalt husleie forrige måned.",
    frist: "2022-07-15T10:19:01.026Z",
    status: "RELEVANT",
    type: "dokumentasjonkrav",
    hendelsestidspunkt: "2022-07-08T12:19:42.253Z",
  };
  const utbetalingUtenSak1 = {
    utbetalingsreferanse: "hwll28tw-p35o-78ro-f417-x8pub2182ov0",
    status: "UTBETALT",
    belop: 6550,
    beskrivelse: "Livsopphold",
    forfallsdato: "2022-07-01",
    utbetalingsdato: "2022-06-30",
    fom: "2022-05-25",
    tom: "2022-05-22",
    annenMottaker: false,
    mottaker: "Standard Standarsen",
    kontonummer: "12345678903",
    utbetalingsmetode: "Bankkonto",
    type: "utbetaling",
    hendelsestidspunkt: "2022-07-08T12:19:45.254Z",
  };
  const utbetalingUtenSak1Endret = {
    utbetalingsreferanse: "hwll28tw-p35o-78ro-f417-x8pub2182ov0",
    status: "UTBETALT",
    belop: 6550,
    beskrivelse: "dsfadfs",
    forfallsdato: "2022-07-01",
    utbetalingsdato: "2022-06-30",
    fom: "2022-05-25",
    tom: "2022-05-22",
    annenMottaker: false,
    mottaker: "Standard Standarsen",
    kontonummer: "12345678903",
    utbetalingsmetode: "Bankkonto",
    type: "utbetaling",
    hendelsestidspunkt: "2022-07-08T12:19:49.487Z",
  };
  const utbetalingUtenSak2 = {
    utbetalingsreferanse: "kf1xa3cs-6uft-lv3w-zxhl-3uzz97i8igpf",
    status: "UTBETALT",
    belop: 6550,
    beskrivelse: "Livsopphold",
    forfallsdato: "2022-07-01",
    utbetalingsdato: "2022-06-30",
    fom: "2022-05-25",
    tom: "2022-05-22",
    annenMottaker: false,
    mottaker: "Standard Standarsen",
    kontonummer: "12345678903",
    utbetalingsmetode: "Bankkonto",
    type: "utbetaling",
    hendelsestidspunkt: "2022-07-08T12:19:52.714Z",
  };

  const data = {
    version: "1.0.0",
    avsender: {
      systemnavn: "Testsystemet",
      systemversjon: "1.0.0",
    },
    hendelser: [
      {
        status: "MOTTATT",
        type: "soknadsStatus",
        hendelsestidspunkt: "2021-04-07T09:37:37.641Z",
      },
      {
        status: "FERDIGBEHANDLET",
        type: "soknadsStatus",
        hendelsestidspunkt: "2021-04-07T09:39:27.778Z",
      },
      {
        status: "UNDER_BEHANDLING",
        type: "soknadsStatus",
        hendelsestidspunkt: "2021-04-07T09:39:29.491Z",
      },
      sak1,
      {
        saksreferanse: "hdso93xj-t42m-kx07-dqnb-c5aqb0j8r1az",
        utfall: "DELVIS_INNVILGET",
        vedtaksfil: {
          referanse: {
            id: "2c75227d-64f8-4db6-b718-3b6dd6beb450",
            type: "dokumentlager",
          },
        },
        vedlegg: [],
        type: "vedtakFattet",
        hendelsestidspunkt: "2021-04-07T09:39:40.910Z",
      },
      sistevedtakSak1,
      utbetaling1,
      utbetaling2,
      vilkarSak1,
      dokKrav,
      {
        navKontor: "1210",
        type: "tildeltNavKontor",
        hendelsestidspunkt: "2021-04-07T09:40:20.895Z",
      },
      {
        navKontor: "1208",
        type: "tildeltNavKontor",
        hendelsestidspunkt: "2021-04-07T09:40:22.862Z",
      },
      vilkarUtenUtbetaling1,
      vilkarUtenUtbetaling1Endret,
      vilkarUtenUtbetaling2,
      dokKravUtenUtbetaling1,
      dokKravUtenUtbetaling1Endret,
      dokKravUtenUtbetaling2,
      utbetalingUtenSak1,
      utbetalingUtenSak1Endret,
      utbetalingUtenSak2,
    ],
  } as HentetFsSoknad["data"];

  const fiksDigisosSokerJson = {
    sak: {
      soker: {
        ...data,
      },
    },
    type: "no.nav.digisos.digisos.soker.v1",
  } as FiksDigisosSokerJson;

  expect(
    createFsSoknadFromHendelser(
      data.hendelser,
      fiksDigisosSokerJson,
      "VxBlk01Kz0a"
    )
  ).toEqual({
    soknadsStatus: {
      status: "UNDER_BEHANDLING",
      type: "soknadsStatus",
      hendelsestidspunkt: "2021-04-07T09:39:29.491Z",
    },
    navKontor: {
      navKontor: "1208",
      type: "tildeltNavKontor",
      hendelsestidspunkt: "2021-04-07T09:40:22.862Z",
    },
    dokumentasjonEtterspurt: undefined,
    forelopigSvar: undefined,
    vilkar: [vilkarUtenUtbetaling1Endret, vilkarUtenUtbetaling2],
    dokumentasjonkrav: [dokKravUtenUtbetaling1Endret, dokKravUtenUtbetaling2],
    utbetalingerUtenSaksreferanse: [
      utbetalingUtenSak1Endret,
      utbetalingUtenSak2,
    ],
    saker: [
      {
        ...sak1,
        utbetalinger: [utbetaling1, utbetaling2],
        vedtakFattet: sistevedtakSak1,
        vilkar: [vilkarSak1],
        dokumentasjonskrav: [dokKrav],
      },
    ],
    fiksDigisosId: "VxBlk01Kz0a",
    fiksDigisosSokerJson: fiksDigisosSokerJson,
  });
});

test("funksjon sorterer dato med nyeste hendelser til slutt", () => {
  const hendelser = [
    {
      type: "soknadsStatus",
      hendelsestidspunkt: "2022-04-07T09:37:37.641Z",
    },
    {
      type: "soknadsStatus",
      hendelsestidspunkt: "2021-05-07T09:39:27.778Z",
    },
    {
      type: "utbetaling",
      hendelsestidspunkt: "2021-04-07T09:45:15.306Z",
    },
    {
      type: "vilkar",
      hendelsestidspunkt: "2021-04-07T09:40:00.456Z",
    },
    {
      type: "utbetaling",
      hendelsestidspunkt: "2021-04-08T09:40:15.306Z",
    },
  ];

  expect(
    sorterEtterDatoStigende(
      hendelser,
      (hendelser) => hendelser.hendelsestidspunkt
    )
  ).toEqual([
    {
      type: "vilkar",
      hendelsestidspunkt: "2021-04-07T09:40:00.456Z",
    },
    {
      type: "utbetaling",
      hendelsestidspunkt: "2021-04-07T09:45:15.306Z",
    },
    {
      type: "utbetaling",
      hendelsestidspunkt: "2021-04-08T09:40:15.306Z",
    },
    {
      type: "soknadsStatus",
      hendelsestidspunkt: "2021-05-07T09:39:27.778Z",
    },
    {
      type: "soknadsStatus",
      hendelsestidspunkt: "2022-04-07T09:37:37.641Z",
    },
  ]);
});
