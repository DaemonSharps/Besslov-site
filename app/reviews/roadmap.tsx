"use client";

import { useEffect, useRef, useState } from "react";
import type { StudentStory } from "./stories";
import styles from "./roadmap.module.css";

const phaseLabels = {
  start: "точка старта",
  analysis: "разбор",
  preparation: "подготовка",
  result: "результат",
} as const;

type RoadmapRect = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

type RoadmapPoint = {
  x: number;
  y: number;
};

type RoadmapConnection = {
  path: string;
  ports: [RoadmapPoint, RoadmapPoint];
};

type RoadmapGeometry = {
  viewBox: string;
  connections: RoadmapConnection[];
};

const round = (value: number) => {
  const rounded = Math.round(value * 100) / 100;
  return Object.is(rounded, -0) ? 0 : rounded;
};

const point = (x: number, y: number): RoadmapPoint => ({ x: round(x), y: round(y) });

const verticalRangesOverlap = (first: RoadmapRect, second: RoadmapRect) =>
  first.top < second.bottom && second.top < first.bottom;

function roundedLanePath(
  source: RoadmapPoint,
  target: RoadmapPoint,
  laneY: number,
) {
  const verticalDirection = Math.sign(laneY - source.y);
  const targetDirection = Math.sign(target.y - laneY);
  const horizontalDirection = Math.sign(target.x - source.x) || 1;
  const radius = round(Math.min(
    16,
    Math.abs(laneY - source.y) / 2,
    Math.abs(target.y - laneY) / 2,
    Math.abs(target.x - source.x) / 2,
  ));

  if (!radius) {
    return `M ${source.x} ${source.y} L ${source.x} ${round(laneY)} L ${target.x} ${round(laneY)} L ${target.x} ${target.y}`;
  }

  const lane = round(laneY);
  const sourceTurnY = round(laneY - verticalDirection * radius);
  const sourceTurnX = round(source.x + horizontalDirection * radius);
  const targetTurnX = round(target.x - horizontalDirection * radius);
  const targetTurnY = round(laneY + targetDirection * radius);

  return [
    `M ${source.x} ${source.y}`,
    `L ${source.x} ${sourceTurnY}`,
    `Q ${source.x} ${lane} ${sourceTurnX} ${lane}`,
    `L ${targetTurnX} ${lane}`,
    `Q ${target.x} ${lane} ${target.x} ${targetTurnY}`,
    `L ${target.x} ${target.y}`,
  ].join(" ");
}

function makeConnection(
  source: RoadmapRect,
  target: RoadmapRect,
  rects: RoadmapRect[],
): RoadmapConnection | null {
  const sourceCenterY = (source.top + source.bottom) / 2;
  const targetCenterY = (target.top + target.bottom) / 2;
  const horizontalGapToRight = target.left - source.right;
  const horizontalGapToLeft = source.left - target.right;

  if (verticalRangesOverlap(source, target) && horizontalGapToRight >= 0) {
    const sourcePort = point(source.right, sourceCenterY);
    const targetPort = point(target.left, targetCenterY);
    const midX = round((sourcePort.x + targetPort.x) / 2);
    return {
      path: `M ${sourcePort.x} ${sourcePort.y} C ${midX} ${sourcePort.y}, ${midX} ${targetPort.y}, ${targetPort.x} ${targetPort.y}`,
      ports: [sourcePort, targetPort],
    };
  }

  if (verticalRangesOverlap(source, target) && horizontalGapToLeft >= 0) {
    const sourcePort = point(source.left, sourceCenterY);
    const targetPort = point(target.right, targetCenterY);
    const midX = round((sourcePort.x + targetPort.x) / 2);
    return {
      path: `M ${sourcePort.x} ${sourcePort.y} C ${midX} ${sourcePort.y}, ${midX} ${targetPort.y}, ${targetPort.x} ${targetPort.y}`,
      ports: [sourcePort, targetPort],
    };
  }

  const sourceAboveTarget = source.bottom <= target.top;
  const sourceOverlappingRow = rects.filter((rect) => verticalRangesOverlap(source, rect));
  const targetOverlappingRow = rects.filter((rect) => verticalRangesOverlap(target, rect));

  if (sourceAboveTarget) {
    const sourceRowBottom = Math.max(...sourceOverlappingRow.map((rect) => rect.bottom));
    const targetRowTop = Math.min(...targetOverlappingRow.map((rect) => rect.top));
    if (!(targetRowTop > sourceRowBottom)) return null;

    const sourcePort = point((source.left + source.right) / 2, source.bottom);
    const targetPort = point((target.left + target.right) / 2, target.top);
    const laneY = round((sourceRowBottom + targetRowTop) / 2);
    return {
      path: roundedLanePath(sourcePort, targetPort, laneY),
      ports: [sourcePort, targetPort],
    };
  }

  const targetRowBottom = Math.max(...targetOverlappingRow.map((rect) => rect.bottom));
  const sourceRowTop = Math.min(...sourceOverlappingRow.map((rect) => rect.top));
  if (!(sourceRowTop > targetRowBottom)) return null;

  const sourcePort = point((source.left + source.right) / 2, source.top);
  const targetPort = point((target.left + target.right) / 2, target.bottom);
  const laneY = round((targetRowBottom + sourceRowTop) / 2);
  return {
    path: roundedLanePath(sourcePort, targetPort, laneY),
    ports: [sourcePort, targetPort],
  };
}

function measureGeometry(roadmap: HTMLDivElement): RoadmapGeometry | null {
  const bounds = roadmap.getBoundingClientRect();
  if (!Number.isFinite(bounds.width) || !Number.isFinite(bounds.height)) return null;

  const rects = [...roadmap.querySelectorAll<HTMLElement>("[data-roadmap-step]")].map((element) => {
    const rect = element.getBoundingClientRect();
    return {
      left: round(rect.left - bounds.left),
      right: round(rect.right - bounds.left),
      top: round(rect.top - bounds.top),
      bottom: round(rect.bottom - bounds.top),
    };
  });

  return {
    viewBox: `0 0 ${round(Math.max(1, bounds.width))} ${round(Math.max(1, bounds.height))}`,
    connections: rects.slice(0, -1).flatMap((source, sourceIndex) => {
      const connection = makeConnection(source, rects[sourceIndex + 1], rects);
      return connection ? [connection] : [];
    }),
  };
}

function sameGeometry(first: RoadmapGeometry, second: RoadmapGeometry) {
  return first.viewBox === second.viewBox
    && first.connections.length === second.connections.length
    && first.connections.every((connection, index) => connection.path === second.connections[index].path);
}

function StoryRoadmap({ story, index }: { story: StudentStory; index: number }) {
  const roadmapRef = useRef<HTMLDivElement>(null);
  const [geometry, setGeometry] = useState<RoadmapGeometry | null>(null);
  const layoutVariant = index % 3;

  useEffect(() => {
    const roadmap = roadmapRef.current;
    if (!roadmap) return;

    let disposed = false;
    let frame: number | null = null;
    const measure = () => {
      if (disposed) return;
      const nextGeometry = measureGeometry(roadmap);
      if (!nextGeometry) return;
      setGeometry((currentGeometry) => (
        currentGeometry && sameGeometry(currentGeometry, nextGeometry)
          ? currentGeometry
          : nextGeometry
      ));
    };
    const scheduleMeasure = () => {
      if (disposed || frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        measure();
      });
    };

    scheduleMeasure();
    const observer = new ResizeObserver(scheduleMeasure);
    const list = roadmap.querySelector<HTMLOListElement>("ol");
    observer.observe(roadmap);
    if (list) observer.observe(list);
    roadmap.querySelectorAll<HTMLElement>("[data-roadmap-step]").forEach((element) => observer.observe(element));
    window.addEventListener("resize", scheduleMeasure);

    if (document.fonts) {
      document.fonts.ready.then(() => {
        if (!disposed) scheduleMeasure();
      });
    }

    return () => {
      disposed = true;
      observer.disconnect();
      if (frame !== null) window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [story.steps, layoutVariant]);

  const storyVariant = ["", styles.story1, styles.story2][layoutVariant];

  return (
    <article className={[styles.story, storyVariant].filter(Boolean).join(" ")} aria-labelledby={`${story.id}-title`}>
      <header className={styles.header}>
        <span className={styles.context}>{story.context}</span>
        <h2 id={`${story.id}-title`}>{story.title}</h2>
        <p>{story.student}</p>
      </header>

      <div className={styles.roadmap} ref={roadmapRef}>
        {geometry && (
          <svg className={styles.line} viewBox={geometry.viewBox} preserveAspectRatio="none" aria-hidden="true">
            {geometry.connections.map((connection, connectionIndex) => (
              <path key={`${story.id}-connection-${connectionIndex}`} d={connection.path} pathLength="1" />
            ))}
            {geometry.connections.flatMap((connection, connectionIndex) => (
              connection.ports.map((port, portIndex) => (
                <circle
                  key={`${story.id}-port-${connectionIndex}-${portIndex}`}
                  cx={port.x}
                  cy={port.y}
                  fill="var(--pink)"
                  stroke="var(--paper)"
                  strokeWidth={3}
                  r={6}
                  aria-hidden="true"
                />
              ))
            ))}
          </svg>
        )}
        <ol className={styles.steps}>
          {story.steps.map((step, stepIndex) => (
            <li
              className={[styles.step, step.phase === "start" ? "" : styles[step.phase]].filter(Boolean).join(" ")}
              data-roadmap-step
              key={`${story.id}-${step.phase}-${stepIndex}`}
            >
              <span className={styles.phase} aria-label={phaseLabels[step.phase]}>
                {step.phase === "start" ? "начало" : step.phase === "analysis" ? "почему" : step.phase === "preparation" ? "практика" : "итог"}
              </span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>

      {story.feedback.text && (
        <aside className={styles["review-feedback"]} aria-label="Полный отзыв">
          <span className={styles.feedbackLabel}>Отзыв</span>
          <blockquote>
            {story.feedback.text.split(/\n\n/).filter(Boolean).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </blockquote>
          <cite className={styles.cite}>{story.feedback.author}</cite>
        </aside>
      )}
    </article>
  );
}

export function Roadmaps({ stories }: { stories: StudentStory[]; demo?: boolean }) {
  return (
    <div className={styles.list}>
      {stories.map((story, index) => (
        <div key={story.id} className={styles.item}>
          {story.isDemo && <div className={styles.demoFlag}>Демо — вымышленная история</div>}
          <StoryRoadmap story={story} index={index} />
        </div>
      ))}
    </div>
  );
}
