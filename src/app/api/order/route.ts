import { NextResponse } from "next/server";
import { getManualOrder } from "@/lib/order-message";
import { ORDER_ERROR_MESSAGE, ORDER_SUCCESS_MESSAGE, type OrderApiResponse } from "@/lib/order-api";
import { createRateLimiter } from "@/lib/rate-limit";
import { isSameOrigin, readLimitedJson, requestRateKey } from "@/lib/request-security";
import { getTelegramConfig, sendTelegramOrder } from "@/lib/telegram";
import { parseOrderRequest } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const limiter = createRateLimiter();

function response(body: OrderApiResponse, status = 200, headers?: Record<string, string>) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
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

  // This limiter is best-effort and per server instance.
  const rate = limiter.consume(requestRateKey(request));
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
