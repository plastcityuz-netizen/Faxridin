"use client";

import { useEffect } from "react";

/** Progressive enhancement: content stays visible without JS or with reduced motion. */
export function ScrollEffects() {
  useEffect(() => {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.revealState = "visible";
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -40px 0px", threshold: 0.05 });
    elements.forEach((element) => {
      // Avoid hiding content that was already visible before hydration.
      if (element.getBoundingClientRect().top < window.innerHeight - 40) return;
      element.dataset.revealState = "pending";
      observer.observe(element);
    });
    return () => { observer.disconnect(); elements.forEach((element) => { delete element.dataset.revealState; }); };
  }, []);
  return null;
}
