import { Link } from 'react-router';
import type { Route } from './+types/not-found';
import { seo } from '@/lib/seo';
import { BRAND_IMAGE } from '@/constants/brand';
export function meta({ matches, location }: Route.MetaArgs) { return seo({ matches, location }, { title: 'Página não encontrada — Adriana Maria', description: 'O endereço solicitado não existe. Volte para o início e acesse o painel profissional.', image: BRAND_IMAGE, noindex: true }); }
export function loader() { throw new Response('Página não encontrada', { status: 404 }); }
export function ErrorBoundary() { return <main className="not-found"><span className="eyebrow">ADRIANA MARIA / 404</span><h1>Este endereço não existe.</h1><p>Vamos voltar para um lugar conhecido?</p><Link className="btn btn-primary" to="/">Voltar ao início</Link></main>; }
export default function NotFound() { return null; }
