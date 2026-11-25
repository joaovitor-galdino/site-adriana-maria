import type { Route } from './+types/admin-appointments';
import { seo } from '@/lib/seo';
import { AppointmentsManager } from '@/components/admin/appointments-manager';
import { BRAND_IMAGE } from '@/constants/brand';
export function meta({ matches, location }: Route.MetaArgs) { return seo({ matches, location }, { title: 'Agendamentos — Adriana Maria', description: 'Registre e acompanhe os horários combinados com suas clientes.', image: BRAND_IMAGE, noindex: true }); }
export default function Appointments() { return <AppointmentsManager />; }
