import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, CalendarDays, MessageCircle, ArrowUpRight } from 'lucide-react';
import { useListFilter } from '@/hooks/use-list-filter';
import { useAdmin } from '@/lib/admin-context';
import type { AppointmentRecord } from '@/lib/admin-types';
import { PageHeading } from '@/components/admin/page-heading';
import { ContentState } from '@/components/admin/content-state';
import { AppointmentEditor } from '@/components/admin/appointment-editor';
import { DeleteConfirmation } from '@/components/admin/delete-confirmation';
import { formatDate, formatTime } from '@/lib/intl-format';
import { whatsappUrl } from '@/lib/contact-links';

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  concluído: 'Concluído',
  cancelado: 'Cancelado',
};

export function AppointmentsManager() {
  const { appointments } = useAdmin();
  const [editing, setEditing] = useState<AppointmentRecord | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<AppointmentRecord | null>(null);
  const filter = useListFilter({ items: appointments.records, searchText: item => `${item.client_name} ${item.phone} ${item.service} ${item.status}`, pageSize: 10 });
  return <>
    <PageHeading eyebrow="ATENDIMENTO / AGENDAMENTOS" title="Seus agendamentos" description="Registre e acompanhe os horários combinados com suas clientes." action={<button className="btn btn-primary" onClick={() => setEditing(null)}><Plus size={17} /> Novo agendamento</button>} />
    <section className="panel manager-panel"><header className="manager-toolbar"><div className="manager-count"><CalendarDays size={19} /><strong>Todos os agendamentos</strong><span className="count-badge">{appointments.isLoading ? '—' : appointments.records.length}</span></div><div className="search-input"><Search size={17} /><input aria-label="Buscar agendamentos" placeholder="Buscar por nome, serviço…" value={filter.query} onChange={e => filter.setQuery(e.target.value)} /></div></header>
      <ContentState loading={appointments.isLoading} error={appointments.error} empty={!appointments.records.length} onRetry={appointments.reload} title="Nenhum agendamento por aqui" description="Registre um horário combinado com uma cliente para acompanhar por aqui." action={<button className="btn btn-primary" onClick={() => setEditing(null)}><Plus size={16} /> Registrar agendamento</button>} />
      {!appointments.isLoading && !appointments.error && appointments.records.length > 0 && <>{filter.results.length ? <div className="service-table-wrap"><table className="service-table"><thead><tr><th>CLIENTE</th><th>SERVIÇO</th><th>DATA / HORA</th><th>STATUS</th><th className="actions-heading">AÇÕES</th></tr></thead><tbody>{filter.results.map(appointment => <tr key={appointment.id}><td><div className="service-name-cell"><span className="service-cell-icon"><CalendarDays size={15} /></span><button onClick={() => setEditing(appointment)}>{appointment.client_name}<ArrowUpRight size={14} /></button></div></td><td className="description-cell"><p>{appointment.service || 'Não informado'}</p></td><td className="date-cell">{appointment.date ? formatDate(appointment.date, { locale: 'pt-BR', day: '2-digit', month: 'short', year: 'numeric' }) : '—'}{appointment.time ? ` · ${formatTime(`1970-01-01T${appointment.time}:00`, { locale: 'pt-BR', timeZone: 'UTC' })}` : ''}</td><td><span className={`status-pill status-${appointment.status}`}>{STATUS_LABEL[appointment.status] ?? appointment.status}</span></td><td><div className="row-actions">{appointment.phone && <a className="icon-button" target="_blank" rel="noreferrer noopener" href={whatsappUrl({ phone: appointment.phone, text: `Olá ${appointment.client_name}! Confirmando seu horário.` })} aria-label={`WhatsApp de ${appointment.client_name}`}><MessageCircle size={16} /></a>}<button className="icon-button" aria-label={`Editar ${appointment.client_name}`} onClick={() => setEditing(appointment)}><Pencil size={16} /></button><button className="icon-button danger" aria-label={`Excluir ${appointment.client_name}`} onClick={() => setDeleting(appointment)}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div> : <ContentState empty title="Nenhum agendamento encontrado" description="Tente buscar por outro nome ou serviço." action={<button className="btn btn-secondary" onClick={filter.reset}>Limpar busca</button>} />}<footer className="list-footer"><span>{filter.matches.length} {filter.matches.length === 1 ? 'agendamento encontrado' : 'agendamentos encontrados'}</span>{filter.pageCount > 1 && <div className="pagination"><button className="btn btn-secondary" disabled={filter.page === 1} onClick={() => filter.setPage(filter.page - 1)}>Anterior</button><span>{filter.page} / {filter.pageCount}</span><button className="btn btn-secondary" disabled={filter.page === filter.pageCount} onClick={() => filter.setPage(filter.page + 1)}>Próxima</button></div>}<span>Atendimento com hora marcada.</span></footer></>}
    </section>
    <div className="section-footnote">Dica: o agendamento acontece pelo WhatsApp. Use esta área para registrar e acompanhar os horários combinados.</div>
    {editing !== undefined && <AppointmentEditor appointment={editing} onClose={() => setEditing(undefined)} />}
    {deleting && <DeleteConfirmation title="Excluir este agendamento?" description={`O agendamento de “${deleting.client_name}” será removido.`} onClose={() => setDeleting(null)} onConfirm={() => appointments.remove(deleting.id)} />}
  </>;
}
