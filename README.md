# Бесслов

Сайт преподавателя русского языка и литературы для 8–11 классов. Next.js-приложение с адаптивной главной страницей, страницей отзывов и формой заявки, которая отправляет сообщения в Telegram.

## Стек

- Next.js 16, React 19, TypeScript
- Tailwind CSS 4, PostCSS
- Radix UI и Lucide
- pnpm 11
- Telegram Bot API для уведомлений о заявках
- Vercel для production-деплоя

## Структура

```
app/
  layout.tsx                  корневой layout и SEO metadata
  page.tsx                    главная страница и форма заявки
  globals.css                глобальные стили и адаптив
  reviews/page.tsx            страница /reviews
  reviews/stories.ts          типы и истории учеников
  api/enquiries/route.ts      POST /api/enquiries и отправка в Telegram

components/
  site-header.tsx             шапка и навигация
  site-footer.tsx             подвал
  site-brand.tsx              текстовый логотип «бесслов»
  ui/                         переиспользуемые UI-компоненты

lib/
  enquiry-validation.ts       Zod-схема заявки
  utils.ts                    общие функции

public/
  assets/                     шрифты, изображения и текстуры
  favicon.svg                 favicon

vendor/
  shadcn-tailwind-4.13.0.css  локальные стили shadcn
```

Корневые настройки: `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `components.json`, `eslint.config.mjs`, `.npmrc`, `.gitignore`.

## Локальная разработка

Требуется Node.js `>=22.13.0`.

```sh
pnpm install
pnpm exec next dev
pnpm build
pnpm lint
```

Откройте адрес, который напечатает Next.js (обычно `http://localhost:3000`). Автоматических unit/E2E-тестов нет, поэтому UI-изменения нужно дополнительно проверить вручную на desktop и mobile, включая `/`, `/reviews` и форму.

## Заявки в Telegram

Браузер отправляет заявку на `POST /api/enquiries`. Сервер проверяет origin, тип и размер запроса, валидирует поля через Zod и вызывает официальный метод Telegram `sendMessage`.

В Vercel добавьте две переменные окружения:

- `TELEGRAM_BOT_TOKEN` — токен, выданный BotFather;
- `TELEGRAM_CHAT_ID` — ID чата или канала, куда бот может отправлять сообщения.

Значения добавляются в Vercel Project Settings → Environment Variables для Production и Preview. Их нельзя помещать в исходники, README, клиентский JavaScript или публичные issue.

Перед использованием:

1. Создайте бота через @BotFather.
2. Добавьте бота в нужный чат и выдайте ему право отправлять сообщения.
3. Узнайте `chat_id` выбранного чата.
4. Сохраните обе переменные в Vercel и выполните новый deploy.

Сообщение содержит имя, контакт, выбранное направление, уровень хаоса, UUID заявки и время отправки. Токен никогда не отправляется в браузер.

## Контент и дизайн

- Главный контент и CTA — `app/page.tsx`.
- Истории учеников — `app/reviews/stories.ts`; добавляйте только реальные истории и отзывы с разрешением на публикацию.
- Логотип и навигация — `components/site-brand.tsx`, `components/site-header.tsx`.
- Цвета, breakpoints и типографика — `app/globals.css`.
- Основной шрифт — Golos Text; декоративный — Caveat. Balsamiq Sans не используется.
- Локальные `.woff2` подключаются через `public/assets/fonts.css` с `format('woff2')`.

Не публикуйте контакты учеников, скриншоты переписок и фотографии несовершеннолетних без явного согласия.

## Деплой

Репозиторий: https://github.com/DaemonSharps/Besslov-site  
Ветка production: `main`  
Сайт: https://besslov.vercel.app

Push в `main` запускает Vercel deploy. Перед отправкой изменений выполните `pnpm build` и `pnpm lint` для затронутых TS/TSX-файлов. Секреты и файлы `.env*`, `.vercel/`, `.next/`, `node_modules/` не коммитятся.

## Безопасность

Сохраняйте server-side валидацию и honeypot-поле формы. Не логируйте полное тело заявки. Не добавляйте Telegram token в `NEXT_PUBLIC_*` или любой код, который выполняется в браузере.
