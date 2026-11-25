import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Plus, Search, Pencil, Trash2, Eye, Layers3, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useListFilter } from '@/hooks/use-list-filter';
import { useAdmin } from '@/lib/admin-context';
import { DEFAULT_SERVICES } from '@/data/default-services';
import type { ServiceRecord } from '@/lib/admin-types';
import { ModalClose } from '@/components/admin/modal-close';
import { PageHeading } from '@/components/admin/page-heading';
import { ContentState } from '@/components/admin/content-state';
import { ServiceEditor } from '@/components/admin/service-editor';
import { DeleteConfirmation } from '@/components/admin/delete-confirmation';
import { formatDate, formatMoney } from '@/lib/intl-format';
import { publicFileUrl } from '@/lib/public-files';

export function ServicesManager() {
  const { services, user } = useAdmin();
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState<ServiceRecord | null | undefined>(undefined);
  const [viewing, setViewing] = useState<ServiceRecord | null>(null);
  const [deleting, setDeleting] = useState<ServiceRecord | null>(null);
  const filter = useListFilter({ items: services.records, searchText: item => `${item.name} ${item.description}`, pageSize: 10 });
  const newRequested = params.get('novo') === '1';
  const modalOpen = editing !== undefined || newRequested;
  const [adding, setAdding] = useState<string | null>(null);
  async function addSuggested(name: string) {
    setAdding(name);
    try { await services.create({ name, owner: user.id }); toast.success(`Serviço “${name}” adicionado.`); }
    catch { toast.error('Não foi possível adicionar o serviço. Tente novamente.'); }
    finally { setAdding(null); }
  }
  function closeEditor() { setEditing(undefined); if (newRequested) { const next = new URLSearchParams(params); next.delete('novo'); setParams(next, { replace: true }); } }
  return <>
    <PageHeading eyebrow="CONTEÚDO / SERVIÇOS" title="Seu trabalho, em palavras" description="Apresente, organize e valorize cada serviço que você oferece." action={<button className="btn btn-primary" onClick={() => setEditing(null)}><Plus size={17} /> Novo serviço</button>} />
    <section className="panel manager-panel"><header className="manager-toolbar"><div className="manager-count"><Layers3 size={19} /><strong>Todos os serviços</strong><span className="count-badge">{services.isLoading ? '—' : services.records.length}</span></div><div className="search-input"><Search size={17} /><input aria-label="Buscar serviços" placeholder="Buscar um serviço…" value={filter.query} onChange={e => filter.setQuery(e.target.value)} /></div></header>
      <ContentState loading={services.isLoading} error={services.error} empty={!services.records.length} onRetry={services.reload} title="Vamos apresentar seu trabalho?" description="Cadastre seu primeiro serviço e dê forma ao que você oferece." action={<button className="btn btn-primary" onClick={() => setEditing(null)}><Plus size={16} /> Cadastrar primeiro serviço</button>} />
      {!services.isLoading && !services.error && services.records.length > 0 && <>{filter.results.length ? <div className="service-table-wrap"><table className="service-table"><thead><tr><th>SERVIÇO</th><th>DESCRIÇÃO</th><th>PREÇO</th><th>CADASTRADO EM</th><th className="actions-heading">AÇÕES</th></tr></thead><tbody>{filter.results.map((service, index) => <tr key={service.id}><td><div className="service-name-cell"><span className="service-cell-icon">{String((filter.page - 1) * 10 + index + 1).padStart(2, '0')}</span><button onClick={() => setViewing(service)}>{service.name}<ArrowUpRight size={14} /></button></div></td><td className="description-cell"><p>{service.description || 'Sem descrição'}</p></td><td className="price-cell">{typeof service.price === 'number' && service.price > 0 ? formatMoney(service.price, { locale: 'pt-BR', currency: 'BRL' }) : '—'}</td><td className="date-cell">{formatDate(service.created, { locale: 'pt-BR', day: '2-digit', month: 'short', year: 'numeric' })}</td><td><div className="row-actions"><button className="icon-button" aria-label={`Visualizar ${service.name}`} onClick={() => setViewing(service)}><Eye size={17} /></button><button className="icon-button" aria-label={`Editar ${service.name}`} onClick={() => setEditing(service)}><Pencil size={16} /></button><button className="icon-button danger" aria-label={`Excluir ${service.name}`} onClick={() => setDeleting(service)}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div> : <ContentState empty title="Nenhum serviço encontrado" description="Tente buscar por outro nome ou descrição." action={<button className="btn btn-secondary" onClick={filter.reset}>Limpar busca</button>} />}<footer className="list-footer"><span>{filter.matches.length} {filter.matches.length === 1 ? 'serviço encontrado' : 'serviços encontrados'}</span>{filter.pageCount > 1 && <div className="pagination"><button className="btn btn-secondary" disabled={filter.page === 1} onClick={() => filter.setPage(filter.page - 1)}>Anterior</button><span>{filter.page} / {filter.pageCount}</span><button className="btn btn-secondary" disabled={filter.page === filter.pageCount} onClick={() => filter.setPage(filter.page + 1)}>Próxima</button></div>}<span>Seu conteúdo, sempre organizado.</span></footer></>}
    </section>
    {!services.isLoading && !services.error && services.records.length === 0 && (
      <div className="quick-add">
        <span className="eyebrow">SUGESTÕES PARA COMEÇAR</span>
        <p>Adicione rapidamente os serviços que você oferece. Você pode editar os detalhes depois.</p>
        <div className="quick-add-list">
          {DEFAULT_SERVICES.map(service => (
            <button key={service.id} className="btn btn-secondary" onClick={() => addSuggested(service.name)} disabled={adding === service.name}>
              <Plus size={15} /> {adding === service.name ? 'Adicionando…' : service.name}
            </button>
          ))}
        </div>
      </div>
    )}
    <div className="section-footnote">Dica: use nomes objetivos, descrições que transmitam a essência e fotos que mostrem o resultado.</div>
    {modalOpen && <ServiceEditor service={editing ?? null} onClose={closeEditor} />}
    {viewing && <Dialog open onOpenChange={open => { if (!open) setViewing(null); }}><DialogContent className="atelier-modal"><ModalClose /><span className="eyebrow">SEU SERVIÇO</span><DialogTitle className="modal-title">{viewing.name}</DialogTitle><DialogDescription className="service-detail-description">{viewing.description || 'Nenhuma descrição adicionada a este serviço.'}</DialogDescription><p className="field-hint">Preço: {typeof viewing.price === 'number' && viewing.price > 0 ? formatMoney(viewing.price, { locale: 'pt-BR', currency: 'BRL' }) : 'Não informado'}</p><p className="field-hint">Cadastrado em {formatDate(viewing.created, { locale: 'pt-BR', dateStyle: 'long' })}</p><div className="modal-actions"><button className="btn btn-secondary" onClick={() => setViewing(null)}>Fechar</button><button className="btn btn-primary" onClick={() => { setEditing(viewing); setViewing(null); }}><Pencil size={16} /> Editar serviço</button></div></DialogContent></Dialog>}
    {deleting && <DeleteConfirmation title="Excluir este serviço?" description={`O serviço “${deleting.name}” será removido da sua conta.`} onClose={() => setDeleting(null)} onConfirm={() => services.remove(deleting.id)} />}
  </>;
}
