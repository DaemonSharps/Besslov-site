# AGENTS.md — «бесслов»

Публичный русскоязычный сайт преподавателя для 8–11 классов. Production: https://besslov.vercel.app.

## Рабочий цикл

- Требуются Node.js `>=22.13.0` и pnpm `11.25.0`.
- Основные команды:

  ```sh
  pnpm install
  pnpm dev
  pnpm build
  pnpm lint
  ```

- Автотестов, отдельного `typecheck`-скрипта и CI-конфигурации нет: для TS/TSX-изменений обязательны `pnpm build` и `pnpm lint`.
- Для затронутого UI вручную проверьте `/`, `/reviews`, `/fortune`, форму заявки, keyboard/focus navigation и мобильную вёрстку.
- Не редактируйте `pnpm-lock.yaml` вручную. pnpm workspace задаёт строгую политику установки зависимостей.
- `main` разворачивается Vercel; перед push проверьте diff, затем build и lint. Не коммитьте `.env*`, `.vercel/`, `.next/`, `node_modules/` и другие build/runtime-артефакты.

## Устройство

- Next.js App Router, strict TypeScript и alias `@/*`. По умолчанию используйте Server Components; `"use client"` — только для состояния, effects, событий или browser API.
- `app/page.tsx` — главная и заявка; `app/reviews/stories.ts` — единственный production-источник историй; `app/fortune/` — страница рулетки.
- `app/api/enquiries/route.ts` — server-side обработка заявок; `app/api/telegram/webhook/route.ts` — webhook; `instrumentation.ts` регистрирует webhook только при Node.js-старте.
- Глобальные entrypoints стилей — `app/globals.scss` и `app/tailwind.css`; токены находятся в `styles/_tokens.scss`. Шрифты из `app/fonts/` подключаются в `app/layout.tsx` через `next/font/local`.

## Заявки и Telegram

- Не ослабляйте same-origin, JSON/content-size (4096 bytes), строгую Zod-валидацию, honeypot `website`, UUID `id` и нейтральные ошибки в `POST /api/enquiries`.
- Секреты — только server-side: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_IDS`, `TELEGRAM_WEBHOOK_SECRET`; `TELEGRAM_CHAT_ID` — legacy fallback. Никогда не добавляйте их в browser-код, `NEXT_PUBLIC_*`, HTML или логи и не логируйте полное тело заявки.
- В development заявка намеренно завершается успехом без Telegram. В production отсутствие конфигурации или нулевая доставка должны возвращать `503`; частичная доставка остаётся успешной.
- Webhook принимает только заголовок `X-Telegram-Bot-Api-Secret-Token`, равный секрету, и поддерживает `/start` и `/chatid`. Авто-регистрация использует HTTPS `TELEGRAM_WEBHOOK_URL` или production URL; не отключайте её и не логируйте содержимое update.

## Контент и дизайн

- Перед изменением текстов читайте `.agents/redpolitika.md`. Не добавляйте неподтверждённые результаты, оценки, цены, статистику, отзывы, контакты, личные детали или фото; реальные материалы требуют разрешения владельца.
- Истории сохраняют смысловые фазы `start`, `analysis`, `preparation`, `result`; число шагов в фазе свободно. Демо-истории разрешены только при явном development opt-in и не должны попасть в production output.
- Основной шрифт — Golos Text; Caveat — только декоративный акцент/логотип. Не возвращайте Balsamiq Sans.
- Используйте существующие CSS-токены (`--pink`, `--lime`, `--blue`, `--ink`, `--paper`) и сохраняйте `focus-visible`, aria-метки, клавиатурный доступ и alt-тексты.
