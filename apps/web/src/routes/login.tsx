import { redirect } from 'react-router';
import type { Route } from './+types/login';
import { seo } from '@/lib/seo';
import { pocketbaseClient as pb } from '@/lib/pocketbase-client';
import { LoginScreen } from '@/components/login/login-screen';
import { BRAND_IMAGE } from '@/constants/brand';
export function meta({ matches, location }: Route.MetaArgs) { return seo({ matches, location }, { title: 'Entrar — Adriana Maria', description: 'Acesse com segurança seu painel profissional para gerenciar serviços, fotos da galeria e informações de contato em um único lugar.', image: BRAND_IMAGE, noindex: true }); }
export async function clientLoader() {
  if (pb.authStore.isValid && (pb.authStore.record?.role === 'admin' || pb.authStore.record?.role === 'profissional')) throw redirect('/admin');
  let slotsAvailable = false;
  try {
    const res = await fetch('/api/auth-status', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      slotsAvailable = Boolean(data.slotsAvailable);
    }
  } catch {
    slotsAvailable = false;
  }
  return { slotsAvailable };
}
clientLoader.hydrate = true as const;
export function HydrateFallback() { return <div className="auth-loading"><span className="brand-symbol">AM<span /></span><p>Carregando…</p></div>; }
export default function LoginPage({ loaderData }: Route.ComponentProps) { return <LoginScreen slotsAvailable={loaderData.slotsAvailable} />; }
