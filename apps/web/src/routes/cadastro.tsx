import { redirect } from 'react-router';
import type { Route } from './+types/cadastro';
import { seo } from '@/lib/seo';
import { pocketbaseClient as pb } from '@/lib/pocketbase-client';
import { RegisterScreen } from '@/components/login/register-screen';
import { BRAND_IMAGE } from '@/constants/brand';
export function meta({ matches, location }: Route.MetaArgs) { return seo({ matches, location }, { title: 'Criar conta — Adriana Maria', description: 'Crie sua conta para acessar a área profissional.', image: BRAND_IMAGE, noindex: true }); }
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
    // network error — default to no slots, redirect to login
  }
  if (!slotsAvailable) throw redirect('/login');
  return { slotsAvailable: true };
}
clientLoader.hydrate = true as const;
export function HydrateFallback() { return <div className="auth-loading"><span className="brand-symbol">AM<span /></span><p>Carregando…</p></div>; }
export default function CadastroPage() { return <RegisterScreen />; }
