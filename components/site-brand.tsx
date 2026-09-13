import Link from "next/link";

export function SiteBrand({ footer = false }: { footer?: boolean }) {
  return (
    <Link href="/" className={`brand${footer ? " footer-brand" : ""}`} aria-label="Бесслов — на главную">
      <span className="brand-name">бесслов</span>
    </Link>
  );
}
