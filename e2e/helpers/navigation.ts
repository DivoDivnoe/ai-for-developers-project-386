import type { Page } from '@playwright/test';

export const goToBooking = (page: Page) => page.goto('/');

export const goToBookings = (page: Page) => page.goto('/bookings');

export const goToAvailability = (page: Page) => page.goto('/availability');

export const goToExceptions = (page: Page) => page.goto('/exceptions');

export const openCalendar = (page: Page) =>
  page.getByRole('button', { name: /^(Выберите дату|\d{1,2}\s)/ }).click();

export const selectDay = (page: Page, dataDay: string) =>
  page.locator(`[data-day="${dataDay}"]`).click();

export const goToNextMonth = (page: Page) => page.locator('.rdp-button_next').click();

export const selectDate = async (page: Page, dataDay: string) => {
  await openCalendar(page);
  await selectDay(page, dataDay);
  await page.keyboard.press('Escape');
};

export const selectDateNextMonth = async (page: Page, dataDay: string) => {
  await openCalendar(page);
  await goToNextMonth(page);
  await selectDay(page, dataDay);
  await page.keyboard.press('Escape');
};

export const selectDuration = async (page: Page, duration: '15' | '30') => {
  const label = duration === '15' ? '15 мин' : '30 мин';
  await page.locator('[data-slot="select-trigger"].w-40').click();
  await page.getByRole('option', { name: label }).click();
};

export const selectSlot = (page: Page, time: string) =>
  page
    .locator('[data-slot="card"]')
    .filter({ hasText: 'Свободное время' })
    .getByRole('button', { name: time })
    .click();

export const fillBookingForm = async (
  page: Page,
  { name, email, comment }: { name: string; email: string; comment?: string },
) => {
  await page.locator('#name').fill(name);
  await page.locator('#email').fill(email);
  if (comment !== undefined) {
    await page.locator('#comment').fill(comment);
  }
};

export const submitBooking = (page: Page) =>
  page.getByRole('button', { name: 'Забронировать' }).click();

export const slotCount = (page: Page) =>
  page
    .locator('[data-slot="card"]')
    .filter({ hasText: 'Свободное время' })
    .getByRole('button')
    .count();
