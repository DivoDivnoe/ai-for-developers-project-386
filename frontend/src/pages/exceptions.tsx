import { CalendarOff, Plus } from 'lucide-react';
import { useState } from 'react';

import { ExceptionFormDialog } from '@/components/exceptions/exceptions-form-dialog';
import {
  ExceptionsTable,
  ExceptionsTableHeader,
  SkeletonRow,
} from '@/components/exceptions/exceptions-table';
import { Button } from '@/components/ui/button';
import { Table, TableBody } from '@/components/ui/table';
import { useExceptionsQuery } from '@/hooks/use-exceptions';

import type { ScheduleException } from '@/api/exceptions';

export const ExceptionsPage = () => {
  const exceptionsQuery = useExceptionsQuery();
  const [formOpen, setFormOpen] = useState(false);
  const [editException, setEditException] = useState<ScheduleException | undefined>(undefined);

  return (
    <main className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Исключения</h1>
        <Button
          onClick={() => {
            setEditException(undefined);
            setFormOpen(true);
          }}
        >
          <Plus />
          Добавить
        </Button>
      </div>

      {exceptionsQuery.isLoading ? (
        <Table>
          <ExceptionsTableHeader />
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </TableBody>
        </Table>
      ) : exceptionsQuery.isError ? (
        <p className="text-sm text-destructive">
          Не удалось загрузить исключения. Попробуйте позже.
        </p>
      ) : exceptionsQuery.data && exceptionsQuery.data.length > 0 ? (
        <ExceptionsTable
          exceptions={exceptionsQuery.data}
          onEdit={(exception) => {
            setEditException(exception);
            setFormOpen(true);
          }}
        />
      ) : (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <CalendarOff className="size-10 text-muted-foreground" />
          <div>
            <p className="font-medium">Нет исключений</p>
            <p className="text-sm text-muted-foreground">
              Добавьте исключения, чтобы заблокировать слоты на время отпуска или выходных.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditException(undefined);
              setFormOpen(true);
            }}
          >
            <Plus />
            Добавить исключение
          </Button>
        </div>
      )}

      <ExceptionFormDialog open={formOpen} onOpenChange={setFormOpen} exception={editException} />
    </main>
  );
};
