
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxyPublicRequest(
  request: NextRequest,
  context: RouteContext,
) {
  if (!API_URL) {
    return NextResponse.json(
      { detail: "Backend API is not configured." },
      { status: 503 },
    );
  }

  const { path } = await context.params;

  // Allow only public widget configuration and chat endpoints.
  const isConfigRequest =
    path.length === 1 &&
    /^[A-Za-z0-9_-]{20,64}$/.test(path[0]) &&
    request.method === "GET";

  const isChatRequest =
    path.length === 2 &&
    /^[A-Za-z0-9_-]{20,64}$/.test(path[0]) &&
    path[1] === "chat" &&
    request.method === "POST";

  if (!isConfigRequest && !isChatRequest) {
    return NextResponse.json(
      { detail: "Public endpoint not found." },
      { status: 404 },
    );
  }

  const targetUrl = new URL(
    `/api/public/${path.map(encodeURIComponent).join("/")}`,
    API_URL,
  );

  const headers = new Headers();
  headers.set("Accept", "application/x-ndjson, application/json");

  let body: string | undefined;

  if (isChatRequest) {
    headers.set("Content-Type", "application/json");
    body = await request.text();

    if (body.length > 20_000) {
      return NextResponse.json(
        { detail: "Request is too large." },
        { status: 413 },
      );
    }
  }

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      signal: request.signal,
    });

    const responseHeaders = new Headers();
    const contentType = response.headers.get("content-type");

    if (contentType) {
      responseHeaders.set("content-type", contentType);
    }

    responseHeaders.set("Cache-Control", "no-store");

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      { detail: "Unable to reach the support service." },
      { status: 502 },
    );
  }
}

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  return proxyPublicRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  return proxyPublicRequest(request, context);
}
