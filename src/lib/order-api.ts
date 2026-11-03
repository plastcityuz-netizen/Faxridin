export type OrderApiResponse =
  | { status: "sent"; reference: string; message: string }
  | { status: "manual"; reference: string; telegramText: string; telegramUrl: string; message: string }
  | { status: "error"; message: string };

export const ORDER_ERROR_MESSAGE = "Buyurtma yuborilmadi. Qaytadan urinib ko‘ring.";
export const ORDER_SUCCESS_MESSAGE = "Buyurtmangiz muvaffaqiyatli yuborildi!";

export function isOrderApiResponse(value: unknown): value is OrderApiResponse {
  if (typeof value !== "object" || value === null || !("status" in value) || !("message" in value) || typeof value.message !== "string") return false;
  if (value.status === "error") return true;
  if (!("reference" in value) || typeof value.reference !== "string") return false;
  if (value.status === "sent") return true;
  return value.status === "manual" && "telegramText" in value && typeof value.telegramText === "string" && "telegramUrl" in value && value.telegramUrl === "https://t.me/penaplast_uz";
}
