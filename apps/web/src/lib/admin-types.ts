import type { RecordModel } from 'pocketbase';
export interface ServiceRecord extends RecordModel { name: string; description: string; price: number | null; image: string; }
export interface GalleryRecord extends RecordModel { title: string; description: string; image: string; }
export interface ContactRecord extends RecordModel { professional_name: string; email: string; phone: string; whatsapp: string; instagram: string; address: string; hours: string; presentation: string; story: string; photo: string; }
export interface AppointmentRecord extends RecordModel { client_name: string; phone: string; service: string; date: string; time: string; notes: string; status: string; }
export interface AvailabilityRecord extends RecordModel { weekday: string; start_time: string; end_time: string; enabled: boolean; note: string; }
