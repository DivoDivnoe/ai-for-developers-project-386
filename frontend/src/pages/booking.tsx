import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  DatePicker,
  DurationSelector,
  SlotPicker,
  BookingForm,
  ConfirmationCard,
  type BookingFormData,
} from '@/components/booking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateBookingMutation } from '@/hooks/use-bookings';
import { useSlotsQuery } from '@/hooks/use-slots';

import type { Booking } from '@/api/bookings';
import type { MeetingDuration, Slot } from '@/api/slots';

export const BookingPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedDuration, setSelectedDuration] = useState<MeetingDuration>(15);
  const [selectedSlot, setSelectedSlot] = useState<Slot | undefined>(undefined);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const slotsQuery = useSlotsQuery({ date: dateStr, duration: selectedDuration });
  const createBooking = useCreateBookingMutation();

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(undefined);
  };

  const handleDurationChange = (duration: MeetingDuration) => {
    setSelectedDuration(duration);
    setSelectedSlot(undefined);
  };

  const handleSubmit = async (formData: BookingFormData) => {
    if (!selectedSlot) {
      console.warn('BookingForm submitted without a selected slot');
      toast.error('Выберите время встречи');
      return;
    }
    try {
      const booking = await createBooking.mutateAsync({
        startAt: selectedSlot.startAt,
        duration: selectedSlot.duration,
        name: formData.name,
        email: formData.email,
        comment: formData.comment || undefined,
      });
      setConfirmedBooking(booking);
      toast.success('Встреча забронирована!');
    } catch {
      toast.error('Не удалось забронировать. Попробуйте другой слот.');
      setSelectedSlot(undefined);
    }
  };

  const handleReset = () => {
    setSelectedDate(undefined);
    setSelectedSlot(undefined);
    setConfirmedBooking(null);
  };

  if (confirmedBooking) {
    return (
      <main className="p-8">
        <ConfirmationCard booking={confirmedBooking} onNewBooking={handleReset} />
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Новое бронирование</h1>
        <p className="text-muted-foreground">Выберите дату, длительность и время для встречи</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Когда?</CardTitle>
          <CardDescription>Выберите дату и длительность встречи</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <DatePicker date={selectedDate} onDateChange={handleDateChange} />
          <DurationSelector value={selectedDuration} onChange={handleDurationChange} />
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>Свободное время</CardTitle>
            <CardDescription>{format(selectedDate, 'd MMMM yyyy', { locale: ru })}</CardDescription>
          </CardHeader>
          <CardContent>
            {slotsQuery.isError ? (
              <p className="text-sm text-destructive">
                Не удалось загрузить слоты. Попробуйте позже.
              </p>
            ) : (
              <SlotPicker
                slots={slotsQuery.data ?? []}
                selectedSlot={selectedSlot}
                onSlotSelect={setSelectedSlot}
                isLoading={slotsQuery.isLoading}
              />
            )}
          </CardContent>
        </Card>
      )}

      {selectedSlot && (
        <Card>
          <CardHeader>
            <CardTitle>Ваши данные</CardTitle>
            <CardDescription>Заполните информацию для бронирования</CardDescription>
          </CardHeader>
          <CardContent>
            <BookingForm
              slot={selectedSlot}
              onSubmit={handleSubmit}
              isSubmitting={createBooking.isPending}
            />
          </CardContent>
        </Card>
      )}
    </main>
  );
};
