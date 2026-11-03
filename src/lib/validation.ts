import { calculateQuote, isDensity, isThickness, type ProductSelection, type Quote } from "./products";

export const CONTACT = {
  phoneDisplay: "+998 99 513 22 22",
  phoneHref: "tel:+998995132222",
  telegram: "@penaplast_uz",
  telegramUrl: "https://t.me/penaplast_uz",
} as const;

export interface CustomerInput {
  name: string;
  phone: string;
  address: string;
  note: string;
}
export interface Customer extends CustomerInput { phone: string }
export type CustomerErrors = Partial<Record<keyof CustomerInput, string>>;
export interface OrderRequest {
  selection: ProductSelection;
  customer: CustomerInput;
  requestId: string;
}
export interface ValidatedOrder {
  quote: Quote;
  customer: Customer;
  requestId: string;
  reference: string;
}
export const EMPTY_CUSTOMER: CustomerInput = { name: "", phone: "", address: "", note: "" };

export function normalizeUzPhone(value: string): string | null {
  const raw = value.trim();
  if (!/^\+?[\d\s()-]+$/.test(raw)) return null;
  const digits = raw.replace(/\D/g, "");
  const local = digits.length === 9 ? digits : digits.length === 12 && digits.startsWith("998") ? digits.slice(3) : null;
  if (!local || !/^[2-9]\d{8}$/.test(local)) return null;
  return `+998${local}`;
}
export function formatPhone(value: string): string {
  const phone = normalizeUzPhone(value);
  return phone ? `+998 ${phone.slice(4, 6)} ${phone.slice(6, 9)} ${phone.slice(9, 11)} ${phone.slice(11)}` : value;
}
function hasInvalidControl(value: string, multiline = false): boolean {
  return (multiline ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/ : /[\u0000-\u001f\u007f]/).test(value);
}
export function validateCustomer(input: CustomerInput): CustomerErrors {
  const errors: CustomerErrors = {};
  const name = input.name.trim();
  const address = input.address.trim();
  if (name.length < 2 || name.length > 80 || hasInvalidControl(name)) errors.name = "Ismingizni 2–80 ta belgi bilan kiriting.";
  if (!normalizeUzPhone(input.phone)) errors.phone = "To‘g‘ri raqam kiriting: +998 90 123 45 67.";
  if (address.length < 5 || address.length > 240 || hasInvalidControl(address)) errors.address = "Manzilni 5–240 ta belgi bilan kiriting.";
  if (input.note.length > 1000 || hasInvalidControl(input.note, true)) errors.note = "Izoh 1000 ta belgidan oshmasin.";
  return errors;
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Validate untrusted JSON at the server boundary, including exact catalog variants. */
export function parseOrderRequest(value: unknown): { ok: true; value: ValidatedOrder } | { ok: false; message: string } {
  if (!isRecord(value) || !isRecord(value.selection) || !isRecord(value.customer)) {
    return { ok: false, message: "Buyurtma ma’lumotlarini tekshirib, qayta yuboring." };
  }
  const { selection: raw, customer: rawCustomer } = value;
  if (typeof raw.productId !== "string" || typeof raw.quantity !== "string" || raw.quantity.length > 20) {
    return { ok: false, message: "Mahsulot va miqdorni tekshiring." };
  }
  let selection: ProductSelection;
  if (raw.productId === "granules") {
    selection = { productId: "granules", quantity: raw.quantity };
  } else if (raw.productId === "white" || raw.productId === "black") {
    if (!isDensity(raw.density) || !isThickness(raw.thicknessCm)) {
      return { ok: false, message: "Zichlik va qalinlikni tanlang." };
    }
    selection = { productId: raw.productId, quantity: raw.quantity, density: raw.density, thicknessCm: raw.thicknessCm };
  } else {
    return { ok: false, message: "Mahsulotni tanlang." };
  }
  const quote = calculateQuote(selection);
  if (!quote) return { ok: false, message: "Mahsulot tanlovi yoki miqdori noto‘g‘ri. Iltimos, tekshiring." };
  if (!["name", "phone", "address", "note"].every((key) => typeof rawCustomer[key] === "string")) {
    return { ok: false, message: "Mijoz ma’lumotlarini to‘ldiring." };
  }
  const input = rawCustomer as unknown as CustomerInput;
  if (Object.values(input).some((text) => text.length > 1100) || Object.keys(validateCustomer(input)).length) {
    return { ok: false, message: "Ism, telefon va manzilni to‘g‘ri to‘ldiring." };
  }
  if (typeof value.requestId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.requestId)) {
    return { ok: false, message: "Buyurtmani qayta ochib, yana urinib ko‘ring." };
  }
  return {
    ok: true,
    value: {
      quote,
      customer: {
        name: input.name.trim(), phone: normalizeUzPhone(input.phone)!,
        address: input.address.trim(), note: input.note.trim(),
      },
      requestId: value.requestId,
      reference: `IZO-${value.requestId.slice(0, 8).toUpperCase()}`,
    },
  };
}
