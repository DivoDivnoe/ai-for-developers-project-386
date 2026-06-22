import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { describe, expect, it, vi } from 'vitest';

import { useExceptionsQuery } from '@/hooks/use-exceptions';
import { createQueryClient } from '@/queryClient';

import { ExceptionsPage } from '../exceptions';

import type { ScheduleException } from '@/api/exceptions';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const exceptionFixture: ScheduleException = {
  id: '1',
  startDate: '2025-01-06',
  endDate: '2025-01-10',
  reason: 'Отпуск',
};

let exceptions: ScheduleException[];

vi.mock('@/hooks/use-exceptions', () => ({
  useExceptionsQuery: vi.fn(() => ({
    isLoading: false,
    isError: false,
    data: exceptions,
  })),
  useCreateExceptionMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useUpdateExceptionMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useRemoveExceptionMutation: vi.fn(() => {
    const removeAsync = vi.fn(async (id: string) => {
      const idx = exceptions.findIndex((e) => e.id === id);
      if (idx !== -1) exceptions.splice(idx, 1);
    });
    return { mutateAsync: removeAsync, isPending: false };
  }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createQueryClient()}>{children}</QueryClientProvider>
);

describe('ExceptionsPage', () => {
  it('renders loading skeleton', () => {
    vi.mocked(useExceptionsQuery).mockReturnValueOnce({
      isLoading: true,
      isError: false,
      data: undefined,
    } as ReturnType<typeof useExceptionsQuery>);

    render(<ExceptionsPage />, { wrapper });

    expect(screen.getByText('Исключения')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
  });

  it('renders error message', () => {
    vi.mocked(useExceptionsQuery).mockReturnValueOnce({
      isLoading: false,
      isError: true,
      data: undefined,
    } as ReturnType<typeof useExceptionsQuery>);

    render(<ExceptionsPage />, { wrapper });
    expect(
      screen.getByText('Не удалось загрузить исключения. Попробуйте позже.'),
    ).toBeInTheDocument();
  });

  it('renders empty state', () => {
    vi.mocked(useExceptionsQuery).mockReturnValueOnce({
      isLoading: false,
      isError: false,
      data: [] as ScheduleException[],
    } as ReturnType<typeof useExceptionsQuery>);

    render(<ExceptionsPage />, { wrapper });
    expect(screen.getByText('Нет исключений')).toBeInTheDocument();
  });

  it('shows exceptions and deletes one with confirmation dialog', async () => {
    exceptions = [{ ...exceptionFixture }];
    const user = userEvent.setup();

    render(<ExceptionsPage />, { wrapper });

    expect(screen.getByText('Отпуск')).toBeInTheDocument();

    const row = screen.getByText('Отпуск').closest('tr')!;
    await user.click(within(row).getByRole('button', { name: 'Удалить' }));

    expect(screen.getByText('Удалить исключение?')).toBeInTheDocument();

    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByText('Удалить'));

    await waitFor(() => {
      expect(screen.queryByText('Отпуск')).not.toBeInTheDocument();
    });
    expect(toast.success).toHaveBeenCalledWith('Исключение удалено');
  });

  it('does not delete when cancel is clicked in dialog', async () => {
    exceptions = [{ ...exceptionFixture }];
    const user = userEvent.setup();

    render(<ExceptionsPage />, { wrapper });

    const row = screen.getByText('Отпуск').closest('tr')!;
    await user.click(within(row).getByRole('button', { name: 'Удалить' }));

    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByText('Отмена'));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Отпуск')).toBeInTheDocument();
  });

  it('opens edit form dialog', async () => {
    exceptions = [{ ...exceptionFixture }];
    const user = userEvent.setup();

    render(<ExceptionsPage />, { wrapper });

    const row = screen.getByText('Отпуск').closest('tr')!;
    await user.click(within(row).getByRole('button', { name: 'Редактировать' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Редактировать исключение')).toBeInTheDocument();
  });
});
