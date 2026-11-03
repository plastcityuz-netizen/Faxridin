import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Brand } from "@/components/Brand";

export const metadata: Metadata = { title: "Sahifa topilmadi — IZO PLUS", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <main className="state-page"><Brand /><p className="state-page__code">404</p><h1>Bu sahifa topilmadi.</h1><p>Manzil o‘zgargan yoki noto‘g‘ri kiritilgan bo‘lishi mumkin.<br />Bosh sahifadan kerakli mahsulotni tanlashingiz mumkin.</p><Link className="button button--primary" href="/"><ArrowLeft size={18} />BOSH SAHIFAGA QAYTISH</Link></main>
  );
}
