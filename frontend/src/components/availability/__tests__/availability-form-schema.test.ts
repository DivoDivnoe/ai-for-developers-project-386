import { describe, expect, it } from 'vitest';

import { availabilityFormSchema } from '../availability-form-dialog';

describe('availabilityFormSchema', () => {
  it('passes when startTime < endTime', () => {
    const result = availabilityFormSchema.safeParse({
      dayOfWeek: 'monday',
      startTime: '09:00',
      endTime: '17:00',
    });
    expect(result.success).toBe(true);
  });

  it('fails when startTime > endTime', () => {
    const result = availabilityFormSchema.safeParse({
      dayOfWeek: 'monday',
      startTime: '17:00',
      endTime: '09:00',
    });
    expect(result.success).toBe(false);
    const error = result.error!;
    expect(error.issues[0]!.message).toBe('Время начала должно быть раньше времени окончания');
  });

  it('fails when startTime equals endTime', () => {
    const result = availabilityFormSchema.safeParse({
      dayOfWeek: 'monday',
      startTime: '12:00',
      endTime: '12:00',
    });
    expect(result.success).toBe(false);
  });
});
