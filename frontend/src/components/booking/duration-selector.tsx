import { ClockIcon } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { MeetingDuration } from '@/api/slots';

type DurationSelectorProps = {
  value: MeetingDuration;
  onChange: (value: MeetingDuration) => void;
};

export const DurationSelector = ({ value, onChange }: DurationSelectorProps) => (
  <div className="flex items-center gap-3">
    <ClockIcon className="size-4 text-muted-foreground" />
    <Select value={String(value)} onValueChange={(v) => onChange(Number(v) as MeetingDuration)}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="15">15 мин</SelectItem>
        <SelectItem value="30">30 мин</SelectItem>
      </SelectContent>
    </Select>
  </div>
);
