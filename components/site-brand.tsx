export function SiteBrand({ footer = false }: { footer?: boolean }) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return (
    // A full navigation prevents Next.js from restoring the scroll position from the source route.
    // eslint-disable-next-line @next/next/no-html-link-for-pages
    <a
      href={`${basePath}/`}
      className={`brand${footer ? " footer-brand" : ""}`}
      aria-label="Бесслов — на главную"
    >
      <span className="brand-name">бесслов</span>
    </a>
  );
}
