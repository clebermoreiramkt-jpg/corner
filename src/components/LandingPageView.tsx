import React from 'react';
import { Zap, ArrowRight, Key, Lock } from 'lucide-react';

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
    <div className="min-h-screen bg-[#f4f5f7] text-slate-950 flex flex-col justify-between selection:bg-slate-950 selection:text-white">
      <header className="px-4 py-4 max-w-5xl mx-auto w-full flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
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
              className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm font-display tracking-wider transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>ACESSAR O CORNER</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              {onOpenAuthModal && (
                <button
                  onClick={onOpenAuthModal}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs font-display tracking-wider transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-slate-600" />
                  <span>Já comprei (Entrar)</span>
                </button>
              )}

              <a
                href="https://cakto.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs font-display tracking-wider transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>COMPRAR NA CAKTO 🥋</span>
              </a>
            </>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 sm:py-20 text-center space-y-8">
        <div className="flex justify-center">
          <div className="px-6 py-4 bg-slate-950 rounded-2xl sm:rounded-3xl shadow-lg border border-slate-900 inline-flex items-center justify-center">
            <img 
              src="/logo-white.png" 
              alt="CORNER" 
              className="h-14 sm:h-20 w-auto object-contain" 
            />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-mono font-bold uppercase tracking-wider shadow-2xs">
          <Zap className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
          <span>Assistente de Conteúdo para Professores de Luta</span>
        </div>

        <div className="space-y-4">
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black text-slate-950 tracking-tight leading-[0.95]">
            TU NÃO PRECISA SABER O QUE POSTAR.
            <br />
            <span className="text-slate-500">TU PRECISA SABER OLHAR.</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed pt-2">
            O CORNER transforma o que acontece na tua academia em conteúdo pronto para gravar e postar.
          </p>
        </div>

        <div className="pt-2 space-y-3">
          {isAccessActive ? (
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-black text-xl sm:text-2xl font-display tracking-wider transition-all shadow-xl hover:scale-[1.02] cursor-pointer inline-flex items-center justify-center gap-3"
            >
              <span>ACESSAR MEU CORNER</span>
              <ArrowRight className="w-6 h-6 stroke-[3]" />
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
              <button
                onClick={onEnterApp}
                className="w-full sm:w-auto flex-1 px-6 py-4 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-black text-sm sm:text-base font-display tracking-wider transition-all shadow-xl cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4 text-slate-300" />
                <span>JÁ COMPREI (ENTRAR)</span>
              </button>

              <a
                href="https://cakto.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex-1 px-6 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 border-2 border-slate-950 font-black text-sm sm:text-base font-display tracking-wider transition-all shadow-xs cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <span>COMPRAR NA CAKTO 🥋</span>
              </a>
            </div>
          )}
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-mono">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Conteúdo exclusivo liberado automaticamente após compra na Cakto.</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-center space-y-2 mt-8 shadow-xs">
          <h2 className="font-display text-2xl sm:text-3xl text-slate-950 font-black tracking-tight">
            “NUNCA MAIS COMECE UM STORY DO ZERO.”
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto italic font-medium">
            O que acontece na tua academia já é conteúdo. O CORNER só te mostra como transformar isso em Story.
          </p>
        </div>

        <section className="py-12 border-t border-slate-200 text-left space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase text-slate-500 tracking-widest font-bold">
              REALIDADE DE TATAME
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-slate-950 font-black tracking-tight">
              TODO DIA ACONTECE ALGUMA COISA.
            </h2>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">
              O professor não precisa ser especialista em marketing nem falar como agência.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {happenings.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-4 text-center hover:border-slate-400 transition-colors shadow-2xs"
              >
                <div className="w-2 h-2 rounded-full bg-slate-950 mx-auto mb-2" />
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  {item}
                </span>
              </div>
            ))}
          </div>

          <div className="text-center pt-3">
            <p className="text-xl font-display font-black text-slate-950 tracking-tight">
              TUDO ISSO PODE VIRAR CONTEÚDO.
            </p>
          </div>
        </section>

        <section className="py-12 border-t border-slate-200 text-left space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase text-slate-500 tracking-widest font-bold">
              FLUXO RÁPIDO
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-slate-950 font-black tracking-tight">
              COMO FUNCIONA
            </h2>
            <p className="text-sm text-slate-600">
              Da situação do tatame ao Story no ar em poucos segundos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {steps.map((st) => (
              <div
                key={st.num}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between group hover:border-slate-300 transition-colors shadow-2xs"
              >
                <div>
                  <span className="font-mono text-2xl font-black text-slate-950 block mb-1">
                    {st.num}
                  </span>
                  <h3 className="font-display text-lg text-slate-950 font-black leading-tight">
                    {st.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12 border-t border-slate-200 text-center space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase text-slate-500 tracking-widest font-bold">
              FEITO POR QUEM CONHECE ACADEMIA
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-slate-950 font-black tracking-tight">
              CRIADO PARA O TEU TATAME
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
            {modalities.map((mod) => (
              <span
                key={mod}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 shadow-2xs"
              >
                🥊 {mod}
              </span>
            ))}
          </div>
        </section>

        {/* Regra Final do Corner */}
        <section className="py-12 border-t border-slate-200 text-left space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase text-slate-500 tracking-widest font-bold">
              ESTRATÉGIA DE TATAME
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-slate-950 font-black tracking-tight">
              A REGRA FINAL DO CORNER
            </h2>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">
              Quando não souber o que postar, não pergunte: <span className="text-slate-800 italic font-medium">“Qual conteúdo eu deveria criar?”</span>
              <br />
              Pergunte: <span className="text-slate-950 font-black">“O que aconteceu hoje?”</span> Depois procure no CORNER.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs">
              <span className="font-display text-lg text-slate-950 font-bold block">
                👤 Um aluno começou
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pode virar: Primeiro treino, Não tá sozinho, Bastidor, Motivador e Agenda aberta.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs">
              <span className="font-display text-lg text-slate-950 font-bold block">
                📈 Um aluno evoluiu
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pode virar: Prova, Evolução técnica, Pequena vitória, Celebração e Depoimento.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs">
              <span className="font-display text-lg text-slate-950 font-bold block">
                👊 A aula acabou
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pode virar: Forninho, Final do treino, Professor cansado, Bastidor e Motivador.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs">
              <span className="font-display text-lg text-slate-950 font-bold block">
                ❓ Alguém perguntou
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pode virar: Comentário, Pergunta de aluno, Revelação, Curioso e Técnica do dia.
              </p>
            </div>
          </div>
        </section>

        {/* Brand Quotes Marquee / Grid */}
        <section className="py-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase text-slate-500 tracking-widest font-bold">
              O PRINCÍPIO DO CORNER
            </span>
            <h3 className="font-display text-3xl text-slate-950 font-black tracking-tight">
              NÃO INVENTA. OBSERVA.
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Não precisa ter ideia. Precisa reconhecer o momento. A tua academia já está produzindo conteúdo todos os dias.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm font-medium text-slate-800 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold">
              “Qual é o próximo round?”
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold">
              “Não inventa. Observa.”
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold">
              “A academia já está produzindo conteúdo.”
            </div>
          </div>
        </section>

        <div className="pt-8 pb-12 text-center space-y-4">
          <h2 className="font-display text-4xl sm:text-5xl text-slate-950 font-black tracking-tight">
            PRONTO PRO PRÓXIMO ROUND?
          </h2>
          {isAccessActive ? (
            <button
              onClick={onEnterApp}
              className="px-8 py-4 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xl font-display tracking-wider transition-all shadow-xl cursor-pointer"
            >
              ACESSAR MEU CORNER AGORA
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <button
                onClick={onEnterApp}
                className="w-full sm:w-auto flex-1 px-8 py-4 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-base font-display tracking-wider transition-all shadow-xl cursor-pointer"
              >
                ENTRAR COM E-MAIL (CAKTO)
              </button>
              <a
                href="https://cakto.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex-1 px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 border-2 border-slate-950 font-extrabold text-base font-display tracking-wider transition-all shadow-xs cursor-pointer text-center"
              >
                GARANTIR ACESSO 🥋
              </a>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 font-mono bg-white flex flex-col items-center justify-center gap-2">
        <img src="/logo-black.png" alt="CORNER" className="h-6 w-auto opacity-75" />
        <p>CORNER • Tu dá aula. O CORNER encontra o conteúdo. • 99 Templates Prontos</p>
      </footer>
    </div>
  );
};
