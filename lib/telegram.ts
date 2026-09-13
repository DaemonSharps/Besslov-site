export function getTelegramChatIds() {
  const configured = process.env.TELEGRAM_CHAT_IDS || process.env.TELEGRAM_CHAT_ID || "";
  return [...new Set(configured.split(/[,\n]/).map((value) => value.trim()).filter(Boolean))];
}

export async function sendTelegramMessage(token: string, chatId: string, text: string) {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    signal: AbortSignal.timeout(8000),
  });
  const result = await response.json() as { ok?: boolean };
  if (!response.ok || result.ok !== true) {
    throw new Error("Telegram API rejected the message");
  }
}
