"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Check, Download, ExternalLink, RotateCw } from "lucide-react";
import styles from "./fortune.module.css";

const FORTUNE_COOKIE = "besslov_fortune";
const CONSENT_COOKIE = "besslov_cookie_consent";
const SPIN_MAX_AGE = 60 * 60 * 24 * 30;
const CONSENT_MAX_AGE = 60 * 60 * 24 * 365;

type Prize = {
  id: string;
  title: string;
  description: string;
  action: "download" | "link";
  href: string;
  filename?: string;
};

const prizes: Prize[] = [
  { id: "cheat-sheet", title: "Шпаргалка", description: "Тестовый файл приза. Скоро здесь появится настоящая шпаргалка.", action: "download", href: "/assets/fortune-prize-placeholder.txt", filename: "besslov-shpargalka.txt" },
  { id: "checklist", title: "Чек-лист", description: "Тестовый файл приза. Скоро здесь появится полезный чек-лист.", action: "download", href: "/assets/fortune-prize-placeholder.txt", filename: "besslov-checklist.txt" },
  { id: "article", title: "Статья", description: "Тестовый файл приза. Скоро здесь появится новая статья.", action: "download", href: "/assets/fortune-prize-placeholder.txt", filename: "besslov-article.txt" },
  { id: "practice", title: "Практика", description: "Тестовый файл приза. Скоро здесь появятся задания для практики.", action: "download", href: "/assets/fortune-prize-placeholder.txt", filename: "besslov-practice.txt" },
  { id: "memo", title: "Памятка", description: "Тестовый файл приза. Скоро здесь появится памятка по теме.", action: "download", href: "/assets/fortune-prize-placeholder.txt", filename: "besslov-pamyatka.txt" },
  { id: "bonus", title: "Бонус", description: "Тестовый файл приза. Скоро здесь появится полезный бонус.", action: "download", href: "/assets/fortune-prize-placeholder.txt", filename: "besslov-bonus.txt" },
];

type WheelStyle = CSSProperties & {
  "--wheel-rotation"?: string;
  "--label-angle"?: string;
};

function getCookie(name: string) {
  const prefix = `${name}=`;
  const value = document.cookie.split("; ").find(cookie => cookie.startsWith(prefix))?.slice(prefix.length);
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

function setCookie(name: string, value: string, maxAge: number) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function FortuneWheel() {
  const [consent, setConsent] = useState<"unknown" | "accepted" | "declined">("unknown");
  const [result, setResult] = useState<Prize | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const syncStoredState = () => {
      const storedConsent = getCookie(CONSENT_COOKIE);
      const storedPrize = getCookie(FORTUNE_COOKIE);
      setConsent(storedConsent === "accepted" ? "accepted" : storedConsent === "declined" ? "declined" : "unknown");
      if (storedPrize && storedPrize !== "ready") {
        setResult(prizes.find(prize => prize.id === storedPrize) ?? null);
      }
    };
    const syncId = window.setTimeout(syncStoredState, 0);
    return () => window.clearTimeout(syncId);
  }, []);

  function allowCookies() {
    setCookie(CONSENT_COOKIE, "accepted", CONSENT_MAX_AGE);
    if (!getCookie(FORTUNE_COOKIE)) setCookie(FORTUNE_COOKIE, "ready", CONSENT_MAX_AGE);
    setConsent("accepted");
  }

  function declineCookies() {
    setCookie(CONSENT_COOKIE, "declined", CONSENT_MAX_AGE);
    setConsent("declined");
  }

  function spin() {
    if (consent !== "accepted" || spinning || result) return;

    const index = Math.floor(Math.random() * prizes.length);
    const prize = prizes[index];
    const targetRotation = 360 * 6 - (index * 60 + 30);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setCookie(FORTUNE_COOKIE, prize.id, SPIN_MAX_AGE);
    setRotation(targetRotation);
    setSpinning(true);

    if (reducedMotion) {
      setSpinning(false);
      setResult(prize);
      return;
    }

    window.setTimeout(() => {
      setSpinning(false);
      setResult(prize);
    }, 2500);
  }

  const wheelStyle: WheelStyle = { "--wheel-rotation": `${rotation}deg` };
  const canSpin = consent === "accepted" && !spinning && !result;
  const buttonLabel = result ? "Приз получен" : consent === "declined" ? "Нужны cookie" : "Крутить!";

  return (
    <div className={styles.wheelColumn}>
      <div className={styles.wheelStage}>
        <span className={styles.pointer} aria-hidden="true" />
        <div className={styles.wheelFrame}>
          <div className={styles.wheel} style={wheelStyle} role="img" aria-label="Колесо с шестью полезными бонусами">
            {prizes.map((prize, index) => (
              <span
                className={styles.wheelLabel}
                key={prize.id}
                style={{ "--label-angle": `${index * 60 + 30}deg` } as WheelStyle}
                aria-hidden="true"
              >
                {prize.title}
              </span>
            ))}
          </div>
          <button className={styles.wheelButton} type="button" onClick={spin} disabled={!canSpin} aria-label={buttonLabel}>
            {spinning ? <RotateCw className={styles.spinningIcon} size={25} aria-hidden="true" /> : result ? <Check size={25} aria-hidden="true" /> : buttonLabel}
          </button>
        </div>
      </div>

      <p className={styles.wheelHint} aria-live="polite">
        {spinning ? "Колесо выбирает твой бонус…" : result ? "Попытка использована. Загляни за призом ниже." : consent === "declined" ? "Разреши cookie, чтобы крутить рулетку." : "Нажми на центр колеса — попытка только одна."}
      </p>

      {result && (
        <section className={styles.resultCard} aria-live="polite" aria-labelledby="fortune-result-title">
          <span className="eyebrow">ТВОЙ ПРИЗ</span>
          <h2 id="fortune-result-title">{result.title}</h2>
          <p>{result.description}</p>
          {result.action === "download" ? (
            <a className="button button-pink" href={result.href} download={result.filename}>
              <Download size={18} aria-hidden="true" /> Скачать приз
            </a>
          ) : (
            <a className="button button-pink" href={result.href} target="_blank" rel="noopener noreferrer">
              Открыть приз <ExternalLink size={18} aria-hidden="true" />
            </a>
          )}
        </section>
      )}

      {consent !== "accepted" && (
        <aside className={styles.cookieBanner} role="dialog" aria-label="Настройки cookie">
          <div>
            <strong>Можно использовать cookie?</strong>
            <p>Они нужны, чтобы запомнить твою попытку и не дать крутить рулетку повторно в течение 30 дней.</p>
          </div>
          <div className={styles.cookieActions}>
            <button className="button button-pink" type="button" onClick={allowCookies}>Разрешить</button>
            <button className={styles.declineButton} type="button" onClick={declineCookies}>Не разрешать</button>
          </div>
        </aside>
      )}
    </div>
  );
}
