import { LayoutDashboard, Layers3, Images, CalendarDays } from 'lucide-react';
export const adminNavigation = [
  { label: 'Visão geral', path: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Serviços', path: '/admin/servicos', icon: Layers3, end: false },
  { label: 'Galeria', path: '/admin/galeria', icon: Images, end: false },
  { label: 'Agendamentos', path: '/admin/agendamentos', icon: CalendarDays, end: false },
];
