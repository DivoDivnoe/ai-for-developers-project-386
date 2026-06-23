# План реализации бэкенда Call Booking

## Контекст

Реализация REST API для учебного проекта Call Booking по контракту OpenAPI (`openapi/openapi.1.0.0.yaml`). 15 эндпоинтов, in-memory хранилище, ключевая бизнес-логика — генерация слотов и защита от конфликтов бронирования.

## Выбранные технологии

| Назначение     | Выбор                     | Обоснование                                                                              |
| -------------- | ------------------------- | ---------------------------------------------------------------------------------------- |
| HTTP-фреймворк | **Hono**                  | Лёгкий, отличный TS-инференс, встроенные `zValidator`, `HTTPException`, `cors`, `logger` |
| Валидация      | **Zod**                   | Единообразие с фронтендом, `z.coerce` для query-параметров                               |
| Даты/время     | **date-fns**              | Уже на фронте, критичен для генерации слотов                                             |
| UUID           | **`crypto.randomUUID()`** | Нативный, без зависимостей                                                               |
| Dev-сервер     | **tsx watch**             | Быстрый esbuild-транспайлер                                                              |

## Архитектурные решения

- **Фабрика `createApp(store)`** — изоляция тестов через свежий store
- **`services/slots.ts` как чистая функция** — `generateSlots({date, duration, availability, exceptions, bookings}) => Slot[]`, легко тестировать
- **Контрактная типизация** — типы генерируются из OpenAPI в `generated/schema.ts`, обработчики явно типизируют ответ через `c.json<ResponseType>(data)`
- **In-memory store на Map** — `Map<string, Booking>`, `Map<string, AvailabilityInterval>`, `Map<string, ScheduleException>`

## Структура папок

```
backend/
  package.json
  tsconfig.json
  eslint.config.mjs
  vitest.config.ts
  src/
    index.ts              # точка входа: createApp(store) + serve
    app.ts                # createApp(store) => Hono app, регистрация роутов
    types.ts              # переменные приложения (c.get/c.set typed bindings)
    routes/
      health.ts           # GET /health
      owner.ts            # GET /owner
      slots.ts            # GET /slots?date=&duration=
      bookings.ts         # GET/POST /bookings, GET/DELETE /bookings/{id}
      availability.ts     # GET/POST /availability, PUT/DELETE /availability/{id}
      exceptions.ts       # GET/POST /exceptions, PUT/DELETE /exceptions/{id}
    validation/
      schemas.ts          # Zod-схемы для всех request body, query, path params
    store/
      types.ts            # интерфейсы Store, BookingRecord и пр.
      store.ts            # createStore() — Map-based реализация
    services/
      slots.ts            # generateSlots() — чистая функция
      booking.ts          # createBooking() — проверка конфликтов
    lib/
      errors.ts           # throwNotFound, throwConflict, throwBadRequest
  generated/
    schema.ts             # типы из openapi-typescript
```

## Порядок реализации

### Шаг 1: Инфраструктура пакета + типы из OpenAPI ✓

- [x] `package.json` — зависимости (hono, zod, date-fns), devDependencies (tsx, vitest, openapi-typescript), скрипты
- [x] `tsconfig.json` — extends base, `exactOptionalPropertyTypes: false`
- [x] `eslint.config.mjs` — extends base + import-x/resolver для TS
- [x] `vitest.config.ts` — node, globals
- [x] `gen:api` → `generated/schema.ts`
- [x] `.gitignore` — `**/todo.md`

### Шаг 2: Хранилище и базовые абстракции

- [ ] `store/types.ts` — интерфейсы Store
- [ ] `store/store.ts` — `createStore()` на Map
- [ ] `lib/errors.ts` — HTTPException-хелперы
- [ ] `types.ts` — Hono Variables

### Шаг 3: Валидация

- [ ] `validation/schemas.ts` — Zod-схемы для всех request body, query, path params

### Шаг 4: Роуты (в порядке сложности)

- [ ] `health.ts` — `GET /health` → `{ status: "ok" }`
- [ ] `owner.ts` — `GET /owner` → статичные данные владельца
- [ ] `availability.ts` — CRUD для интервалов доступности
- [ ] `exceptions.ts` — CRUD для исключений
- [ ] `services/slots.ts` — `generateSlots()` — генерация слотов
- [ ] `slots.ts` — `GET /slots?date=&duration=`
- [ ] `services/booking.ts` — проверка конфликтов + сохранение
- [ ] `bookings.ts` — CRUD + cancel
- [ ] `app.ts` — сборка createApp
- [ ] `index.ts` — точка входа

### Шаг 5: Тесты

- [ ] `test/services/slots.test.ts` — юнит-тесты generateSlots
- [ ] `test/services/booking.test.ts` — юнит-тесты createBooking
- [ ] `test/routes/` — интеграционные тесты через `app.request()`

## Верификация

1. `pnpm -C backend typecheck` — типы проходят
2. `pnpm -C backend lint` — ESLint без ошибок
3. `pnpm -C backend test` — все тесты зелёные
4. `pnpm -C backend dev` — сервер стартует на :3000
5. Ручная проверка: `curl http://localhost:3000/health` → `{"status":"ok"}`
6. Проверка с фронтендом: `pnpm -C frontend dev` с бэкендом на :3000
