import React from 'react';
import { Zap, Flame, BookOpen, Layers, ArrowRight, Shield } from 'lucide-react';
import type { Template, UserProfile } from '../types';
import { situationCards } from '../data/situations';
import { TemplateCard } from './TemplateCard';
import { allTemplates } from '../data/templates';

interface DashboardProps {
  userProfile: UserProfile;
  onOpenGiveMeAStory: (initialPrompt?: string) => void;
  onSelectTemplate: (template: Template) => void;
  onNavigateToTab: (tab: 'library' | 'combos' | 'mycorner') => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userProfile,
  onOpenGiveMeAStory,
  onSelectTemplate,
  onNavigateToTab,
  isFavorite,
  onToggleFavorite,
}) => {
  const dailySpotlightTemplates = [
    allTemplates[0],  // 01 PREP
    allTemplates[15], // 16 FALTA DE CONDICIONAMENTO
    allTemplates[20], // 21 PROVA
    allTemplates[70], // 71 AGENDA ABERTA
  ];

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto px-4 pt-3 text-left">
      {/* Hero Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-800 font-bold px-2 py-0.5 rounded bg-slate-200/80 border border-slate-300">
              {userProfile.gymName || 'CORNER'} • {userProfile.modality}
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight pt-1">
            Fala, {userProfile.name}.
          </h1>
          <p className="text-slate-600 text-sm sm:text-base font-medium">
            O que tá acontecendo aí? Escolhe uma situação e eu te mostro o que dá pra postar.
          </p>
        </div>

        <div className="hidden sm:block shrink-0">
          <div className="px-3.5 py-2 bg-slate-950 rounded-2xl shadow-xs border border-slate-900 inline-flex items-center justify-center">
            <img src="/logo-white.png" alt="CORNER" className="h-6 w-auto object-contain" />
          </div>
        </div>
      </div>

      {/* Main Big Highlighted Button (⚡ ME DÊ UM STORY) */}
      <div className="relative group">
        <button
          onClick={() => onOpenGiveMeAStory()}
          className="relative w-full py-5 px-6 rounded-2xl bg-white border-2 border-slate-900 hover:bg-slate-50 transition-all flex items-center justify-between gap-4 text-left shadow-sm hover:shadow-md cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Zap className="w-6 h-6 fill-white stroke-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl sm:text-2xl text-slate-950 font-black tracking-tight leading-none">
                  ⚡ ME DÊ UM STORY
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Aconteceu algo agora? Digita aqui e receba até 4 ideias na hora.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 border border-slate-300 text-slate-900 shrink-0 group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* Gamification / Round de Conteúdo Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <Flame className="w-5 h-5 fill-emerald-600 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                Seu round de conteúdo
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono border border-emerald-200">
                {userProfile.streakDays} dias seguidos
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-0.5 font-medium">
              “Boa. Continua. A academia já está produzindo o conteúdo. Tu só precisa enxergar.”
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateToTab('mycorner')}
          className="text-xs text-slate-900 hover:text-emerald-700 font-bold flex items-center gap-1 self-end sm:self-auto hover:underline"
        >
          <span>Ver histórico</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Situation Quick Cards Grid (Section 4) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl sm:text-2xl text-slate-950 font-bold tracking-tight">
            O QUE TÁ ACONTECENDO AÍ?
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {situationCards.length} situações
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {situationCards.map((sit) => (
            <button
              key={sit.id}
              onClick={() => onOpenGiveMeAStory(sit.defaultPrompt)}
              className="bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-400 rounded-2xl p-4 transition-all duration-150 text-left flex items-start gap-3.5 group shadow-2xs hover:shadow-xs"
            >
              <span className="text-2xl p-2 rounded-xl bg-slate-100 border border-slate-200 group-hover:scale-105 transition-transform shrink-0">
                {sit.icon}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-base text-slate-950 font-bold group-hover:text-emerald-800 transition-colors tracking-tight leading-snug">
                  {sit.title}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                  {sit.subtitle}
                </p>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-900 font-bold group-hover:text-emerald-700">
                  <span>Ver ideias pra agora</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
        <button
          onClick={() => onNavigateToTab('library')}
          className="p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-left transition-all shadow-2xs"
        >
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-slate-900" />
            <span className="font-display text-sm text-slate-950 font-bold">
              BIBLIOTECA 99
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Todos os 99 templates categorizados e filtráveis.
          </p>
        </button>

        <button
          onClick={() => onNavigateToTab('combos')}
          className="p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-left transition-all shadow-2xs"
        >
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-slate-900" />
            <span className="font-display text-sm text-slate-950 font-bold">
              🔥 COMBOS
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Sequências completas de 3 a 5 Stories para o dia.
          </p>
        </button>

        <button
          onClick={() => onNavigateToTab('mycorner')}
          className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-left transition-all shadow-2xs"
        >
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-slate-900" />
            <span className="font-display text-sm text-slate-950 font-bold">
              MEU CORNER
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Seus favoritos, histórico de postados e perfil.
          </p>
        </button>
      </div>

      {/* Brand Quote Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 text-center space-y-1.5 shadow-2xs">
        <p className="text-xs uppercase font-mono tracking-wider text-slate-950 font-bold">
          “NUNCA MAIS COMECE UM STORY DO ZERO.”
        </p>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto italic">
          O que acontece na tua academia já é conteúdo. O CORNER só te mostra como transformar isso em Story.
        </p>
      </div>

      {/* Regra de Ouro do Corner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-3 shadow-2xs">
        <div className="flex items-center gap-2 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider">
          <Zap className="w-4 h-4 text-slate-900" />
          <span>A REGRA DE OURO DO CORNER</span>
        </div>
        <p className="font-display text-xl sm:text-2xl text-slate-950 font-black tracking-tight leading-tight">
          NÃO INVENTA. OBSERVA.
        </p>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Não pergunte: <span className="italic text-slate-500">“Qual conteúdo eu deveria criar?”</span>. Pergunte: <span className="font-bold text-slate-950">“O que aconteceu hoje?”</span>. Depois procura no CORNER. A tua academia já está produzindo conteúdo todos os dias.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-800">
            <span className="font-bold text-slate-950 block mb-0.5">👤 Aluno começou</span>
            <span className="text-[11px] text-slate-500">Primeiro treino • Bastidor • Vaga</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-800">
            <span className="font-bold text-slate-950 block mb-0.5">📈 Aluno evoluiu</span>
            <span className="text-[11px] text-slate-500">Prova • Pequena vitória • Orgulho</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-800">
            <span className="font-bold text-slate-950 block mb-0.5">👊 Aula acabou</span>
            <span className="text-[11px] text-slate-500">Forninho • Final • Cansaço</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-800">
            <span className="font-bold text-slate-950 block mb-0.5">❓ Dúvida surgiu</span>
            <span className="text-[11px] text-slate-500">Pergunta de aluno • Detalhe • Técnica</span>
          </div>
        </div>
      </div>

      {/* Destaques Rápidos do Dia */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl sm:text-2xl text-slate-950 font-bold tracking-tight">
              ROUND RÁPIDO DO DIA
            </h2>
            <p className="text-xs text-slate-500">
              4 ideias que tu pode gravar em menos de 15 segundos hoje.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('library')}
            className="text-xs text-slate-900 hover:text-emerald-700 font-bold hover:underline"
          >
            Ver todos (99)
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {dailySpotlightTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isFavorite={isFavorite(template.id)}
              onToggleFavorite={onToggleFavorite}
              onSelect={onSelectTemplate}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
