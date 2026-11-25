import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight, ArrowUpRight, Eye, EyeOff, LockKeyhole, Mail, User, LoaderCircle, ShieldCheck, KeyRound } from 'lucide-react';
import { pocketbaseClient as pb } from '@/lib/pocketbase-client';
import { BrandMark } from '@/components/brand-mark';
import { BRAND_IMAGE } from '@/constants/brand';

type Status = 'idle' | 'submitting' | 'error';

export function RegisterScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('password') ?? '');
    const confirm = String(data.get('confirm') ?? '');
    const setupToken = String(data.get('setupToken') ?? '').trim();

    setError('');
    if (!setupToken || !name || !email || !password || !confirm) { setStatus('error'); setError('Preencha todos os campos para continuar.'); return; }
    if (password.length < 12) { setStatus('error'); setError('A senha deve ter pelo menos 12 caracteres.'); return; }
    if (password !== confirm) { setStatus('error'); setError('As senhas não coincidem.'); return; }

    setStatus('submitting');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, setupToken }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || 'Não foi possível concluir o cadastro.');
      }
      await pb.collection('users').authWithPassword(email, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Não foi possível concluir o cadastro.');
    }
  }

  const submitting = status === 'submitting';

  return <main className="login-page">
    <section className="login-main">
      <header className="login-header"><BrandMark /><span className="header-caption"><span className="status-dot" /> ÁREA ADMINISTRATIVA</span></header>
      <Link to="/" className="login-home-link"><ArrowLeft size={15} strokeWidth={1.8} /><span>Voltar ao início</span></Link>
      <div className="login-form-wrap">
        <div className="eyebrow"><span className="tiny-rule" /> CRIAR MINHA CONTA</div>
        <h1>Comece pelo<br />começo<span className="headline-dot">.</span></h1>
        <p className="login-intro">Crie sua conta para acessar a área profissional e gerenciar seus serviços, imagens e informações.</p>
        <form onSubmit={onSubmit} className="login-form">
          <div className="field"><label htmlFor="register-token">Código de acesso</label><div className="input-icon"><KeyRound size={18} /><input id="register-token" name="setupToken" type="password" placeholder="Código fornecido pelo responsável" autoComplete="off" required disabled={submitting} /></div><span className="field-hint">Necessário para autorizar o cadastro.</span></div>
          <div className="field"><label htmlFor="register-name">Nome</label><div className="input-icon"><User size={18} /><input id="register-name" name="name" type="text" placeholder="Seu nome" autoComplete="name" required maxLength={100} disabled={submitting} /></div></div>
          <div className="field"><label htmlFor="register-email">E-mail</label><div className="input-icon"><Mail size={18} /><input id="register-email" name="email" type="email" placeholder="seu@email.com" autoComplete="email" required maxLength={254} disabled={submitting} /></div></div>
          <div className="field"><div className="label-row"><label htmlFor="register-password">Senha</label></div><div className="input-icon"><LockKeyhole size={18} /><input id="register-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Mínimo 12 caracteres" autoComplete="new-password" required minLength={12} disabled={submitting} /><button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
          <div className="field"><label htmlFor="register-confirm">Confirmar senha</label><div className="input-icon"><LockKeyhole size={18} /><input id="register-confirm" name="confirm" type={showPassword ? 'text' : 'password'} placeholder="Repita a senha" autoComplete="new-password" required minLength={12} disabled={submitting} /></div></div>
          {status === 'error' && <p className="form-error" role="alert">{error}</p>}
          <button className="btn btn-primary login-submit" disabled={submitting}>{submitting ? <><LoaderCircle className="spin" size={18} /> Criando conta…</> : <>Criar minha conta <ArrowRight size={19} /></>}</button>
        </form>
        <div className="login-security"><ShieldCheck size={16} /><span>Cadastro independente e seguro.</span></div>
      </div>
      <footer className="login-footer"><span>© 2026 Adriana Maria</span><span>Feito para o seu trabalho florescer.</span><Link to="/login" className="footer-arrow" aria-label="Acessar login"><ArrowUpRight size={17} /></Link></footer>
    </section>
    <aside className="login-story" aria-label="Adriana Maria, seu espaço profissional">
      <img className="login-photo" src={BRAND_IMAGE} alt="Composição artística de formas e materiais em um ambiente criativo" fetchPriority="high" />
      <div className="photo-shade" />
      <div className="story-top"><span className="story-label">MENOS DISTRAÇÕES.<br />MAIS POSSIBILIDADES.</span><span className="story-badge"><span /> ORGANIZE. INSPIRE. CRESÇA.</span></div>
      <div className="story-caption"><span className="story-index">01 / SEU ESPAÇO PROFISSIONAL</span><h2>Seu talento.<br />Sua essência.<br /><span>Seu espaço.</span></h2><p>O cuidado com cada detalhe começa aqui.<br />Tudo o que você precisa, em um só lugar.</p><div className="story-line"><span>UM ESPAÇO PARA CRIAR E CUIDAR</span><ArrowUpRight size={21} /></div></div>
      <div className="story-cross" aria-hidden="true">+</div>
    </aside>
  </main>;
}
