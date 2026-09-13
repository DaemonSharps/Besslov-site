export const storyStages = [
  { key: "start", number: "01", title: "С чем пришли", description: "Точка старта: что вызывало трудности и какую цель поставил ученик." },
  { key: "analysis", number: "02", title: "Разобрались в ситуации", description: "Что показал разбор знаний и работ, с чего решили начать и почему." },
  { key: "preparation", number: "03", title: "Готовились к работам", description: "Как проходили занятия, что практиковали и как разбирали ошибки." },
  { key: "result", number: "04", title: "К чему пришли", description: "Что изменилось: результаты работ, самостоятельность и отношение к предмету." },
] as const;

type Feedback = {
  author: string;
} & (
  | { text: string; image?: { src: string; alt: string } }
  | { text?: string; image: { src: string; alt: string } }
);

export type StudentStory = {
  id: string;
  title: string;
  student: string;
  context: string;
  stages: Record<(typeof storyStages)[number]["key"], string>;
  feedback: Feedback;
};

// Add only teacher-supplied stories and original feedback here.
// No student cases or testimonials have been supplied for publication yet.
export const studentStories: StudentStory[] = [];
