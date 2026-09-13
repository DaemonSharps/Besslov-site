import { sendTelegramMessage } from "@/lib/telegram";

type TelegramUpdate = {
  message?: {
    chat?: { id?: number | string };
    text?: string;
  };
};

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const suppliedSecret = request.headers.get("x-telegram-bot-api-secret-token");
  if (!secret || suppliedSecret !== secret) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return Response.json({ ok: false }, { status: 503 });
  }

  let update: TelegramUpdate;
  try {
    update = await request.json() as TelegramUpdate;
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const chatId = update.message?.chat?.id;
  const command = update.message?.text?.trim() || "";
  if (chatId === undefined) {
    return Response.json({ ok: true });
  }

  const isStart = /^\/start(?:@[^\s]+)?(?:\s|$)/i.test(command);
  const isChatId = /^\/chatid(?:@[^\s]+)?(?:\s|$)/i.test(command);
  if (!isStart && !isChatId) {
    return Response.json({ ok: true });
  }

  const responseText = isStart
    ? "Привет! Чтобы узнать chatid этого чата, вызови команду /chatid."
    : `Ваш chatid: ${chatId}`;

  try {
    await sendTelegramMessage(token, String(chatId), responseText);
  } catch {
    console.error(`Failed to respond to Telegram ${isStart ? "/start" : "/chatid"} command`);
  }

  return Response.json({ ok: true });
}
