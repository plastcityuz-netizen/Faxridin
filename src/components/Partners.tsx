import { ArrowUpRight, Box, Building2, Factory, Ruler } from "lucide-react";

const sectors = [
  { icon: Building2, name: "QURILISH", description: "Bino va inshootlar" },
  { icon: Ruler, name: "LOYIHALASH", description: "Muhandislik yechimlari" },
  { icon: Factory, name: "SANOAT", description: "Ishlab chiqarish obyektlari" },
  { icon: Box, name: "QADOQLASH", description: "Himoya va tashish" },
];

export function Partners() {
  return (
    <section className="section partners-section" aria-labelledby="partners-title">
      <div className="container partners__inner" data-reveal>
        <div className="partners__intro"><p className="eyebrow"><span /> HAMKORLIK YO‘NALISHLARI <b> / 06</b></p><h2 id="partners-title">Birgalikda yanada<br /><span className="text-muted">mustahkam natija.</span></h2><p>Turli sohalar, yagona maqsad — har bir loyiha uchun to‘g‘ri material tanlash.</p><a className="text-link" href="#contact">FIKRINGIZNI BILDIRING <ArrowUpRight size={17} aria-hidden="true" /></a></div>
        <div className="partners__sectors">{sectors.map(({ icon: Icon, name, description }) => <div key={name} className="partner-sector"><Icon size={25} strokeWidth={1.5} aria-hidden="true" /><div><strong>{name}</strong><span>{description}</span></div></div>)}</div>
      </div>
    </section>
  );
}
