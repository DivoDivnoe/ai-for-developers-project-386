import { test, expect } from '@playwright/test';

import { resetStore } from './helpers/api';
import { goToBookings, goToAvailability, goToExceptions } from './helpers/navigation';

test.describe('Empty state страниц', () => {
  test.beforeEach(async ({ request }) => {
    await resetStore(request);
  });

  test('Страница встреч: пустое состояние', async ({ page }) => {
    await goToBookings(page);
    await expect(page.getByText('Нет забронированных встреч')).toBeVisible();
  });

  test('Страница доступности: пустое состояние', async ({ page }) => {
    await goToAvailability(page);
    await expect(page.getByText('Нет интервалов доступности')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Добавить', exact: true })).toBeVisible();
  });

  test('Страница исключений: пустое состояние', async ({ page }) => {
    await goToExceptions(page);
    await expect(page.getByText('Нет исключений')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Добавить', exact: true })).toBeVisible();
  });
});
