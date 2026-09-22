"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Check, Download, ExternalLink, RotateCw } from "lucide-react";
import { REQUIRED_COOKIE } from "@/components/cookie-notice";
import styles from "./fortune.module.scss";

const FORTUNE_COOKIE = "besslov_fortune";
const FORTUNE_ATTEMPTS_KEY = "besslov_fortune_attempts";
const FORTUNE_RESET_EVENT = "besslov:fortune-reset";
const SPIN_MAX_AGE = 60 * 60 * 24 * 30;
const REQUIRED_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

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

function normalizeAttempts(value: unknown) {
  const attempts = typeof value === "string" ? Number(value) : value;
  return typeof attempts === "number" && Number.isInteger(attempts) && attempts >= 0 && attempts <= 2 ? attempts : null;
}

export function FortuneWheel() {
  const [cookieReady, setCookieReady] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<Prize | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const spinTimeout = useRef<number | null>(null);

  useEffect(() => {
    const syncStoredState = () => {
      const storedPrize = getCookie(FORTUNE_COOKIE);
      if (!getCookie(REQUIRED_COOKIE)) setCookie(REQUIRED_COOKIE, "1", REQUIRED_COOKIE_MAX_AGE);
      setCookieReady(Boolean(getCookie(REQUIRED_COOKIE)));

      const storedAttempts = normalizeAttempts(window.localStorage.getItem(FORTUNE_ATTEMPTS_KEY));
      const normalizedAttempts = storedAttempts ?? (storedPrize && storedPrize !== "ready" ? 0 : 1);
      window.localStorage.setItem(FORTUNE_ATTEMPTS_KEY, String(normalizedAttempts));
      setAttempts(normalizedAttempts);

      if (storedPrize && storedPrize !== "ready") {
        setResult(prizes.find(prize => prize.id === storedPrize) ?? null);
      }
    };

    const handleFortuneReset = (event: Event) => {
      const detail = (event as CustomEvent<{ attempts?: unknown }>).detail;
      const normalizedAttempts = normalizeAttempts(detail?.attempts);
      if (normalizedAttempts === null) return;

      if (spinTimeout.current !== null) {
        window.clearTimeout(spinTimeout.current);
        spinTimeout.current = null;
      }
      setAttempts(normalizedAttempts);
      setResult(null);
      setSpinning(false);
      setRotation(0);
    };

    window.addEventListener(FORTUNE_RESET_EVENT, handleFortuneReset);
    const syncId = window.setTimeout(syncStoredState, 0);
    return () => {
      window.clearTimeout(syncId);
      window.removeEventListener(FORTUNE_RESET_EVENT, handleFortuneReset);
      if (spinTimeout.current !== null) window.clearTimeout(spinTimeout.current);
    };
  }, []);

  function spin() {
    if (!cookieReady || attempts <= 0 || spinning) return;

    const index = Math.floor(Math.random() * prizes.length);
    const prize = prizes[index];
    const targetRotation = 360 * 6 - (index * 60 + 30);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nextAttempts = attempts - 1;

    window.localStorage.setItem(FORTUNE_ATTEMPTS_KEY, String(nextAttempts));
    setCookie(FORTUNE_COOKIE, prize.id, SPIN_MAX_AGE);
    setAttempts(nextAttempts);
    setResult(null);
    setRotation(targetRotation);
    setSpinning(true);

    if (reducedMotion) {
      setSpinning(false);
      setResult(prize);
      return;
    }

    spinTimeout.current = window.setTimeout(() => {
      spinTimeout.current = null;
      setSpinning(false);
      setResult(prize);
    }, 2500);
  }

  const wheelStyle: WheelStyle = { "--wheel-rotation": `${rotation}deg` };
  const canSpin = cookieReady && attempts > 0 && !spinning;
  const buttonLabel = spinning ? "Колесо крутится" : result && attempts === 0 ? "Приз получен" : cookieReady ? attempts > 0 ? "Крутить!" : "Попытки закончились" : "Нужны cookie";

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
            {spinning ? <RotateCw className={styles.spinningIcon} size={25} aria-hidden="true" /> : result && attempts === 0 ? <Check size={25} aria-hidden="true" /> : buttonLabel}
          </button>
        </div>
      </div>

      <p className={styles.wheelHint} aria-live="polite">
        {spinning ? "Колесо выбирает твой бонус…" : result ? attempts > 0 ? `Приз ниже. Осталось попыток: ${attempts}.` : "Попытка использована. Загляни за призом ниже." : cookieReady ? `Осталось попыток: ${attempts}. Нажми на центр колеса.` : "Подожди, пока включатся обязательные cookie."}
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

    </div>
  );
}
