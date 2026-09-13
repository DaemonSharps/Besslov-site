import type { Metadata } from "next";
import Link from "next/link";
import { Gift, Sparkles } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { FortuneWheel } from "./fortune-wheel";
import styles from "./fortune.module.css";

export const metadata: Metadata = {
  title: "Рулетка бонусов — бесслов",
  description: "Полезные материалы для учёбы от бесслов. Крути рулетку и забирай свой бонус.",
};

export default function FortunePage() {
  return (
    <>
      <a className="skip-link" href="#main">Перейти к содержанию</a>
      <SiteHeader fortune />
      <main id="main" className={styles.page}>
        <section className={`notebook ${styles.hero}`}>
          <div className={`container ${styles.heroInner}`}>
            <div className={styles.heroCopy}>
              <Link className={styles.backLink} href="/">← На главную</Link>
              <span className="eyebrow">БОНУСЫ ДЛЯ УЧЁБЫ / БЕЗ РЕГИСТРАЦИИ</span>
              <h1>Крути рулетку<br /><span>полезных бонусов</span></h1>
              <p className={styles.lead}>
                Забери материал, который поможет разобраться с русским языком и литературой.
                Одна попытка — один приз.
              </p>
              <div className={styles.heroNotes}>
                <span><Sparkles size={18} aria-hidden="true" /> Полезное для 8–11 классов</span>
                <span><Gift size={18} aria-hidden="true" /> Один бонус на 30 дней</span>
              </div>
            </div>
            <FortuneWheel />
          </div>
        </section>

        <section className={`container ${styles.prizesSection}`} aria-labelledby="prizes-title">
          <div className={styles.sectionHeading}>
            <div>
              <span className="eyebrow">ЧТО МОЖЕТ ВЫПАСТЬ</span>
              <h2 id="prizes-title">Шесть вариантов<br /><span>для твоей учёбы</span></h2>
            </div>
            <p>Материалы будут пополняться. Пока каждый сектор ведёт на тестовый файл, чтобы проверить механику.</p>
          </div>
          <div className={styles.prizeGrid}>
            {[
              ["01", "Шпаргалка", "Коротко о главном"],
              ["02", "Чек-лист", "Проверь себя по шагам"],
              ["03", "Статья", "Разберись в теме глубже"],
              ["04", "Практика", "Закрепи знания заданиями"],
              ["05", "Памятка", "Сохрани полезное рядом"],
              ["06", "Бонус", "Небольшой сюрприз для учёбы"],
            ].map(([number, title, text]) => (
              <article className={styles.prizePreview} key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
