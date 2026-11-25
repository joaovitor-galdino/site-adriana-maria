import { useState } from 'react';
import { LoaderCircle, Save, Upload, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { ModalClose } from '@/components/admin/modal-close';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useFormSubmission } from '@/hooks/use-form-submission';
import { useAdmin } from '@/lib/admin-context';
import { GalleryImage } from '@/components/admin/gallery-image';
import type { GalleryRecord } from '@/lib/admin-types';

export function GalleryEditor({ photo, onClose }: { photo: GalleryRecord | null; onClose: () => void }) {
  const { gallery, user, fileToken } = useAdmin();
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState('');
  const [fileName, setFileName] = useState('');
  const form = useFormSubmission({ resetOnSuccess: false, submit: async (_values, data) => {
    const file = data.get('image');
    if (file instanceof File && file.size > 0) {
      if (file.size > 10485760 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Imagem inválida');
    } else { data.delete('image'); if (!photo) throw new Error('Selecione uma imagem'); }
    data.set('title', String(data.get('title')).trim());
    data.set('description', String(data.get('description')).trim());
    if (photo) await gallery.update(photo.id, data); else { data.set('owner', user.id); await gallery.create(data); }
    toast.success(photo ? 'Foto atualizada com sucesso.' : 'Foto adicionada à sua galeria.');
    onClose();
  }});
  function selectFile(file: File | undefined, input: HTMLInputElement) {
    setFileError(''); setPreview(null); setFileName('');
    if (!file) return;
    if (file.size > 10485760 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setFileError('Escolha uma imagem JPG, PNG ou WebP de até 10 MB.'); input.value = ''; return; }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === 'string') setPreview(reader.result); };
    reader.onerror = () => setFileError('Não foi possível ler esta imagem. Escolha outro arquivo.');
    reader.readAsDataURL(file);
  }
  return <Dialog open onOpenChange={open => { if (!open && !form.isSubmitting) onClose(); }}><DialogContent className="atelier-modal gallery-modal" onInteractOutside={event => { if (form.isSubmitting) event.preventDefault(); }}><ModalClose /><span className="eyebrow">SUA GALERIA</span><DialogTitle className="modal-title">{photo ? 'Editar imagem' : 'Um novo olhar'}</DialogTitle><DialogDescription className="modal-description">Escolha uma foto para fazer parte do seu espaço.</DialogDescription><form onSubmit={form.onSubmit} className="editor-form"><input {...form.honeypotProps} /><div className="field"><label htmlFor="gallery-file">Imagem {!photo && <span>*</span>}</label><label className={`upload-zone ${preview || photo ? 'with-preview' : ''}`} htmlFor="gallery-file">{preview ? <img src={preview} alt="Prévia da imagem selecionada" /> : photo ? <GalleryImage photo={photo} token={fileToken} /> : <><span className="upload-icon"><ImagePlus size={27} strokeWidth={1.5} /></span><strong>Escolha uma imagem</strong><span>ou arraste e solte o arquivo aqui</span></>}<span className="upload-cta"><Upload size={15} /> {photo || preview ? 'Trocar imagem' : 'Selecionar arquivo'}</span><input id="gallery-file" className="file-input-overlay" name="image" type="file" accept="image/jpeg,image/png,image/webp" required={!photo} disabled={form.isSubmitting} onChange={e => selectFile(e.target.files?.[0], e.target)} aria-label={photo ? 'Trocar imagem da galeria' : 'Escolher imagem da galeria'} /></label><span className="field-hint">{fileName || 'JPG, PNG ou WebP. Até 10 MB por imagem.'}</span>{(fileError || form.fieldErrors.image) && <p className="field-error">{fileError || 'Selecione uma imagem válida de até 10 MB.'}</p>}</div><div className="field"><label htmlFor="gallery-title">Título da imagem <span>*</span></label><input id="gallery-title" name="title" placeholder="Ex.: Um detalhe do meu trabalho" defaultValue={photo?.title ?? ''} required maxLength={150} pattern=".*\S.*" disabled={form.isSubmitting} />{form.fieldErrors.title && <p className="field-error">Informe um título válido de até 150 caracteres.</p>}</div><div className="field"><label htmlFor="gallery-description">Descrição</label><textarea id="gallery-description" name="description" placeholder="Conte um pouco sobre esta imagem…" defaultValue={photo?.description ?? ''} rows={2} maxLength={2000} disabled={form.isSubmitting} /><span className="field-hint">Também usada como descrição acessível da foto.</span></div>{form.isError && <p className="form-error" role="alert">Não foi possível salvar a imagem. Confira o arquivo e tente novamente.</p>}<div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={onClose} disabled={form.isSubmitting}>Cancelar</button><button className="btn btn-primary" disabled={form.isSubmitting || Boolean(fileError)}>{form.isSubmitting ? <><LoaderCircle size={16} className="spin" /> Enviando…</> : <><Save size={16} /> {photo ? 'Salvar alterações' : 'Adicionar imagem'}</>}</button></div></form></DialogContent></Dialog>;
}
