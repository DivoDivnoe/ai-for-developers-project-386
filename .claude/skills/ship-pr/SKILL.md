---
name: ship-pr
description: 'Полный цикл отправки локальных правок через GitHub PR — stage, коммит, пуш ветки, создание pull request, опционально мерж. Чистый исполнитель: без проверок стиля/тестов/секретов. Использовать когда пользователь хочет ВЕСЬ цикл целиком: «закоммить и запуш и сделай PR», «отправь изменения через PR», «ship it», «открой PR и вмержи». НЕ запускать на одиночные шаги вроде просто «закоммить», просто «запушь» или просто «сделай PR» — там справляйся без скилла.'
---

# ship-pr

Полный цикл: stage → commit → push → PR → (опц.) merge. Чистый исполнитель — без проверок стиля/тестов/секретов.

## 0. Pre-flight

1. `git status` + `git branch --show-current`.
2. На `master`/`main` — СТОП. Спросить имя feature-ветки, создать (`git checkout -b <name>`), продолжить.

## 1. Stage

Stage конкретные файлы по именам. НЕ `git add -A` / `git add .`.

## 2. Commit

- Драфт сообщения показать пользователю → коммит после «ок».
- Однострочное по умолчанию:
  ```bash
  git commit -m "<message>"
  ```
- Multi-line HEREDOC только если пользователь явно попросил body:

  ```bash
  git commit -m "$(cat <<'EOF'
  <subject>

  <body>
  EOF
  )"
  ```

## 3. Push

```bash
git push origin <branch>
```

## 4. PR

1. Драфт title/body показать пользователю → `gh pr create` после «ок».
2. ```bash
   gh pr create --title "<title>" --body "<body>"
   ```
   Без `--base`, `--draft`, `--web`.
3. Сообщить URL из вывода. Сохранить номер PR для п.5.

## 5. Merge (только если пользователь явно просит)

```bash
gh pr merge <N> --squash --delete-branch
```

Номер `<N>` — из вывода п.4 или `gh pr view --json number -q .number`.

## Что НЕ делать

- НЕ пушить в `master`/`main` напрямую (см. п.0).
- НЕ `git add -A` / `git add .` — только конкретные файлы.
