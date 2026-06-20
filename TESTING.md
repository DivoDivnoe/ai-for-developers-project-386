# Testing

Решение по тест-раннеру в монорепо. Зафиксировано заранее, до появления `frontend/` и `backend/` пакетов — чтобы при scaffolding не принимать решения заново.

## Решение

- **Раннер — Vitest.**
- **Структура — per-package.** Каждый пакет (`frontend/`, `backend/`) имеет свой `vitest.config.ts` и свой `test`-скрипт.
- **Root агрегирует:** `pnpm test` в root запускает `pnpm -r run --if-present test` — по образцу `typecheck` и `lint`.

## Почему не Jest

- `tsconfig.base.json` включает `verbatimModuleSyntax: true` + `module: NodeNext` (строгий ESM). Jest с ESM требует либо `--experimental-vm-modules` (хрупко), либо babel/swc-трансформ (нейтрализует `verbatimModuleSyntax`).
- Фронт на Vite → Vitest использует тот же конфиг/резолв алиасов, без дублирования.
- API (`describe/it/expect/beforeEach`) совместим с Jest — учебный эффект тот же.

## Почему не root-only

Фронт (jsdom, JSX/TSX, React Testing Library) и бэк (node, без DOM) имеют радикально разные потребности. Один root-конфиг превращается в условную лапшу по `projects`/`testMatch`. Per-package повторяет уже принятый в репо паттерн (`typecheck`, `lint`).

## Шаблоны конфигов (когда пакеты будут созданы)

### `frontend/vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: { provider: 'v8', reporter: ['text', 'html'] },
  },
});
```

`src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

### `backend/vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: { provider: 'v8', reporter: ['text', 'html'] },
  },
});
```

## Зависимости на пакет

- Оба: `vitest`, `@vitest/coverage-v8`.
- Фронт дополнительно: `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`.

## Per-package `package.json` скрипты

```jsonc
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
  },
}
```

## Где запускать тесты

- **pre-commit** (`.husky/pre-commit`): без тестов. Линт/формат/тайпчек уже быстрые и блокирующие; добавление `test` замедлит commit и спровоцирует `--no-verify`. Даже `vitest run --changed` не покрывает случай «изменил исходник без теста рядом» → silent pass.
- **pre-push** (`.husky/pre-push`): `pnpm -r run --if-present test` — полный прогон, **без** `--changed`. К моменту push рабочее дерево чистое → `--changed` без ref'а ничего не найдёт; `--changed origin/<branch>` падает на первом push ветки и не прокидывается в `pnpm -r` без парсинга husky stdin. Pre-push случается редко — полный suite приемлем. Когда прогон станет >~30s, вернуться к оптимизации.
- **CI на PR:** полный `pnpm typecheck && pnpm lint && pnpm test` — основной контур.
- **Локально (dev):** `vitest --changed --watch` — вот тут `--changed` полезен для быстрого фидбека по изменившимся тестам.

## Текущее состояние

Ни `frontend/`, ни `backend/` пакетов ещё нет. Конфиги и зависимости появятся при их scaffolding. Сейчас в репо:

- root `package.json` имеет `test`-скрипт (`pnpm -r run --if-present test`) — no-op до появления `test`-скриптов в пакетах.
- husky/CI без тестов — добавляются вместе с первыми тестами по рецептам выше.
