import { formatMoney, formatQuantity, formatSelectionSummary, type Quote } from "./products";
import { CONTACT, formatPhone, type ValidatedOrder } from "./validation";

export function formatOrderMessage(order: ValidatedOrder): string {
  const { quote, customer } = order;
  const specifications = quote.productId === "granules"
    ? []
    : [`Zichlik: ${quote.density} kg/m³`, `Qalinlik: ${quote.thicknessCm} cm`];
  return [
    "YANGI BUYURTMA",
    `Buyurtma: ${order.reference}`,
    "",
    `Mahsulot: ${quote.productName}`,
    ...specifications,
    `Miqdor: ${formatQuantity(quote.quantity)} ${quote.unit}`,
    `Birlik narxi: ${formatMoney(quote.unitPriceCents)} / ${quote.unit}`,
    `Jami: ${formatMoney(quote.totalCents)}`,
    "",
    "MIJOZ:",
    `Ism: ${customer.name}`,
    `Telefon: ${formatPhone(customer.phone)}`,
    `Manzil: ${customer.address}`,
    `Izoh: ${customer.note || "Yo‘q"}`,
    "",
    "Narx va yetkazib berish shartlari operator bilan tasdiqlanadi.",
  ].join("\n");
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}
export function formatTelegramHtml(order: ValidatedOrder): string {
  const text = escapeHtml(formatOrderMessage(order));
  return text.replace("YANGI BUYURTMA", "<b>YANGI BUYURTMA</b>").replace("MIJOZ:", "<b>MIJOZ:</b>");
}
export function getManualOrder(order: ValidatedOrder) {
  return {
    status: "manual" as const,
    reference: order.reference,
    telegramText: formatOrderMessage(order),
    telegramUrl: CONTACT.telegramUrl,
    message: "Buyurtma matni tayyor. Telegramda yuborishni yakunlang.",
  };
}
export function getQuoteSummary(quote: Quote): string {
  return `${quote.productName} · ${formatSelectionSummary(quote)}`;
}
