import { z } from "zod";
const contact = z.string().trim().min(5).max(160).refine(value => /^@[a-zA-Z0-9_]{5,32}$/.test(value) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || (/^\+?[\d\s()\-]+$/.test(value) && value.replace(/\D/g,"").length >= 10 && value.replace(/\D/g,"").length <= 15), "Укажи Telegram в формате @username, телефон с кодом страны или email.");
export const enquirySchema = z.object({
  id: z.string().uuid(), name: z.string().trim().min(2).max(80), contact,
  chaos: z.enum(["Полный хаос","Есть вопросы","Почти порядок"]),
  format: z.enum(["Русский язык","Литература","ЕГЭ / ОГЭ","Сочинения и пробники","Помогите выбрать"]),
  consent: z.literal(true), website: z.string().max(0).nullable().optional(),
}).strict();
export type Enquiry = z.infer<typeof enquirySchema>;
