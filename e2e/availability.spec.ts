import { test, expect } from '@playwright/test';

import { resetStore, seedAvailability } from './helpers/api';
import {
  MONDAY_DATA_DAY,
  TUESDAY_DATA_DAY,
  WEDNESDAY_DATA_DAY,
} from './helpers/dates';
import {
  fillBookingForm,
  goToAvailability,
  goToBooking,
  selectDate,
  selectDateNextMonth,
  selectDuration,
  selectSlot,
  slotCount,
  submitBooking,
} from './helpers/navigation';

test.describe('Управление доступностью', () => {
  test.beforeEach(async ({ request }) => {
    await resetStore(request);
  });

  test('Сценарий 6: управление доступностью через UI', async ({ page }) => {
    // 1. Открываем /availability
    await goToAvailability(page);

    // 2. Проверяем empty state
    await expect(page.getByText('Нет интервалов доступности')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Добавить', exact: true })).toBeVisible();

    // 3. Добавляем первый интервал: Пн 09:00–12:00
    await page.getByRole('button', { name: 'Добавить', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.locator('[data-slot="select-trigger"]').click();
    await page.getByRole('option', { name: 'Понедельник' }).click();
    await page.locator('input[type="time"]').first().fill('09:00');
    await page.locator('input[type="time"]').last().fill('12:00');
    await page.getByRole('dialog').getByRole('button', { name: 'Добавить' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // 4. Добавляем второй интервал: Пн 14:00–17:00
    await page.getByRole('button', { name: 'Добавить', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.locator('[data-slot="select-trigger"]').click();
    await page.getByRole('option', { name: 'Понедельник' }).click();
    await page.locator('input[type="time"]').first().fill('14:00');
    await page.locator('input[type="time"]').last().fill('17:00');
    await page.getByRole('dialog').getByRole('button', { name: 'Добавить' }).click();

    // 5. Проверяем: в таблице 2 интервала
    await expect(page.getByText('09:00')).toBeVisible();
    await expect(page.getByText('14:00')).toBeVisible();

    // 6. Открываем /, проверяем: 12 слотов
    await goToBooking(page);
    await selectDate(page, MONDAY_DATA_DAY);
    await selectDuration(page, '30');
    await expect.poll(() => slotCount(page)).toBe(12);

    // 7. Возвращаемся на /availability
    await goToAvailability(page);

    // 8. Редактируем первый: 09:00–12:00 → 08:00–12:00
    await page.getByRole('button', { name: 'Редактировать' }).first().click();
    await page.locator('input[type="time"]').first().fill('08:00');
    await page.getByRole('dialog').getByRole('button', { name: 'Сохранить' }).click();

    // 9. Удаляем второй (dismiss)
    await page.getByRole('button', { name: 'Удалить' }).last().click();
    await page.getByRole('dialog').getByRole('button', { name: 'Отмена' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // 10. Проверяем: оба интервала на месте
    await expect(page.getByText('08:00')).toBeVisible();
    await expect(page.getByText('14:00')).toBeVisible();

    // 11. Удаляем второй по-настоящему
    await page.getByRole('button', { name: 'Удалить' }).last().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /^Удалить$/ })
      .click();

    // Ждём закрытия диалога
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // 12. Проверяем: 1 интервал — Пн 08:00–12:00
    await expect(page.getByText('Нет интервалов доступности')).not.toBeVisible();
    await expect(page.getByText('08:00')).toBeVisible();
    await expect(page.getByText('14:00')).not.toBeVisible();

    // 13. Открываем /, проверяем: 8 слотов (08:00–11:30)
    await goToBooking(page);
    await selectDate(page, MONDAY_DATA_DAY);
    await selectDuration(page, '30');
    await expect.poll(() => slotCount(page)).toBe(8);
  });

  test('Сценарий 10: разные дни недели', async ({ page, request }) => {
    // 1. Сидируем доступность Пн и Ср
    await seedAvailability(request);
    await seedAvailability(request, {
      dayOfWeek: 'wednesday',
      startTime: '09:00',
      endTime: '17:00',
    });

    // 2. Открываем /, длительность 30 мин
    await goToBooking(page);
    await selectDuration(page, '30');

    // 3. Пн: 16 слотов
    await selectDate(page, MONDAY_DATA_DAY);
    await expect.poll(() => slotCount(page)).toBe(16);

    // 4. Вт: «Нет свободных слотов»
    await selectDate(page, TUESDAY_DATA_DAY);
    await expect(page.getByText(/Нет свободных слотов/)).toBeVisible();

    // 5. Ср: 16 слотов
    await selectDateNextMonth(page, WEDNESDAY_DATA_DAY);
    await expect.poll(() => slotCount(page)).toBe(16);

    // 6. Бронируем слот на понедельник 09:00
    await selectDate(page, MONDAY_DATA_DAY);
    await selectSlot(page, '09:00');
    await fillBookingForm(page, {
      name: 'Monday User',
      email: 'mon@example.com',
    });
    await submitBooking(page);
    await expect(page.getByText('Встреча забронирована!').first()).toBeVisible();

    // 7. Бронируем слот на среду 09:00
    await page.getByRole('button', { name: 'Новое бронирование' }).click();
    await selectDateNextMonth(page, WEDNESDAY_DATA_DAY);
    await selectDuration(page, '30');
    await selectSlot(page, '09:00');
    await fillBookingForm(page, {
      name: 'Wednesday User',
      email: 'wed@example.com',
    });
    await submitBooking(page);
    await expect(page.getByText('Встреча забронирована!').first()).toBeVisible();

    // 8. Проверяем Пн: 15 слотов
    await page.getByRole('button', { name: 'Новое бронирование' }).click();
    await selectDate(page, MONDAY_DATA_DAY);
    await selectDuration(page, '30');
    await expect.poll(() => slotCount(page)).toBe(15);

    // 9. Проверяем Ср: 15 слотов
    await selectDateNextMonth(page, WEDNESDAY_DATA_DAY);
    await expect.poll(() => slotCount(page)).toBe(15);
  });
});
