import { z } from 'zod';

import type { components } from '../../generated/schema.js';

type DayOfWeek = components['schemas']['DayOfWeek'];

const dayOfWeekValues = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const satisfies readonly DayOfWeek[];

type _assertCoverage = DayOfWeek extends (typeof dayOfWeekValues)[number] ? true : never;
const _check: _assertCoverage = true;

export const uuidParam = z.object({
  id: z.uuid(),
});

export const getSlotsQuery = z.object({
  date: z.iso.date(),
  duration: z.coerce.number().pipe(z.union([z.literal(15), z.literal(30)])),
});

export const createBookingBody = z.object({
  startAt: z.iso.datetime(),
  duration: z.union([z.literal(15), z.literal(30)]),
  name: z.string().min(1),
  email: z.email(),
  comment: z.string().optional(),
});

export const createAvailabilityBody = z
  .object({
    dayOfWeek: z.enum(dayOfWeekValues),
    startTime: z.iso.time(),
    endTime: z.iso.time(),
  })
  .superRefine((data, ctx) => {
    if (data.endTime <= data.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'endTime must be after startTime',
        path: ['endTime'],
      });
    }
  });

export const createExceptionBody = z
  .object({
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    startTime: z.iso.time().optional(),
    endTime: z.iso.time().optional(),
    reason: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.endDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'endDate must be on or after startDate',
        path: ['endDate'],
      });
    }
    if (data.startTime && data.endTime && data.endTime <= data.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'endTime must be after startTime',
        path: ['endTime'],
      });
    }
  });
