import { enquirySchema } from "@/lib/enquiry-validation";
import { getTelegramChatIds, sendTelegramMessage } from "@/lib/telegram";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: "Отправь заявку с этой страницы." }, { status: 403, headers });
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return Response.json({ error: "Неизвестный формат заявки." }, { status: 415, headers });
  }
  if (Number(request.headers.get("content-length") || 0) > 4096) {
    return Response.json({ error: "Слишком длинная заявка." }, { status: 413, headers });
  }

  let value;
  try {
    const text = await request.text();
    if (text.length > 4096) {
      return Response.json({ error: "Слишком длинная заявка." }, { status: 413, headers });
    }
    value = enquirySchema.safeParse(JSON.parse(text));
  } catch {
    return Response.json({ error: "Не удалось прочитать заявку. Попробуй ещё раз." }, { status: 400, headers });
  }

  if (!value.success) {
    const issue = value.error.issues.find((item) => ["phone", "telegram", "subjects"].includes(String(item.path[0])));
    return Response.json(
      { error: issue?.message || "Проверь имя, контакты, направления, уровень хаоса и согласие." },
      { status: 400, headers },
    );
  }

  if (process.env.NODE_ENV === "development") {
    return Response.json({ ok: true, id: value.data.id }, { status: 201, headers });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = getTelegramChatIds();
  if (!token || chatIds.length === 0) {
    console.error("Telegram notification is not configured");
    return Response.json({ error: "Заявки временно недоступны. Попробуй ещё раз позже." }, { status: 503, headers });
  }

  const { id, name, phone, telegram, subjects, details, chaos } = value.data;
  const escapeTelegramHtml = (text: string) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const message = [
    "<b>Новая заявка с сайта «бесслов»</b>",
    "━━━━━━━━━━━━",
    "",
    `<b>Имя</b>\n${escapeTelegramHtml(name)}`,
    `<b>Направления</b>\n${subjects.map((subject) => `• ${escapeTelegramHtml(subject)}`).join("\n")}`,
    "",
    `<b>Контакты</b>\n📞 ${phone ? escapeTelegramHtml(phone) : "—"}\n✈️ Telegram: ${telegram ? escapeTelegramHtml(telegram) : "—"}`,
    "",
    `<b>Уровень хаоса</b>\n${escapeTelegramHtml(chaos)}`,
    `<b>Подробнее</b>\n${details ? escapeTelegramHtml(details) : "Не указано"}`,
    "",
    `<i>${new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })} (МСК)</i>`,
  ].join("\n");

  const results = await Promise.allSettled(chatIds.map((chatId) => sendTelegramMessage(token, chatId, message)));
  const delivered = results.filter((result) => result.status === "fulfilled").length;
  if (delivered === 0) {
    console.error("Failed to send Telegram notification to all configured chats");
    return Response.json({ error: "Не удалось отправить заявку. Попробуй ещё раз чуть позже." }, { status: 503, headers });
  }
  if (delivered < chatIds.length) {
    console.warn(`Telegram notification delivered to ${delivered} of ${chatIds.length} chats`);
  }

  return Response.json({ ok: true, id }, { status: 201, headers });
}
