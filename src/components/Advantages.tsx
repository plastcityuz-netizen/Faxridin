import { ADVANTAGES } from "@/lib/content";
import { ContentIcon } from "./ContentIcon";

export function Advantages() {
  return (
    <section id="advantages" className="section advantages-section" aria-labelledby="advantages-title">
      <div className="container">
        <div className="section-heading" data-reveal>
          <div><p className="eyebrow"><span /> AFZALLIKLAR <b> / 01</b></p><h2 id="advantages-title">Katta loyihalar uchun<br /><span className="text-muted">to‘g‘ri tanlov.</span></h2></div>
          <p className="section-heading__aside">Har bir detal muhim. Shuning uchun material tanlashdan buyurtmagacha sizga qulay yechimlar taklif qilamiz.</p>
        </div>
        <div className="advantages-grid">{ADVANTAGES.map((advantage) => <article className="advantage-card" key={advantage.number} data-reveal><div className="advantage-card__top"><span className="icon-tile"><ContentIcon name={advantage.icon} /></span><span className="advantage-card__number">{advantage.number} / 06</span></div><h3>{advantage.title}</h3><p>{advantage.description}</p></article>)}</div>
      </div>
    </section>
  );
}
