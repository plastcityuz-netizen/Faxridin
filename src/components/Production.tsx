import { ArrowUpRight } from "lucide-react";
import { PRODUCTION_STEPS } from "@/lib/content";
import { ContentIcon } from "./ContentIcon";

export function Production() {
  return (
    <section id="production" className="section production-section" aria-labelledby="production-title">
      <div className="container">
        <div className="section-heading"><div><p className="eyebrow eyebrow--light"><span />ISHLAB CHIQARISH</p><h2 id="production-title">Xomashyodan<br /><span>tayyor mahsulotgacha.</span></h2></div><div className="section-heading__aside"><p>Har bir bosqichda e’tibor.<br />Har bir mahsulotda aniq maqsad.</p><a className="text-link text-link--light" href="#products">TAYYOR MAHSULOTLAR<ArrowUpRight size={17} /></a></div></div>
        <ol className="production-grid">{PRODUCTION_STEPS.map((step) => <li key={step.number} className="production-card"><div className="production-card__top"><span>{step.number}</span><ContentIcon name={step.icon} size={28} /></div><h3>{step.title}</h3><p>{step.description}</p><span className="production-card__line" /></li>)}</ol>
        <div className="production-bottom"><span className="status-dot status-dot--orange" /><p>IZO PLUS — EPS penaplast ishlab chiqarish</p><span>01 — 06</span></div>
      </div>
    </section>
  );
}
