import Image from "next/image";
import { ArrowDown, ArrowRight, Layers3 } from "lucide-react";
import { OrderButton } from "./OrderButton";

export function Hero() {
  return (
    <section id="home" className="hero" aria-labelledby="hero-title">
      <Image src="/images/hero-industrial.jpg" alt="EPS penaplast plitalari taxlangan zamonaviy ishlab chiqarish muhiti — illustrativ vizual" fill priority sizes="100vw" quality={85} className="hero__image" />
      <div className="hero__shade" />
      <div className="container hero__inner">
        <div className="hero__content">
          <p className="hero__eyebrow"><span /> ISHLAB CHIQARUVCHIDAN BEVOSITA <b> / 01</b></p>
          <h1 id="hero-title">Sifatli penaplast.<br /><span>Ishonchli qurilish<span className="hero__dot">.</span></span></h1>
          <p className="hero__description">Qurilish va issiqlik izolyatsiyasi uchun puxta yechim. Loyihangizga mos penaplastni biz bilan tanlang.</p>
          <div className="hero__actions">
            <OrderButton>Narx so‘rash</OrderButton>
            <a className="button button--hero-outline" href="#products">Katalogni ko‘rish <ArrowRight size={19} aria-hidden="true" /></a>
          </div>
        </div>
        <div className="hero__floating" aria-hidden="true"><span className="hero__floating-icon"><Layers3 size={22} /></span><span><small>MATERIAL</small><strong>EPS PENAPLAST</strong></span><span className="hero__floating-number">01 / 03</span></div>
        <div className="hero__bottom">
          <div className="hero__facts" aria-label="Mahsulot ko‘rsatkichlari">
            <div><span>01</span><p><strong>7–20 <small>kg/m³</small></strong><em>Zichlik variantlari</em></p></div>
            <div><span>02</span><p><strong>1–60 <small>cm</small></strong><em>Qalinlik variantlari</em></p></div>
            <div><span>03</span><p><strong>3 <small>xil</small></strong><em>Mahsulot turi</em></p></div>
          </div>
          <a href="#advantages" className="hero__scroll"><span>PASTGA<br />AYLANTIRING</span><ArrowDown size={18} aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}
