import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCreateAvailabilityMutation,
  useUpdateAvailabilityMutation,
} from '@/hooks/use-availability';

import { DAY_OF_WEEK_VALUES, DAY_OPTIONS } from './types';

import type { AvailabilityInterval } from '@/api/availability';

const availabilityFormSchema = z
  .object({
    dayOfWeek: z.enum(DAY_OF_WEEK_VALUES),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Неверный формат'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Неверный формат'),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'Время начала должно быть раньше времени окончания',
    path: ['endTime'],
  });

export type AvailabilityFormData = z.infer<typeof availabilityFormSchema>;

export const AvailabilityFormDialog = ({
  open,
  onOpenChange,
  interval,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interval?: AvailabilityInterval;
}) => {
  const createMutation = useCreateAvailabilityMutation();
  const updateMutation = useUpdateAvailabilityMutation();
  const mutation = interval ? updateMutation : createMutation;

  const dayOfWeek = interval?.dayOfWeek;
  const startTime = interval?.startTime;
  const endTime = interval?.endTime;

  const defaults = useMemo(
    () => ({
      dayOfWeek: dayOfWeek ?? 'monday',
      startTime: startTime ?? '09:00',
      endTime: endTime ?? '17:00',
    }),
    [dayOfWeek, startTime, endTime],
  );

  const form = useForm<AvailabilityFormData>({
    resolver: zodResolver(availabilityFormSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (open) form.reset(defaults);
  }, [open, defaults, form]);

  const onSubmit = async (data: AvailabilityFormData) => {
    try {
      if (interval) {
        await updateMutation.mutateAsync({ id: interval.id, body: data });
        toast.success('Интервал обновлён');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Интервал добавлен');
      }
      onOpenChange(false);
    } catch {
      toast.error('Не удалось сохранить интервал');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{interval ? 'Редактировать интервал' : 'Добавить интервал'}</DialogTitle>
          <DialogDescription>
            {interval
              ? 'Измените параметры доступности'
              : 'Настройте регулярный интервал доступности'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Controller
            name="dayOfWeek"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>День недели</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите день" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="startTime"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Время начала</FieldLabel>
                <Input {...field} type="time" aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="endTime"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Время окончания</FieldLabel>
                <Input {...field} type="time" aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Сохранение...' : interval ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
