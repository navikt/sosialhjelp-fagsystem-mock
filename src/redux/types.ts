import Hendelse, {
  DokumentasjonEtterspurt,
  Dokumentasjonkrav,
  FiksDigisosSokerJson,
  ForelopigSvar,
  SaksStatus,
  SoknadsStatus,
  TildeltNavKontor,
  Utbetaling,
  VedtakFattet,
  Vilkar,
} from "../types/hendelseTypes";

export interface Model {
  loaderOn: boolean;
  backendUrlTypeToUse: keyof BackendUrls;
  thememode: "light" | "dark";

  soknader: FsSoknad[];

  visNySakModal: boolean;
  visNyDokumentasjonEtterspurtModal: boolean;
  visNyUtbetalingModal: boolean;
  visNyVilkarModal: boolean;
  visNyDokumentasjonkravModal: boolean;
  modalSaksreferanse: string | null;
  visSystemSettingsModal: boolean;
  visSnackbar: boolean;
  snackbarVariant: "success" | "error";

  aktivSoknad: string; // fiksDigisosId
  aktivUtbetaling: string | null; // utbetalingsreferanse
  aktivtVilkar: string | null; // vilkarreferanse
  aktivtDokumentasjonkrav: string | null; // dokumentasjonkravreferanse
}

export interface FsSoknad {
  fiksDigisosId: string;
  soknadsStatus: SoknadsStatus; // Default mottatt
  navKontor: TildeltNavKontor | undefined;
  dokumentasjonEtterspurt: DokumentasjonEtterspurt | undefined;
  forelopigSvar: ForelopigSvar | undefined;
  vilkar: Vilkar[];
  dokumentasjonkrav: Dokumentasjonkrav[];
  utbetalingerUtenSaksreferanse: Utbetaling[];
  saker: FsSaksStatus[];
  fiksDigisosSokerJson: FiksDigisosSokerJson;
}

export interface FsSaksStatus extends SaksStatus {
  utbetalinger: Utbetaling[];
  vedtakFattet: VedtakFattet | undefined;
  vilkar: Vilkar[];
  dokumentasjonskrav: Dokumentasjonkrav[];
}

export interface BackendUrls {
  lokalInnsyn: string;
  mock: string;
  lokalMockalt: string;
}

export enum ActionTypeKeys {
  HENTET_SOKNAD = "HENTET_SOKNAD",
}

export interface HentetFsSoknad {
  type: ActionTypeKeys.HENTET_SOKNAD;
  fiksDigisosId: string;

  data: {
    version: string;
    avsender: {
      systemnavn: string;
      systemversjon: string;
    };
    hendelser: Hendelse[];
  };
}
