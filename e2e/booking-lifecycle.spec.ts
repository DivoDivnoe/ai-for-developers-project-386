import { test, expect } from '@playwright/test';

import { resetStore, seedAvailability } from './helpers/api';
import { MONDAY_DATA_DAY } from './helpers/dates';
import {
  fillBookingForm,
  goToBooking,
  goToBookings,
  selectDate,
  selectDuration,
  selectSlot,
  slotCount,
  submitBooking,
} from './helpers/navigation';

test.describe('Полный жизненный цикл бронирования', () => {
  test.beforeEach(async ({ request }) => {
    await resetStore(request);
  });

  test('Сценарий 1: бронирование, отмена, повторное бронирование', async ({ page, request }) => {
    // 1. Сидируем доступность Пн 09:00–17:00
    await seedAvailability(request);

    // 2. Открываем /
    await goToBooking(page);

    // 3. Выбираем понедельник 29 июня
    await selectDate(page, MONDAY_DATA_DAY);

    // 4. Выбираем длительность 30 мин
    await selectDuration(page, '30');

    // 5. Проверяем: 16 слотов
    await expect.poll(() => slotCount(page)).toBe(16);

    // 6. Кликаем на слот 09:00
    await selectSlot(page, '09:00');

    // 7. Заполняем форму
    await fillBookingForm(page, {
      name: 'Иван Петров',
      email: 'ivan@example.com',
      comment: 'Позвоните за 5 минут',
    });

    // 8. Нажимаем «Забронировать»
    await submitBooking(page);

    // 9. Проверяем карточку подтверждения
    await expect(page.getByText('Встреча забронирована!').first()).toBeVisible();
    await expect(page.getByText('Иван Петров')).toBeVisible();
    await expect(page.getByText('Позвоните за 5 минут')).toBeVisible();

    // 10. Переходим на /bookings
    await goToBookings(page);

    // 11. Проверяем запись
    await expect(page.getByText('Иван Петров')).toBeVisible();
    await expect(page.getByText('Подтверждена')).toBeVisible();
    await expect(page.getByText('Позвоните за 5 минут')).toBeVisible();

    // 12. Нажимаем «Отменить» → открылся диалог
    await page.getByRole('button', { name: 'Отменить' }).click();

    // 13. Нажимаем «Закрыть» (dismiss)
    await page.getByRole('button', { name: 'Закрыть' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // 14. Проверяем: бронь всё ещё «Подтверждена»
    await expect(page.getByText('Подтверждена')).toBeVisible();

    // 15. Нажимаем «Отменить» → «Отменить» в диалоге
    await page.getByRole('button', { name: 'Отменить' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('dialog').getByRole('button', { name: 'Отменить' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // 16. Проверяем: статус «Отменена»
    await expect(page.getByText('Отменена', { exact: true })).toBeVisible();

    // 17. Возвращаемся на /, выбираем понедельник, 30 мин
    await goToBooking(page);
    await selectDate(page, MONDAY_DATA_DAY);
    await selectDuration(page, '30');

    // 18. Проверяем: 16 слотов, 09:00 доступен
    await expect.poll(() => slotCount(page)).toBe(16);

    // 19. Бронируем 09:00 повторно (без комментария)
    await selectSlot(page, '09:00');
    await fillBookingForm(page, {
      name: 'Иван Петров',
      email: 'ivan@example.com',
    });
    await submitBooking(page);

    // Проверяем: подтверждение успешно
    await expect(page.getByText('Встреча забронирована!').first()).toBeVisible();
  });
});
