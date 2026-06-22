import { Clock, Plus } from 'lucide-react';
import { useState } from 'react';

import { AvailabilityFormDialog } from '@/components/availability/availability-form-dialog';
import {
  AvailabilityTable,
  AvailabilityTableHeader,
  SkeletonRow,
} from '@/components/availability/availability-table';
import { Button } from '@/components/ui/button';
import { Table, TableBody } from '@/components/ui/table';
import { useAvailabilityQuery } from '@/hooks/use-availability';

import type { AvailabilityInterval } from '@/api/availability';

export const AvailabilityPage = () => {
  const availabilityQuery = useAvailabilityQuery();
  const [formOpen, setFormOpen] = useState(false);
  const [editInterval, setEditInterval] = useState<AvailabilityInterval | undefined>(undefined);

  return (
    <main className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Доступность</h1>
        <Button
          onClick={() => {
            setEditInterval(undefined);
            setFormOpen(true);
          }}
        >
          <Plus />
          Добавить
        </Button>
      </div>

      {availabilityQuery.isLoading ? (
        <Table>
          <AvailabilityTableHeader />
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </TableBody>
        </Table>
      ) : availabilityQuery.isError ? (
        <p className="text-sm text-destructive">
          Не удалось загрузить интервалы доступности. Попробуйте позже.
        </p>
      ) : availabilityQuery.data && availabilityQuery.data.length > 0 ? (
        <AvailabilityTable
          intervals={availabilityQuery.data}
          onEdit={(interval) => {
            setEditInterval(interval);
            setFormOpen(true);
          }}
        />
      ) : (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <Clock className="size-10 text-muted-foreground" />
          <div>
            <p className="font-medium">Нет интервалов доступности</p>
            <p className="text-sm text-muted-foreground">
              Добавьте интервалы, чтобы клиенты могли бронировать встречи.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditInterval(undefined);
              setFormOpen(true);
            }}
          >
            <Plus />
            Добавить интервал
          </Button>
        </div>
      )}

      <AvailabilityFormDialog open={formOpen} onOpenChange={setFormOpen} interval={editInterval} />
    </main>
  );
};
