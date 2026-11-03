"use client";

import Image from "next/image";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { calculateQuote, DENSITY_OPTIONS, GRANULE_PRICE_CENTS, formatMoney, getDefaultSelection, type Product } from "@/lib/products";
import { ProductSelector } from "./ProductSelector";
import { OrderButton } from "./OrderButton";

export function ProductCard({ product }: { product: Product }) {
  const [selection, setSelection] = useState(() => getDefaultSelection(product.id));
  const [open, setOpen] = useState(false);
  const quote = calculateQuote(selection);
  const sheet = product.kind === "sheet";
  return (
    <article className={`product-card product-card--${product.id}`} data-testid={`product-${product.id}`} aria-labelledby={`product-title-${product.id}`} data-reveal>
      <div className="product-card__visual">
        <Image src={product.image} alt={product.imageAlt} fill sizes="(min-width: 1100px) 32vw, (min-width: 700px) 46vw, 92vw" loading="lazy" />
        <span className="product-card__number">{product.number} <span>/ 03</span></span>
        <span className="product-card__material">{sheet ? "EPS / PLITA" : "EPS / GRANULA"}</span>
      </div>
      <div className="product-card__body">
        <div className="product-card__heading"><div><span className="product-card__category">IZO PLUS / {sheet ? "IZOLYATSIYA" : "TO‘LDIRUVCHI"}</span><h3 id={`product-title-${product.id}`}>{product.name}</h3></div><ArrowUpRight size={19} aria-hidden="true" /></div>
        <p className="product-card__description">{product.description}</p>
        <dl className="product-card__specs">
          {sheet ? <><div><dt>Zichlik</dt><dd>7–20 kg/m³</dd></div><div><dt>Qalinlik</dt><dd>1–60 cm</dd></div><div><dt>O‘lcham</dt><dd>Kelishiladi</dd></div></> : <><div><dt>Turi</dt><dd>Maydalangan EPS</dd></div><div><dt>Miqdor</dt><dd>kg bo‘yicha</dd></div><div><dt>Qo‘llanilishi</dt><dd>To‘ldirish</dd></div></>}
        </dl>
        <div className="product-card__summary"><div><span>Boshlang‘ich narx</span><strong>{formatMoney(sheet ? DENSITY_OPTIONS[0].priceCents : GRANULE_PRICE_CENTS)} <small>/ {sheet ? "m³ dan" : "kg"}</small></strong></div><button type="button" className="product-card__details" aria-expanded={open} aria-controls={`product-details-${product.id}`} onClick={() => setOpen(!open)}>{open ? "Yopish" : "Batafsil"}<ArrowDownRight size={17} className={open ? "product-card__details-icon--open" : ""} aria-hidden="true" /></button></div>
        <div id={`product-details-${product.id}`} className="product-card__configuration" hidden={!open}>
          <p className="product-card__configuration-title">O‘zingizga mos variantni tanlang</p>
          <ProductSelector selection={selection} onChange={setSelection} idPrefix={product.id} />
          <div className="product-card__pricing">
            <div className="product-card__unit-price"><span>Birlik narxi</span><strong>{quote ? formatMoney(quote.unitPriceCents) : "—"}<small> / {sheet ? "m³" : "kg"}</small></strong></div>
            <div className="product-card__total"><span>Umumiy summa</span><strong data-testid={`total-${product.id}`} aria-live="polite" aria-atomic="true">{quote ? formatMoney(quote.totalCents) : "—"}</strong></div>
          </div>
          <OrderButton selection={selection} className="product-card__order" disabled={!quote} />
        </div>
      </div>
    </article>
  );
}
