"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { SiteBrand } from "@/components/site-brand";

export function SiteHeader({ onBooking, reviews = false, fortune = false }: { onBooking?: () => void; reviews?: boolean; fortune?: boolean }) {
  const [mobileNav, setMobileNav] = useState(false);
  const prefix = reviews || fortune ? "/" : "";
  return (
    <header className="site-header">
      <div className="header-inner container">
        <SiteBrand />
        <nav id="site-navigation" aria-label="Навигация" className={mobileNav ? "nav is-open" : "nav"}>
          {[["story", "Моя история"], ["lessons", "Занятия"], ["method", "Как всё устроено"], ["formats", "Форматы"]].map(([id, label]) => (
            <a key={id} onClick={() => setMobileNav(false)} href={`${prefix}#${id}`}>{label}</a>
          ))}
          <a href="/reviews" onClick={() => setMobileNav(false)} aria-current={reviews ? "page" : undefined}>Отзывы</a>
          <a href="/fortune" onClick={() => setMobileNav(false)} aria-current={fortune ? "page" : undefined}>Рулетка</a>
        </nav>
        {onBooking ? (
          <button className="button button-pink header-cta" onClick={() => { setMobileNav(false); onBooking(); }}>
            Давай знакомиться <ArrowUpRight size={17} />
          </button>
        ) : (
          <Link className="button button-pink header-cta" href="/#contact">Давай знакомиться <ArrowUpRight size={17} /></Link>
        )}
        <button className="menu-toggle" onClick={() => setMobileNav(!mobileNav)} aria-controls="site-navigation" aria-expanded={mobileNav} aria-label={mobileNav ? "Закрыть меню" : "Открыть меню"}>
          {mobileNav ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
