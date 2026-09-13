# AGENTS.md — Besslov

Инструкции для AI-агентов и разработчиков сайта «бесслов».

## Контекст

Это публичный русскоязычный сайт преподавателя для 8–11 классов. Production: https://besslov.vercel.app. Основные сценарии: главная, `/reviews`, открытие формы и отправка заявки.

Не добавляйте вымышленные отзывы, оценки, цены, контакты или фотографии. Публикуйте только материалы, предоставленные владельцем и разрешённые к публикации.

## Команды

Требуется Node.js >= 22.13.0 и pnpm 11.

```sh
pnpm install
pnpm exec next dev
pnpm build
pnpm lint
```

- Перед завершением TS/TSX-изменений запускайте `pnpm build` и `pnpm lint`.
- Автоматических тестов нет: вручную проверьте `/`, `/reviews`, форму, keyboard navigation и mobile layout.
- Не редактируйте `pnpm-lock.yaml` вручную.
- Не коммитьте секреты, `.env*`, `.vercel/`, `.next/` или `node_modules/`.

## Структура

- `app/page.tsx` — главная страница и client-side состояние формы.
- `app/reviews/page.tsx` — разметка отзывов.
- `app/reviews/stories.ts` — типы и единственный источник историй учеников.
- `app/api/enquiries/route.ts` — server-side валидация и рассылка заявок.
- `app/api/telegram/webhook/route.ts` — защищённый Telegram webhook и команды `/start`, `/chatid`.
- `instrumentation.ts` — автоматическая регистрация webhook через `setWebhook` при старте Node.js-приложения.
- `components/` — site chrome и UI-примитивы.
- `lib/telegram.ts` — разбор списка администраторских chat ID и вызов Telegram API.
- `lib/` — Zod-схема заявки и утилиты.
- `public/assets/` — изображения и локальные шрифты.
- `app/globals.css` — токены, типографика и responsive rules.

Используйте App Router и alias `@/*`. По умолчанию создавайте Server Components; `"use client"` добавляйте только для state, effects, events или browser API.

## Заявки и Telegram

Клиент отправляет JSON на `POST /api/enquiries`. Сохраняйте:

- проверку same-origin;
- проверку content type и лимит размера;
- строгую Zod-схему из `lib/enquiry-validation.ts`;
- honeypot `website`;
- UUID `id` для идемпотентности;
- нейтральные ошибки без внутренних деталей.

После успешной валидации маршрут рассылает сообщение через Telegram Bot API `sendMessage` во все ID из `TELEGRAM_CHAT_IDS`. Значения разделяются запятой или новой строкой. `TELEGRAM_CHAT_ID` допустим только как legacy fallback для одного чата.

Переменные окружения:

- `TELEGRAM_BOT_TOKEN`;
- `TELEGRAM_CHAT_IDS`;
- `TELEGRAM_WEBHOOK_SECRET`.

Webhook находится по адресу `/api/telegram/webhook`. При каждом старте Node.js-приложение повторно регистрирует этот URL через Telegram `setWebhook`. Он принимает только запросы с заголовком `X-Telegram-Bot-Api-Secret-Token`, равным `TELEGRAM_WEBHOOK_SECRET`, и отвечает на `/chatid` ID текущего чата. После публикации webhook нужно зарегистрировать методом `setWebhook`.

Никогда не используйте переменные в client component, `NEXT_PUBLIC_*`, HTML или логах. Не логируйте полное тело заявки. Если все отправки не удались или variables не заданы, верните HTTP 503 без внутренних деталей.

## UI и контент

- Заголовки и основной текст используют Golos Text.
- Caveat оставлен только для декоративных рукописных акцентов и логотипа.
- Balsamiq Sans запрещён и не должен возвращаться в CSS, assets или dependencies.
- Для `.woff2` в `public/assets/fonts.css` используйте `format('woff2')`.
- Используйте CSS tokens `--pink`, `--lime`, `--blue`, `--ink`, `--paper`; не размножайте произвольные цвета.
- Сохраняйте focus-visible, aria labels, keyboard access и alt text.
- Новые истории должны содержать четыре этапа: старт, разбор ситуации, подготовка, результат. Реальные фотографии и цитаты требуют разрешения.

## Конфигурация

- `package.json` — scripts и dependencies; build должен оставаться `next build`.
- `next.config.ts` — настройки Next.js.
- `tsconfig.json` — strict TypeScript и alias.
- `postcss.config.mjs` — Tailwind PostCSS.
- `components.json` — aliases shadcn/ui.
- `eslint.config.mjs` — lint rules.
- `.npmrc` — безопасные настройки package manager.

Не добавляйте обратно удалённые конфигурации хранения данных, SQL-файлы или каталоги миграций. Вся отправка заявок должна идти через server-side route.

## Git и Vercel

Репозиторий: https://github.com/DaemonSharps/Besslov-site, branch `main`. Push запускает production deploy в Vercel.

Перед push:

1. Просмотрите diff и не перезаписывайте несвязанные изменения.
2. Сделайте небольшой тематический commit.
3. Запустите build и lint.
4. Проверьте Vercel build status и production URL.

## Definition of done

- Изменены только необходимые файлы.
- Build и lint проходят либо внешняя блокировка явно описана.
- Проверены desktop/mobile и затронутые маршруты.
- Нет секретов, персональных данных или вымышленных отзывов.
- Telegram notification проверена на тестовом чате, если менялся API route.
- Production deploy имеет READY после push в `main`.

Поддерживайте этот файл актуальным при изменении команд, маршрутов, переменных окружения, процесса деплоя или ключевых ограничений.
