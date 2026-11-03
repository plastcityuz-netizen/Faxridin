import { escapeHtml } from "./order-message";
import { CONTACT, formatPhone, normalizeUzPhone } from "./validation";

export interface ContactInput { name: string; phone: string; message: string }
export type ContactErrors = Partial<Record<keyof ContactInput, string>>;
export interface ContactRequest extends ContactInput { requestId: string; reference: string }

export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};
  const name = input.name.trim();
  const message = input.message.trim();
  if (name.length < 2 || name.length > 80 || /[\u0000-\u001f\u007f]/.test(name)) errors.name = "Ismingizni 2–80 ta belgi bilan kiriting.";
  if (input.phone.length > 25 || !normalizeUzPhone(input.phone)) errors.phone = "To‘g‘ri raqam kiriting: +998 90 123 45 67.";
  if (message.length < 2 || message.length > 1000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(message)) errors.message = "Xabarni 2–1000 ta belgi bilan kiriting.";
  return errors;
}

export function parseContactRequest(value: unknown): { ok: true; value: ContactRequest } | { ok: false; message: string } {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return { ok: false, message: "Murojaat ma’lumotlarini tekshiring." };
  const raw = value as Record<string, unknown>;
  if (typeof raw.name !== "string" || typeof raw.phone !== "string" || typeof raw.message !== "string" ||
      typeof raw.requestId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw.requestId)) {
    return { ok: false, message: "Murojaat ma’lumotlarini tekshiring." };
  }
  const input = { name: raw.name, phone: raw.phone, message: raw.message };
  if (Object.keys(validateContact(input)).length) return { ok: false, message: "Ism, telefon va xabarni to‘g‘ri to‘ldiring." };
  return {
    ok: true,
    value: {
      name: input.name.trim(), phone: normalizeUzPhone(input.phone)!, message: input.message.trim(),
      requestId: raw.requestId, reference: `IZO-${raw.requestId.slice(0, 8).toUpperCase()}`,
    },
  };
}

export function formatContactMessage(input: ContactRequest): string {
  return ["YANGI MUROJAAT", `Murojaat: ${input.reference}`, "", `Ism: ${input.name}`, `Telefon: ${formatPhone(input.phone)}`, `Xabar: ${input.message}`].join("\n");
}

export function formatContactTelegramHtml(input: ContactRequest): string {
  return escapeHtml(formatContactMessage(input)).replace("YANGI MUROJAAT", "<b>YANGI MUROJAAT</b>");
}

export function getManualContact(input: ContactRequest) {
  return {
    status: "manual" as const, reference: input.reference, telegramText: formatContactMessage(input),
    telegramUrl: CONTACT.telegramUrl, message: "Murojaat matni tayyor. Telegramda yuborishni yakunlang.",
  };
}
