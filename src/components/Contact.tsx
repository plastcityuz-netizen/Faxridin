import { ArrowUpRight, Phone, Send } from "lucide-react";
import { CONTACT } from "@/lib/validation";
import { OrderButton } from "./OrderButton";

export function Contact() {
  return (
    <section id="contact" className="section contact-section" aria-labelledby="contact-title">
      <div className="container">
        <div className="contact-panel"><div className="contact-panel__main"><p className="eyebrow eyebrow--dark"><span />ALOQA</p><h2 id="contact-title">Loyihangiz uchun<br />penaplast kerakmi?</h2><p>Tanlovingizni biz bilan muhokama qiling.<br />Buyurtmangizni bir necha qadamda rasmiylashtiring.</p><OrderButton variant="dark" /></div><div className="contact-panel__details"><span className="contact-panel__label">BIZ BILAN BEVOSITA BOG‘LANING</span><a className="contact-channel" href={CONTACT.phoneHref}><span className="contact-channel__icon"><Phone size={23} strokeWidth={1.6} /></span><span><small>Telefon</small><strong>{CONTACT.phoneDisplay}</strong></span><ArrowUpRight size={21} aria-hidden="true" /></a><a className="contact-channel" href={CONTACT.telegramUrl} target="_blank" rel="noopener noreferrer"><span className="contact-channel__icon"><Send size={23} strokeWidth={1.6} /></span><span><small>Telegram</small><strong>{CONTACT.telegram}</strong></span><ArrowUpRight size={21} aria-hidden="true" /></a><p className="contact-panel__note">Savolingiz bormi? Qo‘ng‘iroq qiling<br />yoki Telegram orqali yozing.</p></div></div>
      </div>
    </section>
  );
}
