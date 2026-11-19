import { afterEach, describe, expect, it, vi } from "vitest";
import {
  oppdaterInnsynsfilFraBackend,
  sendPdfOgOppdaterForelopigSvar,
  sendPdfOgOppdaterVedtakFattet,
} from "./actions";
import { getInitialFsSoknad, initialModel } from "./reducer";
import { HendelseType, Utfall } from "../types/hendelseTypes";
import { configureStore } from "@reduxjs/toolkit";
import modelReducer from "./reducer";

const sakId = "33333333-3333-3333-3333-333333333333";
const dokumentId = "44444444-4444-4444-4444-444444444444";

function createStore() {
  return configureStore({
    reducer: { model: modelReducer },
    preloadedState: {
      model: { ...initialModel, aktivSoknad: sakId, soknader: [getInitialFsSoknad(sakId)] },
    },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("opplasting av hendelsesdokument", () => {
  it("sender vedtak med den opplastede dokumentreferansen", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(dokumentId))
      .mockResolvedValueOnce(Response.json({}));
    vi.stubGlobal("fetch", fetchMock);
    const store = createStore();

    sendPdfOgOppdaterVedtakFattet(new FormData(), Utfall.INNVILGET, "sak-1", store.getState().model, store.dispatch);

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const hendelse = JSON.parse(fetchMock.mock.calls[1][1].body).sak.soker.hendelser.at(-1);
    expect(hendelse).toMatchObject({
      type: "vedtakFattet",
      vedtaksfil: { referanse: { type: "dokumentlager", id: dokumentId } },
      vedlegg: [],
    });
  });

  it("sender foreløpig svar med den opplastede dokumentreferansen", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(dokumentId))
      .mockResolvedValueOnce(Response.json({}));
    vi.stubGlobal("fetch", fetchMock);
    const store = createStore();

    store.dispatch(sendPdfOgOppdaterForelopigSvar(new FormData()));

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const hendelse = JSON.parse(fetchMock.mock.calls[1][1].body).sak.soker.hendelser.at(-1);
    expect(hendelse).toMatchObject({
      type: "forelopigSvar",
      forvaltningsbrev: { referanse: { type: "dokumentlager", id: dokumentId } },
    });
  });

  it("sender ikke hendelsen når filopplastingen feiler", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("feil", { status: 400 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const store = createStore();

    sendPdfOgOppdaterVedtakFattet(new FormData(), Utfall.INNVILGET, "sak-1", store.getState().model, store.dispatch);

    await vi.waitFor(() => expect(store.getState().model.loaderOn).toBe(false));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(store.getState().model.snackbarVariant).toBe("error");
  });
});

describe("oppdaterInnsynsfilFraBackend", () => {
  it("erstatter en eksisterende søknad med hendelser fra backend ved 200", async () => {
    const existingSoknad = getInitialFsSoknad(sakId);
    const soker = existingSoknad.fiksDigisosSokerJson.sak.soker;
    const data = {
      ...soker,
      hendelser: [
        ...soker.hendelser,
        {
          type: HendelseType.TildeltNavKontor,
          hendelsestidspunkt: "2024-01-02T00:00:00Z",
          navKontor: "Nav Oslo",
        },
      ],
    };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(data));
    vi.stubGlobal("fetch", fetchMock);
    const store = createStore();

    await oppdaterInnsynsfilFraBackend(sakId, store.dispatch);

    expect(store.getState().model.soknader).toHaveLength(1);
    expect(store.getState().model.soknader[0].navKontor).toMatchObject({
      navKontor: "Nav Oslo",
    });
    expect(
      store.getState().model.soknader[0].fiksDigisosSokerJson.sak.soker.hendelser,
    ).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(`${encodeURIComponent(sakId)}/innsynsfil`),
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("lar state være uendret og oppretter ikke søknad ved 404", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("", { status: 404 }));
    vi.stubGlobal("fetch", fetchMock);
    const store = createStore();
    const modelBefore = store.getState().model;

    await oppdaterInnsynsfilFraBackend(sakId, store.dispatch);

    expect(store.getState().model).toBe(modelBefore);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "GET" });
  });
});
