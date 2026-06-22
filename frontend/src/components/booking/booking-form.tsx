import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useForm, Controller } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import type { Slot } from '@/api/slots';

const bookingFormSchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
  email: z.string().email('Некорректный email'),
  comment: z.string().optional(),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;

type BookingFormProps = {
  slot: Slot;
  onSubmit: (data: BookingFormData) => Promise<void>;
  isSubmitting: boolean;
};

export const BookingForm = ({ slot, onSubmit, isSubmitting }: BookingFormProps) => {
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: { name: '', email: '', comment: '' },
  });

  const timeLabel = format(new Date(slot.startAt), 'd MMMM yyyy, HH:mm', { locale: ru });
  const durationLabel = `${slot.duration} мин`;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Встреча: <span className="font-medium text-foreground">{timeLabel}</span> ({durationLabel})
      </p>

      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Имя</FieldLabel>
            <Input
              {...field}
              id={field.name}
              placeholder="Иван Иванов"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Email</FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="email"
              placeholder="ivan@example.com"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="comment"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Комментарий</FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              placeholder="Тема встречи, вопросы..."
              rows={3}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? 'Бронирование...' : 'Забронировать'}
      </Button>
    </form>
  );
};
