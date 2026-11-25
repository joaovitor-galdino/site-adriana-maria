import { useState } from 'react';
import { Images, Maximize2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { publicFileUrl } from '@/lib/public-files';
import type { GalleryRecord } from '@/lib/admin-types';

export function GallerySection({ photos }: { photos: GalleryRecord[] }) {
  const [viewing, setViewing] = useState<GalleryRecord | null>(null);
  const index = viewing ? photos.findIndex(photo => photo.id === viewing.id) : -1;
  function next(direction: number) { const length = photos.length; if (length) setViewing(photos[(index + direction + length) % length]); }
  return <section className="site-section gallery-section" id="galeria">
    <div className="section-head">
      <span className="eyebrow">GALERIA</span>
      <h2>Trabalhos que contam<br />a minha história<span className="headline-dot">.</span></h2>
      <p>Um pouco do que passa por aqui — cada detalhe feito com carinho.</p>
    </div>
    {photos.length
      ? <div className="public-gallery-grid">{photos.map(photo => {
        const src = publicFileUrl('gallery', photo.id, photo.image, '480x480');
        return <button key={photo.id} className="public-gallery-item" onClick={() => setViewing(photo)} aria-label={`Ampliar ${photo.title}`}>
          <img src={src} alt={photo.description || photo.title} loading="lazy" />
          <span className="enlarge-icon"><Maximize2 size={16} /></span>
        </button>;
      })}</div>
      : <div className="empty-card wide"><span className="empty-icon"><Images size={24} strokeWidth={1.4} /></span><h3>Em breve</h3><p>A galeria de trabalhos está sendo montada. Volte logo para ver as novidades.</p></div>}
    {viewing && <Dialog open onOpenChange={open => { if (!open) setViewing(null); }}>
      <DialogContent className="atelier-modal lightbox-modal">
        <DialogTitle className="modal-title">{viewing.title}</DialogTitle>
        <DialogDescription className="modal-description">{viewing.description || 'Registro de um trabalho realizado.'}</DialogDescription>
        <div className="lightbox-image-wrap"><img className="gallery-image-full" src={publicFileUrl('gallery', viewing.id, viewing.image, '800x600')} alt={viewing.description || viewing.title} /></div>
        <div className="lightbox-controls">
          <button className="icon-button" onClick={() => next(-1)} disabled={photos.length < 2} aria-label="Imagem anterior"><ArrowLeft size={19} /></button>
          <span>{index + 1} / {photos.length}</span>
          <button className="icon-button" onClick={() => next(1)} disabled={photos.length < 2} aria-label="Próxima imagem"><ArrowRight size={19} /></button>
        </div>
      </DialogContent>
    </Dialog>}
  </section>;
}
