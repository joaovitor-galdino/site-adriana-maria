import { apiError, json, readJsonBody, withApi } from '@/lib/api.server';
import { pocketbaseAdmin } from '@/lib/pocketbase-client.server';

// public-route: token-gated administrative password reset. Lets the site owner
// reset the password of an existing `users` account when email recovery is
// unavailable (SMTP not configured). Access is gated by the SETUP_TOKEN Secret
// — the same code that controls registration — so only the token holder can
// perform a reset. The new password is chosen by the caller, travels only in
// the request body, is applied through the superuser client, and is never
// written to source, logs, or any store other than PocketBase's own auth
// store. Only the password field changes: name, role and every other field on
// the record are preserved, and no account is created or deleted. The route
// returns no user data and does not confirm whether an email exists beyond the
// success or failure of the reset itself.
export const action = withApi(async ({ request }) => {
	const setupToken = process.env.SETUP_TOKEN;

	if (!setupToken) {
		return apiError(
			403,
			'A redefinição de senha não está disponível. Solicite ao responsável a configuração do código de acesso.',
		);
	}

	const { email, password, setupToken: submittedToken } = await readJsonBody<{
		email?: string;
		password?: string;
		setupToken?: string;
	}>(request);

	if (!submittedToken || submittedToken !== setupToken) {
		return apiError(403, 'Código de acesso inválido.');
	}

	const normalizedEmail = String(email ?? '').trim().toLowerCase();
	const newPassword = String(password ?? '');

	if (!normalizedEmail || !newPassword) {
		return apiError(422, 'E-mail e nova senha são obrigatórios.');
	}

	if (newPassword.length < 12) {
		return apiError(422, 'A senha deve ter pelo menos 12 caracteres.');
	}

	let existing: { items: { id: string }[] };
	try {
		existing = await pocketbaseAdmin.listRecords<{ id: string }>('users', {
			filter: pocketbaseAdmin.filter('email = {:email}', { email: normalizedEmail }),
			perPage: 1,
		});
	} catch {
		// PocketBase unreachable — do not disclose internal state.
		return apiError(500, 'Não foi possível concluir a redefinição agora. Tente novamente.');
	}

	if (existing.items.length === 0) {
		// Generic message without confirming whether the email exists.
		return apiError(404, 'Não foi possível redefinir a senha com os dados informados.');
	}

	const userId = existing.items[0].id;

	try {
		await pocketbaseAdmin.updateRecord('users', userId, {
			password: newPassword,
			passwordConfirm: newPassword,
		});
	} catch {
		return apiError(500, 'Não foi possível atualizar a senha agora. Tente novamente.');
	}

	return json({ ok: true });
});
