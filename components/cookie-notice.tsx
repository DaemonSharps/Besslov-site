"use client";

import { useEffect, useState } from "react";

export const REQUIRED_COOKIE = "besslov_cookie_notice";
export const COOKIE_NOTICE_SEEN = "besslov_cookie_notice_seen";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function setCookie(name: string, value: string) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

function hasCookie(name: string) {
  return document.cookie.split("; ").some((cookie) => cookie.startsWith(`${name}=`));
}

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasCookie(REQUIRED_COOKIE)) setCookie(REQUIRED_COOKIE, "1");
    const visibilityTimer = window.setTimeout(() => {
      setVisible(!hasCookie(COOKIE_NOTICE_SEEN));
    }, 0);

    return () => window.clearTimeout(visibilityTimer);
  }, []);

  function dismiss() {
    setCookie(COOKIE_NOTICE_SEEN, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <aside className="cookie-notice" role="region" aria-label="Уведомление о cookie">
      <p>Мы используем cookie, чтобы сайт работал стабильно и был удобнее для вас.</p>
      <button className="cookie-notice-button" type="button" onClick={dismiss}>
        Понятно
      </button>
    </aside>
  );
}
