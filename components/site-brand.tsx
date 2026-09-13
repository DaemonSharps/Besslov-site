export function SiteBrand({ footer = false }: { footer?: boolean }) {
  return (
    <a href="/" className={`brand${footer ? " footer-brand" : ""}`} aria-label="Бесслов — на главную">
      <span className="brand-name">бесслов</span>
    </a>
  );
}
