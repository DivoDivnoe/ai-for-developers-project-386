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
- **In-memory store на Map** — `Map<string, T>` для bookings, availability, exceptions
- **Shallow copy** во всех методах чтения store — защита от мутаций в обход update
- **Фабрики ошибок** — `notFound()` / `conflict()` / `badRequest()` / `internalError()`, caller делает `throw`

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
    types.ts              # Hono Variables (AppVariables)
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
      types.ts            # интерфейс Store, реэкспорт типов записей
      store.ts            # createStore() — Map-based реализация
    services/
      slots.ts            # generateSlots() — чистая функция
      booking.ts          # createBooking() — проверка конфликтов
    lib/
      errors.ts           # Фабрики HTTPException (notFound, conflict, badRequest, internalError)
  generated/
    schema.ts             # типы из openapi-typescript
```

## Порядок реализации

### Шаг 1: Инфраструктура пакета ✓

- [x] `package.json` — зависимости (hono, zod, date-fns), devDependencies (tsx, vitest, openapi-typescript), скрипты (dev, typecheck, lint, test, verify, gen:api)
- [x] `tsconfig.json` — extends base, `exactOptionalPropertyTypes: false`
- [x] `eslint.config.mjs` — extends base + import-x/resolver для TS
- [x] `vitest.config.ts` — node, globals
- [x] `gen:api` → `generated/schema.ts`
- [x] `.gitignore` — `**/todo.md`

### Шаг 2: Хранилище и базовые абстракции ✓

**Решения:**

- Shallow copy `{ ...record }` во всех методах чтения — защита от мутаций store в обход update
- `update` возвращает `T | undefined` (undefined = не найдено) — атомарный check-and-update
- ID генерирует route handler через `crypto.randomUUID()`, store получает готовый объект
- `create` при дубликате ключа перезаписывает (поведение `Map.set`)

- [x] `store/types.ts` — реэкспорт типов из `components["schemas"]`, интерфейс `Store`
- [x] `store/store.ts` — `createStore(): Store`, три `Map<string, T>`, owner-константа
- [x] `lib/errors.ts` — фабрики `notFound`/`conflict`/`badRequest`/`internalError`
- [x] `types.ts` — `type AppVariables = { store: Store }`

### Шаг 3: Валидация ✓

- [x] `validation/schemas.ts` — Zod-схемы для всех request body, query, path params
  - `uuidParam`, `getSlotsQuery`, `createBookingBody`, `createAvailabilityBody` (с `.superRefine` для `endTime > startTime`), `createExceptionBody` (с `.superRefine` для дат и времени)
  - `dayOfWeekValues` с `as const satisfies readonly DayOfWeek[]`
  - Exhaustiveness check: `type _assertCoverage` + `const _check: _assertCoverage = true` (переменная использует тип, нет TS6196)
  - `@hono/zod-validator` уже был в зависимостях
- [x] `eslint.config.mjs` — `@typescript-eslint/no-unused-vars` с `varsIgnorePattern: '^_'`, `argsIgnorePattern: '^_'`
- [x] `tsconfig.json` — `noUnusedLocals: false` (TypeScript не игнорирует `_`-префикс для const; за этим следит ESLint)
- [x] `spec/main.tsp` — добавлен `@format("email")` на 3 email-поля (Owner, Booking, CreateBookingRequest)
- [x] Перегенерированы `openapi/openapi.1.0.0.yaml`, `backend/generated/schema.ts`, `frontend/src/api/schema.d.ts`

### Шаг 4: Роуты ✓

1. [x] `health.ts` — `GET /health` → `{ status: "ok" }`
2. [x] `owner.ts` — `GET /owner` → статичные данные владельца
3. [x] `availability.ts` — CRUD для интервалов доступности
4. [x] `exceptions.ts` — CRUD для исключений
5. [x] `services/slots.ts` — `generateSlots()` — генерация слотов
6. [x] `slots.ts` — `GET /slots?date=&duration=`
7. [x] `services/booking.ts` — проверка конфликтов + сохранение
8. [x] `bookings.ts` — CRUD + cancel
9. [x] `app.ts` — сборка createApp
10. [x] `index.ts` — точка входа

### Шаг 5: Тесты

**Решения:**

- `process.env.TZ = "UTC"` в `test/setup.ts` — детерминизм дат в тестах
- `generateSlots` тестируется как чистая функция: без store, вход — plain arrays
- `createBooking` тестируется с моком store через `vi.fn()` + `vi.setSystemTime()` для past-date проверок
- Интеграционные тесты: `createApp(createStore())` + `app.request()`, seed данных через store напрямую
- Фабрики: `createTestAvailability(overrides?)`, `createTestException(overrides?)`, `createTestBooking(overrides?)` с разумными дефолтами и optional overrides. Дефолты: id через `crypto.randomUUID()`, `dayOfWeek: "monday"`, времена `09:00`–`17:00`. У `createTestException` дефолт partial-day (времена заданы), full-day через `{ startTime: undefined, endTime: undefined }`. У `createTestBooking` `createdAt` — фиксированная константа, не `new Date()`
- Константы дат: `MONDAY = "2026-06-22"`, `TUESDAY = "2026-06-23"` etc. — фиксированные, не `new Date()`-производные

#### 5.1 Инфраструктура тестов

- [x] `test/setup.ts` — `process.env.TZ = "UTC"`
- [x] `vitest.config.ts` — добавить `setupFiles: ['./test/setup.ts']`
- [x] `test/helpers/constants.ts` — `MONDAY = "2026-06-22"`, `TUESDAY = "2026-06-23"`, `SATURDAY = "2026-06-27"`, `MONDAY_0900 = "2026-06-22T09:00:00.000Z"`, `MONDAY_0930 = "2026-06-22T09:30:00.000Z"`, `FAR_FUTURE_DATE = "2027-01-01"`, `PAST_DATE = "2020-01-01T10:00:00.000Z"`
- [x] `test/helpers/factories.ts` — `createTestAvailability(overrides?)`, `createTestException(overrides?)`, `createTestBooking(overrides?)`. Дефолты: id через `crypto.randomUUID()`, `dayOfWeek: "monday"`, `startTime: "09:00"`, `endTime: "17:00"`. У `createTestException` дефолт partial-day (времена заданы), full-day через `{ startTime: undefined, endTime: undefined }`. У `createTestBooking` `createdAt: "2026-06-20T00:00:00.000Z"` (фиксированная константа), `status: "confirmed"`

Верификация: `pnpm -C backend test` (0 тестов, инфраструктура готова)

#### 5.2 Юнит-тесты generateSlots ✓

Файл `test/services/slots.test.ts` — 32 теста. Чистая функция, вход — `{ date, duration, availability, exceptions, bookings }`, выход — `Slot[]`.

В код добавлена дедупликация слотов по `startAt` (`[...new Map(allSlots.map(s => [s.startAt, s])).values()]`) — пересекающиеся окна доступности или исключений не порождают дубликатов.

1. Пустой вход (нет доступности, нет исключений) → `[]`
2. Одно окно доступности, день совпадает (Monday 09:00–10:00, duration=30) → 2 слота
3. Окно доступности для другого дня недели → `[]`
4. 15-минутная длительность (09:00–09:45) → 3 слота
5. Несколько окон доступности в один день → слоты из всех окон
6. Сортировка по startAt (несколько окон, порядок проверяется явно)
7. Полнодневное исключение (без startTime/endTime) блокирует день → `[]`
8. Частичное исключение переопределяет регулярную доступность (вместо 09:00–17:00 слоты только 10:00–14:00)
9. Несколько частичных исключений на одну дату → слоты из всех
10. Исключение вне диапазона дат игнорируется (Monday availability, Tuesday exception)
11. Исключение точно на startDate (c endDate позже) — применяется
12. Исключение в середине многодневного диапазона — применяется
13. Все слоты забронированы (confirmed) → `[]`
14. Часть слотов забронирована → только свободные
15. Cancelled-букинги не блокируют слоты
16. Перекрытие: букинг точно совпадает со слотом → слот исключён
17. Перекрытие: букинг начинается раньше слота, заканчивается внутри → слот исключён
18. Перекрытие: букинг начинается внутри слота, заканчивается позже → слот исключён
19. Перекрытие: букинг полностью накрывает слот → слот исключён
20. Без перекрытия: смежные слоты (09:00–09:30 и 09:30–10:00) → бронирование 09:00–09:30 не блокирует 09:30–10:00
21. Слот не выходит за границу окна (09:00–09:45, duration=30) → только 1 слот, 09:30–10:00 не создаётся
22. Блокирующее исключение (без времён) + частичное на ту же дату → `[]` (блокирующее приоритетнее)
23. Дубликаты от пересекающихся окон доступности → слоты без дубликатов
24. Несколько подтверждённых бронирований перекрывают один и тот же слот → слот исключён (один раз)
25. Cross-duration: 15-минутное бронирование блокирует 30-минутный слот
26. Cross-duration: 30-минутное бронирование блокирует несколько 15-минутных слотов
27. Бронирование строго внутри слота (09:10–09:25 внутри 09:00–09:30) → слот исключён
28. Исключение точно на endDate (startDate раньше) — применяется
29. Исключение только с startTime (без endTime) → полнодневная блокировка
30. Окно доступности короче длительности слота (09:00–09:15, duration=30) → `[]`
31. Исключение только с endTime (без startTime) → полнодневная блокировка
32. Пересекающиеся частичные исключения → слоты без дубликатов

Верификация: `pnpm -C backend test` — 32 зелёных

#### 5.3 Юнит-тесты createBooking ✓

Файл `test/services/booking.test.ts` — 9 тестов. Мок store через `vi.fn()`, `vi.setSystemTime()` для детерминизма past-date проверки.

1. Успешное создание: валидный будущий `startAt`, слот существует → `BookingRecord` с `status: "confirmed"`, `store.createBooking` вызван один раз
2. Букинг с комментарием: `comment: "Need projector"` → поле `comment` есть в результате
3. Букинг без комментария: `comment` не передан → поле `comment` отсутствует в результате
4. Букинг через исключение: `listAvailability` пуст, но частичное исключение даёт окно → слот доступен — страхует передачу `exceptions` в `generateSlots`
5. Букинг в прошлом: `startAt` = 2020 год → `HTTPException` 409 "Cannot book a slot in the past"
6. Букинг прямо сейчас: `vi.setSystemTime` + `startAt` равен текущему времени → 409 (граничное `<=`)
7. Слот недоступен: `startAt` не совпадает ни с одним сгенерированным слотом → 409 "This time slot is not available"
8. Слот занят: confirmed-букинг занимает слот → `generateSlots` фильтрует → 409
9. Уникальность ID: два вызова → разные UUID

Верификация: `pnpm -C backend test` — 41 зелёный (32 + 9)

#### 5.4 Интеграционные тесты — health + owner

Самые простые, проверяют паттерн `createApp(createStore())` + `app.request()`.

- [x] `test/routes/health.test.ts` — 1 тест: `GET /health` → 200 `{ status: "ok" }`
- [x] `test/routes/owner.test.ts` — 1 тест: `GET /owner` → 200 `{ name: "Alex Petrov", email: "alex@callbooking.demo" }`

Верификация: `pnpm -C backend test` — 43 зелёных

#### 5.5 Интеграционные тесты — slots ✓

- [x] Файл `test/routes/slots.test.ts` — 7 тестов. Seed store через `store.createAvailability()`, запрос через `app.request()`.

1. Валидный запрос: seed Monday 09:00–10:00, `GET /slots?date=2026-06-22&duration=30` → 200, массив Slot
2. Нет query date: `GET /slots?duration=30` → 400 (Zod)
3. Нет query duration: `GET /slots?date=2026-06-22` → 400 (Zod)
4. Невалидный duration: `?date=2026-06-22&duration=45` → 400 (Zod — только 15 или 30)
5. Невалидный date: `?date=not-a-date&duration=30` → 400 (Zod)
6. Пустая доступность: без seed, валидный запрос → 200 `[]`
7. Исключение блокирует день: seed доступность + full-day исключение на ту же дату → 200 `[]`

Верификация: `pnpm -C backend test` — 50 зелёных

#### 5.6 Интеграционные тесты — bookings ✓

- [x] Файл `test/routes/bookings.test.ts` — 15 тестов. Для POST нужно предварительно seed-ить availability на нужный день.

1. `GET /bookings` пустой store → 200 `[]`
2. `GET /bookings` с записями: пре-insert 2 букинга → 200, массив из 2
3. `POST /bookings` валидный: seed availability, передать валидное тело → 200 Booking (`status: "confirmed"`)
4. `POST /bookings` с комментарием → 200, `comment` в ответе
5. `POST /bookings` без email → 400
6. `POST /bookings` невалидный startAt → 400
7. `POST /bookings` past date → 409
8. `POST /bookings` слот недоступен (нет availability) → 409
9. `GET /bookings/:id` найден → 200
10. `GET /bookings/:id` не найден → 404
11. `GET /bookings/:id` невалидный uuid → 400
12. `DELETE /bookings/:id` успех → 200, `status: "cancelled"`
13. `DELETE /bookings/:id` не найден → 404
14. `DELETE /bookings/:id` невалидный uuid → 400
15. Связка: POST создаёт букинг → GET /bookings его возвращает

Верификация: `pnpm -C backend test` — 65 зелёных

#### 5.7 Интеграционные тесты — availability

Файл `test/routes/availability.test.ts` — 15 тестов.

1. `GET /availability` пустой → 200 `[]`
2. `GET /availability` с записями → 200, массив
3. `POST /availability` валидный → 200, `AvailabilityInterval` с UUID
4. `POST /availability` без dayOfWeek → 400
5. `POST /availability` невалидный dayOfWeek → 400
6. `POST /availability` endTime ≤ startTime → 400 (superRefine)
7. `POST /availability` без startTime → 400
8. `PUT /availability/:id` валидный: пре-insert, изменить времена → 200 обновлённый
9. `PUT /availability/:id` не найден → 404
10. `PUT /availability/:id` невалидное тело → 400
11. `DELETE /availability/:id` успех → 204, тело пустое
12. `DELETE /availability/:id` не найден → 404
13. `DELETE /availability/:id` невалидный uuid → 400
14. `PUT /availability/:id` невалидный uuid → 400
15. Связка: DELETE → GET не возвращает удалённый

Верификация: `pnpm -C backend test` — 80 зелёных

#### 5.8 Интеграционные тесты — exceptions

Файл `test/routes/exceptions.test.ts` — 15 тестов.

1. `GET /exceptions` пустой → 200 `[]`
2. `GET /exceptions` с записями → 200, массив
3. `POST /exceptions` full-day (без startTime/endTime) → 200, поля времени undefined
4. `POST /exceptions` partial-day (с startTime/endTime) → 200
5. `POST /exceptions` с reason → 200, reason заполнен
6. `POST /exceptions` endDate < startDate → 400 (superRefine)
7. `POST /exceptions` endTime ≤ startTime (обе указаны) → 400 (superRefine)
8. `POST /exceptions` без startDate → 400
9. `PUT /exceptions/:id` валидный: пре-insert, изменить reason → 200 обновлённый
10. `PUT /exceptions/:id` не найден → 404
11. `PUT /exceptions/:id` невалидное тело → 400
12. `DELETE /exceptions/:id` успех → 204
13. `DELETE /exceptions/:id` не найден → 404
14. `DELETE /exceptions/:id` невалидный uuid → 400
15. `PUT /exceptions/:id` невалидный uuid → 400

Верификация: `pnpm -C backend test` — 95 зелёных

## Верификация

1. `pnpm -C backend typecheck` — типы проходят
2. `pnpm -C backend lint` — ESLint без ошибок
3. `pnpm -C backend test` — все тесты зелёные
4. `pnpm -C backend dev` — сервер стартует на :3000
5. Ручная проверка: `curl http://localhost:3000/health` → `{"status":"ok"}`
6. Проверка с фронтендом: `pnpm -C frontend dev` с бэкендом на :3000
