import { beforeEach, describe, expect, it, vi } from "vitest";

const getToken = vi.fn();
const validateAzureToken = vi.fn();
const requestAzureOboToken = vi.fn();

vi.mock("@navikt/oasis", () => ({
  getToken,
  validateAzureToken,
  requestAzureOboToken,
}));

describe("getOboToken", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.FAGSYSTEM_BACKEND_SCOPE = "api://dev-gcp.teamdigisos.backend/.default";
  });

  it("validerer Azure-tokenet før det veksles", async () => {
    getToken.mockReturnValue("user-token");
    validateAzureToken.mockResolvedValue({ ok: true, payload: {} });
    requestAzureOboToken.mockResolvedValue({ ok: true, token: "obo-token" });
    const { getOboToken } = await import("./backendAuth");

    await expect(getOboToken(new Request("https://example.test"))).resolves.toBe("obo-token");
    expect(validateAzureToken).toHaveBeenCalledWith("user-token");
    expect(requestAzureOboToken).toHaveBeenCalledWith(
      "user-token",
      "api://dev-gcp.teamdigisos.backend/.default",
    );
  });

  it("avviser manglende token uten å veksle", async () => {
    getToken.mockReturnValue(null);
    const { getOboToken } = await import("./backendAuth");

    await expect(getOboToken(new Request("https://example.test"))).rejects.toMatchObject({
      status: 401,
    });
    expect(validateAzureToken).not.toHaveBeenCalled();
    expect(requestAzureOboToken).not.toHaveBeenCalled();
  });

  it("avviser ugyldig token uten å veksle", async () => {
    getToken.mockReturnValue("invalid-token");
    validateAzureToken.mockResolvedValue({ ok: false, error: new Error("invalid"), errorType: "unknown" });
    const { getOboToken } = await import("./backendAuth");

    await expect(getOboToken(new Request("https://example.test"))).rejects.toMatchObject({
      status: 401,
    });
    expect(requestAzureOboToken).not.toHaveBeenCalled();
  });
});
