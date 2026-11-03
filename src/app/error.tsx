"use client";

import { RotateCcw } from "lucide-react";
import { Brand } from "@/components/Brand";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="state-page"><Brand /><p className="state-page__code">IZO PLUS</p><h1>Sahifani yuklab bo‘lmadi.</h1><p>Iltimos, qayta urinib ko‘ring.<br />Muammo davom etsa, biz bilan Telegram orqali bog‘laning.</p><div className="state-page__actions"><button type="button" className="button button--primary" onClick={reset}><RotateCcw size={18} />QAYTA YUKLASH</button><a className="button button--outline" href="https://t.me/penaplast_uz" target="_blank" rel="noopener noreferrer">TELEGRAM ORQALI ALOQA</a></div></main>
  );
}
