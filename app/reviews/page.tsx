import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { studentStories } from "./stories";
import { Roadmaps } from "./roadmap";
import styles from "./roadmap.module.css";
import { ScrollReveal } from "@/components/scroll-reveal";

export const metadata: Metadata = {
  title: "Истории учеников — бесслов",
  description: "Личные истории занятий по русскому языку: от точки старта до результата.",
};

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const params = await searchParams;
  const demo = process.env.NODE_ENV === "development" && params.demo === "1";
  let stories = studentStories;
  if (demo) stories = [...stories, ...(await import("./demo-stories")).demoStories];

  return (
    <>
      <a className="skip-link" href="#main">Перейти к содержанию</a>
      <SiteHeader reviews />
      <main id="main" className={styles.page}>
        <ScrollReveal><section className={`${styles.hero} notebook`}>
          <div className="container">
            <h1>
              От точки старта
              <br />
              до результата
            </h1>
          </div>
        </section></ScrollReveal>
        <section className={`${styles.section} container`} aria-label="Истории учеников">
          <Roadmaps stories={stories} demo={demo} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
