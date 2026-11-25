import { LoaderCircle, ShieldCheck } from 'lucide-react';
export function AdminLoading() { return <main className="auth-loading"><span className="brand-symbol" aria-hidden="true">a<span /></span><LoaderCircle size={23} className="spin" /><p>Preparando seu espaço…</p><small><ShieldCheck size={14} /> Verificando acesso seguro</small></main>; }
