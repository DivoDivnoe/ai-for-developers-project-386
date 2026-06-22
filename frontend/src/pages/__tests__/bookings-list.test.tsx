import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { useBookingsQuery } from '@/hooks/use-bookings';
import { createQueryClient } from '@/queryClient';

import { BookingsListPage } from '../bookings-list';

import type { Booking } from '@/api/bookings';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const confirmed: Booking = {
  id: '1',
  startAt: '2025-06-15T10:00:00Z',
  duration: 30,
  name: 'Ivan Ivanov',
  email: 'ivan@example.com',
  status: 'confirmed',
  createdAt: '2025-06-10T08:00:00Z',
};

let bookings: Booking[];

vi.mock('@/hooks/use-bookings', () => ({
  useBookingsQuery: vi.fn(() => ({
    isLoading: false,
    isError: false,
    data: bookings,
  })),
  useCancelBookingMutation: vi.fn(() => {
    const cancelAsync = vi.fn(async (id: string) => {
      const idx = bookings.findIndex((b) => b.id === id);
      if (idx !== -1) {
        bookings[idx] = { ...bookings[idx], status: 'cancelled' } as Booking;
      }
      return bookings[idx];
    });
    return { mutateAsync: cancelAsync, isPending: false };
  }),
  useBookingQuery: vi.fn(),
  useCreateBookingMutation: vi.fn(),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createQueryClient()}>{children}</QueryClientProvider>
);

describe('BookingsListPage', () => {
  it('renders loading skeleton', () => {
    vi.mocked(useBookingsQuery).mockReturnValueOnce({
      isLoading: true,
      isError: false,
      data: undefined,
    } as ReturnType<typeof useBookingsQuery>);

    render(<BookingsListPage />, { wrapper });

    expect(screen.getByText('Список встреч')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
  });

  it('renders error message', () => {
    vi.mocked(useBookingsQuery).mockReturnValueOnce({
      isLoading: false,
      isError: true,
      data: undefined,
    } as ReturnType<typeof useBookingsQuery>);

    render(<BookingsListPage />, { wrapper });
    expect(
      screen.getByText('Не удалось загрузить список встреч. Попробуйте позже.'),
    ).toBeInTheDocument();
  });

  it('renders empty message', () => {
    vi.mocked(useBookingsQuery).mockReturnValueOnce({
      isLoading: false,
      isError: false,
      data: [] as Booking[],
    } as ReturnType<typeof useBookingsQuery>);

    render(<BookingsListPage />, { wrapper });
    expect(screen.getByText('Нет забронированных встреч')).toBeInTheDocument();
  });

  it('shows bookings and cancels one with visible status change', async () => {
    bookings = [{ ...confirmed }];
    const user = userEvent.setup();

    render(<BookingsListPage />, { wrapper });

    expect(screen.getByText('Ivan Ivanov')).toBeInTheDocument();
    expect(screen.getByText('Подтверждена')).toBeInTheDocument();

    const row = screen.getByText('Ivan Ivanov').closest('tr')!;
    await user.click(within(row).getByRole('button', { name: 'Отменить' }));

    expect(screen.getByText('Отменить встречу?')).toBeInTheDocument();

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/Ivan Ivanov/)).toBeInTheDocument();

    await user.click(within(dialog).getByText('Отменить'));

    await waitFor(() => {
      expect(screen.getByText('Отменена')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: 'Отменить' })).not.toBeInTheDocument();
  });
});
