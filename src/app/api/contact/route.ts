import { NextResponse } from "next/server";
import { formatContactTelegramHtml, getManualContact, parseContactRequest } from "@/lib/contact";
import type { OrderApiResponse } from "@/lib/order-api";
import { createRateLimiter } from "@/lib/rate-limit";
import { isSameOrigin, readLimitedJson, requestRateKey } from "@/lib/request-security";
import { getTelegramConfig, sendTelegramMessage } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const limiter = createRateLimiter();
const ERROR = "Xabar yuborilmadi. Qaytadan urinib ko‘ring.";

function response(body: OrderApiResponse, status = 200, headers?: Record<string, string>) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export async function POST(request: Request): Promise<NextResponse<OrderApiResponse>> {
  if (!isSameOrigin(request)) return response({ status: "error", message: ERROR }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) return response({ status: "error", message: ERROR }, 415);
  const body = await readLimitedJson(request);
  if (body === null) return response({ status: "error", message: "Murojaat ma’lumotlari noto‘g‘ri yoki juda katta." }, 400);
  const parsed = parseContactRequest(body);
  if (!parsed.ok) return response({ status: "error", message: parsed.message }, 400);
  const rate = limiter.consume(requestRateKey(request));
  if (!rate.allowed) return response({ status: "error", message: "Juda ko‘p urinish. Birozdan so‘ng qayta urinib ko‘ring." }, 429, { "Retry-After": String(rate.retryAfterSeconds) });
  try {
    const config = getTelegramConfig();
    if (!config) return response(getManualContact(parsed.value));
    await sendTelegramMessage(formatContactTelegramHtml(parsed.value), config);
    return response({ status: "sent", reference: parsed.value.reference, message: "Xabaringiz yuborildi!" });
  } catch {
    // Do not log provider responses, tokens, request URLs or customer information.
    return response({ status: "error", message: ERROR }, 502);
  }
}
