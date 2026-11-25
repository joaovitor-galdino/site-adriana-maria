import type { Route } from './+types/admin-gallery';
import { seo } from '@/lib/seo';
import { GalleryManager } from '@/components/admin/gallery-manager';
import { BRAND_IMAGE } from '@/constants/brand';
export function meta({ matches, location }: Route.MetaArgs) { return seo({ matches, location }, { title: 'Gerenciar galeria — Adriana Maria', description: 'Envie suas fotos, consulte e edite títulos e descrições e organize a galeria que representa seu trabalho no seu espaço profissional.', image: BRAND_IMAGE, noindex: true }); }
export default function Gallery() { return <GalleryManager />; }
