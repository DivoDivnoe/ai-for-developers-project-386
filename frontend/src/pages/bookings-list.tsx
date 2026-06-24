import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useBookingsQuery, useCancelBookingMutation } from '@/hooks/use-bookings';
import { cn } from '@/lib/utils';

import type { Booking } from '@/api/bookings';

const StatusBadge = ({ status }: { status: Booking['status'] }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
      status === 'confirmed' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive',
    )}
  >
    {status === 'confirmed' ? 'Подтверждена' : 'Отменена'}
  </span>
);

const SkeletonRow = () => (
  <TableRow>
    {Array.from({ length: 8 }).map((_, i) => (
      <TableCell key={i}>
        <Skeleton className="h-5 w-full" />
      </TableCell>
    ))}
  </TableRow>
);

const BookingsTableHeader = () => (
  <TableHeader>
    <TableRow>
      <TableHead>Дата</TableHead>
      <TableHead>Время</TableHead>
      <TableHead>Длительность</TableHead>
      <TableHead>Имя</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Комментарий</TableHead>
      <TableHead>Статус</TableHead>
      <TableHead className="w-0" />
    </TableRow>
  </TableHeader>
);

const BookingsTable = ({ bookings }: { bookings: Booking[] }) => {
  const cancelBooking = useCancelBookingMutation();
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await cancelBooking.mutateAsync(cancelTarget.id);
      toast.success('Встреча отменена');
    } catch {
      toast.error('Не удалось отменить встречу');
    } finally {
      setCancelTarget(null);
    }
  };

  return (
    <>
      <Table>
        <BookingsTableHeader />
        <TableBody>
          {bookings.map((booking) => (
            <TableRow
              key={booking.id}
              className={cn(booking.status === 'cancelled' && 'opacity-60')}
            >
              <TableCell className="font-medium">
                {format(new Date(booking.startAt), 'd MMMM yyyy', { locale: ru })}
              </TableCell>
              <TableCell>{format(new Date(booking.startAt), 'HH:mm')}</TableCell>
              <TableCell>{booking.duration} мин</TableCell>
              <TableCell
                className={cn(
                  'max-w-[200px] truncate',
                  booking.status === 'cancelled' && 'line-through',
                )}
              >
                {booking.name}
              </TableCell>
              <TableCell
                className={cn(
                  'max-w-[200px] truncate',
                  booking.status === 'cancelled' && 'line-through',
                )}
              >
                {booking.email}
              </TableCell>
              <TableCell
                className={cn(
                  'max-w-[200px] truncate',
                  booking.status === 'cancelled' && 'line-through',
                )}
              >
                {booking.comment ?? ''}
              </TableCell>
              <TableCell>
                <StatusBadge status={booking.status} />
              </TableCell>
              <TableCell>
                {booking.status === 'confirmed' && (
                  <Button variant="destructive" size="xs" onClick={() => setCancelTarget(booking)}>
                    Отменить
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={cancelTarget !== null}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отменить встречу?</DialogTitle>
            <DialogDescription>
              {cancelTarget && (
                <>
                  Встреча с <strong>{cancelTarget.name}</strong> на{' '}
                  {format(new Date(cancelTarget.startAt), 'd MMMM yyyy, HH:mm', { locale: ru })} (
                  {cancelTarget.duration} мин) будет отменена.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelTarget(null)}
              disabled={cancelBooking.isPending}
            >
              Закрыть
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelBooking.isPending}>
              {cancelBooking.isPending ? 'Отмена...' : 'Отменить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const BookingsListPage = () => {
  const bookingsQuery = useBookingsQuery();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Список встреч</h1>

      {bookingsQuery.isLoading ? (
        <Table>
          <BookingsTableHeader />
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </TableBody>
        </Table>
      ) : bookingsQuery.isError ? (
        <p className="text-sm text-destructive">
          Не удалось загрузить список встреч. Попробуйте позже.
        </p>
      ) : bookingsQuery.data && bookingsQuery.data.length > 0 ? (
        <BookingsTable bookings={bookingsQuery.data} />
      ) : (
        <p className="text-sm text-muted-foreground">Нет забронированных встреч</p>
      )}
    </main>
  );
};
