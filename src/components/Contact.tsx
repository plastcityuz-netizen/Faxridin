import { ArrowUpRight, MapPin, Phone, Send } from "lucide-react";
import { CONTACT } from "@/lib/validation";
import { ContactForm } from "./ContactForm";

export function Contact() {
  return (
    <section id="contact" className="section contact-section" aria-labelledby="contact-title">
      <div className="container contact__grid">
        <div className="contact__content" data-reveal>
          <p className="eyebrow"><span /> ALOQA <b> / 07</b></p>
          <h2 id="contact-title">Loyihangizni<br /><span className="text-muted">birga boshlaymiz.</span></h2>
          <p className="contact__description">Savolingiz bormi yoki buyurtma bermoqchimisiz? Biz bilan bog‘laning — kerakli yechimni birgalikda tanlaymiz.</p>
          <div className="contact__channels">
            <a className="contact-channel" href={CONTACT.phoneHref}><span className="contact-channel__icon"><Phone size={20} /></span><span><small>Telefon</small><strong>{CONTACT.phoneDisplay}</strong></span><ArrowUpRight size={18} aria-hidden="true" /></a>
            <a className="contact-channel" href={CONTACT.telegramUrl} target="_blank" rel="noopener noreferrer"><span className="contact-channel__icon"><Send size={20} /></span><span><small>Telegram</small><strong>{CONTACT.telegram}</strong></span><ArrowUpRight size={18} aria-hidden="true" /></a>
          </div>
          <div className="contact-map" aria-label="Sxematik xarita: aniq manzilni operator bilan aniqlashtiring">
            <div className="contact-map__roads" aria-hidden="true" /><span className="contact-map__pin" aria-hidden="true"><MapPin size={22} /></span>
            <div className="contact-map__label"><span>MANZIL</span><strong>Aniq manzilni bizdan so‘rang</strong><a href={CONTACT.telegramUrl} target="_blank" rel="noopener noreferrer">Telegram orqali aniqlashtirish <ArrowUpRight size={14} aria-hidden="true" /></a></div>
          </div>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
