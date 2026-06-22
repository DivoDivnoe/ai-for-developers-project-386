import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CircleCheckIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import type { Booking } from '@/api/bookings';

type ConfirmationCardProps = {
  booking: Booking;
  onNewBooking: () => void;
};

export const ConfirmationCard = ({ booking, onNewBooking }: ConfirmationCardProps) => (
  <Card className="mx-auto w-full max-w-md">
    <CardHeader className="text-center">
      <CircleCheckIcon className="mx-auto size-10 text-green-500" />
      <CardTitle>Встреча забронирована!</CardTitle>
      <CardDescription>
        {format(new Date(booking.startAt), 'd MMMM yyyy, HH:mm', { locale: ru })}
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      <Separator />
      <DetailRow label="Длительность" value={`${booking.duration} мин`} />
      <DetailRow label="Имя" value={booking.name} />
      <DetailRow label="Email" value={booking.email} />
      {booking.comment && <DetailRow label="Комментарий" value={booking.comment} />}
    </CardContent>
    <CardFooter>
      <Button onClick={onNewBooking} variant="outline" className="w-full">
        Новое бронирование
      </Button>
    </CardFooter>
  </Card>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-4 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-right font-medium">{value}</span>
  </div>
);
