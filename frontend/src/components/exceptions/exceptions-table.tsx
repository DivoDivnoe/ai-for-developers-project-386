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
import { useRemoveExceptionMutation } from '@/hooks/use-exceptions';

import { formatDate } from './format-date';

import type { ScheduleException } from '@/api/exceptions';

const sortExceptions = (exceptions: ScheduleException[]) =>
  [...exceptions].sort(
    (a, b) => a.startDate.localeCompare(b.startDate) || a.endDate.localeCompare(b.endDate),
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

const ExceptionsTableHeader = () => (
  <TableHeader>
    <TableRow>
      <TableHead>Период</TableHead>
      <TableHead>Время</TableHead>
      <TableHead>Причина</TableHead>
      <TableHead className="w-0" />
    </TableRow>
  </TableHeader>
);

export const ExceptionsTable = ({
  exceptions,
  onEdit,
}: {
  exceptions: ScheduleException[];
  onEdit: (exception: ScheduleException) => void;
}) => {
  const removeMutation = useRemoveExceptionMutation();
  const [deleteTarget, setDeleteTarget] = useState<ScheduleException | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeMutation.mutateAsync(deleteTarget.id);
      toast.success('Исключение удалено');
    } catch {
      toast.error('Не удалось удалить исключение');
    } finally {
      setDeleteTarget(null);
    }
  };

  const sorted = sortExceptions(exceptions);

  return (
    <>
      <Table>
        <ExceptionsTableHeader />
        <TableBody>
          {sorted.map((ex) => (
            <TableRow key={ex.id}>
              <TableCell className="font-medium">
                {formatDate(ex.startDate)} – {formatDate(ex.endDate)}
              </TableCell>
              <TableCell>
                {ex.startTime && ex.endTime ? `${ex.startTime} – ${ex.endTime}` : 'Весь день'}
              </TableCell>
              <TableCell className="max-w-48 truncate text-muted-foreground">
                {ex.reason || '—'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Редактировать"
                    onClick={() => onEdit(ex)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Удалить"
                    onClick={() => setDeleteTarget(ex)}
                  >
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
            <DialogTitle>Удалить исключение?</DialogTitle>
            <DialogDescription>
              {deleteTarget && (
                <>
                  Исключение{' '}
                  <strong>
                    {formatDate(deleteTarget.startDate)} – {formatDate(deleteTarget.endDate)}
                  </strong>{' '}
                  будет удалено.
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

export { SkeletonRow, ExceptionsTableHeader };
