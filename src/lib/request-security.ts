import { createHash } from "node:crypto";

/** Origin checks apply to both order and contact submissions. */
export function isSameOrigin(request: Request): boolean {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host;
    const hosts = [new URL(request.url).host, request.headers.get("host"), request.headers.get("x-forwarded-host")?.split(",")[0]?.trim()];
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      try { hosts.push(new URL(process.env.NEXT_PUBLIC_SITE_URL).host); } catch { /* An invalid optional URL does not widen access. */ }
    }
    return hosts.includes(originHost);
  } catch { return false; }
}

/** Read a bounded body even when Content-Length is absent or incorrect. */
export async function readLimitedJson(request: Request, maxBytes = 16_384): Promise<unknown | null> {
  if (Number(request.headers.get("content-length")) > maxBytes || !request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); return null; }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch { return null; }
  finally { reader.releaseLock(); }
}

/** The reverse proxy must overwrite forwarded IP headers. */
export function requestRateKey(request: Request): string {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  return createHash("sha256").update(ip).digest("hex");
}
