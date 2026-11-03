import Image from "next/image";
import { ArrowDown, Layers3 } from "lucide-react";
import { OrderButton } from "./OrderButton";

export function Hero() {
  return (
    <section id="home" className="hero" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <div className="hero__content">
          <p className="eyebrow"><span />IZO PLUS — PENAPLAST ZAVODI</p>
          <h1 id="hero-title">SIFATLI<br /><span>PENAPLAST.</span><br />ISHONCHLI<br />QURILISH.</h1>
          <p className="hero__description">Qurilish, issiqlik izolyatsiyasi va sanoat uchun sifatli EPS penaplast mahsulotlari.</p>
          <div className="hero__actions">
            <a className="button button--primary" href="#products">MAHSULOTLARNI KO‘RISH<ArrowDown size={18} aria-hidden="true" /></a>
            <OrderButton variant="outline" />
          </div>
          <div className="hero__assurance"><span className="assurance-line" /><p>Kerakli zichlik. Kerakli qalinlik.<br /><strong>To‘g‘ri tanlov — oson buyurtma.</strong></p></div>
        </div>
        <div className="hero__visual">
          <Image src="/images/hero-eps.jpg" alt="Zamonaviy EPS ishlab chiqarish sexi va taxlangan oq penaplast plitalari — illustrativ zavod vizuali" fill priority sizes="(min-width: 1024px) 53vw, 100vw" quality={85} className="hero__image" />
          <div className="hero__image-top"><span className="image-label"><span />EPS / IZO PLUS</span></div>
          <div className="hero__spec-card"><span className="hero__spec-icon"><Layers3 size={29} strokeWidth={1.5} aria-hidden="true" /></span><div><strong>7–20 <span>kg/m³</span></strong><p>Turli vazifalar uchun zichlik</p></div><span className="hero__spec-number">01—03</span></div>
          <span className="hero__image-caption">MATERIALDAN MUSTAHKAM YECHIMGACHA</span>
        </div>
      </div>
      <div className="container hero__facts" aria-label="Asosiy ko‘rsatkichlar">
        <div><span>01</span><p><strong>3 xil mahsulot</strong><small>Bir nechta vazifa — bitta zavod</small></p></div>
        <div><span>02</span><p><strong>1–60 cm qalinlik</strong><small>Loyihangizga mos tanlov</small></p></div>
        <div><span>03</span><p><strong>Oson buyurtma</strong><small>Telegram orqali bevosita aloqa</small></p></div>
        <a href="#products" className="hero__scroll" aria-label="Mahsulotlarga o‘tish"><ArrowDown size={21} /></a>
      </div>
    </section>
  );
}
