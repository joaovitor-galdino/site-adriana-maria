import type { Route } from './+types/admin-services';
import { seo } from '@/lib/seo';
import { ServicesManager } from '@/components/admin/services-manager';
import { BRAND_IMAGE } from '@/constants/brand';
export function meta({ matches, location }: Route.MetaArgs) { return seo({ matches, location }, { title: 'Gerenciar serviços — Adriana Maria', description: 'Cadastre, consulte, edite e organize os serviços do seu trabalho no espaço profissional, com acesso privado e seguro.', image: BRAND_IMAGE, noindex: true }); }
export default function Services() { return <ServicesManager />; }
