"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { ArrowUpRight, ArrowDown, BookOpen, PencilLine, FileCheck2, Check, X, Heart, MoveDown } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

const formats = [
  { title: "Русский язык", label: "ПОНЯТЬ И ПОЛЮБИТЬ", text: "От «как слышится» к «я знаю почему». Разбираемся в правилах и применяем их на практике.", className: "pink-format", icon: "Ая", tags: ["8–11 классы", "Школьная программа"] },
  { title: "Литература", label: "ЧИТАТЬ МЕЖДУ СТРОК", text: "Герои, смыслы и твоя точка зрения. Учимся понимать текст и говорить о нём своими словами.", className: "lime-format", icon: "book", tags: ["Анализ произведений", "Работа с текстом"] },
  { title: "ЕГЭ / ОГЭ", label: "СПОКОЙНО, ЭТО ПО ПЛАНУ", text: "Собираем знания в систему: от отдельного задания до целого варианта. Двигаемся в твоём темпе.", className: "blue-format", icon: "exam", tags: ["Подготовка к экзаменам", "9–11 классы"] },
  { title: "Сочинения и пробники", label: "ОТ ЧИСТОГО ЛИСТА К РЕЗУЛЬТАТУ", text: "Учимся формулировать мысли. Проверяем себя на пробниках и вместе разбираем ошибки.", className: "peach-format", icon: "pencil", tags: ["Обратная связь", "Практика письма"] },
];
const subjectOptions = ["Русский язык", "Литература", "ЕГЭ / ОГЭ", "Сочинения и пробники"] as const;
type Subject = (typeof subjectOptions)[number];
const chaosOptions = ["Полный хаос", "Есть вопросы", "Почти порядок"];
function Sticker({kind, className = ""}: {kind: string; className?: string}) { return <span aria-hidden="true" className={`sticker sticker-${kind} ${className}`} />; }
function Doodle({className = ""}: {className?: string}) {return <svg aria-hidden="true" className={`doodle ${className}`} viewBox="0 0 70 70" fill="none"><path d="m33 4 5 23L63 15 47 37l17 17-26-6-10 19-3-26L4 33l24-5Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" /></svg>;}

export default function Home() {
  const [open, setOpen] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]), [chaos, setChaos] = useState("Есть вопросы");
  const [name, setName] = useState(""), [phone, setPhone] = useState(""), [telegram, setTelegram] = useState(""), [details, setDetails] = useState(""), [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle"), [error, setError] = useState("");
  const requestId = useRef(""), lastTrigger = useRef<HTMLElement | null>(null);
  function startBooking(selected = "Помогите выбрать") {
    lastTrigger.current = document.activeElement as HTMLElement;
    setSubjects(selected === "Помогите выбрать" ? [] : [selected as Subject]); setStatus("idle");setError("");setOpen(true);
  }
  useEffect(() => {
    type ModelTool = {name:string;title:string;description:string;inputSchema:object;annotations:object;execute:(input:unknown)=>unknown};
    const context = (document as Document & {modelContext?: {registerTool:(tool:ModelTool,options:{signal:AbortSignal})=>void | Promise<void>}}).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {void Promise.resolve(context.registerTool({
      name:"start_lesson_enquiry", title:"Открыть заявку на занятия", description:"Открывает форму записи на индивидуальные занятия. Не отправляет заявку и не оформляет оплату.",
      inputSchema:{type:"object",properties:{format:{type:"string",enum:[...formats.map(f=>f.title),"Помогите выбрать"]}},additionalProperties:false},
      annotations:{readOnlyHint:false,untrustedContentHint:false},
      execute(input:unknown) {
        if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Нужен объект с направлением занятий.");
        const args = input as Record<string,unknown>;
        if(Object.keys(args).some(k=>k!=="format")) throw new Error("Неизвестный параметр.");
        const selected = args.format ?? "Помогите выбрать";
        if(typeof selected!=="string" || ![...formats.map(f=>f.title),"Помогите выбрать"].includes(selected)) throw new Error("Неизвестное направление.");
        flushSync(()=>startBooking(selected));return {status:"form_opened",format:selected,submitted:false};
      }
    },{signal:lifecycle.signal})).catch(()=>{});} catch { /* Optional browser capability. */ }
    return ()=>lifecycle.abort();
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();if(status==="sending") return;
    if(!phone.trim() && !telegram.trim()) {setError("Укажи номер телефона или ник в Telegram — достаточно одного контакта.");return;}
    if(subjects.length===0) {setError("Выбери хотя бы одно направление занятий.");return;}
    if(!consent) {setError("Подтверди согласие, чтобы отправить заявку.");return;}
    setStatus("sending");setError("");requestId.current ||= crypto.randomUUID();
    try {
      const response = await fetch("/api/enquiries", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:requestId.current,name:name.trim(),phone:phone.trim(),telegram:telegram.trim(),subjects,details:details.trim(),chaos,consent,website:new FormData(event.currentTarget).get("website")})});
      const result = await response.json() as {error?: string; ok?: boolean};
      if(!response.ok || result.ok!==true) throw new Error(result.error || "Не получилось отправить заявку. Попробуй ещё раз.");
      setStatus("success");requestId.current="";setName("");setPhone("");setTelegram("");setDetails("");setSubjects([]);setConsent(false);
    } catch(error) {setStatus("error");setError(error instanceof Error ? error.message : "Проверь соединение и попробуй ещё раз.");}
  }
  return <>
    <a className="skip-link" href="#main">Перейти к содержанию</a>
    <SiteHeader onBooking={() => startBooking()} />
    <main id="main">
      <section className="hero notebook"><div className="hero-inner container">
        <div className="hero-copy"><span className="eyebrow"><span className="mini-line"/> РУССКИЙ ЯЗЫК И ЛИТЕРАТУРА · 8–11 КЛАССЫ</span>
          <h1>Филолог,<br/>который объясняет<br/><span className="human">по-человечески<svg viewBox="0 0 580 24" preserveAspectRatio="none" aria-hidden="true"><path d="M4 13Q280 29 575 6M24 21Q330 29 554 16"/></svg></span></h1>
          <p className="hero-description">Помогу подружиться с русским и литературой.<br className="desktop-br"/> Разложим по полочкам то, что раньше<br className="desktop-br"/> казалось запутанным.</p>
          <div className="hero-actions"><button className="button button-pink" onClick={()=>startBooking()}>Хочу разобраться <ArrowUpRight size={20}/></button><a className="text-link" href="#method">Как проходят занятия <ArrowDown size={17}/></a></div>
          <div className="lesson-meta"><span>Индивидуально</span><span>Онлайн</span><span>60 минут</span></div>
        </div>
        <div className="hero-visual"><div className="portrait-frame" role="img" aria-label="Портрет преподавателя из предоставленного референса"/><Doodle className="hero-star"/><span className="hero-hi hand">привет, это я!</span>
          <div className="note hero-note"><span className="tape tape-pink"/><span className="note-title">НА ПОЛЯХ</span><p>Можно не понимать.<br/>Можно переспрашивать.<br/><strong>Можно быть собой.</strong></p><Heart size={24}/></div>
        </div>
      </div><div className="hero-bottom container"><span>Меньше «зазубри». Больше «теперь понятно».</span><a href="#story" aria-label="К моей истории"><MoveDown size={22}/></a></div></section>
      <section className="story-section section container" id="story">
        <div className="story-heading"><span className="eyebrow">01 / ДАВАЙ ЗНАКОМИТЬСЯ</span><h2>Моя <span className="underline-pink">история</span></h2><span className="hand story-aside">по ту сторону экрана</span></div>
        <div className="story-copy"><p className="large-copy">Я — филолог. И я за то, чтобы<br className="desktop-br"/> русский стал <mark>понятным.</mark></p><p>Я окончила филологический факультет МПГУ. Уже больше трёх лет преподаю русский язык и литературу, больше двух лет занимаюсь репетиторством и преподаю в онлайн-школе.</p><p>На моих занятиях можно задавать любые вопросы, ошибаться и пробовать снова. Вместо монолога — живой разговор, вместо бесконечной зубрёжки — поиск смысла.</p><div className="story-tags"><span>Филология</span><span>Живой диалог</span><span>Авторские материалы</span></div></div>
        <div className="story-note note"><span className="tape tape-blue"/><Sticker kind="heart"/><p className="hand">На твоей стороне.<br/>Даже если с запятыми<br/>пока всё сложно.</p></div>
      </section>
      <section className="lessons-section section container" id="lessons">
        <div className="section-head"><div><span className="eyebrow">02 / УЧИМСЯ БЕЗ ЛИШНЕГО СТРЕССА</span><h2>Что тебя ждёт <span className="underline-pink">на занятиях</span></h2></div><span className="hand head-note">здесь можно спросить<br/>«а почему?»</span></div>
        <div className="value-grid">{[{kind:"flower",title:<>Уважение<br/>и поддержка</>,text:"Ошибки — часть пути. Разберёмся вместе, без осуждения и неловких вопросов."},{kind:"star",title:<>Понятные<br/>объяснения</>,text:"Ищем логику в правилах, разбираем примеры и связываем новое с тем, что уже знаешь."},{kind:"smile",title:<>Система<br/>и практика</>,text:"От простого к сложному. Применяем знания на общей доске и закрепляем самостоятельно."},{kind:"heart",title:<>Интерес<br/>к предмету</>,text:"Обсуждаем, спорим и замечаем язык вокруг. Твоя точка зрения важна."}].map((item,i)=><article className={`value-card value-${i}`} key={i}><div className="value-top"><Sticker kind={item.kind}/><span className="value-number">0{i+1}</span></div><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
      </section>
      <section className="method-section section" id="method"><div className="container method-layout">
        <div className="chaos-poster"><span className="poster-label">У ВСЕГО ЕСТЬ СВОЁ МЕСТО</span><div className="chaos-letters" aria-label="Хаос">{["Х","А","О","С"].map(l=><span key={l}>{l}</span>)}</div><div className="chaos-arrow"><svg viewBox="0 0 100 120" aria-hidden="true"><path d="M34 5C8 57 102 48 61 72S12 47 43 56s30 34 9 49m-11-17 11 20 15-13"/></svg></div><div className="system-word">СИСТЕМА</div><p>Понятный маршрут.<br/>Ваш темп. Всё по делу.</p><Doodle className="poster-star"/></div>
        <div className="shelves-wrap"><span className="eyebrow">03 / ОТ «НЕ ПОНИМАЮ» К «Я МОГУ»</span><h2>Разложим<br/><span className="underline-lime">по полочкам</span></h2><p className="section-description">У каждого шага своя задача. И на каждом я рядом.</p>
          <div className="shelves"><div className="shelf-row"><article className="shelf-item"><span className="step-number pink-number">01</span><div><h3>Обсуждаем задачу</h3><p>Цель занятий и текущие трудности</p></div></article><article className="shelf-item"><span className="step-number lime-number">02</span><div><h3>Определяем план</h3><p>С чего начнём и что будем отрабатывать</p></div></article></div>
            <div className="shelf-row"><article className="shelf-item practice-step"><span className="step-number white-number">03</span><div><h3>Разбираем тему</h3><p>Понятные объяснения и примеры</p></div><PencilLine size={34}/></article></div>
            <div className="shelf-row"><article className="shelf-item"><span className="step-number lime-number">04</span><div><h3>Практикуемся</h3><p>Закрепляем знания в заданиях</p></div></article><article className="shelf-item"><span className="step-number pink-number">05</span><div><h3>Разбираем ошибки</h3><p>Понимаем, чему уделить внимание</p></div></article></div>
          </div><span className="hand shelf-caption">и вот хаос становится системой :)</span>
        </div>
      </div></section>
      <section className="formats-section section container" id="formats">
        <div className="section-head"><div><span className="eyebrow">04 / НАЙДЁМ ТО, ЧТО НУЖНО ТЕБЕ</span><h2>Форматы <span className="underline-pink">занятий</span></h2></div><p className="format-intro">Один на один, онлайн, 60 минут.<br/>Программу подстроим под твою цель.</p></div>
        <div className="format-grid">{formats.map(f=><article className={`format-card ${f.className}`} key={f.title}><span className="format-label">{f.label}</span><h3>{f.title}</h3><p>{f.text}</p><div className="format-tags">{f.tags.map(tag=><span key={tag}>{tag}</span>)}</div><button className="format-button" onClick={()=>startBooking(f.title)}>Мне подходит <ArrowUpRight size={18}/></button><div className="format-art" aria-hidden="true">{f.icon==="Ая" ? "Ая" : f.icon==="book" ? <BookOpen/> : f.icon==="exam" ? <FileCheck2/> : <PencilLine/>}</div></article>)}</div>
        <p className="formats-footnote"><span className="hand">Не знаешь, что выбрать?</span> Начнём с твоих вопросов и подберём направление вместе.</p>
      </section>
      <section className="reviews-teaser container" aria-labelledby="reviews-teaser-title">
        <div className="reviews-teaser-inner">
          <div><span className="eyebrow">05 / ИСТОРИИ УЧЕНИКОВ</span><h2 id="reviews-teaser-title">За каждым отзывом —<br /><span>свой путь.</span></h2></div>
          <div className="reviews-teaser-copy"><p>С чего начались занятия, как мы работали и что изменилось. Истории и впечатления учеников — на отдельной странице.</p><a className="button button-dark" href="/reviews">К отзывам <ArrowUpRight size={20} aria-hidden="true" /></a></div>
        </div>
      </section>
      <section className="cta-section container" id="contact"><div className="final-banner"><Doodle className="cta-star"/><span className="eyebrow">ТЕПЕРЬ ТВОЯ ОЧЕРЕДЬ</span><h2>В голове хаос?<br/><span>Давай наведём порядок.</span></h2><p>Начнём с знакомства. Расскажешь, что пока не получается,<br className="desktop-br"/> а я помогу понять, куда двигаться дальше.</p><button className="button button-dark" onClick={()=>startBooking()}>Хочу на занятия <ArrowUpRight size={22}/></button><span className="hand cta-note">первый шаг — вот здесь</span><Sticker kind="flower" className="cta-flower"/></div></section>
    </main>
    <SiteFooter />
    <Dialog open={open} onOpenChange={value=>{if(status!=="sending")setOpen(value);}}><DialogContent className="booking-dialog" showCloseButton={false} onCloseAutoFocus={e=>{e.preventDefault();lastTrigger.current?.focus();}}>
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
          <p className="chosen-format">Направления: <strong>{subjects.length ? subjects.join(", ") : "не выбраны"}</strong></p>
          <label className="consent-label"><Checkbox checked={consent} onCheckedChange={v=>setConsent(v===true)} required aria-label="Согласие на обработку контактов"/><span>Согласен(-на) на обработку имени и указанных контактов для обратной связи по этой заявке.</span></label>
          {error && <p role="alert" className="form-error">{error}</p>}
          <button className="button button-pink submit-button" type="submit" disabled={status==="sending"}>{status==="sending" ? "Отправляем…" : "Отправить заявку"}<ArrowUpRight size={20}/></button><p className="form-bottom">Обсудим детали и стоимость до начала занятий.</p>
        </form>
      </>}
    </DialogContent></Dialog>
  </>;
}
