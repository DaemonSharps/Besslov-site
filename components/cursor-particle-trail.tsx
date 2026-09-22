"use client";

import { useEffect, useRef } from "react";
import styles from "./cursor-particle-trail.module.scss";

const MAX_PARTICLES = 28;
const MIN_SPAWN_INTERVAL = 34;

export function CursorParticleTrail() {
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trail = trailRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");

    if (!trail || reducedMotion.matches || coarsePointer.matches) {
      return;
    }

    let lastSpawn = 0;

    const clearParticles = () => {
      trail.replaceChildren();
    };

    const handlePreferenceChange = () => {
      if (reducedMotion.matches || coarsePointer.matches) {
        clearParticles();
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (
        event.pointerType !== "mouse" ||
        reducedMotion.matches ||
        coarsePointer.matches
      ) {
        return;
      }

      const now = performance.now();
      if (now - lastSpawn < MIN_SPAWN_INTERVAL) {
        return;
      }
      lastSpawn = now;

      if (trail.childElementCount >= MAX_PARTICLES) {
        trail.firstElementChild?.remove();
      }

      const particle = document.createElement("span");
      const style = particle.style;
      const tone = Math.random() > 0.55 ? "var(--lime)" : "var(--pink)";
      const spread = () => `${Math.round(Math.random() * 14 - 7)}px`;

      particle.className = styles.particle;
      style.setProperty("--particle-x", `${event.clientX + Math.random() * 8 - 4}px`);
      style.setProperty("--particle-y", `${event.clientY + Math.random() * 8 - 4}px`);
      style.setProperty("--particle-size", `${Math.round(Math.random() * 4 + 4)}px`);
      style.setProperty("--particle-color", tone);
      style.setProperty("--particle-drift-x", spread());
      style.setProperty("--particle-drift-y", spread());
      style.setProperty("--particle-duration", `${Math.round(Math.random() * 180 + 620)}ms`);
      particle.addEventListener("animationend", () => particle.remove(), { once: true });
      trail.appendChild(particle);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    reducedMotion.addEventListener("change", handlePreferenceChange);
    coarsePointer.addEventListener("change", handlePreferenceChange);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      reducedMotion.removeEventListener("change", handlePreferenceChange);
      coarsePointer.removeEventListener("change", handlePreferenceChange);
      clearParticles();
    };
  }, []);

  return <div ref={trailRef} className={styles.trail} aria-hidden="true" />;
}
