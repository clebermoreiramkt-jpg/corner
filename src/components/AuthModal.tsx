import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  Layers, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../services/firebaseConfig';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  isSupabaseConfigured,
  type SupabaseCustomConfig
} from '../services/supabaseConfig';
import { authService } from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { sendMagicLink, loginWithPassword, loginInstantDemo } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'config' | 'webhook'>('login');
  const [loginMode, setLoginMode] = useState<'password' | 'magic'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(!isFirebaseConfigured && !isSupabaseConfigured);

  // Supabase Config state
  const [supaForm, setSupaForm] = useState<SupabaseCustomConfig>(getStoredSupabaseConfig());
  const [copiedSql, setCopiedSql] = useState(false);
  const [configSavedSuccess, setConfigSavedSuccess] = useState(false);

  // Webhook Simulator state
  const [simEmail, setSimEmail] = useState('');
  const [simName, setSimName] = useState('Professor Teste');
  const [simStatus, setSimStatus] = useState<'active' | 'refunded'>('active');
  const [simResult, setSimResult] = useState<string | null>(null);
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://corner.app';
  const defaultWebhookUrl = `${currentOrigin}/api/webhook/cakto`;

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');
    setIsLoading(true);

    try {
      const res = await sendMagicLink(email);
      setSentSuccess(true);
      if (res.isDemo) {
        setIsDemoMode(true);
        setInfoMessage(res.message);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Erro ao enviar link de acesso.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');
    setIsLoading(true);

    try {
      await loginWithPassword(email, password);
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Erro ao efetuar login com senha.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantDemoLogin = async () => {
    if (!email) return;
    setIsLoading(true);
    try {
      await loginInstantDemo(email);
      onClose();
    } catch {
      setErrorMessage('Erro ao efetuar login simulado.');
    } finally {
      setIsLoading(false);
    }
  };

  const sqlSetupCode = `-- 🥋 CORNER: TABELA DE COMPRAS NO SUPABASE
create table if not exists public.purchases (
  email text primary key,
  name text,
  phone text,
  status text default 'active',
  plan text default 'Acesso Vitalício CORNER',
  cakto_order_id text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.purchases enable row level security;

drop policy if exists "Permitir consulta de compras no CORNER" on public.purchases;
create policy "Permitir consulta de compras no CORNER"
  on public.purchases for select
  using (true);

drop policy if exists "Permitir inserção e atualização de compras" on public.purchases;
create policy "Permitir inserção e atualização de compras"
  on public.purchases for all
  using (true)
  with check (true);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSetupCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supaForm);
    setConfigSavedSuccess(true);
    setTimeout(() => setConfigSavedSuccess(false), 2000);
  };

  const handleSimulateWebhook = async () => {
    if (!simEmail.trim()) {
      alert('Informe um e-mail para simular a compra da Cakto.');
      return;
    }

    try {
      await authService.recordCaktoPurchase({
        email: simEmail,
        name: simName,
        status: simStatus,
        plan: 'Acesso Vitalício CORNER',
        caktoOrderId: `CAKTO-${Date.now().toString().slice(-6)}`,
      });

      setSimResult(
        simStatus === 'active'
          ? `✅ Compra Aprovada na Cakto para ${simEmail}! Acesso liberado.`
          : `⚠️ Estorno/Cancelamento processado para ${simEmail}. Acesso revogado.`
      );
    } catch {
      setSimResult('Erro ao simular webhook.');
    }
  };

  const handleCopyWebhookUrl = () => {
    navigator.clipboard.writeText(defaultWebhookUrl);
    setCopiedWebhookUrl(true);
    setTimeout(() => setCopiedWebhookUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white border border-neutral-200 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 bg-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/logo-black.png" alt="CORNER" className="h-7 w-auto object-contain" />
            <div className="border-l border-neutral-200 pl-3">
              <h2 className="font-display text-lg sm:text-xl font-black text-black leading-tight">
                {activeTab === 'login' ? 'Acesso do Professor' : activeTab === 'config' ? 'Configuração Firebase' : 'Webhook Cakto'}
              </h2>
              <p className="text-xs text-neutral-500">
                {activeTab === 'login' ? 'Entrada com senha ou Magic Link' : 'Integração e Automação de Pagamentos'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-black bg-white hover:bg-neutral-100 border border-neutral-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-neutral-100 border-b border-neutral-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Entrar (Email & Senha)</span>
          </button>

          <button
            onClick={() => setActiveTab('webhook')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'webhook'
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Webhook Cakto</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'config'
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Supabase & Cakto</span>
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 bg-white">
          {/* TAB 1: LOGIN COM SENHA OU MAGIC LINK */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              {/* Seletor de Modo: Senha vs Link Mágico */}
              <div className="flex rounded-xl bg-neutral-100 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('password');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                    loginMode === 'password'
                      ? 'bg-black text-white shadow-xs font-black'
                      : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  Entrar com Senha
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('magic');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                    loginMode === 'magic'
                      ? 'bg-black text-white shadow-xs font-black'
                      : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  Link no E-mail (Sem Senha)
                </button>
              </div>

              {!sentSuccess || loginMode === 'password' ? (
                <form
                  onSubmit={loginMode === 'password' ? handlePasswordLogin : handleSendLink}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5">
                    <span className="font-display font-black text-sm text-black block">
                      🥋 {loginMode === 'password' ? 'Acesso com E-mail e Senha' : 'Acesso sem Senha via E-mail'}
                    </span>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {loginMode === 'password'
                        ? 'Digite o seu e-mail cadastrado e sua senha para entrar imediatamente no CORNER.'
                        : 'Digite o mesmo e-mail da compra na Cakto. Você receberá um link seguro para entrar com 1 clique.'}
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-4 rounded-xl bg-neutral-50 border-2 border-black text-black text-xs space-y-2.5 animate-in fade-in duration-200">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 shrink-0 text-black mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-bold text-black font-display">
                            Acesso não liberado
                          </p>
                          <p className="leading-relaxed text-neutral-700">
                            {errorMessage}
                          </p>
                        </div>
                      </div>

                      <div className="pt-1 flex flex-col sm:flex-row gap-2">
                        <a
                          href={supaForm.caktoCheckoutUrl || 'https://cakto.com.br'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 px-3 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs font-display tracking-wider flex items-center justify-center gap-1.5 text-center transition-colors"
                        >
                          <span>Comprar Acesso na Cakto 🥋</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setSimEmail(email);
                            setActiveTab('webhook');
                          }}
                          className="py-2 px-3 rounded-xl bg-white hover:bg-neutral-100 text-black border border-neutral-300 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Zap className="w-3 h-3" />
                          <span>Simular no Webhook</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-bold block">
                        Seu E-mail da Compra:
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="exemplo@tatame.com"
                          className="w-full bg-white border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl pl-10 pr-3.5 py-3 text-sm text-black outline-none font-medium transition-all"
                        />
                      </div>
                    </div>

                    {loginMode === 'password' && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-bold block">
                          Sua Senha:
                        </label>
                        <div className="relative">
                          <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="•••••••••"
                            className="w-full bg-white border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl pl-10 pr-3.5 py-3 text-sm text-black outline-none font-medium transition-all"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email || (loginMode === 'password' && !password)}
                    className="w-full py-3.5 px-4 rounded-xl bg-black hover:bg-neutral-800 disabled:opacity-30 text-white font-extrabold text-sm font-display tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-neutral-300" />
                        <span>VERIFICANDO ACESSO...</span>
                      </>
                    ) : loginMode === 'password' ? (
                      <>
                        <Sparkles className="w-4 h-4 text-white" />
                        <span>ENTRAR NO CORNER 🥋</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 text-white" />
                        <span>ENVIAR LINK DE ACESSO</span>
                      </>
                    )}
                  </button>

                  {/* Cakto Checkout Referral Banner */}
                  <div className="pt-2 text-center">
                    <span className="text-xs text-neutral-500 block mb-1">
                      Ainda não comprou o CORNER?
                    </span>
                    <a
                      href={supaForm.caktoCheckoutUrl || 'https://cakto.com.br'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-black font-bold hover:underline"
                    >
                      <span>Garantir acesso aos 99 Templates na Cakto</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </form>
              ) : (
                <div className="text-center py-4 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-neutral-100 border border-neutral-300 text-black flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <h3 className="font-display text-xl text-black font-black">
                      Verifique sua caixa de entrada!
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-md mx-auto">
                      Enviamos um link de login seguro para <strong>{email}</strong>.
                      Basta clicar no botão que está no e-mail para abrir o CORNER já logado!
                    </p>
                  </div>

                  {infoMessage && (
                    <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-800 text-xs text-left">
                      {infoMessage}
                    </div>
                  )}

                  <div className="pt-2 space-y-2">
                    {/* Botão de Atalho para Teste Imediato */}
                    {isDemoMode && (
                      <button
                        onClick={handleInstantDemoLogin}
                        className="w-full py-3 px-4 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs tracking-wider font-display flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <Zap className="w-4 h-4 fill-white" />
                        <span>ENTRAR AGORA COM ESTE E-MAIL (MODO TESTE)</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSentSuccess(false)}
                      className="text-xs text-neutral-500 hover:text-black font-semibold underline block mx-auto cursor-pointer"
                    >
                      Digitar outro e-mail
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WEBHOOK CAKTO */}
          {activeTab === 'webhook' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-black text-white">
                    CAKTO WEBHOOK
                  </span>
                  <span className="text-xs font-bold text-black font-display">
                    Como conectar com a Cakto
                  </span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Quando o aluno compra na Cakto (via PIX, Cartão ou Boleto), a Cakto avisa o CORNER instantaneamente através deste Webhook para liberar o e-mail no Firestore.
                </p>
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                  URL DO SEU WEBHOOK (COLE NA CAKTO):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={defaultWebhookUrl}
                    className="flex-1 bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-800 font-mono select-all outline-none"
                  />
                  <button
                    onClick={handleCopyWebhookUrl}
                    className="px-3 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                  >
                    {copiedWebhookUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedWebhookUrl ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {/* SIMULADOR DE COBRANÇA CAKTO */}
              <div className="p-4 rounded-xl bg-white border border-neutral-200 space-y-3">
                <span className="font-display font-black text-sm text-black flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-black" />
                  Simulador de Compra Cakto (Teste Local)
                </span>
                <p className="text-xs text-neutral-500">
                  Simule uma cobrança aprovada para testar o cadastro no Firestore e a liberação do Magic Link:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="email"
                    value={simEmail}
                    onChange={(e) => setSimEmail(e.target.value)}
                    placeholder="E-mail do comprador na Cakto..."
                    className="text-xs bg-white border border-neutral-300 focus:border-black rounded-xl px-3 py-2 text-black outline-none"
                  />
                  <input
                    type="text"
                    value={simName}
                    onChange={(e) => setSimName(e.target.value)}
                    placeholder="Nome do professor..."
                    className="text-xs bg-white border border-neutral-300 focus:border-black rounded-xl px-3 py-2 text-black outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={simStatus}
                    onChange={(e) => setSimStatus(e.target.value as 'active' | 'refunded')}
                    className="text-xs bg-white border border-neutral-300 focus:border-black rounded-xl px-3 py-2 text-black outline-none cursor-pointer"
                  >
                    <option value="active">Compra Aprovada (Liberar Acesso)</option>
                    <option value="refunded">Reembolso / Cancelamento (Bloquear)</option>
                  </select>

                  <button
                    onClick={handleSimulateWebhook}
                    className="flex-1 py-2 px-3 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    Disparar Simulação
                  </button>
                </div>

                {simResult && (
                  <div className="p-2.5 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-medium text-black">
                    {simResult}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CONFIGURAÇÃO SUPABASE & CAKTO */}
          {activeTab === 'config' && (
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display font-black text-xs text-black flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-black" />
                    Banco de Dados Supabase & Cakto
                  </span>
                  {isSupabaseConfigured ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-900 text-white">
                      ● CONECTADO
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-200 text-neutral-800">
                      ○ COLE SUA URL DO SUPABASE
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Suas chaves da Cakto e do Supabase já estão salvas abaixo. Basta colar a <strong>URL do seu Projeto Supabase</strong> e salvar!
                </p>
              </div>

              {/* Botão para copiar script SQL */}
              <div className="p-3.5 rounded-xl bg-white border border-neutral-200 flex items-center justify-between gap-3 shadow-xs">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-black block">
                    Criar tabela de compras no Supabase:
                  </span>
                  <span className="text-[11px] text-neutral-500 block">
                    Vá no Supabase &gt; SQL Editor &gt; Cole e clique em Run
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'SQL Copiado!' : 'Copiar Código SQL'}</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] font-mono uppercase font-bold text-neutral-700 block mb-1">
                    1. URL do seu Projeto Supabase:
                  </label>
                  <input
                    type="url"
                    value={supaForm.supabaseUrl}
                    onChange={(e) => setSupaForm({ ...supaForm, supabaseUrl: e.target.value })}
                    placeholder="https://xyzabcdefghijklm.supabase.co"
                    className="w-full bg-white border border-neutral-300 focus:border-black rounded-xl px-3 py-2.5 text-black font-mono text-xs outline-none"
                  />
                  <span className="text-[10px] text-neutral-500 block mt-1">
                    Encontre no Supabase em: <em>Project Settings &gt; API &gt; Project URL</em>.
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase font-bold text-neutral-700 block mb-1">
                    2. Chave Secreta do Supabase:
                  </label>
                  <input
                    type="text"
                    value={supaForm.supabaseKey}
                    onChange={(e) => setSupaForm({ ...supaForm, supabaseKey: e.target.value })}
                    placeholder="sb_secret_..."
                    className="w-full bg-white border border-neutral-300 focus:border-black rounded-xl px-3 py-2.5 text-black font-mono text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase font-bold text-neutral-700 block mb-1">
                    3. Chave Secreta de Webhook Cakto:
                  </label>
                  <input
                    type="text"
                    value={supaForm.caktoWebhookSecret}
                    onChange={(e) => setSupaForm({ ...supaForm, caktoWebhookSecret: e.target.value })}
                    placeholder="10251533-..."
                    className="w-full bg-white border border-neutral-300 focus:border-black rounded-xl px-3 py-2.5 text-black font-mono text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase font-bold text-neutral-700 block mb-1">
                    4. Link de Checkout da Cakto (Onde o aluno compra):
                  </label>
                  <input
                    type="url"
                    value={supaForm.caktoCheckoutUrl}
                    onChange={(e) => setSupaForm({ ...supaForm, caktoCheckoutUrl: e.target.value })}
                    placeholder="https://cakto.com.br/checkout/..."
                    className="w-full bg-white border border-neutral-300 focus:border-black rounded-xl px-3 py-2.5 text-black font-mono text-xs outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                {configSavedSuccess ? (
                  <span className="text-xs text-black font-bold flex items-center gap-1">
                    <Check className="w-4 h-4 text-black" /> Salvo com sucesso! Recarregando...
                  </span>
                ) : <span />}

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-black text-xs font-display tracking-wider cursor-pointer shadow-xs transition-colors"
                >
                  SALVAR CONFIGURAÇÃO
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
