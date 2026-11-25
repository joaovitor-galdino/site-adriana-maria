import { apiError, json, readJsonBody, withApi } from '@/lib/api.server';
import { pocketbaseAdmin } from '@/lib/pocketbase-client.server';

// public-route: gated self-registration. Creates a user with 'admin' privileges
// while fewer than two users exist, but ONLY when the caller supplies the
// site's SETUP_TOKEN (a Secret saved by the site owner). Without the token,
// no visitor can create an administrative account. The PocketBase user-limit
// hook enforces the same two-account cap on the backend regardless of how the
// record is created, so a concurrent request or a direct API call cannot
// exceed two accounts. No information about existing users is returned.
export const action = withApi(async ({ request }) => {
	const setupToken = process.env.SETUP_TOKEN;

	if (!setupToken) {
		return apiError(
			403,
			'O cadastro não está disponível. Solicite ao responsável a configuração do código de acesso.',
		);
	}

	const { name, email, password, setupToken: submittedToken } = await readJsonBody<{
		name?: string;
		email?: string;
		password?: string;
		setupToken?: string;
	}>(request);

	if (!submittedToken || submittedToken !== setupToken) {
		return apiError(403, 'Código de acesso inválido.');
	}

	if (!name?.trim() || !email?.trim() || !password) {
		return apiError(422, 'Nome, e-mail e senha são obrigatórios.');
	}

	if (password.length < 12) {
		return apiError(422, 'A senha deve ter pelo menos 12 caracteres.');
	}

	const existing = await pocketbaseAdmin.listRecords('users', { perPage: 1 });
	if (existing.totalItems >= 2) {
		return apiError(403, 'Não há mais vagas de cadastro disponíveis.');
	}

	try {
		await pocketbaseAdmin.createRecord('users', {
			name: String(name).trim(),
			email: String(email).trim().toLowerCase(),
			password: String(password),
			passwordConfirm: String(password),
			role: 'admin',
			verified: true,
		});
	} catch (error) {
		const status = (error as { status?: number })?.status;
		if (status === 400) {
			return apiError(422, 'Não foi possível criar a conta. Verifique os dados informados.');
		}
		throw error;
	}

	return json({ ok: true });
});
