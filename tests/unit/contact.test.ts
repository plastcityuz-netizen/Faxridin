import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatContactMessage, formatContactTelegramHtml, getManualContact, parseContactRequest, validateContact } from "../../src/lib/contact";
import { sendTelegramMessage } from "../../src/lib/telegram";

const requestId = "a1b2c3d4-e5f6-4a7b-8c9d-e0f1a2b3c4d5";
const input = { name: "Ali <test>", phone: "90 123 45 67", message: "Narx & yetkazish haqida\nMa’lumot bering" };

describe("contact inquiry", () => {
  it("validates name, Uzbek phone and a bounded message", () => {
    assert.deepEqual(validateContact(input), {});
    assert.ok(validateContact({ ...input, name: "A" }).name);
    assert.ok(validateContact({ ...input, name: "Ali\u0000x" }).name);
    assert.ok(validateContact({ ...input, phone: "123" }).phone);
    assert.ok(validateContact({ ...input, message: " " }).message);
    assert.ok(validateContact({ ...input, message: "x".repeat(1001) }).message);
  });
  it("validates untrusted payloads and normalizes phone numbers", () => {
    assert.equal(parseContactRequest(null).ok, false);
    assert.equal(parseContactRequest({ ...input, requestId: "bad" }).ok, false);
    assert.equal(parseContactRequest({ ...input, phone: 123, requestId }).ok, false);
    const parsed = parseContactRequest({ ...input, requestId });
    assert.ok(parsed.ok);
    assert.equal(parsed.value.phone, "+998901234567");
    assert.equal(parsed.value.reference, "IZO-A1B2C3D4");
    assert.ok(formatContactMessage(parsed.value).includes("Telefon: +998 90 123 45 67"));
    assert.ok(formatContactTelegramHtml(parsed.value).includes("Ali &lt;test&gt;"));
    assert.ok(formatContactTelegramHtml(parsed.value).includes("Narx &amp; yetkazish"));
    const manual = getManualContact(parsed.value);
    assert.equal(manual.status, "manual");
    assert.equal(manual.telegramUrl, "https://t.me/penaplast_uz");
    assert.ok(manual.telegramText.includes(input.message));
  });
  it("sends the escaped contact message through the shared Telegram adapter", async () => {
    const parsed = parseContactRequest({ ...input, requestId });
    assert.ok(parsed.ok);
    let body: Record<string, unknown> = {};
    await sendTelegramMessage(formatContactTelegramHtml(parsed.value), { botToken: "not-a-real-token", chatId: "123" }, async (_url, init) => {
      body = JSON.parse(String(init?.body));
      return Response.json({ ok: true });
    });
    assert.equal(body.parse_mode, "HTML");
    assert.match(String(body.text), /&lt;test&gt;/);
    assert.doesNotMatch(String(body.text), /<test>/);
  });
});
