import { NextResponse } from "next/server";
import { getTarget } from "../../../server/proxyRoutes";

export const dynamic = "force-dynamic";

export interface ProxyInfo {
  target: "mock-alt" | "fiks";
  innsynUrl: string;
}

export function GET() {
  const info: ProxyInfo = {
    target: getTarget(),
    innsynUrl: process.env.INNSYN_URL ?? "http://localhost:3000/sosialhjelp/innsyn",
  };
  return NextResponse.json(info);
}
