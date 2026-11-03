import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { escapeHtml, formatOrderMessage, formatTelegramHtml, getManualOrder } from "../../src/lib/order-message";
import { getTelegramConfig, sendTelegramOrder, TelegramDeliveryError } from "../../src/lib/telegram";
import { parseOrderRequest, type ValidatedOrder } from "../../src/lib/validation";

const parsed = parseOrderRequest({
  selection: { productId: "white", density: 15, thicknessCm: 10, quantity: "20" },
  customer: { name: "Ali <b>test</b>", phone: "901234567", address: "Toshkent & Chilonzor", note: "<script>alert('x')</script>" },
  requestId: "a1b2c3d4-e5f6-4a7b-8c9d-e0f1a2b3c4d5",
});
assert.ok(parsed.ok);
const order: ValidatedOrder = parsed.value;
const config = { botToken: "123456789:TEST_TOKEN_NOT_REAL_abcdefghijklmnopqrstuvwxyz", chatId: "-1001234567890" };

describe("Telegram delivery", () => {
  it("formats a complete professional order with unit price and total", () => {
    const text = formatOrderMessage(order);
    for (const expected of ["YANGI BUYURTMA", "Mahsulot: Oq penaplast", "Zichlik: 15 kg/m³", "Qalinlik: 10 cm", "Miqdor: 20 m³", "Birlik narxi: $67.00 / m³", "Jami: $1,340.00", "Telefon: +998 90 123 45 67", "Manzil: Toshkent & Chilonzor"]) assert.ok(text.includes(expected), expected);
    assert.ok(text.length < 4096);
  });
  it("escapes all customer-controlled HTML", () => {
    assert.equal(escapeHtml(`<>&"'`), "&lt;&gt;&amp;&quot;&#39;");
    const html = formatTelegramHtml(order);
    assert.ok(!html.includes("<script>"));
    assert.ok(!html.includes("<b>test</b>"));
    assert.ok(html.includes("&lt;script&gt;"));
    assert.ok(html.includes("<b>MIJOZ:</b>"));
  });
  it("returns a manual flow, not false delivery success, when unconfigured", () => {
    assert.equal(getTelegramConfig({}), null);
    const manual = getManualOrder(order);
    assert.equal(manual.status, "manual");
    assert.equal(manual.telegramUrl, "https://t.me/penaplast_uz");
    assert.ok(manual.telegramText.includes("Jami: $1,340.00"));
  });
  it("rejects incomplete or invalid server configuration", () => {
    assert.throws(() => getTelegramConfig({ TELEGRAM_BOT_TOKEN: config.botToken }), TelegramDeliveryError);
    assert.throws(() => getTelegramConfig({ TELEGRAM_CHAT_ID: config.chatId }), TelegramDeliveryError);
    assert.throws(() => getTelegramConfig({ TELEGRAM_BOT_TOKEN: "bad", TELEGRAM_CHAT_ID: "bad" }), TelegramDeliveryError);
    assert.deepEqual(getTelegramConfig({ TELEGRAM_BOT_TOKEN: config.botToken, TELEGRAM_CHAT_ID: config.chatId }), config);
  });
  it("sends the expected server-side Bot API payload", async () => {
    let capturedUrl = "";
    let capturedInit: RequestInit | undefined;
    const mock: typeof fetch = async (url, init) => {
      capturedUrl = String(url); capturedInit = init;
      return Response.json({ ok: true, result: { message_id: 1 } });
    };
    await sendTelegramOrder(order, config, mock);
    assert.equal(capturedUrl, `https://api.telegram.org/bot${config.botToken}/sendMessage`);
    assert.equal(capturedInit?.method, "POST");
    const body = JSON.parse(String(capturedInit?.body));
    assert.equal(body.chat_id, config.chatId);
    assert.equal(body.parse_mode, "HTML");
    assert.deepEqual(body.link_preview_options, { is_disabled: true });
    assert.ok(body.text.includes("Jami: $1,340.00"));
    assert.ok(!JSON.stringify(body).includes("TEST_TOKEN"));
  });
  it("fails safely on HTTP errors, Telegram errors, invalid JSON and timeouts", async () => {
    const failures: typeof fetch[] = [
      async () => Response.json({ ok: false }, { status: 403 }),
      async () => Response.json({ ok: false, description: "secret provider detail" }),
      async () => new Response("not json"),
      async () => { throw new DOMException("Timeout", "TimeoutError"); },
    ];
    for (const mock of failures) await assert.rejects(sendTelegramOrder(order, config, mock), TelegramDeliveryError);
  });
});
