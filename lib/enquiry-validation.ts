import { z } from "zod";
const phone = z.string().trim().max(25).refine(value => !value || (/^\+?[\d\s()\-]+$/.test(value) && value.replace(/\D/g,"").length >= 10 && value.replace(/\D/g,"").length <= 15), "Проверь номер телефона: добавь код страны и оставь только цифры, пробелы, скобки или дефисы.");
const telegram = z.string().trim().max(33).refine(value => !value || /^@?[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(value), "Укажи ник в Telegram в формате @username.");
export const enquirySchema = z.object({
  id: z.string().uuid(), name: z.string().trim().min(2).max(80), phone, telegram,
  subjects: z.array(z.enum(["Русский язык","Литература","ЕГЭ / ОГЭ","Сочинения и пробники"])).min(1).max(4),
  details: z.string().trim().max(1200),
  chaos: z.enum(["Полный хаос","Есть вопросы","Почти порядок"]),
  consent: z.literal(true), website: z.string().max(0).nullable().optional(),
}).strict().refine(value => value.phone.length > 0 || value.telegram.length > 0, {message:"Укажи номер телефона или ник в Telegram — достаточно одного контакта.", path:["phone"]});
export type Enquiry = z.infer<typeof enquirySchema>;
