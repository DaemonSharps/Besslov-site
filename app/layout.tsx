import type { Metadata } from "next";
import localFont from "next/font/local";
import { CookieNotice } from "@/components/cookie-notice";
import { BookingProvider } from "@/components/booking-shell";
import "./globals.css";

const golos = localFont({
  src: [
    { path: "./fonts/golos-text-regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/golos-text-medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/golos-text-semibold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/golos-text-bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-golos",
  display: "swap",
  preload: true,
});

const caveat = localFont({
  src: [{ path: "./fonts/caveat-bold.woff2", weight: "700", style: "normal" }],
  variable: "--font-caveat",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Бесслов — русский и литература по-человечески",
  description: "Индивидуальные онлайн-занятия по русскому языку и литературе для 8–11 классов. ЕГЭ, ОГЭ, сочинения и пробники. Разложим всё по полочкам.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${golos.variable} ${caveat.variable}`}>
      <body className="antialiased">
        <BookingProvider>{children}</BookingProvider>
        <CookieNotice />
      </body>
    </html>
  );
}
