import { ADVANTAGES } from "@/lib/content";
import { ContentIcon } from "./ContentIcon";

export function Advantages() {
  return (
    <section id="advantages" className="section advantages-section" aria-labelledby="advantages-title">
      <div className="container">
        <div className="section-heading"><div><p className="eyebrow"><span />NEGA PENAPLAST</p><h2 id="advantages-title">Tanlov uchun<br /><span className="text-muted">oltita sabab.</span></h2></div><p className="section-heading__aside">Mahsulotning o‘zi gapirsin.<br />Sizga esa to‘g‘ri tanlov qoladi.</p></div>
        <div className="advantages-grid">{ADVANTAGES.map((advantage) => <article className="advantage-card" key={advantage.number}><div className="advantage-card__top"><span className="icon-tile"><ContentIcon name={advantage.icon} /></span><span className="advantage-card__number">{advantage.number}</span></div><h3>{advantage.title}</h3><p>{advantage.description}</p></article>)}</div>
      </div>
    </section>
  );
}
