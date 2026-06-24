import type {
  Store,
  BookingRecord,
  AvailabilityIntervalRecord,
  ScheduleExceptionRecord,
  OwnerRecord,
} from './types.js';

const owner: OwnerRecord = {
  name: 'Alex Petrov',
  email: 'alex@callbooking.demo',
};

export const createStore = (): Store => {
  const bookings = new Map<string, BookingRecord>();
  const availability = new Map<string, AvailabilityIntervalRecord>();
  const exceptions = new Map<string, ScheduleExceptionRecord>();

  return {
    listBookings: () => Array.from(bookings.values(), (b) => ({ ...b })),
    getBooking: (id) => {
      const record = bookings.get(id);
      return record ? { ...record } : undefined;
    },
    createBooking: (booking) => {
      bookings.set(booking.id, booking);
    },
    updateBooking: (id, booking) => {
      if (!bookings.has(id)) {
        return undefined;
      }
      bookings.set(id, booking);
      return { ...booking };
    },

    listAvailability: () => Array.from(availability.values(), (a) => ({ ...a })),
    getAvailability: (id) => {
      const record = availability.get(id);
      return record ? { ...record } : undefined;
    },
    createAvailability: (interval) => {
      availability.set(interval.id, interval);
    },
    updateAvailability: (id, interval) => {
      if (!availability.has(id)) {
        return undefined;
      }
      availability.set(id, interval);
      return { ...interval };
    },
    deleteAvailability: (id) => availability.delete(id),

    listExceptions: () => Array.from(exceptions.values(), (e) => ({ ...e })),
    getException: (id) => {
      const record = exceptions.get(id);
      return record ? { ...record } : undefined;
    },
    createException: (exception) => {
      exceptions.set(exception.id, exception);
    },
    updateException: (id, exception) => {
      if (!exceptions.has(id)) {
        return undefined;
      }
      exceptions.set(id, exception);
      return { ...exception };
    },
    deleteException: (id) => exceptions.delete(id),

    getOwner: () => ({ ...owner }),

    reset: () => {
      bookings.clear();
      availability.clear();
      exceptions.clear();
    },
  };
};
