"use client";

import { useEffect, useRef } from "react";
import styles from "./scroll-reveal.module.scss";

/**
 * Keeps the server-rendered content visible until the browser can observe it.
 * This is deliberately small: the reveal is a progressive enhancement, not
 * a prerequisite for reading or navigating the site.
 */
export function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.dataset.revealReady = "true";

    const reveal = () => element.dataset.revealed = "true";
    if (typeof IntersectionObserver === "undefined") {
      reveal();
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      reveal();
      observer.disconnect();
    }, { threshold: 0.12, rootMargin: "0px 0px -7%" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={`${styles.reveal} ${className}`} style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}>{children}</div>;
}
