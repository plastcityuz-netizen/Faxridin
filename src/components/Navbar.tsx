"use client";

import { ArrowUpRight, Menu, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NAVIGATION } from "@/lib/site";
import { CONTACT } from "@/lib/validation";
import { Brand } from "./Brand";
import { OrderButton } from "./OrderButton";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => { if (window.innerWidth >= 1180) setOpen(false); };
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize); };
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); toggleRef.current?.focus(); }
    };
    const onOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onOutside);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onOutside); };
  }, [open]);

  return (
    <>
      <div className="utility-bar">
        <div className="container utility-bar__inner">
          <span><span className="status-dot" />Sifatli EPS penaplast ishlab chiqarish</span>
          <a href={CONTACT.telegramUrl} target="_blank" rel="noopener noreferrer"><Send size={12} aria-hidden="true" />{CONTACT.telegram}<ArrowUpRight size={12} aria-hidden="true" /></a>
        </div>
      </div>
      <header ref={headerRef} className={`site-header${scrolled ? " site-header--scrolled" : ""}`}>
        <div className="container navbar">
          <a href="#home" className="brand-link" aria-label="IZO PLUS — bosh sahifa" onClick={() => setOpen(false)}><Brand /></a>
          <nav className="desktop-nav" aria-label="Asosiy menyu">
            {NAVIGATION.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
          </nav>
          <div className="navbar__actions">
            <OrderButton className="navbar__cta" />
            <button ref={toggleRef} type="button" className="menu-toggle icon-button" aria-label={open ? "Menyuni yopish" : "Menyuni ochish"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobil menyu" hidden={!open}>
          {NAVIGATION.map((item, index) => <a key={item.href} href={item.href} onClick={() => setOpen(false)}><span className="mobile-nav__number">0{index + 1}</span>{item.label}<ArrowUpRight size={17} aria-hidden="true" /></a>)}
          <OrderButton className="mobile-nav__cta" />
        </nav>
      </header>
      {open && <button type="button" className="menu-backdrop" aria-label="Menyuni yopish" tabIndex={-1} onClick={() => setOpen(false)} />}
    </>
  );
}
