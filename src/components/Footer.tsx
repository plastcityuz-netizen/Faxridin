import { ArrowUp, ArrowUpRight, Send } from "lucide-react";
import { NAVIGATION } from "@/lib/site";
import { CONTACT } from "@/lib/validation";
import { Brand } from "./Brand";

export function Footer() {
  return (
    <footer className="site-footer"><div className="container"><div className="footer__main">
      <div className="footer__brand"><a href="#home" aria-label="IZO PLUS — bosh sahifa"><Brand inverted /></a><p>Qurilish va izolyatsiya uchun<br />ishonchli EPS yechimlar.</p><a className="footer__telegram" href={CONTACT.telegramUrl} target="_blank" rel="noopener noreferrer"><Send size={16} /> {CONTACT.telegram} <ArrowUpRight size={15} /></a></div>
      <div><span className="footer__label">SAHIFALAR</span><nav className="footer__nav" aria-label="Footer menyusi">{NAVIGATION.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}<a href="#advantages">Afzalliklar</a><a href="#applications">Qo‘llanilishi</a></nav></div>
      <div className="footer__contact"><span className="footer__label">BIZ BILAN BOG‘LANING</span><a href={CONTACT.phoneHref}>{CONTACT.phoneDisplay}</a><p>Mahsulotlar va buyurtmalar<br />bo‘yicha aloqaga chiqing.</p><a href="#home" className="footer__top">Yuqoriga qaytish <ArrowUp size={16} /></a></div>
    </div><div className="footer__bottom"><p>© {new Date().getFullYear()} IZO PLUS. Barcha huquqlar himoyalangan.</p><span>SIFATLI PENAPLAST. ISHONCHLI QURILISH.</span></div></div></footer>
  );
}
