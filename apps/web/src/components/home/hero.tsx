import { MessageCircle, ArrowDown, Sparkles } from 'lucide-react';
import { whatsappUrl } from '@/lib/contact-links';
import { BRAND, WHATSAPP_NUMBER } from '@/constants/brand';
import type { ContactRecord } from '@/lib/admin-types';

const ABOUT_STORY = `Sou apaixonada pelo universo da beleza e pelo cuidado com as mãos e os pés. Como manicure, pedicure e Nail desing,  meu objetivo é proporcionar momentos especiais de autocuidado, autoestima e bem-estar para cada cliente.

Trabalho com dedicação, carinho e atenção aos detalhes, oferecendo serviços que valorizam a beleza natural e respeitam o estilo de cada pessoa.

Acredito que cuidar das unhas vai muito além da estética: é também reservar um momento para si mesma, renovar a autoestima e sentir-se ainda mais bonita.

Será um prazer cuidar de você! Porque suas mãos e seus pés também merecem todo esse carinho.`;

export function Hero({ contact }: { contact: ContactRecord | null }) {
  const name = contact?.professional_name?.trim();
  const whatsapp = WHATSAPP_NUMBER;
  return <section className="hero" id="inicio">
    <span id="sobre" aria-hidden="true" className="anchor-target" />
    <div className="hero-inner">
      <div className="hero-copy">
        <span className="eyebrow hero-eyebrow"><span className="tiny-rule" /> ADRIANA MARIA</span>
        <h1>{name || BRAND}<span className="headline-dot">.</span></h1>
        <p className="hero-story">{ABOUT_STORY}</p>
        <div className="hero-actions">
          {whatsapp
            ? <a className="btn btn-whatsapp btn-lg" target="_blank" rel="noreferrer noopener" href={whatsappUrl({ phone: whatsapp, text: 'Olá! Gostaria de agendar um horário.' })}><MessageCircle size={17} /> Agendar horário</a>
            : <span className="btn btn-whatsapp btn-lg is-disabled" title="O WhatsApp ainda não foi configurado no painel."><MessageCircle size={17} /> Agendar horário</span>}
          <a className="btn btn-secondary btn-lg" href="#servicos">Ver serviços <ArrowDown size={16} /></a>
        </div>
        <p className="hero-note"><Sparkles size={14} /><span>Atendimento com hora marcada, no seu tempo.</span></p>
      </div>
      <div className="hero-media">
        <div className="hero-frame">
          <img src="https://horizons-cdn.hostinger.com/8bd31f54-c975-4070-a574-1fac3a6b2576/666c9227e3f6d4acee30b48d9679523b.webp" alt="Adriana sorrindo em seu espaço de atendimento" fetchPriority="high" />
        </div>
        <span className="hero-cross" aria-hidden="true">+</span>
      </div>
    </div>
  </section>;
}
