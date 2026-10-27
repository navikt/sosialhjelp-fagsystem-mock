/**
 * Auth mellom fagsystem-mock-fiks og sosialhjelp-fagsystem-backend.
 *
 * Wonderwall (azure.sidecar) sørger for at brukeren er logget inn og legger
 * brukerens token i Authorization-headeren. Vi validerer tokenet via Texas
 * (Nais token introspection) og veksler det til et OBO-token for backenden.
 * Ingen tokens logges.
 */

const texasEnv = () => ({
  introspect: process.env.NAIS_TOKEN_INTROSPECTION_ENDPOINT,
  exchange: process.env.NAIS_TOKEN_EXCHANGE_ENDPOINT,
  scope: process.env.FAGSYSTEM_BACKEND_SCOPE,
});

export class AuthError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

const bearer = (header: string | null): string | null => {
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
};

export const getOboAuthorizationHeader = async (
  incomingAuthorization: string | null,
): Promise<string> => {
  const { introspect, exchange, scope } = texasEnv();
  if (!introspect || !exchange || !scope) {
    throw new AuthError("Token exchange er ikke konfigurert", 500);
  }

  const userToken = bearer(incomingAuthorization);
  if (!userToken) throw new AuthError("Mangler token", 401);

  const introspection = await fetch(introspect, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity_provider: "azuread", token: userToken }),
  });
  const result = (await introspection.json()) as { active?: boolean };
  if (!result.active) throw new AuthError("Ugyldig token", 401);

  const oboResponse = await fetch(exchange, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identity_provider: "azuread",
      target: scope,
      user_token: userToken,
    }),
  });
  if (!oboResponse.ok) {
    throw new AuthError(`OBO-veksling feilet (${oboResponse.status})`, 502);
  }
  const { access_token } = (await oboResponse.json()) as { access_token: string };
  return `Bearer ${access_token}`;
};
