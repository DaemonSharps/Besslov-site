export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL || "https://besslov.vercel.app/api/telegram/webhook";

  if (!token || !secret) {
    console.warn("[telegram-webhook] auto-registration skipped: required environment variables are missing");
    return;
  }

  if (!webhookUrl.startsWith("https://")) {
    console.warn("[telegram-webhook] auto-registration skipped: webhook URL must use HTTPS");
    return;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: secret,
        allowed_updates: ["message"],
      }),
      signal: AbortSignal.timeout(8000),
    });
    const result = await response.json() as { ok?: boolean; description?: string };

    if (!response.ok || result.ok !== true) {
      console.error("[telegram-webhook] auto-registration failed", {
        status: response.status,
        description: result.description || "Telegram rejected the request",
      });
      return;
    }

    console.info("[telegram-webhook] registered", { webhookUrl });
  } catch {
    console.error("[telegram-webhook] auto-registration request failed");
  }
}
