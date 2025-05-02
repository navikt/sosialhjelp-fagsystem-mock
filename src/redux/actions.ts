import { BackendUrls, FsSoknad, Model } from "./types";
import Hendelse, {
  DigisosSokerJson,
  Dokument,
  DokumentasjonEtterspurt,
  FilreferanseType,
  ForelopigSvar,
  HendelseType,
  Utfall,
  VedtakFattet,
} from "../types/hendelseTypes";
import {
  getFsSoknadByFiksDigisosId,
  getNow,
  removeNullFieldsFromHendelser,
} from "../utils/utilityFunctions";
import { fetchPost } from "../utils/restUtils";
import { NavKontor } from "../types/additionalTypes";
import { oHendelser } from "./optics";
import {
  backendUrls,
  FIKSDIGISOSID_URL_PARAM,
  getInitialFsSoknad,
  HENTET_SOKNAD,
  NY_SOKNAD,
  nyNavEnhetUrl,
  OPPDATER_DOKUMENTASJON_ETTERSPURT,
  OPPDATER_FIKS_DIGISOS_ID,
  OPPDATER_FORELOPIG_SVAR,
  OPPDATER_VEDTAK_FATTET,
  oppdaterDigisosSakUrl,
  SET_AKTIV_SOKNAD,
  TURN_OFF_LOADER,
  TURN_ON_LOADER,
  VIS_ERROR_SNACKBAR,
  VIS_SUCCESS_SNACKBAR,
} from "./reducer";
import { UnknownAction } from "@reduxjs/toolkit";
import {AppDispatch, RootState} from "../store";

export const sendNyHendelseOgOppdaterModel = (
  nyHendelse: Hendelse,
  model: Model,
  dispatch: AppDispatch,
  actionToDispatchIfSuccess: UnknownAction,
) => {
  dispatch(TURN_ON_LOADER());
  const soknad = getFsSoknadByFiksDigisosId(model.soknader, model.aktivSoknad)!;
  const soknadUpdated = oHendelser.modify((a: Hendelse[]) => [
    ...a,
    nyHendelse,
  ])(soknad);
  const fiksDigisosSokerJsonUtenNull = removeNullFieldsFromHendelser(
    soknadUpdated.fiksDigisosSokerJson,
  );

  const backendUrl = backendUrls[model.backendUrlTypeToUse];
  const queryParam = `?${FIKSDIGISOSID_URL_PARAM}=${model.aktivSoknad}`;
  fetchPost(
    `${backendUrl}${oppdaterDigisosSakUrl}${queryParam}`,
    JSON.stringify(fiksDigisosSokerJsonUtenNull),
  )
    .then(() => {
      dispatch(VIS_SUCCESS_SNACKBAR());
      dispatch(actionToDispatchIfSuccess);
    })
    .catch((reason) => runOnErrorResponse(reason, dispatch))
    .finally(() => dispatch(TURN_OFF_LOADER()));
};

export const sendValgbareNavkontorTilMockBackend = (
  navKontorListe: NavKontor[],
  model: Model,
  dispatch: AppDispatch,
) => {
  dispatch(TURN_ON_LOADER());
  const backendUrl = backendUrls[model.backendUrlTypeToUse];
  fetch(`${backendUrl}${nyNavEnhetUrl}`, {
    method: "POST",
    body: JSON.stringify(navKontorListe),
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: "Bearer 1234",
      Accept: "*/*",
    }),
  }).catch((reason) => {
    runOnErrorResponse(reason, dispatch);
    dispatch(TURN_OFF_LOADER());
  });
};

export const sendPdfOgLeggPdfRefTilHendelseOgSend = (
  formData: FormData,
  model: Model,
  dispatch: AppDispatch,
  sendHendelseMedRef: (id: string) => void,
) => {
  dispatch(TURN_ON_LOADER());
  const backendUrl = backendUrls[model.backendUrlTypeToUse];
  fetch(`${backendUrl}/api/v1/digisosapi/${model.aktivSoknad}/filOpplasting`, {
    method: "POST",
    body: formData,
    headers: new Headers({
      Authorization: "Bearer 1234",
      Accept: "*/*",
    }),
  })
    .then((response: Response) => {
      response.text().then((id: string) => {
        sendHendelseMedRef(id);
      });
    })
    .catch((reason) => {
      runOnErrorResponse(reason, dispatch);
      dispatch(TURN_OFF_LOADER());
    });
};

export const sendPdfOgOppdaterForelopigSvar =
  (formData: FormData) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(TURN_ON_LOADER());
    const sendForelopigSvarMedRef = (id: string) => {
      const nyHendelse: ForelopigSvar = {
        type: HendelseType.ForelopigSvar,
        hendelsestidspunkt: getNow(),
        forvaltningsbrev: {
          referanse: {
            type: FilreferanseType.dokumentlager,
            id: id,
          },
        },
        vedlegg: [],
      };

      sendNyHendelseOgOppdaterModel(
        nyHendelse,
        getState().model,
        dispatch,
        OPPDATER_FORELOPIG_SVAR({
          forFiksDigisosId: getState().model.aktivSoknad,
          nyttForelopigSvar: nyHendelse,
        }),
      );
    };
    sendPdfOgLeggPdfRefTilHendelseOgSend(
      formData,
      getState().model,
      dispatch,
      sendForelopigSvarMedRef,
    );
  };

export const sendPdfOgOppdaterVedtakFattet = (
  formData: FormData,
  vedtakFattetUtfall: Utfall | null,
  saksreferanse: string,
  model: Model,
  dispatch: AppDispatch,
) => {
  dispatch(TURN_ON_LOADER());

  const sendForelopigSvarMedRef = (id: string) => {
    const nyHendelse: VedtakFattet = {
      type: HendelseType.VedtakFattet,
      hendelsestidspunkt: getNow(),
      saksreferanse: saksreferanse,
      utfall: vedtakFattetUtfall,
      vedtaksfil: {
        referanse: {
          type: FilreferanseType.dokumentlager,
          id: id,
        },
      },
      vedlegg: [
        {
          tittel: "",
          referanse: {
            type: FilreferanseType.dokumentlager,
            id: id,
          },
        },
      ],
    };
    sendNyHendelseOgOppdaterModel(
      nyHendelse,
      model,
      dispatch,
      OPPDATER_VEDTAK_FATTET({
        forFiksDigisosId: model.aktivSoknad,
        oppdatertVedtakFattet: nyHendelse,
      }),
    );
  };

  sendPdfOgLeggPdfRefTilHendelseOgSend(
    formData,
    model,
    dispatch,
    sendForelopigSvarMedRef,
  );
};

export const sendPdfOgOppdaterDokumentasjonEtterspurt = (
  formData: FormData,
  dokumenter: Dokument[],
  model: Model,
  dispatch: AppDispatch,
) => {
  dispatch(TURN_ON_LOADER());

  const sendForelopigSvarMedRef = (id: string) => {
    const nyHendelse: DokumentasjonEtterspurt = {
      type: HendelseType.DokumentasjonEtterspurt,
      hendelsestidspunkt: getNow(),
      forvaltningsbrev: {
        referanse: {
          type: FilreferanseType.dokumentlager,
          id: id,
        },
      },
      vedlegg: [],
      dokumenter: dokumenter,
    };
    sendNyHendelseOgOppdaterModel(
      nyHendelse,
      model,
      dispatch,
      OPPDATER_DOKUMENTASJON_ETTERSPURT({
        forFiksDigisosId: model.aktivSoknad,
        nyDokumentasjonEtterspurt: nyHendelse,
      }),
    );
  };

  sendPdfOgLeggPdfRefTilHendelseOgSend(
    formData,
    model,
    dispatch,
    sendForelopigSvarMedRef,
  );
};

export const opprettDigisosSakHvisDenIkkeFinnes = (
  soknad: FsSoknad,
  backendUrlTypeToUse: keyof BackendUrls,
  dispatch: AppDispatch,
  fiksDigisosId: string,
) => {
  dispatch(TURN_ON_LOADER());
  const backendUrl = backendUrls[backendUrlTypeToUse];
  if (!soknad) {
    soknad = getInitialFsSoknad(fiksDigisosId);
  }
  const fiksDigisosSokerJsonUtenNull = removeNullFieldsFromHendelser(
    soknad.fiksDigisosSokerJson,
  );

  const queryParam = `?${FIKSDIGISOSID_URL_PARAM}=${fiksDigisosId}`;
  fetchPost(
    `${backendUrl}${oppdaterDigisosSakUrl}${queryParam}`,
    JSON.stringify(fiksDigisosSokerJsonUtenNull),
  )
    .then((response) => {
      const fiksId = (response as { fiksDigisosId: string }).fiksDigisosId;
      dispatch(
        OPPDATER_FIKS_DIGISOS_ID({
          forFiksDigisosId: fiksDigisosId,
          nyFiksDigisosId: fiksId,
        }),
      );
      dispatch(SET_AKTIV_SOKNAD(fiksId));
    })
    .catch((reason) => runOnErrorResponse(reason, dispatch))
    .finally(() => dispatch(TURN_OFF_LOADER()));
};

export const hentFsSoknadFraFiksEllerOpprettNy = (
  fiksDigisosId: string,
  backendUrlTypeToUse: keyof BackendUrls,
  dispatch: AppDispatch,
  papirSoknad?: boolean,
) => {
  dispatch(TURN_ON_LOADER());
  const backendUrl = backendUrls[backendUrlTypeToUse];
  const url = `${backendUrl}/api/v1/digisosapi/${fiksDigisosId}/innsynsfil`;
  fetch(url, {
    headers: new Headers({
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
    }),
    method: "GET",
    body: null,
  })
    .then((response: Response) => {
      if (response.status === 200) {
        response
          .json()
          .then((data: DigisosSokerJson) => {
            dispatch(HENTET_SOKNAD({ fiksDigisosId, data }));
            dispatch(SET_AKTIV_SOKNAD(fiksDigisosId));
          })
          .catch((reason) => runOnErrorResponse(reason, dispatch))
          .finally(() => dispatch(TURN_OFF_LOADER()));
      } else {
        return opprettNyFsSoknadDersomDigisosIdIkkeEksistererHosFiks(
          fiksDigisosId,
          papirSoknad ?? false,
          backendUrlTypeToUse,
          dispatch,
        );
      }
    })
    .catch((reason) => runOnErrorResponse(reason, dispatch))
    .finally(() => dispatch(TURN_OFF_LOADER()));
};

export const opprettNyFsSoknadDersomDigisosIdIkkeEksistererHosFiks = (
  fiksDigisosId: string,
  papirSoknad: boolean,
  backendUrlTypeToUse: keyof BackendUrls,
  dispatch: AppDispatch,
) => {
  dispatch(TURN_ON_LOADER());
  const backendUrl = backendUrls[backendUrlTypeToUse];
  const fiksDigisosSokerJsonUtenNull = removeNullFieldsFromHendelser(
    getInitialFsSoknad(fiksDigisosId).fiksDigisosSokerJson,
  );

  const queryParams = `?${FIKSDIGISOSID_URL_PARAM}=${fiksDigisosId}&isPapirSoknad=${papirSoknad}`;
  fetchPost(
    `${backendUrl}${oppdaterDigisosSakUrl}${queryParams}`,
    JSON.stringify(fiksDigisosSokerJsonUtenNull),
  )
    .then((response) => {
      const fiksId = (response as { fiksDigisosId: string }).fiksDigisosId;
      dispatch(NY_SOKNAD(fiksId));
      dispatch(SET_AKTIV_SOKNAD(fiksId));
    })
    .catch((reason) => runOnErrorResponse(reason, dispatch))
    .finally(() => dispatch(TURN_OFF_LOADER()));
};

const runOnErrorResponse = (
  reason: { message: string },
  dispatch: AppDispatch,
) => {
  dispatch(VIS_ERROR_SNACKBAR());
  switch (reason.message) {
    case "Not Found": {
      console.warn("Got 404. Specify a valid backend url...");
      break;
    }
    case "Failed to fetch": {
      console.warn("Got 404. Specify a valid backend url...");
      break;
    }
    default: {
      console.warn("Unhandled reason with message: " + reason.message);
    }
  }
};
