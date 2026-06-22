import { describe, expect, it } from 'vitest';

import { DAY_LABELS, DAY_OF_WEEK_VALUES, DAY_OPTIONS, DAY_ORDER } from '../types';

describe('DAY_LABELS', () => {
  it('has entries for all 7 days', () => {
    expect(Object.keys(DAY_LABELS)).toHaveLength(7);
  });

  it('maps each day to a non-empty label', () => {
    for (const [day, label] of Object.entries(DAY_LABELS)) {
      expect(label).toBeTruthy();
      expect(DAY_OF_WEEK_VALUES).toContain(day);
    }
  });
});

describe('DAY_ORDER', () => {
  it('assigns monday < tuesday < ... < sunday', () => {
    expect(DAY_ORDER.monday).toBeLessThan(DAY_ORDER.tuesday);
    expect(DAY_ORDER.tuesday).toBeLessThan(DAY_ORDER.wednesday);
    expect(DAY_ORDER.wednesday).toBeLessThan(DAY_ORDER.thursday);
    expect(DAY_ORDER.thursday).toBeLessThan(DAY_ORDER.friday);
    expect(DAY_ORDER.friday).toBeLessThan(DAY_ORDER.saturday);
    expect(DAY_ORDER.saturday).toBeLessThan(DAY_ORDER.sunday);
  });

  it('covers all DAY_OF_WEEK_VALUES', () => {
    expect(Object.keys(DAY_ORDER).sort()).toEqual([...DAY_OF_WEEK_VALUES].sort());
  });
});

describe('DAY_OPTIONS', () => {
  it('has 7 options', () => {
    expect(DAY_OPTIONS).toHaveLength(7);
  });

  it('each option has value and label matching DAY_LABELS', () => {
    for (const opt of DAY_OPTIONS) {
      expect(DAY_LABELS[opt.value]).toBe(opt.label);
    }
  });
});
