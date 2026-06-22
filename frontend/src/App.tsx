import { createBrowserRouter } from 'react-router-dom';

import { AppLayout } from '@/components/layout/app-layout';
import { AvailabilityPage } from '@/pages/availability';
import { BookingPage } from '@/pages/booking';
import { BookingsListPage } from '@/pages/bookings-list';
import { ExceptionsPage } from '@/pages/exceptions';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <BookingPage /> },
      { path: '/bookings', element: <BookingsListPage /> },
      { path: '/availability', element: <AvailabilityPage /> },
      { path: '/exceptions', element: <ExceptionsPage /> },
    ],
  },
]);
