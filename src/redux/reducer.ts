import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  BackendUrls,
  FsSaksStatus,
  FsSoknad,
  Model,
} from "./types";
import {
  DigisosSokerJson,
  DokumentasjonEtterspurt,
  Dokumentasjonkrav,
  DokumentlagerExtended,
  FiksDigisosSokerJson,
  FilreferanseType,
  ForelopigSvar,
  HendelseType,
  SaksStatus,
  SoknadsStatus,
  SoknadsStatusType,
  TildeltNavKontor,
  Utbetaling,
  VedtakFattet,
  Vilkar,
} from "../types/hendelseTypes";
import {
  fsSaksStatusToSaksStatus,
  generateRandomId,
  getNow,
} from "../utils/utilityFunctions";
import {
  createFsSoknadFromHendelser,
  sorterEtterDatoStigende,
} from "../utils/hentSoknadUtils";
import { ReadonlyURLSearchParams } from "next/navigation";

export const defaultDokumentlagerRef: DokumentlagerExtended = {
  type: FilreferanseType.dokumentlager,
  id: "2c75227d-64f8-4db6-b718-3b6dd6beb450",
  tittel: "01 - qwer - dokumentalger",
};

export const backendUrlsLocalTemplate: string =
  "http://localhost:8080/sosialhjelp/innsyn-api";
export const backendUrlsMockTemplate: string =
  "https://digisos.ekstern.dev.nav.no/sosialhjelp/mock-alt-api/innsyn-api";
export const backendUrlMockAltLocal: string =
  "http://localhost:8989/sosialhjelp/mock-alt-api/innsyn-api";

export const oppdaterDigisosSakUrl: string =
  "/api/v1/digisosapi/oppdaterDigisosSak";
export const nyNavEnhetUrl: string = "/api/v1/mock/nyNavEnhet";

export const FIKSDIGISOSID_URL_PARAM = "fiksDigisosId";

export const backendUrls: BackendUrls = {
  lokalInnsyn: backendUrlsLocalTemplate,
  mock: backendUrlsMockTemplate,
  lokalMockalt: backendUrlMockAltLocal,
};

export const getInitialFsSoknad = (fiksDigisosId: string): FsSoknad => {
  const initialSoknadsStatusHendelse: SoknadsStatus = {
    type: HendelseType.SoknadsStatus,
    hendelsestidspunkt: getNow(),
    status: SoknadsStatusType.MOTTATT,
  };

  return {
    fiksDigisosId,
    soknadsStatus: initialSoknadsStatusHendelse,
    navKontor: undefined,
    dokumentasjonEtterspurt: undefined,
    forelopigSvar: undefined,
    vilkar: [],
    dokumentasjonkrav: [],
    utbetalingerUtenSaksreferanse: [],
    saker: [],
    fiksDigisosSokerJson: {
      sak: {
        soker: {
          version: "1.0.0",
          avsender: {
            systemnavn: "Testsystemet",
            systemversjon: "1.0.0",
          },
          hendelser: [initialSoknadsStatusHendelse],
        },
      },
      type: "no.nav.digisos.digisos.soker.v1",
    } as FiksDigisosSokerJson,
  };
};

export const idFromQueryOrRandomId = (
  searchParams?: ReadonlyURLSearchParams,
): string => {
  if (!searchParams) {
    return generateRandomId(11);
  }
  const fiksdigisosid = searchParams.get(FIKSDIGISOSID_URL_PARAM);

  if (fiksdigisosid && fiksdigisosid.length > 0) {
    return fiksdigisosid;
  }
  return generateRandomId(11);
};

const getBackendUrlTypeToUse = (): keyof BackendUrls => {
  if (process.env.NEXT_PUBLIC_RUNTIME_ENVIRONMENT === "mock") {
    return "mock";
  } else {
    return "lokalMockalt";
  }
};

export const initialModel: Model = {
  loaderOn: false,
  backendUrlTypeToUse: getBackendUrlTypeToUse(),
  soknader: [],
  thememode: "light",
  visNySakModal: false,
  visNyDokumentasjonEtterspurtModal: false,
  visNyUtbetalingModal: false,
  visNyVilkarModal: false,
  visNyDokumentasjonkravModal: false,
  modalSaksreferanse: null,
  visSystemSettingsModal: false,
  visSnackbar: false,
  snackbarVariant: "success",
  aktivSoknad: idFromQueryOrRandomId(),
  aktivUtbetaling: null,
  aktivtVilkar: null,
  aktivtDokumentasjonkrav: null,
};

const modelSlice = createSlice({
  name: "model",
  initialState: initialModel,
  reducers: {
    SET_AKTIV_SOKNAD(state, action: PayloadAction<string>) {
      state.aktivSoknad = action.payload;
    },
    SET_AKTIV_UTBETALING(state, action: PayloadAction<string | null>) {
      state.aktivUtbetaling = action.payload;
    },
    SET_AKTIVT_VILKAR(state, action: PayloadAction<string | null>) {
      state.aktivtVilkar = action.payload;
    },
    SET_AKTIVT_DOKUMENTASJONKRAV(state, action: PayloadAction<string | null>) {
      state.aktivtDokumentasjonkrav = action.payload;
    },
    SET_BACKEND_URL_TYPE_TO_USE(
      state,
      action: PayloadAction<keyof BackendUrls>,
    ) {
      state.backendUrlTypeToUse = action.payload;
    },
    TURN_ON_LOADER(state) {
      state.loaderOn = true;
    },
    TURN_OFF_LOADER(state) {
      state.loaderOn = false;
    },
    SWITCH_TO_LIGHT_MODE(state) {
      state.thememode = "light";
    },
    SWITCH_TO_DARK_MODE(state) {
      state.thememode = "dark";
    },
    VIS_NY_SAK_MODAL(state) {
      state.visNySakModal = true;
    },
    SKJUL_NY_SAK_MODAL(state) {
      state.visNySakModal = false;
    },
    VIS_NY_DOKUMENTASJON_ETTERSPURT_MODAL(state) {
      state.visNyDokumentasjonEtterspurtModal = true;
    },
    SKJUL_NY_DOKUMENTASJON_ETTERSPURT_MODAL(state) {
      state.visNyDokumentasjonEtterspurtModal = false;
    },
    VIS_NY_UTBETALING_MODAL(state, action: PayloadAction<string | null>) {
      state.visNyUtbetalingModal = true;
      state.modalSaksreferanse = action.payload;
    },
    SKJUL_NY_UTBETALING_MODAL(state) {
      state.visNyUtbetalingModal = false;
    },
    VIS_NY_VILKAR_MODAL(state) {
      state.visNyVilkarModal = true;
    },
    SKJUL_NY_VILKAR_MODAL(state) {
      state.visNyVilkarModal = false;
    },
    VIS_NY_DOKUMENTASJONKRAV_MODAL(state) {
      state.visNyDokumentasjonkravModal = true;
    },
    SKJUL_NY_DOKUMENTASJONKRAV_MODAL(state) {
      state.visNyDokumentasjonkravModal = false;
    },
    VIS_SYSTEM_SETTINGS_MODAL(state) {
      state.visSystemSettingsModal = true;
    },
    SKJUL_SYSTEM_SETTINGS_MODAL(state) {
      state.visSystemSettingsModal = false;
    },
    VIS_SUCCESS_SNACKBAR(state) {
      state.visSnackbar = true;
      state.snackbarVariant = "success";
    },
    VIS_ERROR_SNACKBAR(state) {
      state.visSnackbar = true;
      state.snackbarVariant = "error";
    },
    SKJUL_SNACKBAR(state) {
      state.visSnackbar = false;
    },
    NY_SOKNAD(state, action: PayloadAction<string>) {
      const newFsSoknad = getInitialFsSoknad(action.payload);
      state.soknader.push(newFsSoknad);
    },
    HENTET_SOKNAD(
      state,
      action: PayloadAction<{ fiksDigisosId: string; data: DigisosSokerJson }>,
    ) {
      const { fiksDigisosId, data } = action.payload;
      const soknadFinnes = state.soknader.find(
        (soknad) => soknad.fiksDigisosId === fiksDigisosId,
      );
      if (soknadFinnes) return;

      const fiksDigisosSokerJson = {
        sak: {
          soker: {
            ...data,
          },
        },
        type: "no.nav.digisos.digisos.soker.v1",
      } as FiksDigisosSokerJson;

      const sorterteHendelser = sorterEtterDatoStigende(
        data.hendelser,
        (hendelser) => hendelser.hendelsestidspunkt,
      );
      const fsSoknad = createFsSoknadFromHendelser(
        sorterteHendelser,
        fiksDigisosSokerJson,
        fiksDigisosId,
      );

      state.soknader.push(fsSoknad);
    },
    SLETT_SOKNAD(state, action: PayloadAction<string>) {
      state.soknader = state.soknader.filter(
        (soknad) => soknad.fiksDigisosId !== action.payload,
      );
    },
    OPPDATER_FIKS_DIGISOS_ID(
      state,
      action: PayloadAction<{
        forFiksDigisosId: string;
        nyFiksDigisosId: string;
      }>,
    ) {
      const { forFiksDigisosId, nyFiksDigisosId } = action.payload;
      const soknad = state.soknader.find(
        (soknad) => soknad.fiksDigisosId === forFiksDigisosId,
      );
      if (soknad) {
        soknad.fiksDigisosId = nyFiksDigisosId;
      }
    },
    OPPDATER_SOKNADS_STATUS(
      state,
      action: PayloadAction<{
        forFiksDigisosId: string;
        nySoknadsStatus: SoknadsStatus;
      }>,
    ) {
      const { forFiksDigisosId, nySoknadsStatus } = action.payload;
      const soknad = state.soknader.find(
        (soknad) => soknad.fiksDigisosId === forFiksDigisosId,
      );
      if (soknad) {
        soknad.soknadsStatus = nySoknadsStatus;
        soknad.fiksDigisosSokerJson.sak.soker.hendelser.push(nySoknadsStatus);
      }
    },
    OPPDATER_NAV_KONTOR(
      state,
      action: PayloadAction<{
        forFiksDigisosId: string;
        nyttNavKontor: TildeltNavKontor;
      }>,
    ) {
      const { forFiksDigisosId, nyttNavKontor } = action.payload;
      const soknad = state.soknader.find(
        (s) => s.fiksDigisosId === forFiksDigisosId,
      );
      if (soknad) {
        soknad.navKontor = nyttNavKontor;
        soknad.fiksDigisosSokerJson.sak.soker.hendelser.push(nyttNavKontor);
      }
    },
    OPPDATER_DOKUMENTASJON_ETTERSPURT(
      state,
      action: PayloadAction<{
        forFiksDigisosId: string;
        nyDokumentasjonEtterspurt: DokumentasjonEtterspurt;
      }>,
    ) {
      const { forFiksDigisosId, nyDokumentasjonEtterspurt } = action.payload;
      const soknad = state.soknader.find(
        (s) => s.fiksDigisosId === forFiksDigisosId,
      );
      if (soknad) {
        soknad.dokumentasjonEtterspurt = nyDokumentasjonEtterspurt;
        soknad.fiksDigisosSokerJson.sak.soker.hendelser.push(
          nyDokumentasjonEtterspurt,
        );
      }
    },
    OPPDATER_FORELOPIG_SVAR(
      state,
      action: PayloadAction<{
        forFiksDigisosId: string;
        nyttForelopigSvar: ForelopigSvar;
      }>,
    ) {
      const { forFiksDigisosId, nyttForelopigSvar } = action.payload;
      const soknad = state.soknader.find(
        (s) => s.fiksDigisosId === forFiksDigisosId,
      );
      if (soknad) {
        soknad.forelopigSvar = nyttForelopigSvar;
        soknad.fiksDigisosSokerJson.sak.soker.hendelser.push(nyttForelopigSvar);
      }
    },
    NY_FS_SAKS_STATUS(
      state,
      action: PayloadAction<{
        forFiksDigisosId: string;
        nyFsSaksStatus: FsSaksStatus;
      }>,
    ) {
      const { forFiksDigisosId, nyFsSaksStatus } = action.payload;
      const soknad = state.soknader.find(
        (s) => s.fiksDigisosId === forFiksDigisosId,
      );
      if (soknad) {
        soknad.saker.push(nyFsSaksStatus);
        soknad.fiksDigisosSokerJson.sak.soker.hendelser.push(
          fsSaksStatusToSaksStatus(nyFsSaksStatus),
        );
      }
    },
    OPPDATER_FS_SAKS_STATUS(
      state,
      action: PayloadAction<{
        forFiksDigisosId: string;
        oppdatertSaksstatus: SaksStatus;
      }>,
    ) {
      const { forFiksDigisosId, oppdatertSaksstatus } = action.payload;
      const soknad = state.soknader.find(
        (s) => s.fiksDigisosId === forFiksDigisosId,
      );
      if (soknad) {
        const saksStatus = soknad.saker.find(
          (s) => s.referanse === oppdatertSaksstatus.referanse,
        );
        if (saksStatus) {
          saksStatus.tittel = oppdatertSaksstatus.tittel;
          saksStatus.status = oppdatertSaksstatus.status;
        }
        soknad.fiksDigisosSokerJson.sak.soker.hendelser.push(
          oppdatertSaksstatus,
        );
      }
    },
    NY_UTBETALING(
      state,
      action: PayloadAction<{
        forFiksDigisosId: string;
        nyUtbetaling: Utbetaling;
      }>,
    ) {
      const { forFiksDigisosId, nyUtbetaling } = action.payload;
      const soknad = state.soknader.find(
        (s) => s.fiksDigisosId === forFiksDigisosId,
      );
      if (soknad) {
        soknad.fiksDigisosSokerJson.sak.soker.hendelser.push(nyUtbetaling);
        if (nyUtbetaling.saksreferanse) {
          const saksStatus = soknad.saker.find(
            (s) => s.referanse === nyUtbetaling.saksreferanse,
          );
          if (saksStatus) {
            saksStatus.utbetalinger.push(nyUtbetaling);
          }
        } else {
          soknad.utbetalingerUtenSaksreferanse.push(nyUtbetaling);
        }
      }
    },
    OPPDATER_UTBETALING(
      state,
      action: PayloadAction<{
        forFiksDigisosId: string;
        oppdatertUtbetaling: Utbetaling;
      }>,
    ) {
      const { forFiksDigisosId, oppdatertUtbetaling } = action.payload;
      const soknad = state.soknader.find(
        (s) => s.fiksDigisosId === forFiksDigisosId,
      );
      if (soknad) {
        soknad.fiksDigisosSokerJson.sak.soker.hendelser.push(
          oppdatertUtbetaling,
        );
        if (oppdatertUtbetaling.saksreferanse) {
          const saksStatus = soknad.saker.find(
            (s) => s.referanse === oppdatertUtbetaling.saksreferanse,
          );
          if (saksStatus) {
            const utbetalingIndex = saksStatus.utbetalinger.findIndex(
              (u) =>
                u.utbetalingsreferanse ===
                oppdatertUtbetaling.utbetalingsreferanse,
            );
            if (utbetalingIndex !== -1) {
              saksStatus.utbetalinger[utbetalingIndex] = oppdatertUtbetaling;
            } else {
              soknad.utbetalingerUtenSaksreferanse =
                soknad.utbetalingerUtenSaksreferanse.filter(
                  (u) =>
                    u.utbetalingsreferanse !==
                    oppdatertUtbetaling.utbetalingsreferanse,
                );
              saksStatus.utbetalinger.push(oppdatertUtbetaling);
            }
          }
        } else {
          const utbetalingIndex =
            soknad.utbetalingerUtenSaksreferanse.findIndex(
              (u) =>
                u.utbetalingsreferanse ===
                oppdatertUtbetaling.utbetalingsreferanse,
            );
          if (utbetalingIndex !== -1) {
            soknad.utbetalingerUtenSaksreferanse[utbetalingIndex] =
              oppdatertUtbetaling;
          }
        }
      }
    },
    NYTT_DOKUMENTASJONKRAV(
      state,
      action: PayloadAction<{
        forFiksDigisosId: string;
        nyttDokumentasjonkrav: Dokumentasjonkrav;
      }>,
    ) {
      const { forFiksDigisosId, nyttDokumentasjonkrav } = action.payload;
      const soknad = state.soknader.find(
        (s) => s.fiksDigisosId === forFiksDigisosId,
      );
      if (soknad) {
        soknad.dokumentasjonkrav.push(nyttDokumentasjonkrav);
        soknad.fiksDigisosSokerJson.sak.soker.hendelser.push(
          nyttDokumentasjonkrav,
        );
      }
    },
    OPPDATER_DOKUMENTASJONKRAV(
      state,
      action: PayloadAction<{
        forFiksDigisosId: string;
        oppdatertDokumentasjonkrav: Dokumentasjonkrav;
      }>,
    ) {
      const { forFiksDigisosId, oppdatertDokumentasjonkrav } = action.payload;
      const soknad = state.soknader.find(
        (s) => s.fiksDigisosId === forFiksDigisosId,
      );
      if (soknad) {
        const kravIndex = soknad.dokumentasjonkrav.findIndex(
          (k) =>
            k.dokumentasjonkravreferanse ===
            oppdatertDokumentasjonkrav.dokumentasjonkravreferanse,
        );
        if (kravIndex !== -1) {
          soknad.dokumentasjonkrav[kravIndex] = oppdatertDokumentasjonkrav;
        }
        soknad.fiksDigisosSokerJson.sak.soker.hendelser.push(
          oppdatertDokumentasjonkrav,
        );
      }
    },
    OPPDATER_VEDTAK_FATTET(
      state,
      action: PayloadAction<{
        forFiksDigisosId: string;
        oppdatertVedtakFattet: VedtakFattet;
      }>,
    ) {
      const { forFiksDigisosId, oppdatertVedtakFattet } = action.payload;
      const soknad = state.soknader.find(
        (s) => s.fiksDigisosId === forFiksDigisosId,
      );
      if (soknad) {
        const saksStatus = soknad.saker.find(
          (s) => s.referanse === oppdatertVedtakFattet.saksreferanse,
        );
        if (saksStatus) {
          saksStatus.vedtakFattet = oppdatertVedtakFattet;
        }
        soknad.fiksDigisosSokerJson.sak.soker.hendelser.push(
          oppdatertVedtakFattet,
        );
      }
    },
    NYTT_VILKAR(
      state,
      action: PayloadAction<{ forFiksDigisosId: string; nyttVilkar: Vilkar }>,
    ) {
      const { forFiksDigisosId, nyttVilkar } = action.payload;
      const soknad = state.soknader.find(
        (s) => s.fiksDigisosId === forFiksDigisosId,
      );
      if (soknad) {
        soknad.vilkar.push(nyttVilkar);
        soknad.fiksDigisosSokerJson.sak.soker.hendelser.push(nyttVilkar);
      }
    },
    OPPDATER_VILKAR(
      state,
      action: PayloadAction<{
        forFiksDigisosId: string;
        oppdatertVilkar: Vilkar;
      }>,
    ) {
      const { forFiksDigisosId, oppdatertVilkar } = action.payload;
      const soknad = state.soknader.find(
        (s) => s.fiksDigisosId === forFiksDigisosId,
      );
      if (soknad) {
        const vilkarIndex = soknad.vilkar.findIndex(
          (v) => v.vilkarreferanse === oppdatertVilkar.vilkarreferanse,
        );
        if (vilkarIndex !== -1) {
          soknad.vilkar[vilkarIndex] = oppdatertVilkar;
        }
        soknad.fiksDigisosSokerJson.sak.soker.hendelser.push(oppdatertVilkar);
      }
    },
  },
});

export const {
  SET_AKTIV_SOKNAD,
  SET_AKTIV_UTBETALING,
  SET_AKTIVT_VILKAR,
  SET_AKTIVT_DOKUMENTASJONKRAV,
  SET_BACKEND_URL_TYPE_TO_USE,
  TURN_ON_LOADER,
  TURN_OFF_LOADER,
  SWITCH_TO_LIGHT_MODE,
  SWITCH_TO_DARK_MODE,
  VIS_NY_SAK_MODAL,
  SKJUL_NY_SAK_MODAL,
  VIS_NY_DOKUMENTASJON_ETTERSPURT_MODAL,
  SKJUL_NY_DOKUMENTASJON_ETTERSPURT_MODAL,
  VIS_NY_UTBETALING_MODAL,
  SKJUL_NY_UTBETALING_MODAL,
  VIS_NY_VILKAR_MODAL,
  SKJUL_NY_VILKAR_MODAL,
  VIS_NY_DOKUMENTASJONKRAV_MODAL,
  SKJUL_NY_DOKUMENTASJONKRAV_MODAL,
  VIS_SYSTEM_SETTINGS_MODAL,
  SKJUL_SYSTEM_SETTINGS_MODAL,
  VIS_SUCCESS_SNACKBAR,
  VIS_ERROR_SNACKBAR,
  SKJUL_SNACKBAR,
  NY_SOKNAD,
  HENTET_SOKNAD,
  OPPDATER_FIKS_DIGISOS_ID,
  OPPDATER_SOKNADS_STATUS,
  OPPDATER_NAV_KONTOR,
  OPPDATER_DOKUMENTASJON_ETTERSPURT,
  OPPDATER_FORELOPIG_SVAR,
  NY_FS_SAKS_STATUS,
  OPPDATER_FS_SAKS_STATUS,
  NY_UTBETALING,
  OPPDATER_UTBETALING,
  NYTT_DOKUMENTASJONKRAV,
  OPPDATER_DOKUMENTASJONKRAV,
  OPPDATER_VEDTAK_FATTET,
  NYTT_VILKAR,
  OPPDATER_VILKAR,
} = modelSlice.actions;

export default modelSlice.reducer;
