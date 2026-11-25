import { MessageCircle, Instagram, MapPin, Clock3, Mail, Phone, ArrowUpRight } from 'lucide-react';
import { whatsappUrl, mapsUrl, mailtoHref, telHref } from '@/lib/contact-links';
import { WHATSAPP_NUMBER } from '@/constants/brand';
import { weekdayLabel } from '@/lib/weekdays';
import type { ContactRecord, AvailabilityRecord } from '@/lib/admin-types';

type Channel = { label: string; value: string; icon: typeof MessageCircle; href: string; external: boolean };

export function ContactSection({ contact, availability }: { contact: ContactRecord | null; availability: AvailabilityRecord[] }) {
  const whatsapp = WHATSAPP_NUMBER;
  const address = contact?.address?.trim();
  const email = contact?.email?.trim();
  const phone = contact?.phone?.trim();
  const openSlots = availability.filter(slot => slot.enabled !== false);
  const grouped = openSlots.length
    ? ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo']
      .map(day => ({ day, slots: openSlots.filter(slot => slot.weekday === day) }))
      .filter(group => group.slots.length)
    : [];
  const channels: Channel[] = [
    whatsapp ? { label: 'WhatsApp', value: 'Agendar horário', icon: MessageCircle, href: whatsappUrl({ phone: whatsapp, text: 'Olá! Gostaria de agendar um horário.' }), external: true } : null,
    { label: 'Instagram', value: '@adrianamaria_unhas', icon: Instagram, href: 'https://instagram.com/adrianamaria_unhas/', external: true },
    phone ? { label: 'Telefone', value: phone, icon: Phone, href: telHref(phone), external: false } : null,
    email ? { label: 'E-mail', value: email, icon: Mail, href: mailtoHref({ email }), external: false } : null,
    address ? { label: 'Endereço', value: address, icon: MapPin, href: mapsUrl({ query: address }), external: true } : null,
  ].filter((channel): channel is Channel => channel !== null);
  return <section className="site-section contact-section" id="contato">
    <div className="section-head">
      <span className="eyebrow">CONTATO</span>
      <h2>Vamos combinar o seu<br />próximo horário<span className="headline-dot">.</span></h2>
      <p>Escolha o canal que for melhor para você — respondo o mais rápido possível.</p>
    </div>
    <div className="contact-grid">
      {channels.length
        ? channels.map(channel => <a key={channel.label} className="contact-card" target={channel.external ? '_blank' : undefined} rel={channel.external ? 'noreferrer noopener' : undefined} href={channel.href}>
          <span className="contact-card-icon"><channel.icon size={20} strokeWidth={1.5} /></span>
          <div><h3>{channel.label}</h3><p>{channel.value}</p></div>
          <ArrowUpRight size={17} />
        </a>)
        : <div className="empty-card wide"><span className="empty-icon"><MessageCircle size={24} strokeWidth={1.4} /></span><h3>Em breve</h3><p>Os canais de contato estão sendo organizados. Volte logo.</p></div>}
      <div className="hours-card">
        <header><span className="contact-card-icon"><Clock3 size={20} strokeWidth={1.5} /></span><h3>Horários de atendimento</h3></header>
        {grouped.length
          ? <ul>{grouped.map(({ day, slots }) => {
            const notes = [...new Set(slots.map(slot => slot.note?.trim()).filter(Boolean))];
            return <li key={day}><strong>{weekdayLabel(day)}</strong><span>8:00 às 18:00{notes.length ? ` · ${notes.join(' · ')}` : ''}</span></li>;
          })}</ul>
          : <p className="hours-text">8:00 às 18:00</p>}
      </div>
    </div>
  </section>;
}
