import { formatTelegramHtml } from "./order-message";
import type { ValidatedOrder } from "./validation";

export interface TelegramConfig { botToken: string; chatId: string }
export class TelegramDeliveryError extends Error {
  constructor() { super("Telegram delivery failed"); this.name = "TelegramDeliveryError"; }
}

/** Only call this on the server. No token is included in a response or a log. */
export function getTelegramConfig(env: Partial<NodeJS.ProcessEnv> = process.env): TelegramConfig | null {
  const botToken = env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = env.TELEGRAM_CHAT_ID?.trim();
  if (!botToken && !chatId) return null;
  if (!botToken || !chatId || !/^\d+:[A-Za-z0-9_-]{20,}$/.test(botToken) || !/^(@[A-Za-z][A-Za-z0-9_]{4,}|-?\d+)$/.test(chatId)) {
    throw new TelegramDeliveryError();
  }
  return { botToken, chatId };
}

export async function sendTelegramOrder(
  order: ValidatedOrder,
  config: TelegramConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  let response: Response;
  try {
    response = await fetchImpl(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: formatTelegramHtml(order),
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
      }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
  } catch {
    throw new TelegramDeliveryError();
  }
  if (!response.ok) throw new TelegramDeliveryError();
  try {
    const result: unknown = await response.json();
    if (typeof result !== "object" || result === null || !("ok" in result) || result.ok !== true) {
      throw new TelegramDeliveryError();
    }
  } catch {
    throw new TelegramDeliveryError();
  }
}
