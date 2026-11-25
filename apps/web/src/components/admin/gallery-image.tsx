import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { pocketbaseClient as pb } from '@/lib/pocketbase-client';
import type { GalleryRecord } from '@/lib/admin-types';
export function GalleryImage({ photo, token, full = false }: { photo: GalleryRecord; token: string; full?: boolean }) {
  const [freshToken, setFreshToken] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  async function recover() { if (freshToken !== null) { setFailed(true); return; } try { setFreshToken(await pb.files.getToken({ requestKey: null })); } catch { setFailed(true); } }
  if (failed) return <div className="image-failed"><ImageOff size={25} /><span>Não foi possível abrir a imagem.</span><span>Reabra a foto para tentar novamente.</span></div>;
  return <img className={full ? 'gallery-image-full' : 'gallery-image'} src={pb.files.getURL(photo, photo.image, { token: freshToken ?? token, ...(full ? {} : { thumb: '480x480' }) })} alt={photo.description || photo.title} loading="lazy" onError={() => { void recover(); }} />;
}
