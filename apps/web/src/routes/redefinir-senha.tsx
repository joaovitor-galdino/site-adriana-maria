import type { Route } from './+types/redefinir-senha';
import { seo } from '@/lib/seo';
import { ResetScreen } from '@/components/login/reset-screen';
import { BRAND_IMAGE } from '@/constants/brand';

export function meta({ matches, location }: Route.MetaArgs) {
	return seo({ matches, location }, {
		title: 'Redefinir senha — Adriana Maria',
		description: 'Defina uma nova senha para sua conta profissional.',
		image: BRAND_IMAGE,
		noindex: true,
	});
}

export default function RedefinirSenhaPage() {
	return <ResetScreen />;
}
