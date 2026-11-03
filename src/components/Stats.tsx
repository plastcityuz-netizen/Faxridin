"use client";

import { useEffect, useRef } from "react";
import { DENSITY_OPTIONS, PRODUCTS, THICKNESS_OPTIONS } from "@/lib/products";
import { PRODUCTION_STEPS } from "@/lib/content";

const METRICS = [
  { value: PRODUCTS.length, suffix: "", label: "Mahsulot turi", note: "Har xil vazifalar uchun" },
  { value: DENSITY_OPTIONS.length, suffix: "", label: "Zichlik varianti", note: "7 dan 20 kg/m³ gacha" },
  { value: THICKNESS_OPTIONS.length, suffix: "", label: "Qalinlik varianti", note: "1 dan 60 cm gacha" },
  { value: PRODUCTION_STEPS.length, suffix: "", label: "Ishlab chiqarish bosqichi", note: "Xomashyodan mahsulotgacha" },
];

export function Stats() {
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      const counters = Array.from(section.querySelectorAll<HTMLElement>("[data-count]"));
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / 1100, 1);
        const eased = 1 - (1 - progress) ** 3;
        counters.forEach((counter) => { counter.textContent = String(Math.round(Number(counter.dataset.count) * eased)); });
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.25 });
    observer.observe(section);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, []);

  return (
    <section ref={sectionRef} className="stats-section" aria-labelledby="stats-title">
      <div className="container stats__inner">
        <div className="stats__intro"><p className="eyebrow eyebrow--light"><span /> RAQAMLARDA IZO PLUS</p><h2 id="stats-title">Tanlov ortidagi<br /><span>aniq raqamlar.</span></h2><p>Katalogimizdagi imkoniyatlar — bir qarashda.</p></div>
        <div className="stats__grid">{METRICS.map((metric, index) => <div className="stats__item" key={metric.label}><span className="stats__index">0{index + 1} /</span><strong aria-label={`${metric.value}${metric.suffix} ${metric.label}`}><span data-count={metric.value} aria-hidden="true">{metric.value}</span><i>{metric.suffix}</i></strong><p>{metric.label}</p><small>{metric.note}</small></div>)}</div>
      </div>
    </section>
  );
}
