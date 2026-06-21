# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Принципы работы

- Устраняй причины проблем, а не симптомы.
- Не рефакторь и не улучшай код, не связанный с задачей.

## Проект

Call Booking — учебный проект по мотивам Cal.com для бронирования слотов звонков. Подход Design First: контракт на TypeSpec в `spec/` — источник истины, фронтенд и бэкенд строятся по OpenAPI, который он генерирует. Полный функциональный см. в `PROJECT_REQUIREMENTS.md`.

## Монорепо

pnpm workspace из трёх пакетов: `spec/` (TypeSpec), `frontend/` (React 19 + TanStack Query + openapi-fetch), `backend/` (пока заглушка). Корневой тулинг общий; конфиги пакетов наследуют `tsconfig.base.json`.

## Команды (из корня)

- `pnpm install` — установить воркспейсы.
- `pnpm spec:compile` / `pnpm spec:watch` — TypeSpec → `openapi/openapi.1.0.0.yaml`.
- `pnpm -C frontend gen:api` — регенерация `frontend/src/api/schema.d.ts` из OpenAPI.
- `pnpm lint` / `pnpm lint:fix`, `pnpm format` / `pnpm format:check`, `pnpm typecheck`, `pnpm test`.
- `pnpm -C <pkg> verify` — локальная самопроверка пакета (`tsc && eslint .`, тесты добавятся в `verify` при scaffolding). Запускать после завершения задачи в пакете, прежде чем сообщать результат. Сейчас есть в `frontend/`; в `backend/` добавится с появлением src.

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

## Тесты

Решение по тест-раннеру зафиксировано в `TESTING.md` (Vitest, per-package конфиги; шаблоны и обоснование — там). Pre-commit гоняет `lint-staged` + `typecheck`; pre-push — `pnpm test`; CI — `lint && typecheck && test`. Тестов пока нет.
