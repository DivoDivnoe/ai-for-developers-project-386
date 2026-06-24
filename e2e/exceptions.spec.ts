import { test, expect } from '@playwright/test';

import { resetStore, seedAvailability, seedException } from './helpers/api';
import {
  MONDAY_DATA_DAY,
  MONDAY,
  TUESDAY_DATA_DAY,
  WEDNESDAY_DATA_DAY,
  WEDNESDAY,
  THURSDAY_DATA_DAY,
} from './helpers/dates';
import {
  fillBookingForm,
  goToBooking,
  goToExceptions,
  selectDate,
  selectDateNextMonth,
  selectDuration,
  selectSlot,
  slotCount,
  submitBooking,
} from './helpers/navigation';

test.describe('Исключения', () => {
  test.beforeEach(async ({ request }) => {
    await resetStore(request);
  });

  test('Сценарий 2: полное исключение блокирует день', async ({ page, request }) => {
    // 1. Сидируем доступность Пн 09:00–17:00
    await seedAvailability(request);

    // 2. Сидируем полное исключение на понедельник
    await seedException(request, {
      startDate: MONDAY,
      endDate: MONDAY,
    });

    // 3. Открываем /, выбираем дату, 30 мин
    await goToBooking(page);
    await selectDate(page, MONDAY_DATA_DAY);
    await selectDuration(page, '30');

    // 4. Проверяем: «Нет свободных слотов»
    await expect(page.getByText(/Нет свободных слотов/)).toBeVisible();

    // 5. Переходим на /exceptions
    await goToExceptions(page);

    // 6. Удаляем исключение
    await page.getByRole('button', { name: 'Удалить' }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /^Удалить$/ })
      .click();

    // 7. Возвращаемся, выбираем дату, 30 мин
    await goToBooking(page);
    await selectDate(page, MONDAY_DATA_DAY);
    await selectDuration(page, '30');

    // 8. Проверяем: 16 слотов
    await expect.poll(() => slotCount(page)).toBe(16);
  });

  test('Сценарий 3: частичное исключение сокращает доступность', async ({ page, request }) => {
    // 1. Сидируем доступность Пн 09:00–17:00
    await seedAvailability(request);

    // 2. Сидируем частичное исключение 10:00–12:00
    await seedException(request, {
      startDate: MONDAY,
      endDate: MONDAY,
      startTime: '10:00',
      endTime: '12:00',
    });

    // 3. Открываем /, выбираем дату, 30 мин
    await goToBooking(page);
    await selectDate(page, MONDAY_DATA_DAY);
    await selectDuration(page, '30');

    // 4-5. 09:00, 09:30 есть; 10:00, 10:30, 11:00, 11:30 отсутствуют
    const slotsCard = page.locator('[data-slot="card"]').filter({ hasText: 'Свободное время' });
    await expect(slotsCard.getByRole('button', { name: '09:00' })).toBeVisible();
    await expect(slotsCard.getByRole('button', { name: '09:30' })).toBeVisible();
    await expect(slotsCard.getByRole('button', { name: '10:00' })).not.toBeVisible();
    await expect(slotsCard.getByRole('button', { name: '11:30' })).not.toBeVisible();

    // 6. 12:00–16:30 есть (10 слотов + 2 = 12)
    await expect.poll(() => slotCount(page)).toBe(12);
    await expect(slotsCard.getByRole('button', { name: '12:00' })).toBeVisible();
    await expect(slotsCard.getByRole('button', { name: '16:30' })).toBeVisible();

    // 7. Бронируем 09:00
    await selectSlot(page, '09:00');
    await fillBookingForm(page, {
      name: 'Test User',
      email: 'test@test.com',
    });
    await submitBooking(page);

    // 8. Возвращаемся, перепроверяем
    await expect(page.getByText('Встреча забронирована!').first()).toBeVisible();
    await page.getByRole('button', { name: 'Новое бронирование' }).click();
    await selectDate(page, MONDAY_DATA_DAY);
    await selectDuration(page, '30');

    // 9. 09:00 отсутствует (забронирован), остальные без изменений (11 слотов)
    await expect.poll(() => slotCount(page)).toBe(11);
    await expect(slotsCard.getByRole('button', { name: '09:00' })).not.toBeVisible();
    await expect(slotsCard.getByRole('button', { name: '09:30' })).toBeVisible();
  });

  test('Сценарий 8: многодневное исключение (отпуск)', async ({ page, request }) => {
    // 1. Сидируем доступность Пн 09:00–17:00 и Ср 09:00–17:00
    await seedAvailability(request);
    await seedAvailability(request, {
      dayOfWeek: 'wednesday',
      startTime: '09:00',
      endTime: '17:00',
    });

    // 2. Сидируем исключение Пн–Ср (без времени = полные дни)
    await seedException(request, {
      startDate: MONDAY,
      endDate: WEDNESDAY,
    });

    // 3. Открываем /, длительность 30 мин
    await goToBooking(page);
    await selectDuration(page, '30');

    // 4. Пн: нет слотов (доступность есть, но заблокирована исключением)
    await selectDate(page, MONDAY_DATA_DAY);
    await expect(page.getByText(/Нет свободных слотов/)).toBeVisible();

    // 5. Вт: нет слотов (нет доступности, но попадает в диапазон)
    await selectDate(page, TUESDAY_DATA_DAY);
    await expect(page.getByText(/Нет свободных слотов/)).toBeVisible();

    // 6. Ср: нет слотов (доступность есть, но заблокирована)
    await selectDateNextMonth(page, WEDNESDAY_DATA_DAY);
    await expect(page.getByText(/Нет свободных слотов/)).toBeVisible();

    // 7. Чт: нет слотов (нет доступности и за пределами исключения)
    await selectDate(page, THURSDAY_DATA_DAY);
    await expect(page.getByText(/Нет свободных слотов/)).toBeVisible();
  });

  test('Сценарий 9: изменение исключения через UI', async ({ page, request }) => {
    // 1. Сидируем доступность
    await seedAvailability(request);

    // 2. Открываем /exceptions
    await goToExceptions(page);

    // 3. Проверяем empty state
    await expect(page.getByText('Нет исключений')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Добавить', exact: true })).toBeVisible();

    // 4. Добавляем полное исключение на понедельник
    await page.getByRole('button', { name: 'Добавить', exact: true }).click();
    await page.locator('input[type="date"]').first().fill(MONDAY);
    await page.locator('input[type="date"]').last().fill(MONDAY);
    await page.getByRole('dialog').getByRole('button', { name: 'Добавить' }).click();

    // 5. Проверяем: слотов нет
    await goToBooking(page);
    await selectDate(page, MONDAY_DATA_DAY);
    await selectDuration(page, '30');
    await expect(page.getByText(/Нет свободных слотов/)).toBeVisible();

    // 6. Возвращаемся, редактируем: добавляем время 10:00–12:00
    await goToExceptions(page);
    await page.getByRole('button', { name: 'Редактировать' }).click();
    await page.locator('input[type="time"]').first().fill('10:00');
    await page.locator('input[type="time"]').last().fill('12:00');
    await page.getByRole('dialog').getByRole('button', { name: 'Сохранить' }).click();

    // 7. Проверяем частичное исключение
    await goToBooking(page);
    await selectDate(page, MONDAY_DATA_DAY);
    await selectDuration(page, '30');
    await expect(page.getByText(/Нет свободных слотов/)).not.toBeVisible();
    await expect.poll(() => slotCount(page)).toBe(12);

    // 8. Редактируем обратно на полный день
    await goToExceptions(page);
    await page.getByRole('button', { name: 'Редактировать' }).click();
    await page.locator('input[type="time"]').first().fill('');
    await page.locator('input[type="time"]').last().fill('');
    await page.getByRole('dialog').getByRole('button', { name: 'Сохранить' }).click();

    // 9. Проверяем: снова «Нет свободных слотов»
    await goToBooking(page);
    await selectDate(page, MONDAY_DATA_DAY);
    await selectDuration(page, '30');
    await expect(page.getByText(/Нет свободных слотов/)).toBeVisible();
  });
});
