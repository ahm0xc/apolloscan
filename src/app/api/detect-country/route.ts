import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // INFO: get country from headers (works with vercel, cloudflare, etc.)
  const country =
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("x-country-code") ||
    null;

  return NextResponse.json({
    country,
    isGerman: country === "DE",
  });
}
