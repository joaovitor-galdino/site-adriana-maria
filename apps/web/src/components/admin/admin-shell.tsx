import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate, useRevalidator } from 'react-router';
import type { RecordModel } from 'pocketbase';
import { LogOut, Menu, X, ShieldCheck } from 'lucide-react';
import { Toaster } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { useDisclosure } from '@/hooks/use-disclosure';
import { usePocketbaseRecords } from '@/hooks/use-pocketbase-records';
import { BrandMark } from '@/components/brand-mark';
import { adminNavigation } from '@/data/admin-navigation';
import type { ServiceRecord, GalleryRecord, ContactRecord, AppointmentRecord, AvailabilityRecord } from '@/lib/admin-types';
import type { AdminContext } from '@/lib/admin-context';

export function AdminShell({ user, fileToken, connectionError }: { user: RecordModel; fileToken: string; connectionError: boolean }) {
  const menu = useDisclosure({ lockScroll: true });
  const { logout, isLoading, isAuthed } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const revalidator = useRevalidator();
  const enabled = !isLoading && isAuthed;
  const services = usePocketbaseRecords<ServiceRecord>('services', { sort: '-created', enabled });
  const gallery = usePocketbaseRecords<GalleryRecord>('gallery', { sort: '-created', enabled });
  const contacts = usePocketbaseRecords<ContactRecord>('contact_details', { enabled });
  const appointments = usePocketbaseRecords<AppointmentRecord>('appointments', { sort: '-created', enabled });
  const availability = usePocketbaseRecords<AvailabilityRecord>('availability', { enabled });
  const context: AdminContext = { user, fileToken, services, gallery, contacts, appointments, availability };
  const current = adminNavigation.find(item => item.path === location.pathname)?.label ?? 'Visão geral';
  const name = contacts.records[0]?.professional_name || user.name || 'Profissional';
  function signOut() { logout(); navigate('/login', { replace: true }); }
  if (!isLoading && !isAuthed) return <Navigate to="/login" replace />;
  return <div className="admin-app">
    {menu.isOpen && <button className="sidebar-backdrop" aria-label="Fechar menu" onClick={menu.close} />}
    <aside className={`admin-sidebar ${menu.isOpen ? 'is-open' : ''}`} {...menu.panelProps}>
      <div className="sidebar-brand"><BrandMark /><button className="icon-button mobile-only" onClick={menu.close} aria-label="Fechar menu"><X size={20} /></button></div>
      <div className="workspace-tag"><span className="workspace-icon">M</span><span>Meu espaço<small>PAINEL PROFISSIONAL</small></span><ShieldCheck size={14} /></div>
      <span className="nav-caption">GERENCIAMENTO</span>
      <nav className="admin-nav" aria-label="Navegação administrativa">{adminNavigation.map(({ label, path, icon: Icon, end }) => <NavLink key={path} to={path} end={end} className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}><Icon size={19} strokeWidth={1.7} /><span>{label}</span>{path === '/admin/servicos' && services.records.length > 0 && <small>{services.records.length}</small>}{path === '/admin/galeria' && gallery.records.length > 0 && <small>{gallery.records.length}</small>}{path === '/admin/agendamentos' && appointments.records.length > 0 && <small>{appointments.records.length}</small>}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-note"><span className="eyebrow">SEU TRABALHO, EM FOCO</span><p>Cada detalhe conta.<br />Cuide do seu conteúdo.</p><span className="note-line" /></div><button className="sign-out" onClick={signOut}><LogOut size={18} /> Sair da conta</button><div className="sidebar-footer"><span>Adriana Maria © 2026</span><span>v.1.0</span></div></div>
    </aside>
    <div className="admin-body">
      <header className="admin-topbar"><div className="breadcrumbs"><button className="icon-button mobile-only" {...menu.triggerProps} aria-label="Abrir navegação"><Menu size={21} /></button><span>Meu espaço</span><span className="breadcrumb-slash">/</span><strong>{current}</strong></div><div className="topbar-right"><span className="secure-tag"><ShieldCheck size={15} /> Ambiente seguro</span><span className="topbar-divider" /><div className="user-profile"><span className="user-avatar">{name.slice(0, 1).toLocaleUpperCase('pt-BR')}</span><div><strong>{name}</strong><span>{user.role === 'admin' ? 'Administradora' : 'Profissional'}</span></div></div></div></header>
      <main id="main-content" className="admin-content">{connectionError && <div className="load-error" role="alert"><p>Não foi possível verificar a conexão com o servidor.</p><button className="btn btn-secondary" disabled={revalidator.state !== 'idle'} onClick={() => revalidator.revalidate()}>Tentar novamente</button></div>}<Outlet context={context} /></main>
      <footer className="admin-footer"><span>Um espaço pensado para o seu trabalho.</span><span><span className="status-dot" /> Acesso privado e protegido</span></footer>
    </div>
    <Toaster position="bottom-right" richColors closeButton toastOptions={{ style: { fontFamily: 'Manrope, sans-serif', borderRadius: '12px' } }} />
  </div>;
}
