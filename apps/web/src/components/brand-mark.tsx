import { Link } from 'react-router';
export function BrandMark({ light = false }: { light?: boolean }) {
  return <Link className={`brand ${light ? 'brand-light' : ''}`} to="/" aria-label="Adriana Maria — início"><span className="brand-symbol" aria-hidden="true">AM<span /></span><span>Adriana<span className="brand-dot">.</span><small>ADRIANA MARIA</small></span></Link>;
}
