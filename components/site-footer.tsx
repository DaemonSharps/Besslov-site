import { SiteBrand } from "@/components/site-brand";

export function SiteFooter() {
  return (
    <footer className="footer container">
      <SiteBrand footer />
      <p>Русский язык. Литература.<br />И немного любви к тому, что делаешь.</p>
      <a className="footer-reviews" href="/reviews">Отзывы учеников</a>
      <span className="footer-ending hand">До встречи на уроке ♡</span>
    </footer>
  );
}
