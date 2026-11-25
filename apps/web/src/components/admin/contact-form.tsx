import { useState } from 'react';
import { LoaderCircle, Save, Upload, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { useFormSubmission } from '@/hooks/use-form-submission';
import { useAdmin } from '@/lib/admin-context';
import { publicFileUrl } from '@/lib/public-files';
import type { ContactRecord } from '@/lib/admin-types';

export function ContactForm({ contact, onClose }: { contact: ContactRecord | undefined; onClose: () => void }) {
  const { contacts, user } = useAdmin();
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState('');
  const form = useFormSubmission({ resetOnSuccess: false, submit: async (_values, data) => {
    const file = data.get('photo');
    if (file instanceof File && file.size > 0) {
      if (file.size > 10485760 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Imagem inválida');
    } else { data.delete('photo'); }
    for (const [key, value] of data.entries()) if (typeof value === 'string') data.set(key, value.trim());
    if (contact) await contacts.update(contact.id, data); else { data.set('owner', user.id); await contacts.create(data); }
    toast.success('Suas informações foram salvas.'); onClose();
  }});
  function selectFile(file: File | undefined, input: HTMLInputElement) {
    setFileError(''); setPreview(null);
    if (!file) return;
    if (file.size > 10485760 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setFileError('Escolha uma imagem JPG, PNG ou WebP de até 10 MB.'); input.value = ''; return; }
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === 'string') setPreview(reader.result); };
    reader.onerror = () => setFileError('Não foi possível ler esta imagem.');
    reader.readAsDataURL(file);
  }
  const currentPhoto = contact ? publicFileUrl('contact_details', contact.id, contact.photo, '480x480') : '';
  return <form onSubmit={form.onSubmit} className="contact-editor"><input {...form.honeypotProps} />
    <fieldset disabled={form.isSubmitting}>
      <legend className="sr-only">Informações de contato</legend>
      <div className="field full-width"><label htmlFor="contact-name">Nome profissional</label><input id="contact-name" name="professional_name" placeholder="Como você ou seu negócio se apresenta" defaultValue={contact?.professional_name ?? ''} maxLength={150} /></div>
      <div className="field full-width"><label htmlFor="contact-presentation">Apresentação curta</label><input id="contact-presentation" name="presentation" placeholder="Ex.: Manicure dedicada ao cuidado e à beleza das suas mãos." defaultValue={contact?.presentation ?? ''} maxLength={600} /><span className="field-hint">Aparece na página inicial, logo abaixo do nome.</span></div>
      <div className="field full-width"><label htmlFor="contact-story">Sobre mim</label><textarea id="contact-story" name="story" placeholder="Conte sua história, sua trajetória e o que torna seu atendimento especial…" defaultValue={contact?.story ?? ''} rows={5} maxLength={5000} /><span className="field-hint">Aparece na seção “Sobre mim” do site público.</span></div>
      <div className="field full-width"><label htmlFor="contact-photo">Sua foto</label><label className={`upload-zone ${preview || currentPhoto ? 'with-preview' : ''}`} htmlFor="contact-photo">{preview ? <img src={preview} alt="Prévia da foto" /> : currentPhoto ? <img src={currentPhoto} alt="Foto atual" /> : <><span className="upload-icon"><ImagePlus size={27} strokeWidth={1.5} /></span><strong>Escolha uma foto</strong><span>usada na página inicial e em “Sobre mim”</span></>}<span className="upload-cta"><Upload size={15} /> {contact || preview ? 'Trocar foto' : 'Selecionar arquivo'}</span><input id="contact-photo" className="file-input-overlay" name="photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={form.isSubmitting} onChange={e => selectFile(e.target.files?.[0], e.target)} aria-label="Escolher foto da profissional" /></label><span className="field-hint">JPG, PNG ou WebP. Até 10 MB.</span>{(fileError || form.fieldErrors.photo) && <p className="field-error">{fileError || 'Selecione uma imagem válida de até 10 MB.'}</p>}</div>
      <div className="field"><label htmlFor="contact-email">E-mail de contato</label><input id="contact-email" name="email" type="email" placeholder="contato@seunegocio.com" defaultValue={contact?.email ?? ''} maxLength={254} />{form.fieldErrors.email && <p className="field-error">Informe um endereço de e-mail válido.</p>}</div>
      <div className="field"><label htmlFor="contact-phone">Telefone</label><input id="contact-phone" name="phone" type="tel" placeholder="(11) 99999-9999" defaultValue={contact?.phone ?? ''} maxLength={30} /></div>
      <div className="field"><label htmlFor="contact-whatsapp">WhatsApp</label><input id="contact-whatsapp" name="whatsapp" type="tel" placeholder="+55 (11) 99999-9999" defaultValue={contact?.whatsapp ?? ''} maxLength={30} /><span className="field-hint">Número com DDD. Habilita o agendamento pelo WhatsApp.</span></div>
      <div className="field"><label htmlFor="contact-instagram">Instagram</label><input id="contact-instagram" name="instagram" placeholder="@seuperfil" defaultValue={contact?.instagram ?? ''} maxLength={100} /><span className="field-hint">Informe o nome de usuário, com ou sem @.</span></div>
      <div className="field full-width"><label htmlFor="contact-address">Endereço</label><textarea id="contact-address" name="address" placeholder="Rua, número, complemento, bairro e cidade" defaultValue={contact?.address ?? ''} maxLength={500} rows={2} /></div>
      <div className="field full-width"><label htmlFor="contact-hours">Horário de atendimento (texto)</label><textarea id="contact-hours" name="hours" placeholder="Ex.: Segunda a sexta, das 9h às 18h. Sábado com horário marcado." defaultValue={contact?.hours ?? ''} maxLength={1000} rows={2} /><span className="field-hint">Exibido quando não há horários cadastrados em “Horários disponíveis”.</span></div>
    </fieldset>
    {form.isError && <p className="form-error" role="alert">Não foi possível salvar suas informações. Verifique os campos e tente novamente.</p>}
    <div className="contact-form-actions"><span>Salvo apenas ao confirmar as alterações.</span><div><button type="button" className="btn btn-secondary" onClick={onClose} disabled={form.isSubmitting}>Cancelar</button><button className="btn btn-primary" disabled={form.isSubmitting}>{form.isSubmitting ? <><LoaderCircle className="spin" size={16} /> Salvando…</> : <><Save size={16} /> Salvar informações</>}</button></div></div>
  </form>;
}
