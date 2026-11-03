import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "./globals.css";
import { CONTACT } from "@/lib/validation";
import { SITE_DESCRIPTION, SITE_TITLE, getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: "IZO PLUS",
  authors: [{ name: "IZO PLUS" }],
  openGraph: {
    title: SITE_TITLE, description: SITE_DESCRIPTION, siteName: "IZO PLUS — Penaplast Zavodi",
    locale: "uz_UZ", type: "website",
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630, alt: "IZO PLUS — Sifatli penaplast. Ishonchli qurilish." }],
  },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION, images: ["/images/og-image.jpg"] },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ee642a" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organizationSchema = {
    "@context": "https://schema.org", "@type": "Organization",
    name: "IZO PLUS", alternateName: "IZO PLUS — Penaplast Zavodi",
    url: getSiteUrl().origin, logo: new URL("/icon.svg", getSiteUrl()).href,
    description: SITE_DESCRIPTION, telephone: CONTACT.phoneDisplay,
    sameAs: [CONTACT.telegramUrl],
    contactPoint: { "@type": "ContactPoint", telephone: "+998995132222", contactType: "sales", availableLanguage: ["Uzbek"] },
  };
  return (
    <html lang="uz"><body>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c") }} /></body></html>
  );
}
