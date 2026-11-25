/**
 * Browser-ready URL for an unprotected PocketBase file. The site's PocketBase
 * is proxied at `/hcgi/platform`, so a relative URL works in SSR HTML and in
 * the browser alike. Protected files (none on the public site) need a token.
 */
export function publicFileUrl(collection: string, recordId: string, filename: string | null | undefined, thumb?: string): string {
  if (!filename) return '';
  const base = `/hcgi/platform/api/files/${collection}/${recordId}/${encodeURIComponent(filename)}`;
  return thumb ? `${base}?thumb=${thumb}` : base;
}
