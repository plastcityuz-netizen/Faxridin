import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getManualOrder } from "@/lib/order-message";
import { ORDER_ERROR_MESSAGE, ORDER_SUCCESS_MESSAGE, type OrderApiResponse } from "@/lib/order-api";
import { createRateLimiter } from "@/lib/rate-limit";
import { getTelegramConfig, sendTelegramOrder } from "@/lib/telegram";
import { parseOrderRequest } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const limiter = createRateLimiter();
const MAX_BODY_BYTES = 16_384;

function response(body: OrderApiResponse, status = 200, headers?: Record<string, string>) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}
function isSameOrigin(request: Request): boolean {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host;
    const hosts = [new URL(request.url).host, request.headers.get("host"), request.headers.get("x-forwarded-host")?.split(",")[0]?.trim()];
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      try { hosts.push(new URL(process.env.NEXT_PUBLIC_SITE_URL).host); } catch { /* Invalid optional configuration does not widen access. */ }
    }
    return hosts.includes(originHost);
  } catch { return false; }
}
async function readLimitedJson(request: Request): Promise<unknown | null> {
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) return null;
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) { await reader.cancel(); return null; }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch { return null; }
  finally { reader.releaseLock(); }
}

export async function POST(request: Request): Promise<NextResponse<OrderApiResponse>> {
  if (!isSameOrigin(request)) return response({ status: "error", message: ORDER_ERROR_MESSAGE }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return response({ status: "error", message: ORDER_ERROR_MESSAGE }, 415);
  }
  const body = await readLimitedJson(request);
  if (body === null) return response({ status: "error", message: "Buyurtma ma’lumotlari noto‘g‘ri yoki juda katta." }, 400);
  const parsed = parseOrderRequest(body);
  if (!parsed.ok) return response({ status: "error", message: parsed.message }, 400);

  // The reverse proxy must overwrite X-Forwarded-For. This limiter is per instance.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  const key = createHash("sha256").update(ip).digest("hex");
  const rate = limiter.consume(key);
  if (!rate.allowed) {
    return response({ status: "error", message: "Juda ko‘p urinish. Birozdan so‘ng qayta urinib ko‘ring." }, 429, { "Retry-After": String(rate.retryAfterSeconds) });
  }
  try {
    const config = getTelegramConfig();
    if (!config) return response(getManualOrder(parsed.value));
    await sendTelegramOrder(parsed.value, config);
    return response({ status: "sent", reference: parsed.value.reference, message: ORDER_SUCCESS_MESSAGE });
  } catch {
    // Deliberately do not log provider responses, request URLs, tokens or customer data.
    return response({ status: "error", message: ORDER_ERROR_MESSAGE }, 502);
  }
}
