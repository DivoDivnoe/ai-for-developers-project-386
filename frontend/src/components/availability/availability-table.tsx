import { Pencil, Trash2 } from 'lucide-react';
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
import { useRemoveAvailabilityMutation } from '@/hooks/use-availability';

import { DAY_LABELS, DAY_ORDER } from './types';

import type { AvailabilityInterval } from '@/api/availability';

const sortIntervals = (intervals: AvailabilityInterval[]) =>
  [...intervals].sort(
    (a, b) =>
      (DAY_ORDER[a.dayOfWeek] ?? 0) - (DAY_ORDER[b.dayOfWeek] ?? 0) ||
      a.startTime.localeCompare(b.startTime),
  );

const SkeletonRow = () => (
  <TableRow>
    {Array.from({ length: 4 }).map((_, i) => (
      <TableCell key={i}>
        <Skeleton className="h-5 w-full" />
      </TableCell>
    ))}
  </TableRow>
);

const AvailabilityTableHeader = () => (
  <TableHeader>
    <TableRow>
      <TableHead>День недели</TableHead>
      <TableHead>Начало</TableHead>
      <TableHead>Конец</TableHead>
      <TableHead className="w-0" />
    </TableRow>
  </TableHeader>
);

export const AvailabilityTable = ({
  intervals,
  onEdit,
}: {
  intervals: AvailabilityInterval[];
  onEdit: (interval: AvailabilityInterval) => void;
}) => {
  const removeMutation = useRemoveAvailabilityMutation();
  const [deleteTarget, setDeleteTarget] = useState<AvailabilityInterval | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeMutation.mutateAsync(deleteTarget.id);
      toast.success('Интервал удалён');
    } catch {
      toast.error('Не удалось удалить интервал');
    } finally {
      setDeleteTarget(null);
    }
  };

  const sorted = sortIntervals(intervals);

  return (
    <>
      <Table>
        <AvailabilityTableHeader />
        <TableBody>
          {sorted.map((interval) => (
            <TableRow key={interval.id}>
              <TableCell className="font-medium">{DAY_LABELS[interval.dayOfWeek]}</TableCell>
              <TableCell>{interval.startTime}</TableCell>
              <TableCell>{interval.endTime}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-xs" onClick={() => onEdit(interval)}>
                    <Pencil />
                  </Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => setDeleteTarget(interval)}>
                    <Trash2 />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить интервал?</DialogTitle>
            <DialogDescription>
              {deleteTarget && (
                <>
                  Интервал <strong>{DAY_LABELS[deleteTarget.dayOfWeek]}</strong>,{' '}
                  {deleteTarget.startTime}–{deleteTarget.endTime} будет удалён.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={removeMutation.isPending}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={removeMutation.isPending}
            >
              {removeMutation.isPending ? 'Удаление...' : 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { SkeletonRow, AvailabilityTableHeader };
