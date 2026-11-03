import Image from "next/image";
import { APPLICATIONS } from "@/lib/content";

export function Applications() {
  return (
    <section id="applications" className="section applications-section" aria-labelledby="applications-title">
      <div className="container">
        <div className="section-heading"><div><p className="eyebrow"><span />QAYERDA ISHLATILADI</p><h2 id="applications-title">Bir material.<br /><span className="text-muted">Ko‘p yechim.</span></h2></div><p className="section-heading__aside">Uy-joydan sanoatgacha.<br />Penaplast — vazifaga mos keladigan<br className="desktop-break" /> ko‘p qirrali izolyatsiya materiali.</p></div>
        <div className="applications-grid">{APPLICATIONS.map((application) => <article className={`application-card${application.featured ? " application-card--featured" : ""}`} key={application.title}><Image src={application.image} alt={application.alt} fill unoptimized={application.image.endsWith(".svg")} sizes={application.featured ? "(min-width: 1000px) 48vw, (min-width: 640px) 92vw, 92vw" : "(min-width: 1000px) 24vw, (min-width: 640px) 44vw, 92vw"} loading="lazy" /><div className="application-card__shade" /><div className="application-card__content"><h3>{application.title}</h3><p>{application.description}</p></div></article>)}</div>
        <p className="visual-note">Vizuallar mahsulot qo‘llanilishini tushuntirish uchun illustrativ. Aniq qo‘llash shartlari loyiha talablariga bog‘liq.</p>
      </div>
    </section>
  );
}
