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
import { useCreateExceptionMutation, useUpdateExceptionMutation } from '@/hooks/use-exceptions';

import type { ScheduleException } from '@/api/exceptions';

export const exceptionFormSchema = z
  .object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат'),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    reason: z.string().optional(),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: 'Дата начала должна быть не позже даты окончания',
    path: ['endDate'],
  })
  .refine(
    (data) => {
      const hasStart = data.startTime !== undefined && data.startTime !== '';
      const hasEnd = data.endTime !== undefined && data.endTime !== '';
      return hasStart === hasEnd;
    },
    {
      message: 'Укажите оба времени или удалите оба',
      path: ['endTime'],
    },
  )
  .refine(
    (data) => {
      const hasStart = data.startTime !== undefined && data.startTime !== '';
      const hasEnd = data.endTime !== undefined && data.endTime !== '';
      if (!hasStart || !hasEnd) return true;
      return data.startTime! < data.endTime!;
    },
    {
      message: 'Время начала должно быть раньше времени окончания',
      path: ['endTime'],
    },
  );

export type ExceptionFormData = z.infer<typeof exceptionFormSchema>;

export const ExceptionFormDialog = ({
  open,
  onOpenChange,
  exception,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exception?: ScheduleException;
}) => {
  const createMutation = useCreateExceptionMutation();
  const updateMutation = useUpdateExceptionMutation();
  const mutation = exception ? updateMutation : createMutation;

  const startDate = exception?.startDate;
  const endDate = exception?.endDate;
  const startTime = exception?.startTime;
  const endTime = exception?.endTime;
  const reason = exception?.reason;

  const defaults = useMemo(
    () => ({
      startDate: startDate ?? '',
      endDate: endDate ?? '',
      startTime: startTime ?? '',
      endTime: endTime ?? '',
      reason: reason ?? '',
    }),
    [startDate, endDate, startTime, endTime, reason],
  );

  const form = useForm<ExceptionFormData>({
    resolver: zodResolver(exceptionFormSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (open) form.reset(defaults);
  }, [open, defaults, form]);

  const onSubmit = async (data: ExceptionFormData) => {
    const body = {
      startDate: data.startDate,
      endDate: data.endDate,
      startTime: data.startTime || undefined,
      endTime: data.endTime || undefined,
      reason: data.reason || undefined,
    };

    try {
      if (exception) {
        await updateMutation.mutateAsync({ id: exception.id, body });
        toast.success('Исключение обновлено');
      } else {
        await createMutation.mutateAsync(body);
        toast.success('Исключение добавлено');
      }
      onOpenChange(false);
    } catch {
      toast.error('Не удалось сохранить исключение');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {exception ? 'Редактировать исключение' : 'Добавить исключение'}
          </DialogTitle>
          <DialogDescription>
            {exception ? 'Измените параметры исключения' : 'Настройте временную блокировку слотов'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Controller
            name="startDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Дата начала</FieldLabel>
                <Input {...field} type="date" aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="endDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Дата окончания</FieldLabel>
                <Input {...field} type="date" aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="startTime"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Время начала (необязательно)</FieldLabel>
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
                <FieldLabel>Время окончания (необязательно)</FieldLabel>
                <Input {...field} type="time" aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="reason"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Причина (необязательно)</FieldLabel>
                <Input {...field} placeholder="Отпуск, выходной..." />
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
              {mutation.isPending ? 'Сохранение...' : exception ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
