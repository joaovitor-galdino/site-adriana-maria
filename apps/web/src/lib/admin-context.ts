import { useOutletContext } from 'react-router';
import type { RecordModel } from 'pocketbase';
import type { usePocketbaseRecords } from '@/hooks/use-pocketbase-records';
import type { ServiceRecord, GalleryRecord, ContactRecord, AppointmentRecord, AvailabilityRecord } from '@/lib/admin-types';
export type RecordStore<T extends RecordModel> = ReturnType<typeof usePocketbaseRecords<T>>;
export type AdminContext = { user: RecordModel; fileToken: string; services: RecordStore<ServiceRecord>; gallery: RecordStore<GalleryRecord>; contacts: RecordStore<ContactRecord>; appointments: RecordStore<AppointmentRecord>; availability: RecordStore<AvailabilityRecord> };
export function useAdmin() { return useOutletContext<AdminContext>(); }
