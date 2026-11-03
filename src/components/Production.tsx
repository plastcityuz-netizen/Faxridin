import { ArrowRight } from "lucide-react";
import { PRODUCTION_STEPS } from "@/lib/content";
import { ContentIcon } from "./ContentIcon";

export function Production() {
  return (
    <section id="production" className="section production-section" aria-labelledby="production-title">
      <div className="container">
        <div className="section-heading" data-reveal>
          <div><p className="eyebrow"><span /> ISHLAB CHIQARISH <b> / 03</b></p><h2 id="production-title">Xomashyodan<br /><span className="text-muted">tayyor mahsulotgacha.</span></h2></div>
          <div className="section-heading__aside"><p>Har bir bosqichda e’tibor. Har bir mahsulotda aniq maqsad.</p><a className="text-link" href="#products">MAHSULOTLARNI KO‘RISH <ArrowRight size={17} aria-hidden="true" /></a></div>
        </div>
        <ol className="production-grid">{PRODUCTION_STEPS.map((step) => <li key={step.number} className="production-card" data-reveal><div className="production-card__top"><span>{step.number}</span><ContentIcon name={step.icon} size={25} /></div><h3>{step.title}</h3><p>{step.description}</p></li>)}</ol>
        <div className="production-bottom"><span><span className="status-dot status-dot--orange" /> IZCHIL JARAYON. PUXTA NATIJA.</span><span>01 — 06</span></div>
      </div>
    </section>
  );
}
