import Image from "next/image";
import { ArrowUpRight, Layers3 } from "lucide-react";

export function About() {
  return (
    <section id="about" className="section about-section" aria-labelledby="about-title">
      <div className="container about__grid">
        <div className="about__visual"><Image src="/images/hero-eps.jpg" alt="Oq EPS plitalari va zamonaviy ishlab chiqarish muhiti — illustrativ vizual" fill sizes="(min-width: 900px) 44vw, 92vw" loading="lazy" /><div className="about__image-label"><Layers3 size={30} strokeWidth={1.5} aria-hidden="true" /><span>IZO PLUS<strong>PENAPLAST ZAVODI</strong></span></div><span className="about__image-index">IZO / 2026</span></div>
        <div className="about__content"><p className="eyebrow"><span />BIZ HAQIMIZDA</p><h2 id="about-title">IZO PLUS<br /><span className="text-muted">PENAPLAST ZAVODI</span></h2><p className="about__description">Qurilish, issiqlik izolyatsiyasi va sanoat uchun sifatli EPS penaplast mahsulotlarini ishlab chiqaramiz.</p><p className="about__secondary">Kerakli zichlik va qalinlikni tanlashdan buyurtma berishgacha — jarayonni sodda va tushunarli qilishga e’tibor qaratamiz.</p><dl className="about__stats"><div><dt>7–20 <span>kg/m³</span></dt><dd>Zichlik</dd></div><div><dt>1–60 <span>cm</span></dt><dd>Qalinlik</dd></div><div><dt>3</dt><dd>Asosiy mahsulot</dd></div></dl><a className="text-link" href="#contact">BIZ BILAN BOG‘LANISH<ArrowUpRight size={18} /></a></div>
      </div>
    </section>
  );
}
