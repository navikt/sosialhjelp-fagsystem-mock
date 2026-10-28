import { NextRequest, NextResponse } from "next/server";
import { proxyRouteHandler } from "@navikt/next-api-proxy";
import { getTarget, resolveProxyPath } from "../../../../server/proxyRoutes";
import { AuthError, getOboToken } from "../../../../server/backendAuth";

export const dynamic = "force-dynamic";

const proxy = async (
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) => {
  const hostname = process.env.FAGSYSTEM_BACKEND_HOST;
  if (!hostname) {
    return NextResponse.json({ error: "FAGSYSTEM_BACKEND_HOST mangler" }, { status: 500 });
  }

  const { path } = await params;
  const target = getTarget();
  const resolved = resolveProxyPath(path.join("/"), request.method, target);
  switch (resolved.kind) {
    case "not-found":
      return NextResponse.json({ error: "Ukjent sti" }, { status: 404 });
    case "method-not-allowed":
      return NextResponse.json({ error: "Metode ikke tillatt" }, { status: 405 });
    case "not-implemented":
      return NextResponse.json(
        { error: `Ikke støttet mot ${target}` },
        { status: 501 },
      );
  }

  let bearerToken: string | undefined;
  if (target === "fiks") {
    try {
      bearerToken = await getOboToken(request);
    } catch (e) {
      const status = e instanceof AuthError ? e.status : 500;
      console.error("Auth mot fagsystem-backend feilet:", (e as Error).message);
      return NextResponse.json({ error: "Autentisering feilet" }, { status });
    }
  }

  const basePath = process.env.FAGSYSTEM_BACKEND_BASE_PATH ?? "";
  const port = process.env.FAGSYSTEM_BACKEND_PORT || undefined;
  const https = process.env.FAGSYSTEM_BACKEND_HTTPS === "true";
  try {
    return await proxyRouteHandler(request, {
      hostname,
      port,
      https,
      path: `/${[basePath, resolved.path].map((part) => part.replace(/^\/+|\/+$/g, "")).filter(Boolean).join("/")}`,
      bearerToken,
    });
  } catch (e) {
    console.error(`Fikk ikke kontakt med ${target}-backend:`, (e as Error).message);
    return NextResponse.json({ error: "Backend utilgjengelig" }, { status: 502 });
  }
};

export { proxy as GET, proxy as POST };
