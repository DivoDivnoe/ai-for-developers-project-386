import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';

export const App = () => (
  <main className="p-8">
    <h1 className="text-2xl font-semibold">Call Booking</h1>
    <Button onClick={() => toast.success('UI работает')}>Тест</Button>
    <Toaster />
  </main>
);
