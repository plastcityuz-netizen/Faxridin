"use client";

import { ArrowRight, Check, CheckCircle2, Copy, LoaderCircle, Send } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { validateContact, type ContactErrors, type ContactInput } from "@/lib/contact";
import { isOrderApiResponse, type OrderApiResponse } from "@/lib/order-api";
import { CONTACT, formatPhone } from "@/lib/validation";

const EMPTY: ContactInput = { name: "", phone: "", message: "" };
const ERROR = "Xabar yuborilmadi. Qaytadan urinib ko‘ring.";
type Result = Extract<OrderApiResponse, { status: "sent" | "manual" }>;

export function ContactForm() {
  const [input, setInput] = useState<ContactInput>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const requestId = useRef<string | null>(null);
  const submitting = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => () => abortRef.current?.abort(), []);

  function update(field: keyof ContactInput, value: string) {
    setInput((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setServerError("");
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const nextErrors = validateContact(input);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    submitting.current = true;
    setSending(true);
    setServerError("");
    requestId.current ??= crypto.randomUUID();
    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, requestId: requestId.current }), signal: controller.signal,
      });
      const data: unknown = await response.json();
      if (!isOrderApiResponse(data)) throw new Error("Invalid response");
      if (data.status === "sent" || data.status === "manual") setResult(data);
      else setServerError(response.status === 429 ? data.message : ERROR);
    } catch {
      setServerError(ERROR);
    } finally {
      window.clearTimeout(timeout);
      submitting.current = false;
      setSending(false);
      abortRef.current = null;
    }
  }
  async function copyMessage() {
    if (result?.status !== "manual") return;
    try { await navigator.clipboard.writeText(result.telegramText); setCopyState("copied"); }
    catch { textRef.current?.focus(); textRef.current?.select(); setCopyState("manual"); }
  }
  function reset() {
    setInput(EMPTY); setErrors({}); setResult(null); setCopyState("idle"); setServerError(""); requestId.current = null;
  }

  return (
    <div className="contact-form-card" data-reveal>
      <div className="contact-form-card__heading"><div><span>ALOQA / 01</span><h3>Bizga yozing</h3><p>Ma’lumotlaringizni qoldiring, murojaatingizni ko‘rib chiqamiz.</p></div><span className="contact-form-card__icon"><ArrowRight size={19} aria-hidden="true" /></span></div>
      {result ? (
        <div className="contact-result" role="status" aria-live="polite">
          <span className="contact-result__icon">{result.status === "sent" ? <CheckCircle2 size={30} /> : <Send size={28} />}</span>
          <h4>{result.status === "sent" ? "Xabaringiz yuborildi!" : "Xabaringiz Telegramga tayyor"}</h4>
          <p className="contact-result__reference">{result.reference}</p>
          {result.status === "sent" ? <p>Murojaatingiz operatorga yuborildi.</p> : <><p><strong>Hali yuborilmadi.</strong> Matnni nusxalang, {CONTACT.telegram} bilan suhbatga qo‘ying va o‘zingiz yuboring.</p><label className="sr-only" htmlFor="contact-telegram-text">Telegramga yuboriladigan murojaat matni</label><textarea ref={textRef} id="contact-telegram-text" readOnly rows={7} value={result.telegramText} /><div className="contact-result__actions"><button type="button" className="button button--outline" onClick={copyMessage}>{copyState === "copied" ? "Nusxalandi" : "Matnni nusxalash"}{copyState === "copied" ? <Check size={17} /> : <Copy size={17} />}</button><a className="button button--primary" href={result.telegramUrl} target="_blank" rel="noopener noreferrer">Telegramni ochish <ArrowRight size={17} /></a></div><p className="contact-result__hint">{copyState === "copied" ? "Endi matnni Telegramga qo‘ying va yuboring." : copyState === "manual" ? "Matn belgilandi. Qurilmangizning nusxalash menyusidan foydalaning." : "Telegramda xabarni o‘zingiz yuborasiz."}</p></>}
          <button type="button" className="contact-result__reset" onClick={reset}>Yana xabar yozish <ArrowRight size={16} /></button>
        </div>
      ) : (
        <form ref={formRef} className="contact-form" onSubmit={submit} noValidate aria-busy={sending}>
          <div className="contact-form__row">
            <div className="contact-field"><label htmlFor="contact-name">Ismingiz <span>*</span></label><input id="contact-name" name="name" autoComplete="name" placeholder="Ismingizni kiriting" maxLength={80} required value={input.name} disabled={sending} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "contact-name-error" : undefined} onChange={(event) => update("name", event.target.value)} />{errors.name && <p className="field-error" id="contact-name-error">{errors.name}</p>}</div>
            <div className="contact-field"><label htmlFor="contact-phone">Telefon raqamingiz <span>*</span></label><input id="contact-phone" name="phone" type="tel" autoComplete="tel" placeholder="+998 90 123 45 67" maxLength={25} required value={input.phone} disabled={sending} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "contact-phone-error" : undefined} onChange={(event) => update("phone", event.target.value)} onBlur={() => setInput((current) => ({ ...current, phone: formatPhone(current.phone) }))} />{errors.phone && <p className="field-error" id="contact-phone-error">{errors.phone}</p>}</div>
          </div>
          <div className="contact-field"><label htmlFor="contact-message">Xabaringiz <span>*</span></label><textarea id="contact-message" name="message" rows={4} placeholder="Loyihangiz yoki savolingiz haqida yozing..." maxLength={1000} required value={input.message} disabled={sending} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "contact-message-error" : "contact-message-hint"} onChange={(event) => update("message", event.target.value)} />{errors.message ? <p className="field-error" id="contact-message-error">{errors.message}</p> : <p className="contact-field__hint" id="contact-message-hint">{input.message.length} / 1000</p>}</div>
          {serverError && <p className="contact-form__error" role="alert">{serverError}</p>}
          <button className="button button--primary contact-form__submit" type="submit" disabled={sending}>{sending ? <><LoaderCircle size={18} className="spin" aria-hidden="true" /> Yuborilmoqda...</> : <>Xabarni yuborish <ArrowRight size={19} aria-hidden="true" /></>}</button>
          <p className="contact-form__privacy">Ma’lumotlaringiz faqat murojaatingizni ko‘rib chiqish uchun ishlatiladi.</p>
        </form>
      )}
    </div>
  );
}
