import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
	index('routes/home.tsx'),
	route('login', 'routes/login.tsx'),
	route('cadastro', 'routes/cadastro.tsx'),
	route('redefinir-senha', 'routes/redefinir-senha.tsx'),
	route('admin', 'routes/admin.tsx', [
		index('routes/admin-dashboard.tsx'),
		route('servicos', 'routes/admin-services.tsx'),
		route('galeria', 'routes/admin-gallery.tsx'),
		route('agendamentos', 'routes/admin-appointments.tsx'),
	]),
	route('*', 'routes/not-found.tsx'),

	route('sitemap.xml', 'routes/sitemap.xml.ts'),
	route('robots.txt', 'routes/robots.txt.ts'),
	route('api/health', 'routes/api.health.ts'),
	route('api/auth-status', 'routes/api.auth-status.ts'),
	route('api/register', 'routes/api.register.ts'),
	route('api/reset-password', 'routes/api.reset-password.ts'),
	route('api/*', 'routes/api.$.ts'),
] satisfies RouteConfig;
