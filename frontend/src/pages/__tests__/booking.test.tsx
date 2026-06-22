import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { describe, expect, it, vi } from 'vitest';

import { createQueryClient } from '@/queryClient';

import { BookingPage } from '../booking';

import type { CreateBookingRequest } from '@/api/bookings';
import type { Slot } from '@/api/slots';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const sampleSlot: Slot = {
  startAt: '2026-06-15T10:00:00Z',
  endAt: '2026-06-15T10:15:00Z',
  duration: 15,
};

// useSlotsQuery is called on every render (initial + after date selection),
// so mockReturnValueOnce would be consumed by the hidden first call.
// Mutable module variables let each render see the intended value.
let slots: Slot[];
let isSlotsLoading = false;
let isSlotsError = false;

vi.mock('@/hooks/use-slots', () => ({
  useSlotsQuery: vi.fn(() => ({
    isLoading: isSlotsLoading,
    isError: isSlotsError,
    data: slots,
  })),
}));

vi.mock('@/hooks/use-bookings', () => ({
  useCreateBookingMutation: vi.fn(() => {
    const createAsync = vi.fn(async (body: CreateBookingRequest) => ({
      id: 'new-booking-id',
      startAt: body.startAt,
      duration: body.duration,
      name: body.name,
      email: body.email,
      comment: body.comment,
      status: 'confirmed' as const,
      createdAt: new Date().toISOString(),
    }));
    return { mutateAsync: createAsync, isPending: false };
  }),
  useBookingsQuery: vi.fn(),
  useBookingQuery: vi.fn(),
  useCancelBookingMutation: vi.fn(),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createQueryClient()}>{children}</QueryClientProvider>
);

describe('BookingPage', () => {
  it('renders initial state with date picker and duration selector', () => {
    slots = [];
    isSlotsLoading = false;
    isSlotsError = false;

    render(<BookingPage />, { wrapper });

    expect(screen.getByText('Новое бронирование')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Выберите дату' })).toBeInTheDocument();
    expect(screen.getByText('15 мин')).toBeInTheDocument();
    expect(screen.queryByText('Свободное время')).not.toBeInTheDocument();
    expect(screen.queryByText('Ваши данные')).not.toBeInTheDocument();
  });

  it('shows loading skeleton for slots', async () => {
    slots = [];
    isSlotsLoading = true;
    isSlotsError = false;
    const user = userEvent.setup();

    render(<BookingPage />, { wrapper });

    await user.click(screen.getByRole('button', { name: 'Выберите дату' }));
    await user.click(screen.getByRole('button', { name: /15 июня/ }));

    expect(screen.getByText('Свободное время')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
  });

  it('shows empty message when no slots available', async () => {
    slots = [];
    isSlotsLoading = false;
    isSlotsError = false;
    const user = userEvent.setup();

    render(<BookingPage />, { wrapper });

    await user.click(screen.getByRole('button', { name: 'Выберите дату' }));
    await user.click(screen.getByRole('button', { name: /15 июня/ }));

    expect(
      screen.getByText('Нет свободных слотов на выбранную дату. Выберите другой день.'),
    ).toBeInTheDocument();
  });

  it('shows error when slots fail to load', async () => {
    slots = [];
    isSlotsLoading = false;
    isSlotsError = true;
    const user = userEvent.setup();

    render(<BookingPage />, { wrapper });

    await user.click(screen.getByRole('button', { name: 'Выберите дату' }));
    await user.click(screen.getByRole('button', { name: /15 июня/ }));

    expect(screen.getByText('Не удалось загрузить слоты. Попробуйте позже.')).toBeInTheDocument();
  });

  it('completes full booking flow: date → slot → form → confirmation', async () => {
    slots = [{ ...sampleSlot }];
    isSlotsLoading = false;
    isSlotsError = false;
    const user = userEvent.setup();

    render(<BookingPage />, { wrapper });

    await user.click(screen.getByRole('button', { name: 'Выберите дату' }));
    await user.click(screen.getByRole('button', { name: /15 июня/ }));

    expect(screen.getByText('Свободное время')).toBeInTheDocument();

    const slotButton = screen.getAllByRole('button', { name: /^\d{2}:\d{2}$/ })[0]!;
    await user.click(slotButton);

    expect(screen.getByText('Ваши данные')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Имя'), 'Ivan Ivanov');
    await user.type(screen.getByLabelText('Email'), 'ivan@example.com');

    await user.click(screen.getByRole('button', { name: 'Забронировать' }));

    await waitFor(() => {
      expect(screen.getByText('Встреча забронирована!')).toBeInTheDocument();
    });
    expect(screen.getByText('Ivan Ivanov')).toBeInTheDocument();
    expect(screen.getByText('ivan@example.com')).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith('Встреча забронирована!');
  });
});
