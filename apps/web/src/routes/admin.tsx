import { redirect } from 'react-router';
import { ClientResponseError } from 'pocketbase';
import type { Route } from './+types/admin';
import { seo } from '@/lib/seo';
import { requireAuth } from '@/lib/require-auth';
import { pocketbaseClient as pb } from '@/lib/pocketbase-client';
import { AdminShell } from '@/components/admin/admin-shell';
import { AdminLoading } from '@/components/admin/admin-loading';
import { BRAND_IMAGE } from '@/constants/brand';
export function meta({ matches, location }: Route.MetaArgs) { return seo({ matches, location }, { title: 'Painel administrativo — Adriana Maria', description: 'Gerencie seu conteúdo profissional com segurança. Seu dashboard, serviços, imagens e contatos organizados em um só lugar.', image: BRAND_IMAGE, noindex: true }); }
export async function clientLoader() {
  const initial = requireAuth('/login');
  if (initial.role !== 'admin' && initial.role !== 'profissional') { pb.authStore.clear(); throw redirect('/login'); }
  try {
    const { record } = await pb.collection('users').authRefresh();
    if (record.role !== 'admin' && record.role !== 'profissional') { pb.authStore.clear(); throw redirect('/login'); }
    const fileToken = await pb.files.getToken();
    return { user: record, fileToken, connectionError: false };
  } catch (error) {
    if (error instanceof ClientResponseError && [400, 401, 403, 404].includes(error.status)) { pb.authStore.clear(); throw redirect('/login'); }
    if (error instanceof Response) throw error;
    return { user: initial, fileToken: '', connectionError: true };
  }
}
clientLoader.hydrate = true as const;
export function HydrateFallback() { return <AdminLoading />; }
export default function Admin({ loaderData }: Route.ComponentProps) { return <AdminShell user={loaderData.user} fileToken={loaderData.fileToken} connectionError={loaderData.connectionError} />; }
