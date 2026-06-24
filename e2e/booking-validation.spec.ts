import { test, expect } from '@playwright/test';

import { resetStore, seedAvailability } from './helpers/api';
import { MONDAY_DATA_DAY } from './helpers/dates';
import {
  fillBookingForm,
  goToBookings,
  selectDate,
  selectDuration,
  selectSlot,
  slotCount,
  submitBooking,
} from './helpers/navigation';

test.describe('Бронирование: 15 минут и валидация формы', () => {
  test.beforeEach(async ({ request }) => {
    await resetStore(request);
  });

  test('Сценарий 5: бронирование с длительностью 15 минут', async ({ page, request }) => {
    // 1. Сидируем доступность Пн 09:00–10:00
    await seedAvailability(request, {
      startTime: '09:00',
      endTime: '10:00',
    });

    // 2. Открываем /, выбираем дату и длительность 15 мин
    await page.goto('/');
    await selectDate(page, MONDAY_DATA_DAY);
    await selectDuration(page, '15');

    // 3. Проверяем: 4 слота
    await expect.poll(() => slotCount(page)).toBe(4);

    // 4. Кликаем на слот 09:15
    await selectSlot(page, '09:15');

    // 5. Заполняем форму
    await fillBookingForm(page, {
      name: 'Мария',
      email: 'maria@example.com',
    });

    // 6. Нажимаем «Забронировать»
    await submitBooking(page);

    // 7. Проверяем карточку подтверждения
    await expect(page.getByText('Встреча забронирована!').first()).toBeVisible();
    await expect(page.getByText('Мария')).toBeVisible();

    // 8. Переходим на /bookings
    await goToBookings(page);

    // 9. Проверяем: одна запись «Мария», длительность «15 мин»
    await expect(page.getByText('Мария')).toBeVisible();
    await expect(page.getByText('15 мин')).toBeVisible();
  });

  test('Сценарий 11: валидация формы бронирования', async ({ page, request }) => {
    // 1. Сидируем доступность Пн 09:00–17:00
    await seedAvailability(request);

    // 2. Открываем /, выбираем дату, длительность, слот
    await page.goto('/');
    await selectDate(page, MONDAY_DATA_DAY);
    await selectDuration(page, '30');
    await selectSlot(page, '09:00');

    // 3. Оставляем поля пустыми, нажимаем «Забронировать»
    await submitBooking(page);

    // 4. Проверяем ошибки валидации
    await expect(page.getByText('Минимум 2 символа')).toBeVisible();
    await expect(page.getByText('Некорректный email')).toBeVisible();

    // 5. Вводим некорректные данные
    await page.locator('#name').fill('А');
    await page.locator('#email').fill('not-an-email');
    await submitBooking(page);

    // 6. Проверяем: ошибки остались
    await expect(page.getByText('Минимум 2 символа')).toBeVisible();
    await expect(page.getByText('Некорректный email')).toBeVisible();

    // 7. Вводим корректные данные
    await page.locator('#name').clear();
    await page.locator('#name').fill('Анна');
    await page.locator('#email').clear();
    await page.locator('#email').fill('anna@example.com');

    // 8. Отправляем
    await submitBooking(page);

    // 9. Проверяем: подтверждение успешно
    await expect(page.getByText('Встреча забронирована!').first()).toBeVisible();
  });
});
