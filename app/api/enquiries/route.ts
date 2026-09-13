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
    return Response.json(
      { error: value.error.issues.find((issue) => issue.path[0] === "contact")?.message || "Проверь имя, контакт, уровень хаоса и согласие." },
      { status: 400, headers },
    );
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = getTelegramChatIds();
  if (!token || chatIds.length === 0) {
    console.error("Telegram notification is not configured");
    return Response.json({ error: "Заявки временно недоступны. Попробуй ещё раз позже." }, { status: 503, headers });
  }

  const { id, name, contact, chaos, format } = value.data;
  const message = [
    "Новая заявка с сайта «бесслов»",
    "",
    `Имя: ${name}`,
    `Контакт: ${contact}`,
    `Направление: ${format}`,
    `Уровень хаоса: ${chaos}`,
    `ID заявки: ${id}`,
    `Время: ${new Date().toISOString()}`,
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
