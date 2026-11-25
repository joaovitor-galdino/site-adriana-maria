import { usePocketbaseRecords } from '@/hooks/use-pocketbase-records';
import type { ServiceRecord, GalleryRecord, ContactRecord, AvailabilityRecord } from '@/lib/admin-types';
import { DEFAULT_SERVICES } from '@/data/default-services';
import type { HomeInitialData } from '@/lib/public-types';
import { weekdayIndex } from '@/lib/weekdays';
import { SiteHeader } from '@/components/home/site-header';
import { Hero } from '@/components/home/hero';
import { ServicesSection } from '@/components/home/services-section';
import { GallerySection } from '@/components/home/gallery-section';
import { ContactSection } from '@/components/home/contact-section';
import { SiteFooter } from '@/components/home/site-footer';

/**
 * The public site. The server loader seeds the first paint (SEO); the browser
 * then re-reads the same public collections and subscribes to realtime, so
 * every change made in the panel appears here instantly.
 */
export function SiteView({ initial }: { initial?: HomeInitialData }) {
  const services = usePocketbaseRecords<ServiceRecord>('services', { sort: 'created', realtime: true });
  const gallery = usePocketbaseRecords<GalleryRecord>('gallery', { sort: 'created', realtime: true });
  const contacts = usePocketbaseRecords<ContactRecord>('contact_details', { realtime: true });
  const availability = usePocketbaseRecords<AvailabilityRecord>('availability', { realtime: true });

  const serviceList = services.isLoading
    ? (initial?.services ?? [])
    : services.records.length ? services.records : DEFAULT_SERVICES;
  const galleryList = gallery.isLoading ? (initial?.gallery ?? []) : gallery.records;
  const contact = contacts.isLoading ? (initial?.contact ?? null) : (contacts.records[0] ?? null);
  const availabilityList = (availability.isLoading ? (initial?.availability ?? []) : availability.records)
    .slice()
    .sort((a, b) => weekdayIndex(a.weekday) - weekdayIndex(b.weekday) || a.start_time.localeCompare(b.start_time));

  return <div className="site-page">
    <SiteHeader contact={contact} />
    <main>
      <Hero contact={contact} />
      <ServicesSection services={serviceList} contact={contact} />
      <GallerySection photos={galleryList} />
      <ContactSection contact={contact} availability={availabilityList} />
    </main>
    <SiteFooter contact={contact} />
  </div>;
}
