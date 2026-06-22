import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { describe, expect, it, vi } from 'vitest';

import { useAvailabilityQuery } from '@/hooks/use-availability';
import { createQueryClient } from '@/queryClient';

import { AvailabilityPage } from '../availability';

import type { AvailabilityInterval } from '@/api/availability';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mondayInterval: AvailabilityInterval = {
  id: '1',
  dayOfWeek: 'monday',
  startTime: '09:00',
  endTime: '17:00',
};

let intervals: AvailabilityInterval[];

vi.mock('@/hooks/use-availability', () => ({
  useAvailabilityQuery: vi.fn(() => ({
    isLoading: false,
    isError: false,
    data: intervals,
  })),
  useCreateAvailabilityMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useUpdateAvailabilityMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useRemoveAvailabilityMutation: vi.fn(() => {
    const removeAsync = vi.fn(async (id: string) => {
      const idx = intervals.findIndex((i) => i.id === id);
      if (idx !== -1) {
        intervals.splice(idx, 1);
      }
    });
    return { mutateAsync: removeAsync, isPending: false };
  }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createQueryClient()}>{children}</QueryClientProvider>
);

describe('AvailabilityPage', () => {
  it('renders loading skeleton', () => {
    vi.mocked(useAvailabilityQuery).mockReturnValueOnce({
      isLoading: true,
      isError: false,
      data: undefined,
    } as ReturnType<typeof useAvailabilityQuery>);

    render(<AvailabilityPage />, { wrapper });

    expect(screen.getByText('Доступность')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
  });

  it('renders error message', () => {
    vi.mocked(useAvailabilityQuery).mockReturnValueOnce({
      isLoading: false,
      isError: true,
      data: undefined,
    } as ReturnType<typeof useAvailabilityQuery>);

    render(<AvailabilityPage />, { wrapper });
    expect(
      screen.getByText('Не удалось загрузить интервалы доступности. Попробуйте позже.'),
    ).toBeInTheDocument();
  });

  it('renders empty state', () => {
    vi.mocked(useAvailabilityQuery).mockReturnValueOnce({
      isLoading: false,
      isError: false,
      data: [] as AvailabilityInterval[],
    } as ReturnType<typeof useAvailabilityQuery>);

    render(<AvailabilityPage />, { wrapper });
    expect(screen.getByText('Нет интервалов доступности')).toBeInTheDocument();
  });

  it('shows intervals and deletes one with confirmation dialog', async () => {
    intervals = [{ ...mondayInterval }];
    const user = userEvent.setup();

    render(<AvailabilityPage />, { wrapper });

    expect(screen.getByText('Понедельник')).toBeInTheDocument();
    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText('17:00')).toBeInTheDocument();

    const row = screen.getByText('Понедельник').closest('tr')!;
    await user.click(within(row).getByRole('button', { name: 'Удалить' }));

    expect(screen.getByText('Удалить интервал?')).toBeInTheDocument();

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/Понедельник/)).toBeInTheDocument();

    await user.click(within(dialog).getByText('Удалить'));

    await waitFor(() => {
      expect(screen.queryByText('Понедельник')).not.toBeInTheDocument();
    });
    expect(toast.success).toHaveBeenCalledWith('Интервал удалён');
  });

  it('does not delete when cancel is clicked in dialog', async () => {
    intervals = [{ ...mondayInterval }];
    const user = userEvent.setup();

    render(<AvailabilityPage />, { wrapper });

    const row = screen.getByText('Понедельник').closest('tr')!;
    await user.click(within(row).getByRole('button', { name: 'Удалить' }));

    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByText('Отмена'));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Понедельник')).toBeInTheDocument();
  });
});
