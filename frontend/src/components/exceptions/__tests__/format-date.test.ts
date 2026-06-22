import { describe, expect, it } from 'vitest';

import { formatDate } from '../format-date';

describe('formatDate', () => {
  it('converts YYYY-MM-DD to DD.MM.YYYY', () => {
    expect(formatDate('2025-03-15')).toBe('15.03.2025');
  });

  it('handles single-digit day and month', () => {
    expect(formatDate('2025-01-05')).toBe('05.01.2025');
  });

  it('handles end-of-year dates', () => {
    expect(formatDate('2025-12-31')).toBe('31.12.2025');
  });
});
