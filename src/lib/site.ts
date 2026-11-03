export const SITE_NAME = "IZO PLUS";
export const SITE_TITLE = "IZO PLUS — Penaplast Zavodi | Sifatli EPS Penaplast";
export const SITE_DESCRIPTION = "IZO PLUS Penaplast Zavodi — qurilish va issiqlik izolyatsiyasi uchun sifatli EPS penaplast mahsulotlari.";

export function getSiteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) {
    try {
      const url = new URL(configured);
      if (url.protocol === "https:" || url.protocol === "http:") return url;
    } catch { /* Fall back to the local development origin. */ }
  }
  return new URL("http://localhost:3000");
}

export const NAVIGATION = [
  { href: "#home", label: "Bosh sahifa" },
  { href: "#products", label: "Mahsulotlar" },
  { href: "#production", label: "Ishlab chiqarish" },
  { href: "#advantages", label: "Nega Penaplast" },
  { href: "#applications", label: "Qayerda ishlatiladi" },
  { href: "#about", label: "Biz haqimizda" },
  { href: "#contact", label: "Aloqa" },
] as const;
