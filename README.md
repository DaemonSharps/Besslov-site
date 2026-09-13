# Бесслов

Сайт преподавателя русского языка и литературы для 8–11 классов. Это Next.js-приложение с клиентской формой заявки, страницей отзывов и локальными/Cloudflare-интеграциями для хранения заявок.

## Стек

- **Next.js 16 + React 19** — маршрутизация App Router и UI.
- **TypeScript** — типизация исходников.
- **Tailwind CSS 4** и CSS-переменные — базовые utility-стили и дизайн-система.
- **Radix UI / `radix-ui`**, **Lucide** — доступные элементы формы и иконки.
- **pnpm 11** — менеджер зависимостей.
- **Drizzle ORM + SQLite/D1** — схема и запись заявок.
- **Vercel** — production-деплой из ветки `main`.

## Структура проекта

```
app/
  layout.tsx                 корневой layout и metadata
  page.tsx                   главная страница и форма заявки
  globals.css                глобальные стили, адаптив и дизайн-токены
  reviews/page.tsx           страница отзывов
  reviews/stories.ts         данные историй учеников
  api/enquiries/route.ts     POST /api/enquiries
  chatgpt-auth.ts            необязательные helpers Sign in with ChatGPT

components/
  site-header.tsx            шапка, навигация, ссылка на отзывы
  site-footer.tsx            подвал
  site-brand.tsx             текстовый логотип «бесслов»
  ui/                        переиспользуемые UI-компоненты формы

lib/
  enquiry-validation.ts      Zod-схема и ограничения заявки
  utils.ts                   cn() и вспомогательные функции

db/
  schema.ts                  таблица enquiries
  enquiries.ts               сохранение заявки в D1
  index.ts                   Drizzle-подключение к D1

public/
  assets/                    локальные шрифты, изображения, декоративные текстуры
  favicon.svg                favicon

drizzle/
  0000_nifty_power_pack.sql  SQL-миграция таблицы enquiries

Конфигурационные файлы:
  package.json               команды и зависимости
  pnpm-lock.yaml             зафиксированные версии пакетов
  pnpm-workspace.yaml        настройки pnpm workspace
  tsconfig.json               TypeScript, alias @/* -> корень проекта
  next.config.ts              конфигурация Next.js
  postcss.config.mjs         Tailwind через PostCSS
  components.json            aliases и настройки shadcn/ui
  drizzle.config.ts          настройки генерации Drizzle-миграций
  eslint.config.mjs          правила ESLint
  .npmrc                     общие настройки npm/pnpm
  .gitignore                 исключения Git
  vendor/                    локальный CSS-файл shadcn и license
```

## Конфигурация

### `package.json`

Главные команды:

- `pnpm install` — установить зависимости.
- `pnpm dev` — локальная разработка.
- `pnpm build` — production-сборка для Vercel.
- `pnpm lint` — проверка ESLint.
- `pnpm db:generate` — сгенерировать SQL после изменения `db/schema.ts`.

Версия Node задаётся в `engines.node` (сейчас `>=22.13.0`). Не меняйте `pnpm-lock.yaml` вручную: после изменения зависимостей запускайте `pnpm install`.

### `tsconfig.json`

- `strict: true` — строгая проверка TypeScript.
- `moduleResolution: bundler` — режим, совместимый с Next.js.
- `paths.@/*` — позволяет писать `@/components/...` вместо относительных путей.
- `types` подключает Node и Cloudflare Worker-типы.

### `next.config.ts`

Сейчас оставлен минимальным: Next.js использует значения по умолчанию. Дополнительные redirects, headers или image domains можно добавлять сюда.

### `postcss.config.mjs`

Подключает `@tailwindcss/postcss`. Tailwind импортируется в начале `app/globals.css`.

### `components.json`

Конфигурация генератора shadcn/ui. Важные aliases:

- `@/components` — компоненты;
- `@/components/ui` — UI;
- `@/lib` — утилиты;
- `@/hooks` — React hooks.

### `drizzle.config.ts`

Используется только для генерации миграций. После изменения схемы:

```sh
pnpm db:generate
```

Проверьте созданный SQL перед применением к production-базе.

## SQLite и заявки

SQLite здесь — не отдельный сервер и не файл, который нужно запускать вручную. Схема написана в формате SQLite через Drizzle, а в Cloudflare production она работает на **D1** — управляемой SQLite-совместимой базе.

Таблица `enquiries` хранит:

| Поле | Назначение |
|---|---|
| `id` | UUID заявки, primary key |
| `name` | имя ученика |
| `contact` | Telegram, телефон или email |
| `chaos` | выбранный уровень сложности |
| `format` | направление занятий |
| `consent` | согласие на обработку контакта |
| `created_at` | время создания |

Путь заявки: форма на `app/page.tsx` → `POST /api/enquiries` → Zod-проверка → `db/enquiries.ts` → D1.

### Что настроить для хранения

Для Sites/Cloudflare нужен binding с именем `DB`, указывающий на D1-базу. Затем примените миграцию `drizzle/0000_nifty_power_pack.sql` к production D1. Значение binding не кладётся в Git и не записывается в клиентский код.

На чистом Vercel без D1 страницы сайта собираются и открываются, но отправка формы не сможет сохранить заявку и вернёт ошибку доступности хранилища. Для формы на Vercel нужно заменить `db/enquiries.ts` на хранилище Vercel/SQL либо подключить совместимый backend.

## Локальный запуск

```sh
pnpm install
pnpm dev
```

Откройте адрес, который напечатает Next.js (обычно `http://localhost:3000`). Production-проверка:

```sh
pnpm build
```

## Деплой

Vercel подключён к репозиторию `DaemonSharps/Besslov-site` и ветке `main`. Каждый push в `main` запускает production-деплой. Публичный адрес: https://besslov.vercel.app

Не коммитьте:

- `.env*`, токены и ключи;
- `.vercel/`, `.next/`, `node_modules/`;
- локальные базы и содержимое `.wrangler/`.

## Где менять контент

- Главный экран и тексты — `app/page.tsx`.
- Истории отзывов — `app/reviews/stories.ts`.
- Разметка отзывов — `app/reviews/page.tsx`.
- Навигация и логотип — `components/site-header.tsx`, `components/site-brand.tsx`.
- Цвета, шрифты и адаптив — `app/globals.css`.
- Изображения и шрифты — `public/assets/`.
