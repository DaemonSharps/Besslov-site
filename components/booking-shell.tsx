"use client";

import { createContext, useContext, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { ArrowUpRight, Check, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

const subjectOptions = ["Русский язык", "Литература", "ЕГЭ / ОГЭ", "Сочинения и пробники"] as const;
type Subject = (typeof subjectOptions)[number];
const chaosOptions = ["Полный хаос", "Есть вопросы", "Почти порядок"];
const formats = ["Русский язык", "Литература", "ЕГЭ / ОГЭ", "Сочинения и пробники"];

type BookingContextValue = { startBooking: (selected?: string) => void };
const BookingContext = createContext<BookingContextValue | null>(null);

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) throw new Error("useBooking must be used inside BookingProvider");
  return context;
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]), [chaos, setChaos] = useState("Есть вопросы");
  const [name, setName] = useState(""), [phone, setPhone] = useState(""), [telegram, setTelegram] = useState(""), [details, setDetails] = useState(""), [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle"), [error, setError] = useState("");
  const requestId = useRef(""), lastTrigger = useRef<HTMLElement | null>(null);

  function startBooking(selected = "Помогите выбрать") {
    lastTrigger.current = document.activeElement as HTMLElement;
    setSubjects(selected === "Помогите выбрать" ? [] : [selected as Subject]); setStatus("idle"); setError(""); setOpen(true);
  }

  useEffect(() => {
    type ModelTool = {name:string;title:string;description:string;inputSchema:object;annotations:object;execute:(input:unknown)=>unknown};
    const context = (document as Document & {modelContext?: {registerTool:(tool:ModelTool, options:{signal:AbortSignal})=>void | Promise<void>}}).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try { void Promise.resolve(context.registerTool({
      name:"start_lesson_enquiry", title:"Открыть заявку на занятия", description:"Открывает форму записи на индивидуальные занятия. Не отправляет заявку и не оформляет оплату.",
      inputSchema:{type:"object",properties:{format:{type:"string",enum:[...formats,"Помогите выбрать"]}},additionalProperties:false}, annotations:{readOnlyHint:false,untrustedContentHint:false},
      execute(input:unknown) {
        if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Нужен объект с направлением занятий.");
        const args = input as Record<string,unknown>;
        if (Object.keys(args).some(k=>k!=="format")) throw new Error("Неизвестный параметр.");
        const selected = args.format ?? "Помогите выбрать";
        if (typeof selected!=="string" || ![...formats,"Помогите выбрать"].includes(selected)) throw new Error("Неизвестное направление.");
        flushSync(()=>startBooking(selected)); return {status:"form_opened",format:selected,submitted:false};
      }
    }, {signal:lifecycle.signal})).catch(()=>{}); } catch { /* Optional browser capability. */ }
    return () => lifecycle.abort();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (status === "sending") return;
    if (!phone.trim() && !telegram.trim()) { setError("Укажи номер телефона или ник в Telegram — достаточно одного контакта."); return; }
    if (subjects.length === 0) { setError("Выбери хотя бы одно направление занятий."); return; }
    if (!consent) { setError("Подтверди согласие, чтобы отправить заявку."); return; }
    setStatus("sending"); setError(""); requestId.current ||= crypto.randomUUID();
    try {
      const response = await fetch("/api/enquiries", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:requestId.current,name:name.trim(),phone:phone.trim(),telegram:telegram.trim(),subjects,details:details.trim(),chaos,consent,website:new FormData(event.currentTarget).get("website")})});
      const result = await response.json() as {error?: string; ok?: boolean};
      if (!response.ok || result.ok !== true) throw new Error(result.error || "Не получилось отправить заявку. Попробуй ещё раз.");
      setStatus("success"); requestId.current=""; setName(""); setPhone(""); setTelegram(""); setDetails(""); setSubjects([]); setConsent(false);
    } catch (submissionError) { setStatus("error"); setError(submissionError instanceof Error ? submissionError.message : "Проверь соединение и попробуй ещё раз."); }
  }

  return <BookingContext.Provider value={{startBooking}}>
    {children}
    <Dialog open={open} onOpenChange={value=>{if(status!=="sending") setOpen(value);}}><DialogContent className="booking-dialog" showCloseButton={false} onCloseAutoFocus={event=>{event.preventDefault(); lastTrigger.current?.focus();}}>
      <DialogClose className="modal-close" disabled={status==="sending"} aria-label="Закрыть форму"><X size={22}/></DialogClose>
      {status==="success" ? <div className="success-content"><span className="success-check"><Check size={35}/></span><DialogTitle>Первый шаг сделан!</DialogTitle><DialogDescription>Заявка отправлена. Твои контакты и пожелания переданы для связи по поводу занятий.</DialogDescription><p className="hand">С хаосом разберёмся вместе ♡</p><button className="button button-pink" onClick={()=>setOpen(false)}>Отлично <Check size={18}/></button></div> : <>
        <span className="eyebrow">НАЧНЁМ С ЗНАКОМСТВА</span><DialogTitle>Привет! Давай разберёмся.</DialogTitle><DialogDescription>Оставь контакт — обсудим занятия и подберём программу под твою задачу.</DialogDescription>
        <form onSubmit={submit} className="booking-form">
          <div className="form-field"><label htmlFor="student-name">Как к тебе обращаться?</label><input id="student-name" name="name" autoComplete="name" required minLength={2} maxLength={80} placeholder="Твоё имя" value={name} onChange={e=>{setName(e.target.value);requestId.current="";}}/></div>
          <div className="contact-fields"><div className="form-field"><label htmlFor="student-phone">Номер телефона</label><input id="student-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={25} placeholder="+7 999 123-45-67" value={phone} onChange={e=>{setPhone(e.target.value);requestId.current="";}}/></div><div className="form-field"><label htmlFor="student-telegram">Ник в Telegram</label><input id="student-telegram" name="telegram" autoComplete="off" maxLength={33} pattern="@?[A-Za-z][A-Za-z0-9_]{4,31}" title="Ник начинается с @ или латинской буквы и содержит от 5 до 32 символов" placeholder="@username" value={telegram} onChange={e=>{setTelegram(e.target.value);requestId.current="";}}/></div><span className="field-hint contact-hint">Укажи хотя бы один контакт — можно оба.</span></div>
          <fieldset className="subjects-fieldset"><legend>Что будем разбирать?</legend><div className="subject-options">{subjectOptions.map(option=><label className={`subject-option ${subjects.includes(option) ? "selected" : ""}`} key={option}><Checkbox checked={subjects.includes(option)} onCheckedChange={checked=>{setSubjects(current=>checked===true ? current.includes(option) ? current : [...current,option] : current.filter(subject=>subject!==option));requestId.current="";}} aria-label={option}/><span>{option}</span></label>)}</div><span className="field-hint">Можно выбрать несколько направлений.</span></fieldset>
          <div className="form-field details-field"><label htmlFor="student-details">Расскажи подробнее <span>(необязательно)</span></label><textarea id="student-details" name="details" maxLength={1200} placeholder="Например: в каком ты классе, к какому экзамену готовишься и что сейчас вызывает трудности" value={details} onChange={e=>{setDetails(e.target.value);requestId.current="";}}/></div>
          <div className="honeypot" aria-hidden="true"><label>Сайт<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
          <fieldset><legend>Какой сейчас уровень хаоса?</legend><RadioGroup value={chaos} onValueChange={value=>{setChaos(value);requestId.current="";}} className="chaos-options" aria-label="Уровень хаоса">{chaosOptions.map((option,i)=><label className={`chaos-option ${chaos===option ? "selected" : ""}`} key={option}><RadioGroupItem value={option} id={`chaos-${i}`}/><span className="chaos-symbol" aria-hidden="true">{["?!","?","✓"][i]}</span><span>{option}</span></label>)}</RadioGroup></fieldset>
          <p className="chosen-format">Направления: <strong>{subjects.length ? subjects.join(", ") : "не выбраны"}</strong></p><label className="consent-label"><Checkbox checked={consent} onCheckedChange={value=>setConsent(value===true)} required aria-label="Согласие на обработку контактов"/><span>Согласен(-на) на обработку имени и указанных контактов для обратной связи по этой заявке.</span></label>
          {error && <p role="alert" className="form-error">{error}</p>}<button className="button button-pink submit-button" type="submit" disabled={status==="sending"}>{status==="sending" ? "Отправляем…" : "Отправить заявку"}<ArrowUpRight size={20}/></button><p className="form-bottom">Обсудим детали и стоимость до начала занятий.</p>
        </form>
      </>}
    </DialogContent></Dialog>
  </BookingContext.Provider>;
}
