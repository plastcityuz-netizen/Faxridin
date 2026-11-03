"use client";

import { Minus, Plus } from "lucide-react";
import { DENSITY_OPTIONS, THICKNESS_OPTIONS, QUANTITY_LIMITS, getProduct, parseQuantity, validateSelection, type ProductSelection } from "@/lib/products";

interface ProductSelectorProps {
  selection: ProductSelection;
  onChange: (selection: ProductSelection) => void;
  idPrefix: string;
  disabled?: boolean;
}

export function ProductSelector({ selection, onChange, idPrefix, disabled = false }: ProductSelectorProps) {
  const product = getProduct(selection.productId);
  const limits = QUANTITY_LIMITS[product.kind];
  const quantity = parseQuantity(selection.quantity);
  const errors = validateSelection(selection);
  const sheetSelection = selection.productId === "granules" ? null : selection;
  const quantityId = `${idPrefix}-quantity`;
  const adjustQuantity = (direction: -1 | 1) => {
    const current = quantity ?? limits.min;
    const next = Math.min(limits.max, Math.max(limits.min, Math.round((current + direction * limits.step) * 100) / 100));
    onChange({ ...selection, quantity: String(next) });
  };

  return (
    <div className="product-selector">
      {sheetSelection && (
        <>
          <fieldset className="option-group" disabled={disabled}>
            <legend>Zichlik <span>kg/m³</span></legend>
            <div className="option-grid option-grid--density">
              {DENSITY_OPTIONS.map((option) => (
                <label className="chip" key={option.value} data-testid={`density-${idPrefix}-${option.value}`}>
                  <input className="sr-only" type="radio" name={`${idPrefix}-density`} value={option.value} checked={sheetSelection.density === option.value} aria-label={`${option.value} kg/m³`} onChange={() => { onChange({ ...sheetSelection, density: option.value }); }} />
                  <span>{option.value}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="option-group" disabled={disabled}>
            <legend>Qalinlik <span>cm</span></legend>
            <div className="option-grid option-grid--thickness">
              {THICKNESS_OPTIONS.map((thickness) => (
                <label className="chip" key={thickness} data-testid={`thickness-${idPrefix}-${thickness}`}>
                  <input className="sr-only" type="radio" name={`${idPrefix}-thickness`} value={thickness} checked={sheetSelection.thicknessCm === thickness} aria-label={`${thickness} cm`} onChange={() => { onChange({ ...sheetSelection, thicknessCm: thickness }); }} />
                  <span>{thickness}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </>
      )}
      <div className="option-group quantity-group">
        <label htmlFor={quantityId} className="field-label">Miqdor <span>{limits.unit}</span></label>
        <div className={`quantity-control${errors.quantity ? " quantity-control--invalid" : ""}`}>
          <button type="button" className="quantity-control__step" aria-label="Miqdorni kamaytirish" disabled={disabled || (quantity !== null && quantity <= limits.min)} onClick={() => adjustQuantity(-1)}><Minus size={16} /></button>
          <input id={quantityId} data-testid={`quantity-${idPrefix}`} type="text" inputMode={product.kind === "sheet" ? "decimal" : "numeric"} autoComplete="off" maxLength={10} value={selection.quantity} disabled={disabled} aria-invalid={Boolean(errors.quantity)} aria-describedby={`${quantityId}-hint${errors.quantity ? ` ${quantityId}-error` : ""}`} onChange={(event) => onChange({ ...selection, quantity: event.target.value })} />
          <span className="quantity-control__unit">{limits.unit}</span>
          <button type="button" className="quantity-control__step" aria-label="Miqdorni oshirish" disabled={disabled || (quantity !== null && quantity >= limits.max)} onClick={() => adjustQuantity(1)}><Plus size={16} /></button>
        </div>
        {product.kind === "granules" && <div className="quantity-presets" aria-label="Tez miqdor tanlovi">{[10, 50, 100].map((amount) => <button type="button" key={amount} aria-pressed={quantity === amount} disabled={disabled} onClick={() => onChange({ ...selection, quantity: String(amount) })}>{amount} kg</button>)}</div>}
        <p className="field-hint" id={`${quantityId}-hint`}>{product.kind === "sheet" ? "Plitalar hajmi m³ da hisoblanadi." : "Kerakli vaznni kilogrammda kiriting."}</p>
        {errors.quantity && <p className="field-error" id={`${quantityId}-error`} role="alert">{errors.quantity}</p>}
      </div>
    </div>
  );
}
