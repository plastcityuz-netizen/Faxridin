import { ArrowUp, ArrowUpRight, Send } from "lucide-react";
import { NAVIGATION } from "@/lib/site";
import { CONTACT } from "@/lib/validation";
import { Brand } from "./Brand";

export function Footer() {
  return (
    <footer className="site-footer"><div className="container"><div className="footer__main"><div className="footer__brand"><a href="#home" aria-label="IZO PLUS — bosh sahifa"><Brand inverted /></a><p>Sifatli penaplast.<br />Ishonchli qurilish.</p><a className="footer__telegram" href={CONTACT.telegramUrl} target="_blank" rel="noopener noreferrer"><Send size={16} />{CONTACT.telegram}<ArrowUpRight size={15} /></a></div><nav className="footer__nav" aria-label="Footer menyusi">{NAVIGATION.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}</nav><div className="footer__contact"><span>ALOQA UCHUN</span><a href={CONTACT.phoneHref}>{CONTACT.phoneDisplay}</a><p>EPS penaplast mahsulotlari<br />va buyurtmalar bo‘yicha.</p><a href="#home" className="footer__top">Yuqoriga qaytish<ArrowUp size={17} /></a></div></div><div className="footer__bottom"><p>© 2026 IZO PLUS. Barcha huquqlar himoyalangan.</p><span>IZO PLUS / PENAPLAST ZAVODI</span></div></div></footer>
  );
}
