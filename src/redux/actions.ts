import { Bruker, FiksSak, FsSoknad, Model, ProxyInfo } from "./types";
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
  FIKSDIGISOSID_URL_PARAM,
  getInitialFsSoknad,
  HENTET_SOKNAD,
  NY_SOKNAD,
  OPPDATER_DOKUMENTASJON_ETTERSPURT,
  OPPDATER_FIKS_DIGISOS_ID,
  OPPDATER_FORELOPIG_SVAR,
  OPPDATER_VEDTAK_FATTET,
  proxyInfoUrl,
  proxyUrl,
  SET_AKTIV_SOKNAD,
  SET_BRUKERE,
  SET_BRUKERE_FEIL,
  SET_PROXY_INFO,
  SET_FIKS_SAKER,
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

  const query = `${FIKSDIGISOSID_URL_PARAM}=${encodeURIComponent(model.aktivSoknad)}`;
  fetchPost(
    proxyUrl("digisosapi/oppdaterDigisosSak", query),
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
  fetch(proxyUrl("mock/nyNavEnhet"), {
    method: "POST",
    body: JSON.stringify(navKontorListe),
    headers: new Headers({
      "Content-Type": "application/json",
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
  fetch(proxyUrl(`digisosapi/${encodeURIComponent(model.aktivSoknad)}/filOpplasting`), {
    method: "POST",
    body: formData,
    headers: new Headers({
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
  dispatch: AppDispatch,
  fiksDigisosId: string,
  fnr: string,
) => {
  dispatch(TURN_ON_LOADER());
  if (!soknad) {
    soknad = getInitialFsSoknad(fiksDigisosId);
  }
  const fiksDigisosSokerJsonUtenNull = removeNullFieldsFromHendelser(
    soknad.fiksDigisosSokerJson,
  );

  const query = `${FIKSDIGISOSID_URL_PARAM}=${encodeURIComponent(fiksDigisosId)}&fnr=${encodeURIComponent(fnr)}`;
  fetchPost(
    proxyUrl("digisosapi/oppdaterDigisosSak", query),
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
  dispatch: AppDispatch,
  fnr: string,
  papirSoknad?: boolean,
) => {
  dispatch(TURN_ON_LOADER());
  const url = proxyUrl(`digisosapi/${encodeURIComponent(fiksDigisosId)}/innsynsfil`);
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
          dispatch,
          fnr,
        );
      }
    })
    .catch((reason) => runOnErrorResponse(reason, dispatch))
    .finally(() => dispatch(TURN_OFF_LOADER()));
};

export const opprettNyFsSoknadDersomDigisosIdIkkeEksistererHosFiks = (
  fiksDigisosId: string,
  papirSoknad: boolean,
  dispatch: AppDispatch,
  fnr: string,
) => {
  dispatch(TURN_ON_LOADER());
  const fiksDigisosSokerJsonUtenNull = removeNullFieldsFromHendelser(
    getInitialFsSoknad(fiksDigisosId).fiksDigisosSokerJson,
  );

  const query = `${FIKSDIGISOSID_URL_PARAM}=${encodeURIComponent(fiksDigisosId)}&isPapirSoknad=${papirSoknad}&fnr=${encodeURIComponent(fnr)}`;
  fetchPost(
    proxyUrl("digisosapi/oppdaterDigisosSak", query),
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

export const hentProxyInfo = (dispatch: AppDispatch) =>
  fetch(proxyInfoUrl)
    .then((response) => response.json() as Promise<ProxyInfo>)
    .then((info) => {
      dispatch(SET_PROXY_INFO(info));
      return info;
    });

export const hentFiksSaker = (dispatch: AppDispatch) => {
  fetch(proxyUrl("saker"))
    .then((response) => {
      if (!response.ok) throw new Error(response.statusText);
      return response.json() as Promise<FiksSak[]>;
    })
    .then((saker) => dispatch(SET_FIKS_SAKER(saker)))
    .catch((reason) => console.warn("Kunne ikke hente saker: " + reason.message));
};

export const hentBrukere = (dispatch: AppDispatch) => {
  fetch(proxyUrl("brukere"))
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json() as Promise<Bruker[]>;
    })
    .then((brukere) => dispatch(SET_BRUKERE(brukere)))
    .catch((reason) => {
      dispatch(SET_BRUKERE_FEIL(true));
      console.warn("Kunne ikke hente brukere: " + reason.message);
    });
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
