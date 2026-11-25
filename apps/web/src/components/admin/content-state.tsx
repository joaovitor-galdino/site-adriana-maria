import type { ReactNode } from 'react';
import { LoaderCircle, AlertCircle, FolderOpen } from 'lucide-react';
export function ContentState({ loading, error, empty, onRetry, title = 'Ainda não há conteúdo por aqui', description = 'Comece adicionando seu primeiro item.', action }: { loading?: boolean; error?: unknown; empty?: boolean; onRetry?: () => void; title?: string; description?: string; action?: ReactNode }) {
  if (loading) return <div className="content-state" role="status"><LoaderCircle size={26} className="spin" /><h3>Carregando seu conteúdo…</h3><p>Estamos preparando tudo para você.</p></div>;
  if (error) return <div className="content-state error-state" role="alert"><AlertCircle size={29} /><h3>Não foi possível carregar</h3><p>Verifique sua conexão e tente novamente.</p><button className="btn btn-secondary" onClick={onRetry}>Tentar novamente</button></div>;
  if (empty) return <div className="content-state"><span className="empty-icon"><FolderOpen size={27} strokeWidth={1.4} /></span><h3>{title}</h3><p>{description}</p>{action}</div>;
  return null;
}
