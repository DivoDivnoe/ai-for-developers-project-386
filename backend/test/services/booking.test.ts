import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { createBooking } from "../../src/services/booking.js";
import { MONDAY_0900, MONDAY, PAST_DATE } from "../helpers/constants.js";
import { createTestAvailability, createTestBooking, createTestException } from "../helpers/factories.js";

import type {
  Store,
  AvailabilityIntervalRecord,
  ScheduleExceptionRecord,
  BookingRecord,
} from "../../src/store/types.js";

const mockStore = (
  overrides?: {
    listAvailability?: AvailabilityIntervalRecord[];
    listExceptions?: ScheduleExceptionRecord[];
    listBookings?: BookingRecord[];
  },
): Store => ({
  listAvailability: vi
    .fn()
    .mockReturnValue(overrides?.listAvailability ?? []),
  listExceptions: vi.fn().mockReturnValue(overrides?.listExceptions ?? []),
  listBookings: vi.fn().mockReturnValue(overrides?.listBookings ?? []),
  createBooking: vi.fn(),
  getBooking: vi.fn().mockReturnValue(undefined),
  updateBooking: vi.fn().mockReturnValue(undefined),
  getAvailability: vi.fn().mockReturnValue(undefined),
  createAvailability: vi.fn(),
  updateAvailability: vi.fn().mockReturnValue(undefined),
  deleteAvailability: vi.fn().mockReturnValue(false),
  getException: vi.fn().mockReturnValue(undefined),
  createException: vi.fn(),
  updateException: vi.fn().mockReturnValue(undefined),
  deleteException: vi.fn().mockReturnValue(false),
  getOwner: vi.fn().mockReturnValue({
    name: "Test Owner",
    email: "owner@test.com",
  }),
});

const validInput = {
  startAt: MONDAY_0900,
  duration: 30 as const,
  name: "Test User",
  email: "test@example.com",
};

describe("createBooking", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-22T08:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates a booking with status confirmed", () => {
    const store = mockStore({
      listAvailability: [
        createTestAvailability({ startTime: "09:00", endTime: "10:00" }),
      ],
    });

    const result = createBooking(store, validInput);

    expect(result.status).toBe("confirmed");
    expect(result.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(result.startAt).toBe(MONDAY_0900);
    expect(result.duration).toBe(30);
    expect(result.name).toBe("Test User");
    expect(result.email).toBe("test@example.com");
    expect(result.createdAt).toBe("2026-06-22T08:00:00.000Z");
    expect(store.createBooking).toHaveBeenCalledOnce();
    expect(store.createBooking).toHaveBeenCalledWith(result);
  });

  it("includes comment when provided", () => {
    const store = mockStore({
      listAvailability: [
        createTestAvailability({ startTime: "09:00", endTime: "10:00" }),
      ],
    });

    const result = createBooking(store, {
      ...validInput,
      comment: "Need projector",
    });

    expect(result.comment).toBe("Need projector");
  });

  it("does not include comment when not provided", () => {
    const store = mockStore({
      listAvailability: [
        createTestAvailability({ startTime: "09:00", endTime: "10:00" }),
      ],
    });

    const result = createBooking(store, validInput);

    expect(result.comment).toBeUndefined();
  });

  it("creates booking via exception when regular availability is empty", () => {
    const store = mockStore({
      listAvailability: [],
      listExceptions: [
        createTestException({
          startDate: MONDAY,
          endDate: MONDAY,
          startTime: "09:00",
          endTime: "10:00",
        }),
      ],
    });

    const result = createBooking(store, validInput);

    expect(result.status).toBe("confirmed");
    expect(result.startAt).toBe(MONDAY_0900);
    expect(store.createBooking).toHaveBeenCalledOnce();
  });

  it("throws 409 when booking in the past", () => {
    const store = mockStore();

    expect(() =>
      createBooking(store, { ...validInput, startAt: PAST_DATE }),
    ).toThrow("Cannot book a slot in the past");
  });

  it("throws 409 when booking at current time (boundary <=)", () => {
    vi.setSystemTime(new Date("2026-06-22T09:00:00.000Z"));

    const store = mockStore({
      listAvailability: [
        createTestAvailability({ startTime: "09:00", endTime: "10:00" }),
      ],
    });

    expect(() =>
      createBooking(store, {
        ...validInput,
        startAt: "2026-06-22T09:00:00.000Z",
      }),
    ).toThrow("Cannot book a slot in the past");
  });

  it("throws 409 when time slot is not available", () => {
    const store = mockStore({
      listAvailability: [
        createTestAvailability({ dayOfWeek: "tuesday" }),
      ],
    });

    expect(() => createBooking(store, validInput)).toThrow(
      "This time slot is not available",
    );
  });

  it("throws 409 when slot is already booked", () => {
    const store = mockStore({
      listAvailability: [
        createTestAvailability({ startTime: "09:00", endTime: "10:00" }),
      ],
      listBookings: [
        createTestBooking({
          startAt: MONDAY_0900,
          duration: 30,
          status: "confirmed",
        }),
      ],
    });

    expect(() => createBooking(store, validInput)).toThrow(
      "This time slot is not available",
    );
  });

  it("generates unique IDs for each booking", () => {
    const store = mockStore({
      listAvailability: [
        createTestAvailability({ startTime: "09:00", endTime: "10:00" }),
      ],
    });

    const result1 = createBooking(store, validInput);
    const result2 = createBooking(store, validInput);

    expect(result1.id).not.toBe(result2.id);
  });
});
