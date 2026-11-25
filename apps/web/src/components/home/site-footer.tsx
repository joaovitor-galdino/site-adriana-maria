import { Link } from 'react-router';
import { LockKeyhole } from 'lucide-react';
import { BRAND } from '@/constants/brand';
import type { ContactRecord } from '@/lib/admin-types';

export function SiteFooter({ contact }: { contact: ContactRecord | null }) {
  const name = contact?.professional_name?.trim() || BRAND;
  return <footer className="site-footer">
    <div className="site-footer-inner">
      <div className="site-footer-brand">
        <strong>{name}<span className="headline-dot">.</span></strong>
        <p>Dedicação profissional à beleza e ao bem-estar das suas mãos e pés, com cuidado e atenção em cada detalhe.</p>
      </div>
      <nav className="site-footer-nav" aria-label="Navegação do rodapé">
        <a href="#inicio">Início</a>
        <a href="#sobre">Sobre mim</a>
        <a href="#servicos">Serviços</a>
        <a href="#galeria">Galeria</a>
        <a href="#contato">Contato</a>
      </nav>
      <div className="site-footer-meta">
        <Link to="/login" className="admin-link"><LockKeyhole size={13} /> Área administrativa</Link>
        <span>© 2026 {name}</span>
      </div>
    </div>
  </footer>;
}
