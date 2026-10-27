import { describe, expect, it } from "vitest";
import { resolveProxyPath } from "./proxyRoutes";

describe("resolveProxyPath", () => {
  it("mapper innsynsfil til mock-alt-api", () => {
    expect(resolveProxyPath("digisosapi/abc-123/innsynsfil", "GET", "mock-alt")).toEqual({
      kind: "ok",
      path: "innsyn-api/api/v1/digisosapi/abc-123/innsynsfil",
    });
  });

  it("mapper innsynsfil til fagsystem-backend", () => {
    expect(resolveProxyPath("digisosapi/abc-123/innsynsfil", "GET", "fiks")).toEqual({
      kind: "ok",
      path: "api/v1/digisosapi/abc-123/innsynsfil",
    });
  });

  it("avviser stier utenfor tillatelseslisten", () => {
    expect(resolveProxyPath("../../admin", "GET", "mock-alt")).toEqual({ kind: "not-found" });
    expect(resolveProxyPath("digisosapi/a%2F..%2Fb/innsynsfil", "GET", "fiks")).toEqual({
      kind: "not-found",
    });
  });

  it("avviser feil metode", () => {
    expect(resolveProxyPath("brukere", "POST", "mock-alt")).toEqual({
      kind: "method-not-allowed",
    });
  });

  it("svarer not-implemented for endepunkter målet ikke støtter", () => {
    expect(resolveProxyPath("mock/nyNavEnhet", "POST", "fiks")).toEqual({
      kind: "not-implemented",
    });
    expect(resolveProxyPath("saker", "GET", "mock-alt")).toEqual({ kind: "not-implemented" });
  });
});
