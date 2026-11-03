import Image from "next/image";
import { ArrowUpRight, Check, Layers3 } from "lucide-react";

export function About() {
  return (
    <section id="about" className="section about-section" aria-labelledby="about-title">
      <div className="container about__grid">
        <div className="about__visual" data-reveal><Image src="/images/hero-eps.jpg" alt="Oq EPS plitalari va zamonaviy ishlab chiqarish muhiti — illustrativ vizual" fill sizes="(min-width: 900px) 44vw, 92vw" loading="lazy" /><div className="about__image-label"><Layers3 size={29} strokeWidth={1.5} aria-hidden="true" /><span>IZO PLUS<strong>EPS PENAPLAST</strong></span></div><span className="about__image-index">SIFATLI MATERIALLAR / 01</span></div>
        <div className="about__content" data-reveal>
          <p className="eyebrow"><span /> BIZ HAQIMIZDA <b> / 04</b></p>
          <h2 id="about-title">Loyihangiz uchun.<br /><span className="text-muted">Ishonch bilan.</span></h2>
          <p className="about__description">IZO PLUS — qurilish, issiqlik izolyatsiyasi va sanoat uchun EPS penaplast mahsulotlarini ishlab chiqaradi.</p>
          <p className="about__secondary">Kerakli zichlik va qalinlikni tanlashdan buyurtma berishgacha — jarayonni sodda va tushunarli qilishga e’tibor qaratamiz.</p>
          <ul className="about__points"><li><Check size={16} aria-hidden="true" /> Turli loyihalar uchun mos variantlar</li><li><Check size={16} aria-hidden="true" /> Ishlab chiqaruvchidan bevosita buyurtma</li><li><Check size={16} aria-hidden="true" /> Tanlov va narx bo‘yicha maslahat</li></ul>
          <a className="text-link" href="#contact">BIZ BILAN BOG‘LANISH <ArrowUpRight size={18} aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}
