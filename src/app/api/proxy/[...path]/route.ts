import { NextRequest, NextResponse } from "next/server";
import { getTarget, resolveProxyPath } from "../../../../server/proxyRoutes";
import { AuthError, getOboAuthorizationHeader } from "../../../../server/backendAuth";

export const dynamic = "force-dynamic";

const FORWARDED_REQUEST_HEADERS = ["content-type", "accept"];
const FORWARDED_RESPONSE_HEADERS = ["content-type"];

const proxy = async (
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) => {
  const backendUrl = process.env.FAGSYSTEM_BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json({ error: "FAGSYSTEM_BACKEND_URL mangler" }, { status: 500 });
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

  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  if (target === "fiks") {
    try {
      headers.set(
        "authorization",
        await getOboAuthorizationHeader(request.headers.get("authorization")),
      );
    } catch (e) {
      const status = e instanceof AuthError ? e.status : 500;
      console.error("Auth mot fagsystem-backend feilet:", (e as Error).message);
      return NextResponse.json({ error: "Autentisering feilet" }, { status });
    }
  }

  const url = new URL(resolved.path, backendUrl.endsWith("/") ? backendUrl : `${backendUrl}/`);
  url.search = request.nextUrl.search;

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: request.method,
      headers,
      body: request.method === "GET" ? undefined : request.body,
      // Nødvendig for å strømme request-body (multipart ved filopplasting)
      duplex: "half",
      cache: "no-store",
    } as RequestInit);
  } catch (e) {
    console.error(`Fikk ikke kontakt med ${target}-backend:`, (e as Error).message);
    return NextResponse.json({ error: "Backend utilgjengelig" }, { status: 502 });
  }

  const responseHeaders = new Headers();
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
};

export { proxy as GET, proxy as POST };
