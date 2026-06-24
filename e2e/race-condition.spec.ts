import { test, expect } from '@playwright/test';

import { resetStore, seedAvailability } from './helpers/api';
import { MONDAY_DATA_DAY } from './helpers/dates';
import {
  fillBookingForm,
  selectDate,
  selectDuration,
  selectSlot,
  submitBooking,
} from './helpers/navigation';

test.describe('Race condition при бронировании', () => {
  test.beforeEach(async ({ request }) => {
    await resetStore(request);
  });

  test('Сценарий 13: тост при конфликте бронирования', async ({ request, browser }) => {
    // 1. Сидируем доступность Пн 09:00–10:00
    await seedAvailability(request, {
      startTime: '09:00',
      endTime: '10:00',
    });

    // 2. Создаём два изолированных контекста
    const ctx1 = await browser.newContext();
    const ctx2 = await browser.newContext();
    const page1 = await ctx1.newPage();
    const page2 = await ctx2.newPage();

    try {
      // 3. В обоих: выбираем дату, длительность, слот
      for (const p of [page1, page2]) {
        await p.goto('/');
        await selectDate(p, MONDAY_DATA_DAY);
        await selectDuration(p, '30');
        await selectSlot(p, '09:00');
      }

      // 4. В первой вкладке: заполняем и отправляем → успех
      await fillBookingForm(page1, {
        name: 'User One',
        email: 'one@example.com',
      });
      await submitBooking(page1);
      await expect(page1.getByText('Встреча забронирована!').first()).toBeVisible();

      // 5. Во второй вкладке: заполняем и отправляем
      await fillBookingForm(page2, {
        name: 'User Two',
        email: 'two@example.com',
      });
      await submitBooking(page2);

      // 6. Проверяем: тост с ошибкой, форма скрыта
      await expect(page2.getByText(/Не удалось забронировать/)).toBeVisible();
      await expect(page2.getByText('Ваши данные')).not.toBeVisible();
    } finally {
      await ctx1.close();
      await ctx2.close();
    }
  });
});
