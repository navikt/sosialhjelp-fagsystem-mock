import {
  getToken,
  requestAzureOboToken,
  validateAzureToken,
} from "@navikt/oasis";

export class AuthError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/**
 * 🔴 Rød sone: validerer brukerens Azure-token før OBO-veksling.
 * Oasis bruker Nais/Texas og cacher OBO-tokenet frem til det utløper.
 */
export const getOboToken = async (request: Request): Promise<string> => {
  const scope = process.env.FAGSYSTEM_BACKEND_SCOPE;
  if (!scope) {
    throw new AuthError("Token exchange er ikke konfigurert", 500);
  }

  const userToken = getToken(request);
  if (!userToken) {
    throw new AuthError("Mangler token", 401);
  }

  const validation = await validateAzureToken(userToken).catch(() => null);
  if (!validation?.ok) {
    throw new AuthError("Ugyldig token", 401);
  }

  const obo = await requestAzureOboToken(userToken, scope).catch(() => null);
  if (!obo?.ok) {
    throw new AuthError("OBO-veksling feilet", 502);
  }
  return obo.token;
};
