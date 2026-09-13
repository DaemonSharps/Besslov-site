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
    console.warn("[telegram-webhook] unauthorized request", {
      secretConfigured: Boolean(secret),
      secretHeaderPresent: Boolean(suppliedSecret),
    });
    return Response.json({ ok: false }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error("[telegram-webhook] TELEGRAM_BOT_TOKEN is missing");
    return Response.json({ ok: false }, { status: 503 });
  }

  let update: TelegramUpdate;
  try {
    update = await request.json() as TelegramUpdate;
  } catch {
    console.error("[telegram-webhook] invalid JSON update");
    return Response.json({ ok: false }, { status: 400 });
  }

  const chatId = update.message?.chat?.id;
  const command = update.message?.text?.trim() || "";
  const isStart = /^\/start(?:@[^\s]+)?(?:\s|$)/i.test(command);
  const isChatId = /^\/chatid(?:@[^\s]+)?(?:\s|$)/i.test(command);
  console.info("[telegram-webhook] update received", {
    hasMessage: Boolean(update.message),
    hasChatId: chatId !== undefined,
    hasText: Boolean(command),
    isStart,
    isChatId,
  });

  if (chatId === undefined) {
    console.info("[telegram-webhook] update ignored: no chat id");
    return Response.json({ ok: true });
  }

  if (!isStart && !isChatId) {
    console.info("[telegram-webhook] update ignored: unsupported command");
    return Response.json({ ok: true });
  }

  const responseText = isStart
    ? "Привет! Чтобы узнать chatid этого чата, вызови команду /chatid."
    : `Ваш chatid: ${chatId}`;

  try {
    await sendTelegramMessage(token, String(chatId), responseText);
    console.info("[telegram-webhook] command response sent", {
      command: isStart ? "/start" : "/chatid",
    });
  } catch {
    console.error("[telegram-webhook] command response failed", {
      command: isStart ? "/start" : "/chatid",
    });
  }

  return Response.json({ ok: true });
}
