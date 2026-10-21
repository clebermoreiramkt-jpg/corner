import React, { useState, useEffect } from 'react';
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
  UserPlus, 
  Users, 
  RefreshCw, 
  Trash2, 
  Lock, 
  Unlock, 
  MessageCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../services/firebaseConfig';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  isSupabaseConfigured,
  type SupabaseCustomConfig
} from '../services/supabaseConfig';
import { adminService, type RegisteredUser } from '../services/adminService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'admin' | 'config';
}

const MODALITY_OPTIONS = [
  'Muay Thai',
  'Jiu-Jitsu',
  'Boxe',
  'Judô',
  'Karatê',
  'MMA',
  'Taekwondo',
  'Capoeira',
  'Kickboxing',
  'Outra',
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialTab = 'login' }) => {
  const { sendMagicLink, loginWithPassword, loginInstantDemo } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'admin' | 'config'>(initialTab);
  const [loginMode, setLoginMode] = useState<'password' | 'magic'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(!isFirebaseConfigured && !isSupabaseConfigured);

  // Admin Manual Registration State
  const [adminUsers, setAdminUsers] = useState<RegisteredUser[]>([]);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('123456789');
  const [regModality, setRegModality] = useState('Muay Thai');
  const [regPhone, setRegPhone] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccessUser, setRegSuccessUser] = useState<RegisteredUser | null>(null);
  const [copiedMsg, setCopiedMsg] = useState(false);

  // Supabase Config state
  const [supaForm, setSupaForm] = useState<SupabaseCustomConfig>(getStoredSupabaseConfig());
  const [copiedSql, setCopiedSql] = useState(false);
  const [configSavedSuccess, setConfigSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === 'admin') {
      loadAdminUsers();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://corner.app';

  const loadAdminUsers = async () => {
    try {
      const list = await adminService.listUsers();
      setAdminUsers(list);
    } catch (err) {
      console.warn('Erro ao carregar lista de usuários:', err);
    }
  };

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

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setErrorMessage('');

    try {
      const created = await adminService.registerUser({
        name: regName,
        email: regEmail,
        password: regPassword,
        modality: regModality,
        phone: regPhone,
      });

      setRegSuccessUser(created);
      setRegName('');
      setRegEmail('');
      setRegPassword('123456789');
      setRegPhone('');
      await loadAdminUsers();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Erro ao cadastrar usuário.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleToggleStatus = async (user: RegisteredUser) => {
    const nextStatus = user.status === 'active' ? 'blocked' : 'active';
    try {
      await adminService.toggleUserStatus(user.email, nextStatus);
      await loadAdminUsers();
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message);
    }
  };

  const handleDeleteUser = async (userEmail: string) => {
    if (!confirm(`Tem certeza que deseja remover o acesso de ${userEmail}?`)) return;
    try {
      await adminService.deleteUser(userEmail);
      await loadAdminUsers();
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message);
    }
  };

  const handleCopyWelcomeMessage = (user: RegisteredUser) => {
    const text = adminService.generateWelcomeMessage(user, currentOrigin);
    navigator.clipboard.writeText(text);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  const sqlSetupCode = `-- 🥋 CORNER: TABELA DE ACESSOS E PROFESSORES NO SUPABASE
create table if not exists public.purchases (
  email text primary key,
  name text,
  phone text,
  status text default 'active',
  plan text default 'Acesso Liberado pelo Admin',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.purchases enable row level security;

drop policy if exists "Permitir consulta de acessos no CORNER" on public.purchases;
create policy "Permitir consulta de acessos no CORNER"
  on public.purchases for select
  using (true);

drop policy if exists "Permitir inserção e atualização de acessos" on public.purchases;
create policy "Permitir inserção e atualização de acessos"
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white border border-neutral-200 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 bg-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/logo-black.png" alt="CORNER" className="h-7 w-auto object-contain" />
            <div className="border-l border-neutral-200 pl-3">
              <h2 className="font-display text-lg sm:text-xl font-black text-black leading-tight">
                {activeTab === 'login' ? 'Acesso do Professor' : activeTab === 'admin' ? 'Cadastro Manual de Alunos & Professores' : 'Configuração do Banco de Dados'}
              </h2>
              <p className="text-xs text-neutral-500">
                {activeTab === 'login' 
                  ? 'Entrada com e-mail e senha cadastrados' 
                  : activeTab === 'admin'
                  ? 'Painel Administrativo exclusivo para liberação de acessos'
                  : 'Conexão e credenciais do Supabase'}
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
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Entrar</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('admin');
              setErrorMessage('');
              loadAdminUsers();
            }}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Cadastrar Usuário (Admin)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('config');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'config'
                ? 'bg-black text-white shadow-xs'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Banco Supabase</span>
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 bg-white">
          {/* TAB 1: LOGIN COM SENHA OU MAGIC LINK */}
          {activeTab === 'login' && (
            <div className="space-y-4">
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
                        ? 'Digite o seu e-mail e senha cadastrados pela administração para acessar os 99 Templates.'
                        : 'Digite seu e-mail cadastrado. Você receberá um link seguro para entrar com 1 clique.'}
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-4 rounded-xl bg-neutral-50 border-2 border-black text-black text-xs space-y-2 animate-in fade-in duration-200">
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
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-bold block">
                        Seu E-mail Cadastrado:
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
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-white" />
                        <span>ENTRAR NO CORNER 🥋</span>
                      </>
                    )}
                  </button>

                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                    <span className="text-xs text-neutral-600 block">
                      Ainda não tem acesso cadastrado? Fale com o administrador para registrar seu login.
                    </span>
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
                    {isDemoMode && (
                      <button
                        onClick={handleInstantDemoLogin}
                        className="w-full py-3 px-4 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs tracking-wider font-display flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <Sparkles className="w-4 h-4 fill-white" />
                        <span>ENTRAR AGORA COM ESTE E-MAIL (MODO DIRETO)</span>
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

          {/* TAB 2: CADASTRO MANUAL (ADMIN) */}
          {activeTab === 'admin' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-black text-white">
                    PAINEL ADMIN
                  </span>
                  <span className="text-xs font-bold text-black font-display">
                    Liberação Manual de Acessos
                  </span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Cadastre novos professores e academias diretamente. Eles poderão entrar imediatamente com o e-mail e a senha informados abaixo.
                </p>
              </div>

              {/* Formulário de Registro Manual */}
              <form onSubmit={handleRegisterUser} className="p-4 rounded-xl border border-neutral-300 space-y-3.5 bg-white">
                <span className="text-xs font-display font-black text-black uppercase tracking-wider block">
                  Novo Cadastro de Professor:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono uppercase font-bold text-neutral-700 block">
                      Nome do Professor / Academia:
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Ex: Prof. Silva / Team Luta"
                      className="w-full bg-white border border-neutral-300 focus:border-black rounded-lg px-3 py-2 text-xs text-black outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono uppercase font-bold text-neutral-700 block">
                      E-mail de Acesso:
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="professor@tatame.com"
                      className="w-full bg-white border border-neutral-300 focus:border-black rounded-lg px-3 py-2 text-xs text-black outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono uppercase font-bold text-neutral-700 block">
                      Senha de Acesso:
                    </label>
                    <input
                      type="text"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="123456789"
                      className="w-full bg-white border border-neutral-300 focus:border-black rounded-lg px-3 py-2 text-xs text-black outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono uppercase font-bold text-neutral-700 block">
                      Modalidade:
                    </label>
                    <select
                      value={regModality}
                      onChange={(e) => setRegModality(e.target.value)}
                      className="w-full bg-white border border-neutral-300 focus:border-black rounded-lg px-3 py-2 text-xs text-black outline-none font-medium cursor-pointer"
                    >
                      {MODALITY_OPTIONS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono uppercase font-bold text-neutral-700 block">
                      WhatsApp (Opcional):
                    </label>
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full bg-white border border-neutral-300 focus:border-black rounded-lg px-3 py-2 text-xs text-black outline-none font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={regLoading || !regName || !regEmail}
                  className="w-full py-2.5 px-4 rounded-xl bg-black hover:bg-neutral-800 disabled:opacity-40 text-white font-extrabold text-xs font-display tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  {regLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>CADASTRANDO...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>CADASTRAR E LIBERAR ACESSO 🥋</span>
                    </>
                  )}
                </button>
              </form>

              {/* Mensagem de sucesso após cadastro */}
              {regSuccessUser && (
                <div className="p-4 rounded-xl bg-neutral-50 border-2 border-black space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-black text-sm text-black flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-black" />
                      Acesso criado para {regSuccessUser.name}!
                    </span>
                    <button
                      type="button"
                      onClick={() => setRegSuccessUser(null)}
                      className="text-neutral-400 hover:text-black"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs text-neutral-800 space-y-1 bg-white p-3 rounded-lg border border-neutral-200 font-mono">
                    <p><strong>E-mail:</strong> {regSuccessUser.email}</p>
                    <p><strong>Senha:</strong> {regSuccessUser.password}</p>
                    <p><strong>Modalidade:</strong> {regSuccessUser.modality}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyWelcomeMessage(regSuccessUser)}
                    className="w-full py-2 px-3 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedMsg ? <Check className="w-3.5 h-3.5 text-white" /> : <MessageCircle className="w-3.5 h-3.5" />}
                    <span>{copiedMsg ? 'Mensagem de WhatsApp Copiada!' : 'Copiar Texto Pronto para WhatsApp'}</span>
                  </button>
                </div>
              )}

              {/* Lista de Usuários Cadastrados */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-bold flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Professores Cadastrados ({adminUsers.length}):
                  </span>
                  <button
                    type="button"
                    onClick={loadAdminUsers}
                    className="text-[11px] text-neutral-600 hover:text-black font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Atualizar Lista
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {adminUsers.map((user) => (
                    <div
                      key={user.email}
                      className="p-3 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 transition-colors flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-black font-display">
                            {user.name}
                          </span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                            user.status === 'active' 
                              ? 'bg-neutral-100 text-black border border-neutral-300' 
                              : 'bg-neutral-200 text-neutral-500 line-through'
                          }`}>
                            {user.status === 'active' ? 'Ativo' : 'Bloqueado'}
                          </span>
                          {user.role === 'admin' && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black text-white font-bold">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 font-mono">
                          {user.email} • {user.modality}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyWelcomeMessage(user)}
                          title="Copiar mensagem para WhatsApp"
                          className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-black hover:border-black cursor-pointer transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {user.role !== 'admin' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(user)}
                              title={user.status === 'active' ? 'Bloquear Acesso' : 'Desbloquear Acesso'}
                              className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-black hover:border-black cursor-pointer transition-colors"
                            >
                              {user.status === 'active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user.email)}
                              title="Excluir Usuário"
                              className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-rose-600 hover:border-rose-300 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONFIGURAÇÃO SUPABASE */}
          {activeTab === 'config' && (
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display font-black text-xs text-black flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-black" />
                    Banco de Dados Supabase
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
                  Os cadastros de professores são salvos diretamente no seu banco de dados Supabase na tabela <code>purchases</code>.
                </p>
              </div>

              {/* Botão para copiar script SQL */}
              <div className="p-3.5 rounded-xl bg-white border border-neutral-200 flex items-center justify-between gap-3 shadow-xs">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-black block">
                    Criar tabela de usuários no Supabase:
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
