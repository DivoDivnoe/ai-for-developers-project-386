# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Принципы работы

- **Всё общение — на русском языке**: комментарии, планы, описания коммитов, PR, ответы пользователю.
- Устраняй причины проблем, а не симптомы.
- Не рефакторь и не улучшай код, не связанный с задачей.

## Проект

Call Booking — учебный проект по мотивам Cal.com для бронирования слотов звонков. Подход Design First: контракт на TypeSpec в `spec/` — источник истины, фронтенд и бэкенд строятся по OpenAPI, который он генерирует. Полный функциональный см. в `PROJECT_REQUIREMENTS.md`.

## Монорепо

pnpm workspace из трёх пакетов: `spec/` (TypeSpec), `frontend/` (React 19 + TanStack Query + openapi-fetch), `backend/` (пока заглушка). Корневой тулинг общий; конфиги пакетов наследуют `tsconfig.base.json`.

ESLint-конфиги — per-package с общим base: `eslint.config.base.mjs` (shared: TS, import-order, prettier, prefer-arrow, func-style) расширяется через spread в `frontend/eslint.config.mjs` (React-стек + `@/`-резолвер + override для `src/components/ui/`) и будущем `backend/eslint.config.mjs`. Корневой `eslint.config.mjs` — только для root-level `.mjs` файлов (игнорирует `frontend/**`, `backend/**`). Общие правила добавлять в base, пакет-специфичные — в конфиг пакета.

## Команды (из корня)

- `pnpm install` — установить воркспейсы.
- `pnpm spec:compile` / `pnpm spec:watch` — TypeSpec → `openapi/openapi.1.0.0.yaml`.
- `pnpm -C frontend gen:api` — регенерация `frontend/src/api/schema.d.ts` из OpenAPI.
- `pnpm -C frontend mock` — поднять Prism-мок на http://localhost:4010 по `openapi/openapi.1.0.0.yaml` (пока бэкенд-заглушка).
- `pnpm -C frontend dev` — Vite dev-сервер на http://localhost:5173 (прокси `/api` → Prism-мок :4010; `VITE_API_BASE_URL` берётся из `frontend/.env`).
- `pnpm -C frontend build` / `preview` — production-сборка в `dist/` (`tsc` + `vite build`) и локальный предпросмотр собранного бандла.
- `pnpm lint` / `pnpm lint:fix`, `pnpm format` / `pnpm format:check`, `pnpm typecheck`, `pnpm test`.
- `pnpm -C <pkg> verify` — локальная самопроверка пакета (во `frontend/`: `tsc` + `eslint .` + `vitest run`). Запускать после завершения задачи в пакете, прежде чем сообщать результат. Сейчас есть в `frontend/`; в `backend/` добавится с появлением src. `vite build` в `verify` не входит — прод-сборку гоняет CI (`pnpm -r run --if-present build` на каждый PR).

Node 24+ (`.nvmrc`), pnpm 10+ (`packageManager`).

## Contract-first поток

`spec/main.tsp` (namespace `ProjectApi`, версионирование `v1`) → компиляция в `openapi/openapi.1.0.0.yaml` → фронтенд через `openapi-typescript` генерит `frontend/src/api/schema.d.ts` и через `openapi-fetch` (`createClient<paths>`) получает типизированный клиент.

`openapi/` и `frontend/src/api/schema.d.ts` — производные, **не править руками**. При изменении контракта: правка `spec/main.tsp` → `pnpm spec:compile` → `pnpm -C frontend gen:api`. Ошибки 400/404/409/500 объявлены в спеке и на клиенте всплывают как типизированный `ApiError`.

## API-слой фронтенда (`frontend/src/`)

Граница между слоями — её соблюдение делает приложение типобезопасным:

- `api/client.ts` — единственный инстанс openapi-fetch (`api`). `baseUrl` пока захардкожен (TODO: `import.meta.env.VITE_API_BASE_URL` после настройки Vite).
- `api/<resource>.ts` — по файлу на ресурс. Функции-операции разворачивают `{ data, error }` из openapi-fetch: **throw на `res.error`, return `res.data`**. Паттерн throw-on-error сохранять — от него зависит типобезопасность остального кода.
- `api/query-keys.ts` — централизованные ключи TanStack Query, не инлайнить массивы.
- `hooks/use-<resource>.ts` — обёртки React Query. Мутации инвалидируют связанные ключи (например, создание бронирования инвалидирует и `bookings`, и `slots`).

`queryClient.ts` экспортирует `createQueryClient()` — фабрику, не синглтон.

## UI-слой фронтенда

Компоненты — shadcn/ui на Tailwind v4.

- `frontend/src/components/ui/` — исходники компонентов, **править свободно**. Это не npm-зависимость, код в репо.
- Новые компоненты: `pnpm dlx shadcn@latest add <name> -c frontend`. После добавления прогнать `pnpm lint --fix` и `pnpm format` — это приводит сгенерированный код к стайлгайду (стрелочные функции через `eslint-plugin-prefer-arrow-functions`, кавычки/point-free через prettier, порядок импортов через `import-x/order`).
- Хелпер слияния классов — `cn()` из `@/lib/utils`.
- Тема — CSS-переменные в `frontend/src/index.css`. **Не хардкодить цвета** (`bg-zinc-900`), использовать токены (`bg-background`, `text-foreground`, `bg-primary`).
- Иконки — `lucide-react`. Тосты — `sonner` + `<Toaster />` из `@/components/ui/sonner` в корне.
- Формы (когда понадобятся) — `react-hook-form` + `zod` + shadcn-компонент `form`.

## Тесты

Решение по тест-раннеру зафиксировано в `TESTING.md` (Vitest, per-package конфиги; шаблоны и обоснование — там). Pre-commit гоняет `lint-staged` + `typecheck`; pre-push — `pnpm test`; CI — `lint && typecheck && test && build` (`pnpm -r run --if-present build`). Тестов пока нет.
