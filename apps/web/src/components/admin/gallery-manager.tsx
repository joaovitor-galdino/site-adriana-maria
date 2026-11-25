import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, Images, Maximize2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useListFilter } from '@/hooks/use-list-filter';
import { useAdmin } from '@/lib/admin-context';
import type { GalleryRecord } from '@/lib/admin-types';
import { ModalClose } from '@/components/admin/modal-close';
import { PageHeading } from '@/components/admin/page-heading';
import { ContentState } from '@/components/admin/content-state';
import { GalleryEditor } from '@/components/admin/gallery-editor';
import { GalleryImage } from '@/components/admin/gallery-image';
import { DeleteConfirmation } from '@/components/admin/delete-confirmation';
import { formatDate } from '@/lib/intl-format';

export function GalleryManager() {
  const { gallery, fileToken } = useAdmin();
  const [editing, setEditing] = useState<GalleryRecord | null | undefined>(undefined);
  const [viewing, setViewing] = useState<GalleryRecord | null>(null);
  const [deleting, setDeleting] = useState<GalleryRecord | null>(null);
  const filter = useListFilter({ items: gallery.records, searchText: item => `${item.title} ${item.description}`, pageSize: 12 });
  const viewIndex = viewing ? filter.matches.findIndex(item => item.id === viewing.id) : -1;
  function next(direction: number) { const length = filter.matches.length; if (length) setViewing(filter.matches[(viewIndex + direction + length) % length]); }
  return <>
    <PageHeading eyebrow="CONTEÚDO / GALERIA" title="Seu olhar, em imagens" description="Uma coleção do que inspira, representa e valoriza seu trabalho." action={<button className="btn btn-primary" onClick={() => setEditing(null)}><Plus size={17} /> Adicionar imagem</button>} />
    <section className="panel manager-panel"><header className="manager-toolbar"><div className="manager-count"><Images size={19} /><strong>Todas as imagens</strong><span className="count-badge">{gallery.isLoading ? '—' : gallery.records.length}</span></div><div className="search-input"><Search size={17} /><input aria-label="Buscar imagens" placeholder="Buscar uma imagem…" value={filter.query} onChange={e => filter.setQuery(e.target.value)} /></div></header><ContentState loading={gallery.isLoading} error={gallery.error} empty={!gallery.records.length} onRetry={gallery.reload} title="Sua galeria espera pelo primeiro olhar" description="Adicione fotos que expressem a essência do seu trabalho." action={<button className="btn btn-primary" onClick={() => setEditing(null)}><Plus size={16} /> Adicionar primeira imagem</button>} />
    {!gallery.isLoading && !gallery.error && gallery.records.length > 0 && <>{filter.results.length ? <div className="gallery-grid">{filter.results.map(photo => <article className="gallery-card" key={photo.id}><button className="gallery-photo-button" onClick={() => setViewing(photo)} aria-label={`Ampliar ${photo.title}`}><GalleryImage photo={photo} token={fileToken} /><span className="enlarge-icon"><Maximize2 size={17} /></span></button><div className="gallery-card-info"><h2>{photo.title}</h2><p>{formatDate(photo.created, { locale: 'pt-BR', day: '2-digit', month: 'short', year: 'numeric' })}</p><div className="gallery-card-actions"><button className="text-button" onClick={() => setEditing(photo)}><Pencil size={14} /> Editar</button><button className="icon-button danger" onClick={() => setDeleting(photo)} aria-label={`Excluir ${photo.title}`}><Trash2 size={16} /></button></div></div></article>)}</div> : <ContentState empty title="Nenhuma imagem encontrada" description="Tente buscar por outro título ou descrição." action={<button className="btn btn-secondary" onClick={filter.reset}>Limpar busca</button>} />}<footer className="list-footer"><span>{filter.matches.length} {filter.matches.length === 1 ? 'imagem encontrada' : 'imagens encontradas'}</span>{filter.pageCount > 1 && <div className="pagination"><button className="btn btn-secondary" disabled={filter.page === 1} onClick={() => filter.setPage(filter.page - 1)}>Anterior</button><span>{filter.page} / {filter.pageCount}</span><button className="btn btn-secondary" disabled={filter.page === filter.pageCount} onClick={() => filter.setPage(filter.page + 1)}>Próxima</button></div>}<span>JPG, PNG e WebP · Até 10 MB</span></footer></>}
    </section><div className="section-footnote">Cada imagem conta uma história. Escolha aquelas que melhor representam você.</div>
    {editing !== undefined && <GalleryEditor photo={editing} onClose={() => setEditing(undefined)} />}
    {viewing && <Dialog open onOpenChange={open => { if (!open) setViewing(null); }}><DialogContent className="atelier-modal lightbox-modal"><ModalClose /><DialogTitle className="modal-title">{viewing.title}</DialogTitle><DialogDescription className="modal-description">{viewing.description || 'Imagem da sua galeria profissional.'}</DialogDescription><div className="lightbox-image-wrap"><GalleryImage key={viewing.id} photo={viewing} token={fileToken} full /></div><div className="lightbox-controls"><button className="icon-button" onClick={() => next(-1)} disabled={filter.matches.length < 2} aria-label="Imagem anterior"><ArrowLeft size={19} /></button><span>{viewIndex + 1} / {filter.matches.length}</span><button className="icon-button" onClick={() => next(1)} disabled={filter.matches.length < 2} aria-label="Próxima imagem"><ArrowRight size={19} /></button><button className="btn btn-secondary" onClick={() => { setEditing(viewing); setViewing(null); }}><Pencil size={15} /> Editar imagem</button></div></DialogContent></Dialog>}
    {deleting && <DeleteConfirmation title="Excluir esta imagem?" description={`A foto “${deleting.title}” e seu arquivo serão removidos da galeria.`} onClose={() => setDeleting(null)} onConfirm={() => gallery.remove(deleting.id)} />}
  </>;
}
