import type { AvailabilityInterval } from '@/api/availability';

export type DayOfWeek = AvailabilityInterval['dayOfWeek'];

export const DAY_LABELS = {
  monday: 'Понедельник',
  tuesday: 'Вторник',
  wednesday: 'Среда',
  thursday: 'Четверг',
  friday: 'Пятница',
  saturday: 'Суббота',
  sunday: 'Воскресенье',
} as const satisfies Record<DayOfWeek, string>;

export const DAY_ORDER = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
} as const satisfies Record<DayOfWeek, number>;

export const DAY_OPTIONS = Object.entries(DAY_LABELS).map(([value, label]) => ({
  value: value as DayOfWeek,
  label,
}));

export const DAY_OF_WEEK_VALUES = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const satisfies DayOfWeek[];
