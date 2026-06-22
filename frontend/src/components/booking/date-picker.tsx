import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type DatePickerProps = {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
};

export const DatePicker = ({ date, onDateChange }: DatePickerProps) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className={cn(
          'w-60 justify-start gap-2 text-left font-normal',
          !date && 'text-muted-foreground',
        )}
      >
        <CalendarIcon className="size-4" />
        {date ? format(date, 'd MMMM yyyy', { locale: ru }) : 'Выберите дату'}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
      <Calendar mode="single" selected={date} onSelect={onDateChange} locale={ru} />
    </PopoverContent>
  </Popover>
);
