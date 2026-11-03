"use client";

import Image from "next/image";
import { useState } from "react";
import { calculateQuote, formatMoney, getDefaultSelection, type Product } from "@/lib/products";
import { ProductSelector } from "./ProductSelector";
import { OrderButton } from "./OrderButton";

export function ProductCard({ product }: { product: Product }) {
  const [selection, setSelection] = useState(() => getDefaultSelection(product.id));
  const quote = calculateQuote(selection);
  return (
    <article className={`product-card product-card--${product.id}`} data-testid={`product-${product.id}`} aria-labelledby={`product-title-${product.id}`}>
      <div className="product-card__visual">
        <Image src={product.image} alt={product.imageAlt} fill sizes="(min-width: 1100px) 32vw, (min-width: 700px) 46vw, 92vw" />
        <span className="product-card__number">{product.number}<span> / EPS</span></span>
        <span className="product-card__material">{product.kind === "sheet" ? "IZOLYATSIYA PLITALARI" : "EPS GRANULASI"}</span>
      </div>
      <div className="product-card__body">
        <h3 id={`product-title-${product.id}`}>{product.name}</h3>
        <p className="product-card__description">{product.description}</p>
        <ProductSelector selection={selection} onChange={setSelection} idPrefix={product.id} />
        <div className="product-card__pricing">
          <div className="product-card__unit-price"><span>Birlik narxi</span><strong>{quote ? formatMoney(quote.unitPriceCents) : "—"}<small> / {product.kind === "sheet" ? "m³" : "kg"}</small></strong></div>
          <div className="product-card__total"><span>Umumiy summa</span><strong data-testid={`total-${product.id}`} aria-live="polite" aria-atomic="true">{quote ? formatMoney(quote.totalCents) : "—"}</strong></div>
        </div>
        <OrderButton selection={selection} className="product-card__order" disabled={!quote} />
      </div>
    </article>
  );
}
