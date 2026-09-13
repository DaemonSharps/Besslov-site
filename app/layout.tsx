import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
