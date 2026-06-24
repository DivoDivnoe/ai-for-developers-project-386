import { test, expect } from '@playwright/test';

import { resetStore, seedAvailability, seedBooking } from './helpers/api';
import { MONDAY_DATA_DAY, mondayAt } from './helpers/dates';
import {
  fillBookingForm,
  selectDate,
  selectDuration,
  selectSlot,
  slotCount,
  submitBooking,
} from './helpers/navigation';

test.describe('Предотвращение конфликтов и перекрёстное влияние', () => {
  test.beforeEach(async ({ request }) => {
    await resetStore(request);
  });

  test('Сценарий 4: существующая бронь блокирует слот', async ({ page, request }) => {
    // 1-2. Сидируем доступность Пн 09:00–10:00 и чужую бронь 09:00–09:30
    await seedAvailability(request, {
      startTime: '09:00',
      endTime: '10:00',
    });
    await seedBooking(request, {
      startAt: mondayAt('09:00'),
      duration: 30,
      name: 'Existing User',
      email: 'existing@example.com',
    });

    // 3. Открываем /, выбираем дату и 30 мин
    await page.goto('/');
    await selectDate(page, MONDAY_DATA_DAY);
    await selectDuration(page, '30');

    // 4-5. 09:00–09:30 отсутствует, 09:30 доступен (1 слот)
    await expect.poll(() => slotCount(page)).toBe(1);
    await expect(
      page
        .locator('[data-slot="card"]')
        .filter({ hasText: 'Свободное время' })
        .getByRole('button', { name: '09:30' }),
    ).toBeVisible();

    // 6. Бронируем 09:30
    await selectSlot(page, '09:30');
    await fillBookingForm(page, {
      name: 'New User',
      email: 'new@example.com',
    });
    await submitBooking(page);

    // 7. Проверяем подтверждение
    await expect(page.getByText('Встреча забронирована!').first()).toBeVisible();

    // 8. Возвращаемся, проверяем: слотов нет
    await page.getByRole('button', { name: 'Новое бронирование' }).click();
    await selectDate(page, MONDAY_DATA_DAY);
    await selectDuration(page, '30');
    await expect(page.getByText(/Нет свободных слотов/)).toBeVisible();
  });

  test('Сценарий 7: перекрёстное влияние длительностей', async ({ page, request }) => {
    // 1. Сидируем доступность Пн 09:00–10:00
    await seedAvailability(request, {
      startTime: '09:00',
      endTime: '10:00',
    });

    // 2. Сидируем 15-мин бронь на 09:00
    await seedBooking(request, {
      startAt: mondayAt('09:00'),
      duration: 15,
    });

    // 3. Открываем /, выбираем дату, 30 мин
    await page.goto('/');
    await selectDate(page, MONDAY_DATA_DAY);
    await selectDuration(page, '30');

    // 4-5. При 30 мин: 09:00 отсутствует, 09:30 доступен (1 слот)
    await expect.poll(() => slotCount(page)).toBe(1);
    await expect(
      page
        .locator('[data-slot="card"]')
        .filter({ hasText: 'Свободное время' })
        .getByRole('button', { name: '09:30' }),
    ).toBeVisible();

    // 6. Меняем на 15 мин
    await selectDuration(page, '15');

    // 7-8. При 15 мин: 09:00 отсутствует, 09:15, 09:30, 09:45 доступны (3 слота)
    await expect.poll(() => slotCount(page)).toBe(3);
    await expect(
      page
        .locator('[data-slot="card"]')
        .filter({ hasText: 'Свободное время' })
        .getByRole('button', { name: '09:15' }),
    ).toBeVisible();
    await expect(
      page
        .locator('[data-slot="card"]')
        .filter({ hasText: 'Свободное время' })
        .getByRole('button', { name: '09:45' }),
    ).toBeVisible();
  });
});
