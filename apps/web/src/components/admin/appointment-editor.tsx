import { useState } from 'react';
import { LoaderCircle, Save } from 'lucide-react';
import { toast } from 'sonner';
import { ModalClose } from '@/components/admin/modal-close';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useFormSubmission } from '@/hooks/use-form-submission';
import { useAdmin } from '@/lib/admin-context';
import type { AppointmentRecord } from '@/lib/admin-types';

const STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'concluído', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
];

export function AppointmentEditor({ appointment, onClose }: { appointment: AppointmentRecord | null; onClose: () => void }) {
  const { appointments, user } = useAdmin();
  const form = useFormSubmission({ resetOnSuccess: false, submit: async (_values, data) => {
    data.set('client_name', String(data.get('client_name')).trim());
    data.set('phone', String(data.get('phone')).trim());
    data.set('service', String(data.get('service')).trim());
    data.set('date', String(data.get('date')).trim());
    data.set('time', String(data.get('time')).trim());
    data.set('notes', String(data.get('notes')).trim());
    data.set('status', String(data.get('status')));
    if (appointment) await appointments.update(appointment.id, data); else { data.set('owner', user.id); await appointments.create(data); }
    toast.success(appointment ? 'Agendamento atualizado.' : 'Agendamento registrado.');
    onClose();
  }});
  return <Dialog open onOpenChange={open => { if (!open && !form.isSubmitting) onClose(); }}><DialogContent className="atelier-modal" onInteractOutside={event => { if (form.isSubmitting) event.preventDefault(); }}><ModalClose /><span className="eyebrow">AGENDAMENTOS</span><DialogTitle className="modal-title">{appointment ? 'Editar agendamento' : 'Registrar agendamento'}</DialogTitle><DialogDescription className="modal-description">Anote os dados combinados com a cliente. O agendamento acontece pelo WhatsApp.</DialogDescription><form onSubmit={form.onSubmit} className="editor-form"><input {...form.honeypotProps} />
    <div className="field"><label htmlFor="appt-client">Nome da cliente <span>*</span></label><input id="appt-client" name="client_name" placeholder="Ex.: Maria Silva" defaultValue={appointment?.client_name ?? ''} required maxLength={150} pattern=".*\S.*" disabled={form.isSubmitting} /></div>
    <div className="field"><label htmlFor="appt-phone">Telefone / WhatsApp</label><input id="appt-phone" name="phone" type="tel" placeholder="(11) 99999-9999" defaultValue={appointment?.phone ?? ''} maxLength={30} disabled={form.isSubmitting} /></div>
    <div className="field"><label htmlFor="appt-service">Serviço</label><input id="appt-service" name="service" placeholder="Ex.: Esmaltação em gel" defaultValue={appointment?.service ?? ''} maxLength={150} disabled={form.isSubmitting} /></div>
    <div className="field-row">
      <div className="field"><label htmlFor="appt-date">Data</label><input id="appt-date" name="date" type="date" defaultValue={appointment?.date ?? ''} disabled={form.isSubmitting} /></div>
      <div className="field"><label htmlFor="appt-time">Horário</label><input id="appt-time" name="time" type="time" defaultValue={appointment?.time ?? ''} disabled={form.isSubmitting} /></div>
    </div>
    <div className="field"><label htmlFor="appt-status">Status</label><select id="appt-status" name="status" defaultValue={appointment?.status ?? 'pendente'} disabled={form.isSubmitting}>{STATUS_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
    <div className="field"><label htmlFor="appt-notes">Observações</label><textarea id="appt-notes" name="notes" placeholder="Preferências, detalhes do atendimento…" defaultValue={appointment?.notes ?? ''} rows={3} maxLength={1000} disabled={form.isSubmitting} /></div>
    {form.isError && <p className="form-error" role="alert">Não foi possível salvar. Revise os campos e tente novamente.</p>}
    <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={onClose} disabled={form.isSubmitting}>Cancelar</button><button className="btn btn-primary" disabled={form.isSubmitting}>{form.isSubmitting ? <><LoaderCircle className="spin" size={16} /> Salvando…</> : <><Save size={16} /> {appointment ? 'Salvar alterações' : 'Registrar'}</>}</button></div>
  </form></DialogContent></Dialog>;
}
