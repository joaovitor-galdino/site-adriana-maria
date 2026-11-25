import { BrandMark } from '@/components/brand-mark';
import { whatsappUrl } from '@/lib/contact-links';
import { WHATSAPP_NUMBER } from '@/constants/brand';
import type { ContactRecord } from '@/lib/admin-types';

const LINKS = [
  { label: 'Início', href: '#inicio' },
  { label: 'Sobre mim', href: '#sobre' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Galeria', href: '#galeria' },
  { label: 'Contato', href: '#contato' },
];

export function SiteHeader({ contact }: { contact: ContactRecord | null }) {
  const whatsapp = WHATSAPP_NUMBER;
  return <header className="site-header">
    <div className="site-header-inner">
      <BrandMark />
      <nav className="site-nav" aria-label="Navegação principal">
        {LINKS.map(link => <a key={link.href} href={link.href}>{link.label}</a>)}
      </nav>
      <div className="site-header-cta">
        {whatsapp
          ? <a className="btn btn-whatsapp" target="_blank" rel="noreferrer noopener" href={whatsappUrl({ phone: whatsapp, text: 'Olá! Gostaria de agendar um horário.' })}><span aria-hidden="true" className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border border-current text-[8px] font-extrabold leading-none tracking-[-0.05em]">AM</span> Agendar horário</a>
          : <span className="btn btn-whatsapp is-disabled" title="O WhatsApp ainda não foi configurado no painel."><span aria-hidden="true" className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border border-current text-[8px] font-extrabold leading-none tracking-[-0.05em]">AM</span> Agendar horário</span>}
      </div>
    </div>
  </header>;
}
