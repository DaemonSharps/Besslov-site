"use client";
import Link from "next/link";
import { ArrowUpRight, ArrowDown, BookOpen, PencilLine, FileCheck2, Heart, MoveDown } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ScrollReveal } from "@/components/scroll-reveal";
import { useBooking } from "@/components/booking-shell";

const formats = [
  { title: "Русский язык", label: "ПОНЯТЬ И ПОЛЮБИТЬ", text: "От «как слышится» к «я знаю почему». Разбираемся в правилах и применяем их на практике.", className: "pink-format", icon: "Ая", tags: ["8–11 классы", "Школьная программа"] },
  { title: "Литература", label: "ЧИТАТЬ МЕЖДУ СТРОК", text: "Герои, смыслы и твоя точка зрения. Учимся понимать текст и говорить о нём своими словами.", className: "lime-format", icon: "book", tags: ["Анализ произведений", "Работа с текстом"] },
  { title: "ЕГЭ / ОГЭ", label: "СПОКОЙНО, ЭТО ПО ПЛАНУ", text: "Собираем знания в систему: от отдельного задания до целого варианта. Двигаемся в твоём темпе.", className: "blue-format", icon: "exam", tags: ["Подготовка к экзаменам", "9–11 классы"] },
  { title: "Сочинения и пробники", label: "ОТ ЧИСТОГО ЛИСТА К РЕЗУЛЬТАТУ", text: "Учимся формулировать мысли. Проверяем себя на пробниках и вместе разбираем ошибки.", className: "peach-format", icon: "pencil", tags: ["Обратная связь", "Практика письма"] },
];
function Sticker({kind, className = ""}: {kind: string; className?: string}) { return <span aria-hidden="true" className={`sticker sticker-${kind} ${className}`} />; }
function Doodle({className = ""}: {className?: string}) {return <svg aria-hidden="true" className={`doodle ${className}`} viewBox="0 0 70 70" fill="none"><path d="m33 4 5 23L63 15 47 37l17 17-26-6-10 19-3-26L4 33l24-5Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" /></svg>;}

export default function Home() {
  const { startBooking } = useBooking();
  return <>
    <a className="skip-link" href="#main">Перейти к содержанию</a>
    <SiteHeader />
    <main id="main">
      <ScrollReveal><section className="hero notebook"><div className="hero-inner container">
        <div className="hero-copy"><span className="eyebrow"><span className="mini-line"/> РУССКИЙ ЯЗЫК И ЛИТЕРАТУРА · 8–11 КЛАССЫ</span>
          <h1>Филолог,<br/>который объясняет<br/><span className="human">по-человечески<svg viewBox="0 0 580 24" preserveAspectRatio="none" aria-hidden="true"><path d="M4 13Q280 29 575 6M24 21Q330 29 554 16"/></svg></span></h1>
          <p className="hero-description">Помогу подружиться с русским и литературой.<br className="desktop-br"/> Разложим по полочкам то, что раньше<br className="desktop-br"/> казалось запутанным.</p>
          <div className="hero-actions"><button className="button button-pink" onClick={()=>startBooking()}>Хочу разобраться <ArrowUpRight size={20}/></button><a className="text-link" href="#method">Как проходят занятия <ArrowDown size={17}/></a></div>
          <div className="lesson-meta"><span>Индивидуально</span><span>Онлайн</span><span>60 минут</span></div>
        </div>
        <div className="hero-visual"><div className="portrait-frame" role="img" aria-label="Портрет преподавателя из предоставленного референса"/><Doodle className="hero-star"/><span className="hero-hi hand">привет, это я!</span>
          <div className="note hero-note"><span className="tape tape-pink"/><p>Можно не понимать.<br/>Можно переспрашивать.<br/><strong>Можно быть собой.</strong></p><Heart size={24}/></div>
        </div>
      </div><div className="hero-bottom container"><span>Меньше «зазубри». Больше «теперь понятно».</span><a href="#story" aria-label="К моей истории"><MoveDown size={22}/></a></div></section></ScrollReveal>
       <ScrollReveal><section className="story-section section container" id="story">
        <div className="story-heading"><span className="eyebrow">ДАВАЙ ЗНАКОМИТЬСЯ</span><h2>Моя <span className="underline-pink">история</span></h2><span className="hand story-aside">по ту сторону экрана</span></div>
        <div className="story-copy"><p className="large-copy">Я — филолог. И я за то, чтобы<br className="desktop-br"/> русский стал <mark>понятным.</mark></p><p>Я окончила филологический факультет МПГУ. Уже больше трёх лет преподаю русский язык и литературу, больше двух лет занимаюсь репетиторством и преподаю в онлайн-школе.</p><p>На моих занятиях можно задавать любые вопросы, ошибаться и пробовать снова. Вместо монолога — живой разговор, вместо бесконечной зубрёжки — поиск смысла.</p><div className="story-tags"><span>Филология</span><span>Живой диалог</span><span>Авторские материалы</span></div></div>
        <div className="story-note note"><span className="tape tape-blue"/><Sticker kind="heart"/><p className="hand">На твоей стороне.<br/>Даже если с запятыми<br/>пока всё сложно.</p></div>
      </section></ScrollReveal>
      <ScrollReveal><section className="lessons-section section container" id="lessons">
        <div className="section-head"><div><span className="eyebrow">УЧИМСЯ БЕЗ ЛИШНЕГО СТРЕССА</span><h2>Что тебя ждёт <span className="underline-pink">на занятиях</span></h2></div><span className="hand head-note">здесь можно спросить<br/>«а почему?»</span></div>
        <div className="value-grid">{[{kind:"flower",title:<>Уважение<br/>и поддержка</>,text:"Ошибки — часть пути. Разберёмся вместе, без осуждения и неловких вопросов."},{kind:"star",title:<>Понятные<br/>объяснения</>,text:"Ищем логику в правилах, разбираем примеры и связываем новое с тем, что уже знаешь."},{kind:"smile",title:<>Система<br/>и практика</>,text:"От простого к сложному. Применяем знания на общей доске и закрепляем самостоятельно."},{kind:"heart",title:<>Интерес<br/>к предмету</>,text:"Обсуждаем, спорим и замечаем язык вокруг. Твоя точка зрения важна."}].map((item,i)=><article className={`value-card value-${i}`} key={i}><div className="value-top"><Sticker kind={item.kind}/></div><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
      </section></ScrollReveal>
      <ScrollReveal><section className="method-section section" id="method"><div className="container method-layout">
        <div className="chaos-poster"><span className="poster-label">У ВСЕГО ЕСТЬ СВОЁ МЕСТО</span><div className="chaos-letters" aria-label="Хаос">{["Х","А","О","С"].map(l=><span key={l}>{l}</span>)}</div><div className="chaos-arrow"><svg viewBox="0 0 100 120" aria-hidden="true"><path d="M34 5C8 57 102 48 61 72S12 47 43 56s30 34 9 49m-11-17 11 20 15-13"/></svg></div><div className="system-word">СИСТЕМА</div><p>Понятный маршрут.<br/>Ваш темп. Всё по делу.</p><Doodle className="poster-star"/></div>
        <div className="shelves-wrap"><span className="eyebrow">ОТ «НЕ ПОНИМАЮ» К «Я МОГУ»</span><h2>Разложим<br/><span className="underline-lime">по полочкам</span></h2><p className="section-description">У каждого шага своя задача. И на каждом я рядом.</p>
          <div className="shelves"><div className="shelf-row"><article className="shelf-item"><span className="step-number pink-number">01</span><div><h3>Обсуждаем задачу</h3><p>Цель занятий и текущие трудности</p></div></article><article className="shelf-item"><span className="step-number lime-number">02</span><div><h3>Определяем план</h3><p>С чего начнём и что будем отрабатывать</p></div></article></div>
            <div className="shelf-row"><article className="shelf-item practice-step"><span className="step-number white-number">03</span><div><h3>Разбираем тему</h3><p>Понятные объяснения и примеры</p></div><PencilLine size={34}/></article></div>
            <div className="shelf-row"><article className="shelf-item"><span className="step-number lime-number">04</span><div><h3>Практикуемся</h3><p>Закрепляем знания в заданиях</p></div></article><article className="shelf-item"><span className="step-number pink-number">05</span><div><h3>Разбираем ошибки</h3><p>Понимаем, чему уделить внимание</p></div></article></div>
          </div><span className="hand shelf-caption">и вот хаос становится системой :)</span>
        </div>
      </div></section></ScrollReveal>
       <ScrollReveal><section className="formats-section section container" id="formats">
        <div className="section-head"><div><span className="eyebrow">НАЙДЁМ ТО, ЧТО НУЖНО ТЕБЕ</span><h2>Форматы <span className="underline-pink">занятий</span></h2></div><p className="format-intro">Один на один, онлайн, 60 минут.<br/>Программу подстроим под твою цель.</p></div>
        <div className="format-grid">{formats.map(f=><article className={`format-card ${f.className}`} key={f.title}><span className="format-label">{f.label}</span><h3>{f.title}</h3><p>{f.text}</p><div className="format-tags">{f.tags.map(tag=><span key={tag}>{tag}</span>)}</div><button className="format-button" onClick={()=>startBooking(f.title)}>Мне подходит <ArrowUpRight size={18}/></button><div className="format-art" aria-hidden="true">{f.icon==="Ая" ? "Ая" : f.icon==="book" ? <BookOpen/> : f.icon==="exam" ? <FileCheck2/> : <PencilLine/>}</div></article>)}</div>
         <p className="formats-footnote"><span className="hand">Не знаешь, что выбрать?</span> Начнём с твоих вопросов и подберём направление вместе.</p>
       </section></ScrollReveal>
       <ScrollReveal><section className="fortune-promo container" aria-labelledby="fortune-promo-title">
         <Link className="fortune-promo-inner" href="/fortune">
           <span className="fortune-promo-tape"><span className="eyebrow">БОНУСЫ ДЛЯ УЧЁБЫ</span></span>
           <div className="fortune-promo-copy">
             <h2 id="fortune-promo-title">Крути рулетку<br /><span>полезных подарков!</span></h2>
             <p>Шпаргалки, статьи и другие материалы — бесплатно и без регистрации.</p>
             <span className="fortune-promo-action">Крутить рулетку <ArrowUpRight size={19} aria-hidden="true" /></span>
           </div>
           <div className="fortune-promo-wheel" aria-hidden="true">
             <span className="fortune-promo-pointer" />
             <span>крути!</span>
           </div>
         </Link>
       </section></ScrollReveal>
       <ScrollReveal><section className="reviews-teaser section" aria-labelledby="reviews-teaser-title">
        <div className="reviews-teaser-inner">
          <div className="reviews-teaser-heading"><span className="eyebrow">ИСТОРИИ УЧЕНИКОВ</span><h2 id="reviews-teaser-title">За каждым отзывом —<br /><span>свой путь.</span></h2><span className="hand reviews-teaser-aside">от первого вопроса<br/>до «теперь понятно»</span></div>
          <div className="reviews-teaser-copy"><p>С чего начались занятия, как мы работали и что изменилось. Истории и впечатления учеников — на отдельной странице.</p><a className="button button-dark" href="/reviews">К отзывам <ArrowUpRight size={20} aria-hidden="true" /></a></div><div className="review-preview" aria-hidden="true"><svg className="review-preview-lines" viewBox="0 0 620 150" preserveAspectRatio="none"><path d="M75 82C160 22 205 25 285 72s105 43 165-8 92-42 100-15"/><path d="M285 72c20-33 34-44 58-51"/></svg><div className="review-mini-card review-mini-card-one"><span/><i/><i/><b/></div><div className="review-mini-card review-mini-card-two"><span/><i/><i/><b/></div><div className="review-mini-card review-mini-card-three"><span/><i/><i/><b/></div></div>
        </div>
      </section></ScrollReveal>
      <ScrollReveal><section className="cta-section container" id="contact"><div className="final-banner"><Doodle className="cta-star"/><span className="eyebrow">ТЕПЕРЬ ТВОЯ ОЧЕРЕДЬ</span><h2>В голове хаос?<br/><span>Давай наведём порядок.</span></h2><p>Начнём с знакомства. Расскажешь, что пока не получается,<br className="desktop-br"/> а я помогу понять, куда двигаться дальше.</p><button className="button button-dark" onClick={()=>startBooking()}>Хочу на занятия <ArrowUpRight size={22}/></button><span className="hand cta-note">первый шаг — вот здесь</span><Sticker kind="flower" className="cta-flower"/></div></section></ScrollReveal>
    </main>
    <SiteFooter />
  </>;
}
