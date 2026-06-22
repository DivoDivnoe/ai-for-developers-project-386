import { CalendarIcon, ClockIcon, ListIcon, TriangleAlertIcon } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

const navItems = [
  { to: '/', icon: CalendarIcon, label: 'Бронирование' },
  { to: '/bookings', icon: ListIcon, label: 'Встречи' },
  { to: '/availability', icon: ClockIcon, label: 'Доступность' },
  { to: '/exceptions', icon: TriangleAlertIcon, label: 'Исключения' },
];

const AppSidebar = () => {
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <span className="truncate px-2 text-lg font-semibold">Call Booking</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ to, icon: Icon, label }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton asChild isActive={pathname === to}>
                    <NavLink to={to} end={to === '/'}>
                      <Icon />
                      <span>{label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export const AppLayout = () => (
  <TooltipProvider>
    <SidebarProvider>
      <AppSidebar />
      <main className="flex w-full flex-col">
        <SidebarTrigger />
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
      <Toaster />
    </SidebarProvider>
  </TooltipProvider>
);
