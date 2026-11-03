import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { APPLICATIONS } from "@/lib/content";

export function Applications() {
  return (
    <section id="applications" className="section applications-section" aria-labelledby="applications-title">
      <div className="container">
        <div className="section-heading" data-reveal><div><p className="eyebrow"><span /> QO‘LLANILISHI <b> / 05</b></p><h2 id="applications-title">Bir material.<br /><span className="text-muted">Ko‘plab imkoniyatlar.</span></h2></div><p className="section-heading__aside">Uy-joydan sanoatgacha — penaplast turli vazifalar uchun ko‘p qirrali izolyatsiya materialidir.</p></div>
        <div className="applications-grid">{APPLICATIONS.map((application) => <article className={`application-card${application.featured ? " application-card--featured" : ""}`} key={application.title} data-reveal><Image src={application.image} alt={application.alt} fill unoptimized={application.image.endsWith(".svg")} sizes={application.featured ? "(min-width: 1000px) 48vw, 92vw" : "(min-width: 1000px) 24vw, (min-width: 640px) 44vw, 92vw"} loading="lazy" /><div className="application-card__shade" /><div className="application-card__content"><span>IZO PLUS / EPS</span><h3>{application.title}</h3><p>{application.description}</p></div><ArrowUpRight className="application-card__arrow" size={18} aria-hidden="true" /></article>)}</div>
        <p className="visual-note">Vizuallar mahsulot qo‘llanilishini tushuntirish uchun illustrativ. Aniq qo‘llash shartlari loyiha talablariga bog‘liq.</p>
      </div>
    </section>
  );
}
