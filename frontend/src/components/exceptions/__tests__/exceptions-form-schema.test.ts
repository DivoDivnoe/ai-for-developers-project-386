import { describe, expect, it } from 'vitest';

import { exceptionFormSchema } from '../exceptions-form-dialog';

describe('exceptionFormSchema', () => {
  // --- refine 1: startDate <= endDate ---

  it('passes when startDate < endDate', () => {
    const result = exceptionFormSchema.safeParse({
      startDate: '2025-01-01',
      endDate: '2025-01-02',
    });
    expect(result.success).toBe(true);
  });

  it('passes when startDate equals endDate', () => {
    const result = exceptionFormSchema.safeParse({
      startDate: '2025-01-01',
      endDate: '2025-01-01',
    });
    expect(result.success).toBe(true);
  });

  it('fails when startDate > endDate', () => {
    const result = exceptionFormSchema.safeParse({
      startDate: '2025-01-02',
      endDate: '2025-01-01',
    });
    expect(result.success).toBe(false);
    expect(result.error!.issues[0]!.message).toBe(
      'Дата начала должна быть не позже даты окончания',
    );
  });

  // --- refine 2: time symmetry (both or neither) ---

  it('passes when both times are set', () => {
    const result = exceptionFormSchema.safeParse({
      startDate: '2025-01-01',
      endDate: '2025-01-01',
      startTime: '09:00',
      endTime: '17:00',
    });
    expect(result.success).toBe(true);
  });

  it('passes when both times are empty', () => {
    const result = exceptionFormSchema.safeParse({
      startDate: '2025-01-01',
      endDate: '2025-01-01',
      startTime: '',
      endTime: '',
    });
    expect(result.success).toBe(true);
  });

  it('passes when both times are omitted', () => {
    const result = exceptionFormSchema.safeParse({
      startDate: '2025-01-01',
      endDate: '2025-01-01',
    });
    expect(result.success).toBe(true);
  });

  it('fails when only startTime is set', () => {
    const result = exceptionFormSchema.safeParse({
      startDate: '2025-01-01',
      endDate: '2025-01-01',
      startTime: '09:00',
    });
    expect(result.success).toBe(false);
    expect(result.error!.issues[0]!.message).toBe('Укажите оба времени или удалите оба');
  });

  it('fails when only endTime is set', () => {
    const result = exceptionFormSchema.safeParse({
      startDate: '2025-01-01',
      endDate: '2025-01-01',
      endTime: '17:00',
    });
    expect(result.success).toBe(false);
    expect(result.error!.issues[0]!.message).toBe('Укажите оба времени или удалите оба');
  });

  // --- refine 3: startTime < endTime (when both set) ---

  it('passes when startTime < endTime', () => {
    const result = exceptionFormSchema.safeParse({
      startDate: '2025-01-01',
      endDate: '2025-01-01',
      startTime: '09:00',
      endTime: '17:00',
    });
    expect(result.success).toBe(true);
  });

  it('fails when startTime > endTime', () => {
    const result = exceptionFormSchema.safeParse({
      startDate: '2025-01-01',
      endDate: '2025-01-01',
      startTime: '17:00',
      endTime: '09:00',
    });
    expect(result.success).toBe(false);
    expect(result.error!.issues[0]!.message).toBe(
      'Время начала должно быть раньше времени окончания',
    );
  });

  it('fails when startTime equals endTime', () => {
    const result = exceptionFormSchema.safeParse({
      startDate: '2025-01-01',
      endDate: '2025-01-01',
      startTime: '12:00',
      endTime: '12:00',
    });
    expect(result.success).toBe(false);
    expect(result.error!.issues[0]!.message).toBe(
      'Время начала должно быть раньше времени окончания',
    );
  });
});
