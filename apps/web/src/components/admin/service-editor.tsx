import { useState } from 'react';
import { LoaderCircle, Save, Upload, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { ModalClose } from '@/components/admin/modal-close';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useFormSubmission } from '@/hooks/use-form-submission';
import { useAdmin } from '@/lib/admin-context';
import { publicFileUrl } from '@/lib/public-files';
import type { ServiceRecord } from '@/lib/admin-types';

export function ServiceEditor({ service, onClose }: { service: ServiceRecord | null; onClose: () => void }) {
  const { services, user } = useAdmin();
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState('');
  const [fileName, setFileName] = useState('');
  const form = useFormSubmission({ resetOnSuccess: false, submit: async (_values, data) => {
    const file = data.get('image');
    if (file instanceof File && file.size > 0) {
      if (file.size > 10485760 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Imagem inválida');
    } else { data.delete('image'); }
    data.set('name', String(data.get('name')).trim());
    data.set('description', String(data.get('description')).trim());
    const priceRaw = String(data.get('price')).replace(/\s/g, '').replace(',', '.');
    if (priceRaw) data.set('price', priceRaw); else data.delete('price');
    if (service) await services.update(service.id, data); else { data.set('owner', user.id); await services.create(data); }
    toast.success(service ? 'Serviço atualizado com sucesso.' : 'Novo serviço cadastrado.');
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
  const currentImage = service ? publicFileUrl('services', service.id, service.image, '480x480') : '';
  return <Dialog open onOpenChange={open => { if (!open && !form.isSubmitting) onClose(); }}><DialogContent className="atelier-modal gallery-modal" onInteractOutside={event => { if (form.isSubmitting) event.preventDefault(); }}><ModalClose /><span className="eyebrow">SEUS SERVIÇOS</span><DialogTitle className="modal-title">{service ? 'Editar serviço' : 'Um novo serviço'}</DialogTitle><DialogDescription className="modal-description">Dê um nome ao seu trabalho, conte o que o torna especial e informe o preço.</DialogDescription><form onSubmit={form.onSubmit} className="editor-form"><input {...form.honeypotProps} />
    <div className="field"><label htmlFor="service-name">Nome do serviço <span>*</span></label><input id="service-name" name="name" placeholder="Ex.: Esmaltação em gel" defaultValue={service?.name ?? ''} required maxLength={150} pattern=".*\S.*" disabled={form.isSubmitting} />{form.fieldErrors.name && <p className="field-error">Informe um nome válido, com até 150 caracteres.</p>}</div>
    <div className="field"><label htmlFor="service-image">Foto do procedimento</label><label className={`upload-zone ${preview || currentImage ? 'with-preview' : ''}`} htmlFor="service-image">{preview ? <img src={preview} alt="Prévia da imagem selecionada" /> : currentImage ? <img src={currentImage} alt={service?.name ?? ''} /> : <><span className="upload-icon"><ImagePlus size={27} strokeWidth={1.5} /></span><strong>Escolha uma imagem</strong><span>ou arraste e solte o arquivo aqui</span></>}<span className="upload-cta"><Upload size={15} /> {service || preview ? 'Trocar imagem' : 'Selecionar arquivo'}</span><input id="service-image" className="file-input-overlay" name="image" type="file" accept="image/jpeg,image/png,image/webp" disabled={form.isSubmitting} onChange={e => selectFile(e.target.files?.[0], e.target)} aria-label="Escolher foto do procedimento" /></label><span className="field-hint">{fileName || 'JPG, PNG ou WebP. Até 10 MB por imagem.'}</span>{(fileError || form.fieldErrors.image) && <p className="field-error">{fileError || 'Selecione uma imagem válida de até 10 MB.'}</p>}</div>
    <div className="field"><label htmlFor="service-description">Descrição</label><textarea id="service-description" name="description" placeholder="Descreva o serviço, seus diferenciais e o que está incluído…" defaultValue={service?.description ?? ''} rows={4} maxLength={5000} disabled={form.isSubmitting} /><span className="field-hint">Uma apresentação clara ajuda a valorizar seu trabalho.</span>{form.fieldErrors.description && <p className="field-error">A descrição deve ter até 5.000 caracteres.</p>}</div>
    <div className="field"><label htmlFor="service-price">Preço (R$)</label><input id="service-price" name="price" type="text" inputMode="decimal" placeholder="Ex.: 60,00" defaultValue={service?.price ? String(service.price).replace('.', ',') : ''} maxLength={12} disabled={form.isSubmitting} /><span className="field-hint">Deixe vazio para exibir “Consultar” no site público.</span></div>
    {form.isError && <p className="form-error" role="alert">Não foi possível salvar. Revise os campos e tente novamente.</p>}
    <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={onClose} disabled={form.isSubmitting}>Cancelar</button><button className="btn btn-primary" disabled={form.isSubmitting || Boolean(fileError)}>{form.isSubmitting ? <><LoaderCircle className="spin" size={16} /> Salvando…</> : <><Save size={16} /> {service ? 'Salvar alterações' : 'Cadastrar serviço'}</>}</button></div>
  </form></DialogContent></Dialog>;
}
