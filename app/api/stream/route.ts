import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get("url");
  if (!target) {
    return new Response("Missing url parameter", { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return new Response("Invalid url", { status: 400 });
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return new Response("Unsupported protocol", { status: 400 });
  }

  const controller = new AbortController();
  const onAbort = () => controller.abort();
  req.signal.addEventListener("abort", onAbort, { once: true });

  try {
    const upstream = await fetch(parsed.toString(), {
      headers: {
        "User-Agent": "Still-Lofi-Player/1.0",
        Accept: "*/*",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!upstream.ok || !upstream.body) {
      return new Response("Upstream stream error", { status: upstream.status || 502 });
    }

    const reader = upstream.body.getReader();
    const stream = new ReadableStream({
      async pull(ctrl) {
        try {
          const { done, value } = await reader.read();
          if (done) {
            ctrl.close();
            return;
          }
          ctrl.enqueue(value);
        } catch {
          ctrl.close();
        }
      },
      cancel() {
        controller.abort();
        reader.cancel().catch(() => {});
      },
    });

    const headers = new Headers();
    headers.set("Content-Type", upstream.headers.get("content-type") || "audio/mpeg");
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    headers.set("Access-Control-Allow-Origin", "*");

    return new Response(stream, {
      status: 200,
      headers,
    });
  } catch {
    if (req.signal.aborted) {
      return new Response(null, { status: 499 });
    }
    return new Response("Failed to connect to stream", { status: 502 });
  } finally {
    req.signal.removeEventListener("abort", onAbort);
  }
}
