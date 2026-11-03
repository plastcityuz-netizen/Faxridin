"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUpRight, Check, CheckCircle2, ChevronDown, Copy, LoaderCircle, Send, ShieldCheck, TriangleAlert, X } from "lucide-react";
import { PRODUCTS, calculateQuote, formatMoney, formatSelectionSummary, getDefaultSelection, isProductId, validateSelection, type ProductSelection } from "@/lib/products";
import { CONTACT, EMPTY_CUSTOMER, formatPhone, validateCustomer, type CustomerErrors, type CustomerInput } from "@/lib/validation";
import { ORDER_ERROR_MESSAGE, ORDER_SUCCESS_MESSAGE, isOrderApiResponse, type OrderApiResponse } from "@/lib/order-api";
import { ProductSelector } from "./ProductSelector";

interface OrderModalProps { initialSelection?: ProductSelection; onClose: () => void }
type Result = Extract<OrderApiResponse, { status: "sent" | "manual" }>;

export function OrderModal({ initialSelection, onClose }: OrderModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const requestId = useRef<string | null>(null);
  const submitting = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const [selection, setSelection] = useState<ProductSelection>(() => initialSelection ?? getDefaultSelection());
  const [configurationOpen, setConfigurationOpen] = useState(!initialSelection);
  const [customer, setCustomer] = useState<CustomerInput>({ ...EMPTY_CUSTOMER });
  const [errors, setErrors] = useState<CustomerErrors>({});
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">("idle");
  const product = PRODUCTS.find((item) => item.id === selection.productId)!;
  const quote = calculateQuote(selection);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    dialog?.showModal();
    titleRef.current?.focus();
    return () => {
      abortRef.current?.abort();
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    if (!result) return;
    dialogRef.current?.querySelector<HTMLElement>(".order-result")?.scrollTo({ top: 0 });
    titleRef.current?.focus({ preventScroll: true });
  }, [result]);

  const updateCustomer = (field: keyof CustomerInput, value: string) => {
    setCustomer((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setErrorMessage("");
  };
  const updateSelection = (next: ProductSelection) => { setSelection(next); setErrorMessage(""); };
  const close = () => { if (!submitting.current) onClose(); };

  // Keep keyboard focus inside the modal, including when the browser would move to its chrome.
  const trapFocus = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== "Tab") return;
    const elements = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [tabindex="0"]'))
      .filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0 && !element.closest("[hidden]"));
    const first = elements[0];
    const last = elements.at(-1);
    if (!first || !last) return;
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === titleRef.current)) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault(); first.focus();
    }
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || !quote) return;
    const customerErrors = validateCustomer(customer);
    setErrors(customerErrors);
    if (Object.keys(customerErrors).length || Object.keys(validateSelection(selection)).length) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    submitting.current = true;
    setSending(true);
    setErrorMessage("");
    requestId.current ??= crypto.randomUUID();
    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch("/api/order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selection, customer, requestId: requestId.current }),
        signal: controller.signal,
      });
      const data: unknown = await response.json();
      if (!isOrderApiResponse(data)) throw new Error("Invalid response");
      if (data.status === "sent" || data.status === "manual") {
        setResult(data);
        titleRef.current?.focus();
      } else {
        setErrorMessage(response.status === 429 ? data.message : ORDER_ERROR_MESSAGE);
      }
    } catch {
      setErrorMessage(ORDER_ERROR_MESSAGE);
    } finally {
      window.clearTimeout(timeout);
      submitting.current = false;
      setSending(false);
      abortRef.current = null;
    }
  }

  async function copyOrder() {
    if (result?.status !== "manual") return;
    try {
      await navigator.clipboard.writeText(result.telegramText);
      setCopyState("copied");
    } catch {
      textRef.current?.focus();
      textRef.current?.select();
      setCopyState("manual");
    }
  }

  const field = (name: keyof CustomerInput, label: string, placeholder: string, options: { required?: boolean; type?: string; autoComplete?: string; maxLength: number; hint?: string }) => {
    const id = `customer-${name}`;
    return (
      <div className={`form-field${name === "address" || name === "note" ? " form-field--wide" : ""}`}>
        <label htmlFor={id}>{label}{options.required ? <span className="required-mark"> *</span> : <span className="optional-mark"> (ixtiyoriy)</span>}</label>
        {name === "note" ? (
          <textarea id={id} name={name} rows={3} placeholder={placeholder} maxLength={options.maxLength} value={customer[name]} disabled={sending} aria-invalid={Boolean(errors[name])} aria-describedby={`${id}-hint`} onChange={(event) => updateCustomer(name, event.target.value)} />
        ) : (
          <input id={id} name={name} type={options.type ?? "text"} autoComplete={options.autoComplete} placeholder={placeholder} required={options.required} maxLength={options.maxLength} value={customer[name]} disabled={sending} aria-invalid={Boolean(errors[name])} aria-describedby={`${id}-hint`} onChange={(event) => updateCustomer(name, event.target.value)} onBlur={() => { if (name === "phone" && customer.phone.trim()) setCustomer((current) => ({ ...current, phone: formatPhone(current.phone) })); }} />
        )}
        <span id={`${id}-hint`} className={errors[name] ? "field-error" : "field-hint"}>{errors[name] ?? options.hint ?? ""}</span>
      </div>
    );
  };

  return (
    <dialog ref={dialogRef} className={`order-dialog${result ? " order-dialog--result" : ""}`} aria-labelledby="order-title" aria-describedby={result ? undefined : "order-description"} aria-modal="true" onKeyDown={trapFocus} onCancel={(event) => { event.preventDefault(); close(); }} onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div className="order-dialog__shell">
        <header className="order-dialog__header">
          <div><p className="eyebrow"><span />IZO PLUS / BUYURTMA</p><h2 id="order-title" ref={titleRef} tabIndex={-1}>{result ? "Buyurtma yakuni" : "Buyurtmani rasmiylashtiring"}</h2></div>
          <button type="button" className="icon-button order-dialog__close" aria-label="Buyurtma oynasini yopish" onClick={close} disabled={sending}><X size={22} /></button>
        </header>
        {result ? (
          <div className="order-result" role="status" aria-live="polite">
            <span className={`order-result__icon${result.status === "manual" ? " order-result__icon--manual" : ""}`}>{result.status === "sent" ? <CheckCircle2 size={36} /> : <Send size={32} />}</span>
            <h3>{result.status === "sent" ? ORDER_SUCCESS_MESSAGE : "Buyurtmangiz Telegramga tayyor"}</h3>
            <p className="order-result__reference">{result.reference}</p>
            {result.status === "sent" ? (
              <><p>Buyurtmangiz operatorga yuborildi.<br />Tasdiqlash uchun siz bilan bog‘lanishadi.</p><div className="order-result__summary"><strong>{quote?.productName}</strong><span>{quote && formatSelectionSummary(quote)}</span><b>{quote && formatMoney(quote.totalCents)}</b></div><button type="button" className="button button--primary" onClick={onClose}>YOPISH<Check size={18} /></button></>
            ) : (
              <>
                <p><strong>Hali yuborilmadi.</strong> Matnni nusxalang va Telegramda <b>{CONTACT.telegram}</b> bilan suhbatga tashlab, xabarni yuboring.</p>
                <label className="sr-only" htmlFor="telegram-order-text">Telegramga yuboriladigan buyurtma matni</label>
                <textarea ref={textRef} id="telegram-order-text" className="order-result__text" readOnly rows={10} value={result.telegramText} />
                <div className="order-result__actions"><button type="button" className="button button--outline" onClick={copyOrder}>{copyState === "copied" ? "NUSXALANDI" : "MATNNI NUSXALASH"}{copyState === "copied" ? <Check size={17} /> : <Copy size={17} />}</button><a className="button button--primary" href={result.telegramUrl} target="_blank" rel="noopener noreferrer">TELEGRAMNI OCHISH<ArrowUpRight size={17} /></a></div>
                <p className="copy-feedback" aria-live="polite">{copyState === "copied" ? "Matn nusxalandi. Endi uni Telegramga tashlang va yuboring." : copyState === "manual" ? "Matn belgilandi. Telefoningizning “Nusxalash” menyusidan foydalaning." : "Telegram ochilgandan so‘ng xabarni o‘zingiz yuborasiz."}</p>
              </>
            )}
          </div>
        ) : (
          <form ref={formRef} className="order-form" onSubmit={submit} noValidate aria-busy={sending}>
            <div className="order-dialog__body">
              <aside className="order-config">
                <div className="order-config__product"><Image src={product.image} alt="" width={82} height={74} /><div><span>TANLANGAN MAHSULOT</span><h3>{product.name}</h3></div></div>
                {quote && <p className="order-config__specs">{formatSelectionSummary(quote)}</p>}
                <button type="button" className="configuration-toggle" aria-expanded={configurationOpen} aria-controls="order-configuration" disabled={sending} onClick={() => setConfigurationOpen(!configurationOpen)}>{configurationOpen ? "Tanlovni yopish" : "Tanlovni o‘zgartirish"}<ChevronDown size={16} className={configurationOpen ? "rotate-180" : ""} /></button>
                <div id="order-configuration" hidden={!configurationOpen}>
                  <fieldset className="option-group order-product-picker" disabled={sending}><legend>Mahsulot turi</legend><div>{PRODUCTS.map((item) => <label className="chip" key={item.id}><input className="sr-only" type="radio" name="order-product" value={item.id} checked={selection.productId === item.id} aria-label={item.name} onChange={() => { if (isProductId(item.id)) updateSelection(getDefaultSelection(item.id)); }} /><span>{item.name.replace(" penaplast", "")}</span></label>)}</div></fieldset>
                  <ProductSelector selection={selection} onChange={updateSelection} idPrefix="order" disabled={sending} />
                </div>
                <div className="order-config__price"><span>Birlik narxi<strong>{quote ? `${formatMoney(quote.unitPriceCents)} / ${quote.unit}` : "—"}</strong></span><span>Umumiy summa<strong data-testid="order-total">{quote ? formatMoney(quote.totalCents) : "—"}</strong></span></div>
                <p className="order-config__note">Narx va yetkazib berish shartlari operator bilan tasdiqlanadi.</p>
              </aside>
              <div className="order-customer">
                <p id="order-description" className="order-customer__intro">Aloqa ma’lumotlaringizni qoldiring.<br /><span>Yulduzcha (*) bilan belgilangan maydonlar majburiy.</span></p>
                <fieldset className="customer-fields" disabled={sending}>
                  <legend className="sr-only">Mijoz ma’lumotlari</legend>
                  {field("name", "Ismingiz", "Masalan: Ali", { required: true, autoComplete: "name", maxLength: 80 })}
                  {field("phone", "Telefon raqamingiz", "+998 90 123 45 67", { required: true, type: "tel", autoComplete: "tel", maxLength: 25, hint: "O‘zbekiston raqami: +998 bilan yoki 9 ta raqam." })}
                  {field("address", "Manzilingiz", "Shahar, tuman va yetkazib berish manzili", { required: true, autoComplete: "street-address", maxLength: 240 })}
                  {field("note", "Qo‘shimcha izoh", "Buyurtmaga oid savol yoki qo‘shimcha ma’lumot", { maxLength: 1000, hint: `${customer.note.length}/1000 belgi` })}
                </fieldset>
                <p className="privacy-note"><ShieldCheck size={17} aria-hidden="true" />Ma’lumotlaringiz faqat buyurtmani qayta ishlash uchun ishlatiladi.</p>
              </div>
            </div>
            <footer className="order-dialog__footer">
              {errorMessage && <p className="order-error" role="alert"><TriangleAlert size={18} aria-hidden="true" />{errorMessage}</p>}
              <div className="order-dialog__footer-row"><div className="order-dialog__footer-total"><span>Jami</span><strong>{quote ? formatMoney(quote.totalCents) : "—"}</strong></div><button type="submit" className="button button--primary order-submit" disabled={sending || !quote}>{sending ? <><LoaderCircle size={19} className="spin" aria-hidden="true" />Buyurtma yuborilmoqda...</> : <>BUYURTMANI YUBORISH<Send size={18} aria-hidden="true" /></>}</button></div>
            </footer>
          </form>
        )}
      </div>
    </dialog>
  );
}
