import { useState } from 'react';
import { Link } from 'react-router';
import {
	ArrowLeft,
	ArrowRight,
	ArrowUpRight,
	Eye,
	EyeOff,
	LockKeyhole,
	Mail,
	LoaderCircle,
	ShieldCheck,
	KeyRound,
	CheckCircle2,
} from 'lucide-react';
import { BrandMark } from '@/components/brand-mark';
import { BRAND_IMAGE } from '@/constants/brand';

type Status = 'idle' | 'submitting' | 'error' | 'success';

export function ResetScreen() {
	const [showPassword, setShowPassword] = useState(false);
	const [status, setStatus] = useState<Status>('idle');
	const [error, setError] = useState('');

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const data = new FormData(form);
		const email = String(data.get('email') ?? '').trim();
		const password = String(data.get('password') ?? '');
		const confirm = String(data.get('confirm') ?? '');
		const setupToken = String(data.get('setupToken') ?? '').trim();

		setError('');
		if (!setupToken || !email || !password || !confirm) {
			setStatus('error');
			setError('Preencha todos os campos para continuar.');
			return;
		}
		if (password.length < 12) {
			setStatus('error');
			setError('A senha deve ter pelo menos 12 caracteres.');
			return;
		}
		if (password !== confirm) {
			setStatus('error');
			setError('As senhas não coincidem.');
			return;
		}

		setStatus('submitting');
		try {
			const res = await fetch('/api/reset-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password, setupToken }),
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body?.error || 'Não foi possível redefinir a senha.');
			}
			setStatus('success');
			form.reset();
		} catch (err) {
			setStatus('error');
			setError(err instanceof Error ? err.message : 'Não foi possível redefinir a senha.');
		}
	}

	const submitting = status === 'submitting';

	return (
		<main className="login-page">
			<section className="login-main">
				<header className="login-header">
					<BrandMark />
					<span className="header-caption">
						<span className="status-dot" /> ÁREA ADMINISTRATIVA
					</span>
				</header>
				<Link to="/" className="login-home-link">
					<ArrowLeft size={15} strokeWidth={1.8} />
					<span>Voltar ao início</span>
				</Link>
				<div className="login-form-wrap">
					{status === 'success' ? (
						<div className="reset-success" role="status">
							<span className="success-icon">
								<CheckCircle2 size={22} strokeWidth={1.6} />
							</span>
							<h2>Senha redefinida</h2>
							<p>
								Sua nova senha foi definida com sucesso. Você já pode entrar na área profissional com ela.
							</p>
							<Link to="/login" className="btn btn-primary">
								Ir para o login <ArrowRight size={18} />
							</Link>
						</div>
					) : (
						<>
							<div className="eyebrow">
								<span className="tiny-rule" /> REDEFINIR SENHA
							</div>
							<h1>
								Defina uma
								<br />
								nova senha<span className="headline-dot">.</span>
							</h1>
							<p className="login-intro">
								Informe o e-mail da conta, o código de acesso e a nova senha que deseja usar. A senha é
								aplicada com segurança e não fica armazenada em nenhum outro lugar.
							</p>
							<form onSubmit={onSubmit} className="login-form">
								<div className="field">
									<label htmlFor="reset-token">Código de acesso</label>
									<div className="input-icon">
										<KeyRound size={18} />
										<input
											id="reset-token"
											name="setupToken"
											type="password"
											placeholder="Código fornecido pelo responsável"
											autoComplete="off"
											required
											disabled={submitting}
										/>
									</div>
									<span className="field-hint">Necessário para autorizar a redefinição.</span>
								</div>
								<div className="field">
									<label htmlFor="reset-email">E-mail da conta</label>
									<div className="input-icon">
										<Mail size={18} />
										<input
											id="reset-email"
											name="email"
											type="email"
											placeholder="seu@email.com"
											autoComplete="email"
											required
											maxLength={254}
											disabled={submitting}
										/>
									</div>
								</div>
								<div className="field">
									<div className="label-row">
										<label htmlFor="reset-password">Nova senha</label>
									</div>
									<div className="input-icon">
										<LockKeyhole size={18} />
										<input
											id="reset-password"
											name="password"
											type={showPassword ? 'text' : 'password'}
											placeholder="Mínimo 12 caracteres"
											autoComplete="new-password"
											required
											minLength={12}
											disabled={submitting}
										/>
										<button
											type="button"
											className="password-toggle"
											onClick={() => setShowPassword(!showPassword)}
											aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
										>
											{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
										</button>
									</div>
								</div>
								<div className="field">
									<label htmlFor="reset-confirm">Confirmar nova senha</label>
									<div className="input-icon">
										<LockKeyhole size={18} />
										<input
											id="reset-confirm"
											name="confirm"
											type={showPassword ? 'text' : 'password'}
											placeholder="Repita a nova senha"
											autoComplete="new-password"
											required
											minLength={12}
											disabled={submitting}
										/>
									</div>
								</div>
								{status === 'error' && (
									<p className="form-error" role="alert">
										{error}
									</p>
								)}
								<button className="btn btn-primary login-submit" disabled={submitting}>
									{submitting ? (
										<>
											<LoaderCircle className="spin" size={18} /> Redefinindo…
										</>
									) : (
										<>
											Redefinir senha <ArrowRight size={19} />
										</>
									)}
								</button>
							</form>
							<div className="login-security">
								<ShieldCheck size={16} />
								<span>A senha é definida por você e não fica no código.</span>
							</div>
						</>
					)}
				</div>
				<footer className="login-footer">
					<span>© 2026 Adriana Maria</span>
					<span>Feito para o seu trabalho florescer.</span>
					<Link to="/login" className="footer-arrow" aria-label="Acessar login">
						<ArrowUpRight size={17} />
					</Link>
				</footer>
			</section>
			<aside className="login-story" aria-label="Adriana Maria, seu espaço profissional">
				<img
					className="login-photo"
					src={BRAND_IMAGE}
					alt="Composição artística de formas e materiais em um ambiente criativo"
					fetchPriority="high"
				/>
				<div className="photo-shade" />
				<div className="story-top">
					<span className="story-label">
						MENOS DISTRAÇÕES.
						<br />
						MAIS POSSIBILIDADES.
					</span>
					<span className="story-badge">
						<span /> ORGANIZE. INSPIRE. CRESÇA.
					</span>
				</div>
				<div className="story-caption">
					<span className="story-index">01 / SEU ESPAÇO PROFISSIONAL</span>
					<h2>
						Seu talento.
						<br />
						Sua essência.
						<br />
						<span>Seu espaço.</span>
					</h2>
					<p>
						O cuidado com cada detalhe começa aqui.
						<br />
						Tudo o que você precisa, em um só lugar.
					</p>
					<div className="story-line">
						<span>UM ESPAÇO PARA CRIAR E CUIDAR</span>
						<ArrowUpRight size={21} />
					</div>
				</div>
				<div className="story-cross" aria-hidden="true">
					+
				</div>
			</aside>
		</main>
	);
}
