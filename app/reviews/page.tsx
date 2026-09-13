import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, MessageSquareText } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { studentStories, storyStages, type StudentStory } from "./stories";

export const metadata: Metadata = {
  title: "Отзывы и истории учеников — бесслов",
  description: "Истории учеников Бесслов: точка старта, разбор ситуации, подготовка к работам и результат. Отзывы о занятиях по русскому языку и литературе.",
};

function Story({ story, index }: { story: StudentStory; index: number }) {
  return (
    <article className="student-story" id={story.id} aria-labelledby={`${story.id}-title`}>
      <header className="student-story-heading">
        <span className="eyebrow">ИСТОРИЯ {String(index + 1).padStart(2, "0")} / {story.context}</span>
        <h2 id={`${story.id}-title`}>{story.title}</h2>
        <p className="story-student">{story.student}</p>
      </header>
      <div className="story-body">
        <ol className="story-timeline">
          {storyStages.map(stage => (
            <li className={`story-stage stage-${stage.key}`} key={stage.key}>
              <span className="story-step-number" aria-hidden="true">{stage.number}</span>
              <div><h3>{stage.title}</h3><p>{story.stages[stage.key]}</p></div>
            </li>
          ))}
        </ol>
        <figure className="student-feedback">
          <span className="tape tape-pink" aria-hidden="true" />
          <span className="eyebrow">СЛОВАМИ УЧЕНИКА</span>
          <MessageSquareText className="feedback-icon" size={32} aria-hidden="true" />
          {story.feedback.text && <blockquote><p>{story.feedback.text}</p></blockquote>}
          {story.feedback.image && (
            <a className="feedback-image-link" href={story.feedback.image.src} target="_blank" rel="noopener noreferrer">
              <img className="feedback-image" src={story.feedback.image.src} alt={story.feedback.image.alt} loading="lazy" />
              <span>Открыть фото отзыва <ArrowUpRight size={16} aria-hidden="true" /></span>
            </a>
          )}
          <figcaption>{story.feedback.author}</figcaption>
        </figure>
      </div>
    </article>
  );
}

export default function ReviewsPage() {
  return (
    <>
      <a className="skip-link" href="#main">Перейти к содержанию</a>
      <SiteHeader reviews />
      <main id="main" className="reviews-page">
        <section className="reviews-hero notebook">
          <div className="container">
            <Link className="reviews-back" href="/"><ArrowLeft size={17} aria-hidden="true" /> На главную</Link>
            <div className="reviews-intro">
              <div>
                <span className="eyebrow">ОТЗЫВЫ / ИСТОРИИ УЧЕНИКОВ</span>
                <h1>За результатом —<br /><span>целая история.</span></h1>
              </div>
              <p>С чего всё началось, как мы разбирались<br className="desktop-br" /> и к чему пришли.<br /><span className="hand">Шаг за шагом, вместе.</span></p>
            </div>
          </div>
        </section>
        <section className="stories-section container" aria-label="Истории учеников">
          {studentStories.length > 0 ? studentStories.map((story, index) => (
            <Story key={story.id} story={story} index={index} />
          )) : (
            <div className="stories-awaiting">
              <div className="reviews-status"><MessageSquareText size={21} aria-hidden="true" /><p>Отзывы пока не опубликованы. Здесь появятся истории учеников и их впечатления о занятиях.</p></div>
              <div className="student-story-heading">
                <span className="eyebrow">У КАЖДОЙ ИСТОРИИ — СВОЙ ПУТЬ</span>
                <h2>От точки старта<br />до <span className="underline-pink">результата</span></h2>
                <p className="story-structure-caption">О чём расскажет каждая история</p>
              </div>
              <div className="story-body">
                <ol className="story-timeline">
                  {storyStages.map(stage => (
                    <li className={`story-stage stage-${stage.key}`} key={stage.key}>
                      <span className="story-step-number" aria-hidden="true">{stage.number}</span>
                      <div><h3>{stage.title}</h3><p>{stage.description}</p></div>
                    </li>
                  ))}
                </ol>
                <aside className="student-feedback feedback-intro" aria-label="Отзыв в конце истории">
                  <span className="tape tape-pink" aria-hidden="true" />
                  <span className="eyebrow">СЛОВАМИ УЧЕНИКА</span>
                  <MessageSquareText className="feedback-icon" size={36} aria-hidden="true" />
                  <h3>А в конце —<br />личные впечатления</h3>
                  <p>Текст отзыва или его фотография: что запомнилось ученику и как он сам оценивает пройденный путь.</p>
                  <span className="hand">У каждого — свои слова ♡</span>
                </aside>
              </div>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
