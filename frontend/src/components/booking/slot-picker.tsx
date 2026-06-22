import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import type { Slot } from '@/api/slots';

type SlotPickerProps = {
  slots: Slot[];
  selectedSlot: Slot | undefined;
  onSlotSelect: (slot: Slot) => void;
  isLoading: boolean;
};

export const SlotPicker = ({ slots, selectedSlot, onSlotSelect, isLoading }: SlotPickerProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          // eslint-disable-next-line @eslint-react/no-array-index-key -- static identical placeholders
          <Skeleton key={i} className="h-9 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Нет свободных слотов на выбранную дату. Выберите другой день.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((slot) => {
        const isSelected = selectedSlot?.startAt === slot.startAt;
        return (
          <Button
            key={slot.startAt}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            className={cn('font-mono', isSelected && 'shadow-sm')}
            onClick={() => onSlotSelect(slot)}
          >
            {format(new Date(slot.startAt), 'HH:mm')}
          </Button>
        );
      })}
    </div>
  );
};
