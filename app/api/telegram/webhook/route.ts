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
  if (chatId === undefined || !/^\/chatid(?:@[^\s]+)?(?:\s|$)/i.test(command)) {
    return Response.json({ ok: true });
  }

  try {
    await sendTelegramMessage(token, String(chatId), `Ваш chatid: ${chatId}`);
  } catch {
    console.error("Failed to respond to Telegram /chatid command");
  }

  return Response.json({ ok: true });
}
