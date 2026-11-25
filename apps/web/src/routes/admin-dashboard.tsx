import type { Route } from './+types/admin-dashboard';
import { seo } from '@/lib/seo';
import { DashboardOverview } from '@/components/admin/dashboard-overview';
import { BRAND_IMAGE } from '@/constants/brand';
export function meta({ matches, location }: Route.MetaArgs) { return seo({ matches, location }, { title: 'Visão geral — Adriana Maria', description: 'Seu resumo profissional: acompanhe os serviços cadastrados, as fotos da galeria e as informações de contato no painel.', image: BRAND_IMAGE, noindex: true }); }
export default function Dashboard() { return <DashboardOverview />; }
