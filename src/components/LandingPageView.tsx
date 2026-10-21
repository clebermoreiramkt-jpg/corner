import React, { useState } from 'react';
import { 
  Zap, 
  ArrowRight, 
  Key, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingPageViewProps {
  onEnterApp: () => void;
  onOpenAuthModal?: () => void;
  isAccessActive?: boolean;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ 
  onEnterApp, 
  onOpenAuthModal,
  isAccessActive = false 
}) => {
  const { loginWithPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      await loginWithPassword(email, password);
      setLoginSuccess(true);
      onEnterApp();
    } catch (err: unknown) {
      const error = err as Error;
      setLoginError(error.message || 'E-mail ou senha incorretos.');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToLogin = () => {
    const el = document.getElementById('login-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      const input = el.querySelector('input');
      if (input) input.focus();
    } else if (onOpenAuthModal) {
      onOpenAuthModal();
    }
  };

  const happenings = [
    'Aluno novo',
    'Aluno evoluindo',
    'Aula cheia',
    'Dúvida no vestiário',
    'Erro técnico',
    'Conquista pessoal',
    'Treino puxado',
    'Bastidor da academia',
    'Problema vencido',
    'História curiosa',
  ];

  const steps = [
    { num: '01', title: 'Acontece', desc: 'Algo real rola no teu tatame ou na tua rotina.' },
    { num: '02', title: 'Tu conta pro CORNER', desc: 'Em 1 frase tu diz o que acabou de acontecer.' },
    { num: '03', title: 'O CORNER encontra o Story', desc: 'Recebe até 4 ideias e o modelo pronto pra preencher.' },
    { num: '04', title: 'Tu grava', desc: 'Em 15 segundos tu filma o que foi indicado.' },
    { num: '05', title: 'Posta', desc: 'Sem travar. Sem inventar. Com método.' },
  ];

  const modalities = [
    'Muay Thai',
    'Boxe',
    'Jiu-Jitsu',
    'MMA',
    'Kickboxing',
    'Judô',
    'Karatê',
    'Taekwondo',
    'Capoeira',
    'Defesa Pessoal',
    'Personal Fighter',
    'Donos de Academia',
  ];

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between selection:bg-black selection:text-white">
      <header className="px-4 py-4 max-w-5xl mx-auto w-full flex items-center justify-between border-b border-neutral-200 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <img 
            src="/logo-black.png" 
            alt="CORNER" 
            className="h-8 sm:h-9 w-auto object-contain" 
          />
        </div>

        <div className="flex items-center gap-2">
          {isAccessActive ? (
            <button
              onClick={onEnterApp}
              className="px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-extrabold text-xs sm:text-sm font-display tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>ACESSAR O CORNER</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={scrollToLogin}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-50 text-black border border-neutral-300 hover:border-black font-bold text-xs font-display tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5 text-black" />
                <span>Já comprei (Entrar)</span>
              </button>

              <a
                href="https://cakto.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-extrabold text-xs font-display tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>COMPRAR NA CAKTO 🥋</span>
              </a>
            </>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 sm:py-20 text-center space-y-8">
        <div className="flex justify-center">
          <div className="px-6 py-4 bg-black rounded-2xl sm:rounded-3xl border border-black inline-flex items-center justify-center">
            <img 
              src="/logo-white.png" 
              alt="CORNER" 
              className="h-14 sm:h-20 w-auto object-contain" 
            />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-neutral-300 text-black text-xs font-mono font-bold uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 fill-black text-black" />
          <span>Assistente de Conteúdo para Professores de Luta</span>
        </div>

        <div className="space-y-4">
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black text-black tracking-tight leading-[0.95]">
            TU NÃO PRECISA SABER O QUE POSTAR.
            <br />
            <span className="text-neutral-400">TU PRECISA SABER OLHAR.</span>
          </h1>

          <p className="text-base sm:text-xl text-neutral-600 max-w-2xl mx-auto font-medium leading-relaxed pt-2">
            O CORNER transforma o que acontece na tua academia em conteúdo pronto para gravar e postar.
          </p>
        </div>

        {/* ÁREA DE ACESSO DIRETO COM E-MAIL E SENHA */}
        <div id="login-section" className="pt-2 max-w-md mx-auto w-full">
          {isAccessActive ? (
            <div className="space-y-3">
              <button
                onClick={onEnterApp}
                className="w-full py-5 px-8 rounded-2xl bg-black hover:bg-neutral-800 text-white font-black text-xl font-display tracking-wider transition-all cursor-pointer inline-flex items-center justify-center gap-3"
              >
                <span>ACESSAR MEU CORNER</span>
                <ArrowRight className="w-6 h-6 stroke-[3]" />
              </button>
              <div className="flex items-center justify-center gap-1.5 text-xs text-black font-mono font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Acesso liberado e ativo</span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-black text-left space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <div className="space-y-0.5">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-black uppercase text-neutral-500 tracking-wider">
                    <Lock className="w-3.5 h-3.5 text-black" />
                    <span>Área do Aluno</span>
                  </div>
                  <h3 className="font-display text-xl font-black text-black tracking-tight">
                    Entrar com E-mail e Senha
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-black text-[10px] font-mono font-bold text-white uppercase">
                  99 Templates
                </span>
              </div>

              {loginError && (
                <div className="p-3.5 bg-neutral-100 border border-neutral-300 rounded-xl flex items-start gap-2.5 text-xs text-black animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-black mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-black">Acesso não liberado</p>
                    <p className="leading-relaxed text-neutral-600">{loginError}</p>
                  </div>
                </div>
              )}

              {loginSuccess && (
                <div className="p-3 bg-neutral-100 border border-neutral-300 rounded-xl flex items-center gap-2 text-xs text-black">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                  <span className="font-bold">Acesso aprovado! Carregando aplicativo...</span>
                </div>
              )}

              <form onSubmit={handleDirectLogin} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold font-mono uppercase text-neutral-700 block">
                    Seu E-mail cadastrado:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ex: cmjfighter@gmail.com"
                      className="w-full bg-white border border-neutral-300 focus:border-black rounded-xl pl-10 pr-3.5 py-3 text-sm text-black outline-none font-medium transition-all placeholder:text-neutral-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold font-mono uppercase text-neutral-700 block">
                    Sua Senha:
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="•••••••••"
                      className="w-full bg-white border border-neutral-300 focus:border-black rounded-xl pl-10 pr-10 py-3 text-sm text-black outline-none font-medium transition-all placeholder:text-neutral-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black cursor-pointer p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full py-3.5 px-4 rounded-xl bg-black hover:bg-neutral-800 disabled:opacity-40 text-white font-black text-sm font-display tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-neutral-400" />
                      <span>VERIFICANDO ACESSO...</span>
                    </>
                  ) : (
                    <>
                      <span>ENTRAR NO CORNER 🥋</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                {onOpenAuthModal && (
                  <button
                    type="button"
                    onClick={onOpenAuthModal}
                    className="text-neutral-500 hover:text-black underline font-medium cursor-pointer"
                  >
                    Entrar com Link no E-mail
                  </button>
                )}

                <a
                  href="https://cakto.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Comprar na Cakto 🥋</span>
                </a>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-500 font-mono mt-3">
            <Lock className="w-3.5 h-3.5 text-neutral-400" />
            <span>Conteúdo exclusivo liberado automaticamente após compra na Cakto.</span>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 text-center space-y-2 mt-8">
          <h2 className="font-display text-2xl sm:text-3xl text-black font-black tracking-tight">
            “NUNCA MAIS COMECE UM STORY DO ZERO.”
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-xl mx-auto italic font-medium">
            O que acontece na tua academia já é conteúdo. O CORNER só te mostra como transformar isso em Story.
          </p>
        </div>

        <section className="py-12 border-t border-neutral-200 text-left space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase text-neutral-500 tracking-widest font-bold">
              REALIDADE DE TATAME
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-black font-black tracking-tight">
              TODO DIA ACONTECE ALGUMA COISA.
            </h2>
            <p className="text-sm text-neutral-600 max-w-lg mx-auto">
              O professor não precisa ser especialista em marketing nem falar como agência.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {happenings.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-neutral-200 rounded-2xl p-4 text-center hover:border-black transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-black mx-auto mb-2" />
                <span className="text-xs sm:text-sm font-bold text-black">
                  {item}
                </span>
              </div>
            ))}
          </div>

          <div className="text-center pt-3">
            <p className="text-xl font-display font-black text-black tracking-tight">
              TUDO ISSO PODE VIRAR CONTEÚDO.
            </p>
          </div>
        </section>

        <section className="py-12 border-t border-neutral-200 text-left space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase text-neutral-500 tracking-widest font-bold">
              FLUXO RÁPIDO
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-black font-black tracking-tight">
              COMO FUNCIONA
            </h2>
            <p className="text-sm text-neutral-600">
              Da situação do tatame ao Story no ar em poucos segundos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {steps.map((st) => (
              <div
                key={st.num}
                className="bg-white border border-neutral-200 rounded-2xl p-4 flex flex-col justify-between group hover:border-black transition-colors"
              >
                <div>
                  <span className="font-mono text-2xl font-black text-black block mb-1">
                    {st.num}
                  </span>
                  <h3 className="font-display text-lg text-black font-black leading-tight">
                    {st.title}
                  </h3>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12 border-t border-neutral-200 text-center space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase text-neutral-500 tracking-widest font-bold">
              FEITO POR QUEM CONHECE ACADEMIA
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-black font-black tracking-tight">
              CRIADO PARA O TEU TATAME
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
            {modalities.map((mod) => (
              <span
                key={mod}
                className="px-3 py-1.5 rounded-xl bg-white border border-neutral-300 text-xs sm:text-sm font-bold text-black hover:border-black transition-all"
              >
                🥊 {mod}
              </span>
            ))}
          </div>
        </section>

        {/* Regra Final do Corner */}
        <section className="py-12 border-t border-neutral-200 text-left space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase text-neutral-500 tracking-widest font-bold">
              ESTRATÉGIA DE TATAME
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-black font-black tracking-tight">
              A REGRA FINAL DO CORNER
            </h2>
            <p className="text-sm text-neutral-600 max-w-lg mx-auto">
              Quando não souber o que postar, não pergunte: <span className="text-neutral-800 italic font-medium">“Qual conteúdo eu deveria criar?”</span>
              <br />
              Pergunte: <span className="text-black font-black">“O que aconteceu hoje?”</span> Depois procure no CORNER.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white border border-neutral-200 hover:border-black transition-colors rounded-2xl p-4 space-y-2">
              <span className="font-display text-lg text-black font-bold block">
                👤 Um aluno começou
              </span>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Pode virar: Primeiro treino, Não tá sozinho, Bastidor, Motivador e Agenda aberta.
              </p>
            </div>

            <div className="bg-white border border-neutral-200 hover:border-black transition-colors rounded-2xl p-4 space-y-2">
              <span className="font-display text-lg text-black font-bold block">
                📈 Um aluno evoluiu
              </span>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Pode virar: Prova, Evolução técnica, Pequena vitória, Celebração e Depoimento.
              </p>
            </div>

            <div className="bg-white border border-neutral-200 hover:border-black transition-colors rounded-2xl p-4 space-y-2">
              <span className="font-display text-lg text-black font-bold block">
                👊 A aula acabou
              </span>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Pode virar: Forninho, Final do treino, Professor cansado, Bastidor e Motivador.
              </p>
            </div>

            <div className="bg-white border border-neutral-200 hover:border-black transition-colors rounded-2xl p-4 space-y-2">
              <span className="font-display text-lg text-black font-bold block">
                ❓ Alguém perguntou
              </span>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Pode virar: Comentário, Pergunta de aluno, Revelação, Curioso e Técnica do dia.
              </p>
            </div>
          </div>
        </section>

        {/* Brand Quotes Marquee / Grid */}
        <section className="py-8 bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 text-center space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase text-neutral-500 tracking-widest font-bold">
              O PRINCÍPIO DO CORNER
            </span>
            <h3 className="font-display text-3xl text-black font-black tracking-tight">
              NÃO INVENTA. OBSERVA.
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
              Não precisa ter ideia. Precisa reconhecer o momento. A tua academia já está produzindo conteúdo todos os dias.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm font-medium text-black pt-2">
            <div className="p-3 rounded-xl bg-white border border-neutral-300 font-bold">
              “Qual é o próximo round?”
            </div>
            <div className="p-3 rounded-xl bg-white border border-neutral-300 font-bold">
              “Não inventa. Observa.”
            </div>
            <div className="p-3 rounded-xl bg-white border border-neutral-300 font-bold">
              “A academia já está produzindo conteúdo.”
            </div>
          </div>
        </section>

        <div className="pt-8 pb-12 text-center space-y-4">
          <h2 className="font-display text-4xl sm:text-5xl text-black font-black tracking-tight">
            PRONTO PRO PRÓXIMO ROUND?
          </h2>
          {isAccessActive ? (
            <button
              onClick={onEnterApp}
              className="px-8 py-4 rounded-2xl bg-black hover:bg-neutral-800 text-white font-extrabold text-xl font-display tracking-wider transition-all cursor-pointer"
            >
              ACESSAR MEU CORNER AGORA
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <button
                onClick={onEnterApp}
                className="w-full sm:w-auto flex-1 px-8 py-4 rounded-2xl bg-black hover:bg-neutral-800 text-white font-extrabold text-base font-display tracking-wider transition-all cursor-pointer"
              >
                ENTRAR COM E-MAIL (CAKTO)
              </button>
              <a
                href="https://cakto.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex-1 px-8 py-4 rounded-2xl bg-white hover:bg-neutral-50 text-black border-2 border-black font-extrabold text-base font-display tracking-wider transition-all cursor-pointer text-center"
              >
                GARANTIR ACESSO 🥋
              </a>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-neutral-200 py-6 text-center text-xs text-neutral-500 font-mono bg-white flex flex-col items-center justify-center gap-2">
        <img src="/logo-black.png" alt="CORNER" className="h-6 w-auto" />
        <p>CORNER • Tu dá aula. O CORNER encontra o conteúdo. • 99 Templates Prontos</p>
      </footer>
    </div>
  );
};
