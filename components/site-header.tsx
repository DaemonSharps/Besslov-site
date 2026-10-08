"use client";

import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { SiteBrand } from "@/components/site-brand";
import { useBooking } from "@/components/booking-shell";

export function SiteHeader({ reviews = false, fortune = false }: { reviews?: boolean; fortune?: boolean }) {
  const [mobileNav, setMobileNav] = useState(false);
  const { startBooking } = useBooking();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const prefix = reviews || fortune ? `${basePath}/` : "";
  return (
    <header className="site-header">
      <div className="header-inner container">
        <SiteBrand />
        <nav id="site-navigation" aria-label="Навигация" className={mobileNav ? "nav is-open" : "nav"}>
          {[["story", "Моя история"], ["lessons", "Занятия"], ["method", "Как всё устроено"], ["formats", "Форматы"]].map(([id, label]) => (
            <a key={id} onClick={() => setMobileNav(false)} href={`${prefix}#${id}`}>{label}</a>
          ))}
          <a href={`${basePath}/reviews`} onClick={() => setMobileNav(false)} aria-current={reviews ? "page" : undefined}>Отзывы</a>
          <a href={`${basePath}/fortune`} onClick={() => setMobileNav(false)} aria-current={fortune ? "page" : undefined}>Рулетка</a>
        </nav>
        <button className="button button-pink header-cta" onClick={() => { setMobileNav(false); startBooking(); }}>
          Давай знакомиться <ArrowUpRight size={17} />
        </button>
        <button className="menu-toggle" onClick={() => setMobileNav(!mobileNav)} aria-controls="site-navigation" aria-expanded={mobileNav} aria-label={mobileNav ? "Закрыть меню" : "Открыть меню"}>
          {mobileNav ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
