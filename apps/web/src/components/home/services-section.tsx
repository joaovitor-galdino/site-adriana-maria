import { MessageCircle, Sparkles } from 'lucide-react';
import { formatMoney } from '@/lib/intl-format';
import { publicFileUrl } from '@/lib/public-files';
import { whatsappUrl } from '@/lib/contact-links';
import { WHATSAPP_NUMBER } from '@/constants/brand';
import type { ContactRecord } from '@/lib/admin-types';

type ServiceLike = { id: string; name: string; description: string; price: number | null; image: string };

const GEL_BATH_IMAGE = '/banho-de-gel.webp';
const FIBER_EXTENSION_IMAGE = '/alongamento-fibra.webp';
const GEL_POLISH_IMAGE = '/esmalta-gel-pes-maos.webp';

function ServiceCard({ service, whatsapp }: { service: ServiceLike; whatsapp: string }) {
  const isGelBath = service.id === 'default-gel' || service.name.trim().toLocaleLowerCase('pt-BR') === 'banho de gel';
  const isFiberExtension = service.id === 'default-fibra' || service.name.trim().toLocaleLowerCase('pt-BR') === 'alongamento com fibra de vidro';
  const isGelPolish = service.id === 'default-esmaltacao' || service.name.trim().toLocaleLowerCase('pt-BR') === 'esmaltação em gel nos pés e mãos';
  const image = isGelBath ? GEL_BATH_IMAGE : isFiberExtension ? FIBER_EXTENSION_IMAGE : isGelPolish ? GEL_POLISH_IMAGE : publicFileUrl('services', service.id, service.image, '480x480');
  const imageAlt = isGelBath ? 'Unhas em gel com pontas laranja e detalhe floral' : isFiberExtension ? 'Alongamento com fibra de vidro com esmaltação rosada brilhante' : isGelPolish ? 'Esmaltação em gel nude nas unhas dos pés' : service.description || service.name;
  const price = typeof service.price === 'number' && service.price > 0 ? formatMoney(service.price, { locale: 'pt-BR', currency: 'BRL' }) : '';
  return <article className="service-card">
    <div className="service-card-media">
      {image
        ? <img src={image} alt={imageAlt} loading="lazy" />
        : <span className="media-placeholder"><Sparkles size={26} strokeWidth={1.3} /></span>}
    </div>
    <div className="service-card-body">
      <h3>{service.name}</h3>
      {service.description && <p>{service.description}</p>}
      <div className="service-card-foot">
        <strong className="service-price">{price || 'Consultar'}</strong>
        {whatsapp
          ? <a className="btn btn-whatsapp btn-small" target="_blank" rel="noreferrer noopener" href={whatsappUrl({ phone: whatsapp, text: `Olá! Gostaria de agendar: ${service.name}.` })}><MessageCircle size={14} /> Agendar horário</a>
          : <span className="btn btn-whatsapp btn-small is-disabled" title="O WhatsApp ainda não foi configurado no painel."><MessageCircle size={14} /> Agendar horário</span>}
      </div>
    </div>
  </article>;
}

export function ServicesSection({ services, contact }: { services: ServiceLike[]; contact: ContactRecord | null }) {
  const whatsapp = WHATSAPP_NUMBER;
  return <section className="site-section services-section" id="servicos">
    <div className="section-head">
      <span className="eyebrow">SERVIÇOS E VALORES</span>
      <h2>Cuidados pensados<br />para você<span className="headline-dot">.</span></h2>
      <p>Cada atendimento começa com uma conversa, para entender o que as suas mãos precisam.</p>
    </div>
    {services.length
      ? <div className="services-grid">{services.map(service => <ServiceCard key={service.id} service={service} whatsapp={whatsapp} />)}</div>
      : <div className="empty-card wide"><span className="empty-icon"><Sparkles size={24} strokeWidth={1.4} /></span><h3>Em breve</h3><p>A lista de serviços e valores está sendo preparada. Volte logo para conferir.</p></div>}
  </section>;
}
