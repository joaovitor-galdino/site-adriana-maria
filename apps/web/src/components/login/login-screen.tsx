import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, ArrowUpRight, Eye, EyeOff, LockKeyhole, Mail, LoaderCircle, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useFormSubmission } from '@/hooks/use-form-submission';
import { pocketbaseClient as pb } from '@/lib/pocketbase-client';
import { BrandMark } from '@/components/brand-mark';
import { BRAND_IMAGE } from '@/constants/brand';

export function LoginScreen({ slotsAvailable = false }: { slotsAvailable?: boolean }) {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const form = useFormSubmission({ resetOnSuccess: false, submit: async (values) => {
    const email = String(values.email).trim();
    const result = await login(email, String(values.password));
    if (result.record.role !== 'admin' && result.record.role !== 'profissional') { pb.authStore.clear(); throw new Error('Acesso não autorizado'); }
    navigate('/admin', { replace: true });
  }});
  return <main className="login-page">
    <section className="login-main">
      <header className="login-header"><BrandMark /><span className="header-caption"><span className="status-dot" /> ÁREA ADMINISTRATIVA</span></header>
      <Link to="/" className="login-home-link"><ArrowLeft size={15} strokeWidth={1.8} /><span>Voltar ao início</span></Link>
      <div className="login-form-wrap">
        <div className="eyebrow"><span className="tiny-rule" /> SEU ESPAÇO, DO SEU JEITO</div>
        <h1>Bom ter você<br />por aqui<span className="headline-dot">.</span></h1>
        <p className="login-intro">Um lugar para cuidar do seu trabalho. Entre para gerenciar seus serviços, imagens e informações.</p>
        <form onSubmit={form.onSubmit} className="login-form">
          <input {...form.honeypotProps} />
          <div className="field"><label htmlFor="login-email">E-mail</label><div className="input-icon"><Mail size={18} /><input id="login-email" name="email" type="email" placeholder="seu@email.com" autoComplete="email" required maxLength={254} disabled={form.isSubmitting} /></div></div>
          <div className="field"><div className="label-row"><label htmlFor="login-password">Senha</label><Link to="/redefinir-senha" className="text-button">Esqueceu a senha?</Link></div><div className="input-icon"><LockKeyhole size={18} /><input id="login-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Digite sua senha" autoComplete="current-password" required disabled={form.isSubmitting} /><button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
          {form.isError && <p className="form-error" role="alert">{form.errorStatus === 429 ? 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' : form.errorStatus === 0 ? 'Não foi possível conectar. Verifique sua conexão e tente novamente.' : 'E-mail ou senha incorretos, ou conta sem permissão administrativa.'}</p>}
          <button className="btn btn-primary login-submit" disabled={form.isSubmitting}>{form.isSubmitting ? <><LoaderCircle className="spin" size={18} /> Entrando…</> : <>Entrar no painel <ArrowRight size={19} /></>}</button>
        </form>
        {slotsAvailable && <div className="register-link"><span>Ainda não tem conta?</span><Link to="/cadastro" className="text-button">Criar conta <ArrowRight size={15} /></Link></div>}
        <div className="login-security"><ShieldCheck size={16} /><span>Acesso exclusivo para a profissional.</span></div>
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
