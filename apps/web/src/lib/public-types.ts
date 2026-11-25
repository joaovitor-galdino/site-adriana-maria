import type { ServiceRecord, GalleryRecord, ContactRecord, AvailabilityRecord } from '@/lib/admin-types';
export type HomeInitialData = {
  services: ServiceRecord[];
  gallery: GalleryRecord[];
  contact: ContactRecord | null;
  availability: AvailabilityRecord[];
};
