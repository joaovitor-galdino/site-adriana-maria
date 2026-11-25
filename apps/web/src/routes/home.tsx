import type { Route } from './+types/home';
import { seo } from '@/lib/seo';
import { pocketbasePublic } from '@/lib/pocketbase-public.server';
import { SiteView } from '@/components/home/site-view';
import { BRAND, BRAND_SOCIAL_IMAGE } from '@/constants/brand';
import type { HomeInitialData } from '@/lib/public-types';
import type { ServiceRecord, GalleryRecord, ContactRecord, AvailabilityRecord } from '@/lib/admin-types';

export function meta({ matches, location }: Route.MetaArgs) {
  const data = matches.find(match => match?.id === 'routes/home.tsx')?.loaderData as HomeInitialData | undefined;
  const name = data?.contact?.professional_name?.trim() || BRAND;
  return seo({ matches, location }, {
    title: `${name} — Manicure`,
    description: 'Manicure e pedicure: pintura de unhas e alongamentos em gel e fibra de vidro. Conheça os serviços, a galeria e os horários. Agende pelo WhatsApp.',
    image: BRAND_SOCIAL_IMAGE,
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'WebSite', name, inLanguage: 'pt-BR' },
      { '@context': 'https://schema.org', '@type': 'Organization', name, description: 'Manicure e pedicure profissional: pintura de unhas, alongamentos em gel e fibra de vidro, galeria e agendamento pelo WhatsApp.' },
    ],
  });
}

export async function loader({ request }: Route.LoaderArgs): Promise<HomeInitialData> {
  const pb = pocketbasePublic(request);
  const safe = async <T,>(promise: Promise<T>, fallback: T): Promise<T> => {
    try { return await promise; } catch { return fallback; }
  };
  const [services, gallery, contact, availability] = await Promise.all([
    safe(pb.listRecords<ServiceRecord>('services', { sort: 'created', perPage: 100 }).then(result => result.items), []),
    safe(pb.listRecords<GalleryRecord>('gallery', { sort: 'created', perPage: 100 }).then(result => result.items), []),
    safe(pb.listRecords<ContactRecord>('contact_details', { perPage: 1 }).then(result => result.items[0] ?? null), null),
    safe(pb.listRecords<AvailabilityRecord>('availability', { perPage: 50 }).then(result => result.items), []),
  ]);
  return { services, gallery, contact, availability };
}

export default function HomePage({ loaderData }: Route.ComponentProps) {
  return <SiteView initial={loaderData} />;
}
