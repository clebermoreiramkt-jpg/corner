import React, { useState } from 'react';
import { X, Zap, Sparkles, Layers, Bot, Check, Copy } from 'lucide-react';
import type { Template, RecommendationResult, AiGeneratedStory } from '../types';
import { recommendationService } from '../services/recommendationService';
import { aiService } from '../services/aiService';
import { TemplateCard } from './TemplateCard';

interface GiveMeAStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
  onOpenComboSequence: (templates: Template[], situationTitle: string) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  userModality?: string;
  initialPrompt?: string;
}

const EXAMPLE_SITUATIONS = [
  'Hoje uma aluna chegou cansada e disse que quase não veio treinar.',
  'Aluno começou hoje no tatame, tava tímido mas adorou.',
  'Uma aluna conseguiu fazer uma sequência que estava treinando há semanas.',
  'Segunda-feira e a academia lotou na turma das 19h.',
  'Quero abrir 3 vagas para novos alunos na próxima semana.',
  'Aconteceu uma mancada muito engraçada durante o aquecimento.',
];

export const GiveMeAStoryModal: React.FC<GiveMeAStoryModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  onOpenComboSequence,
  isFavorite,
  onToggleFavorite,
  userModality = 'Muay Thai',
  initialPrompt = '',
}) => {
  const [situationText, setSituationText] = useState(initialPrompt);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [aiStory, setAiStory] = useState<AiGeneratedStory | null>(null);
  const [activeTab, setActiveTab] = useState<'templates' | 'ai'>('templates');
  const [copiedAi, setCopiedAi] = useState(false);

  // Sync initialPrompt
  React.useEffect(() => {
    if (initialPrompt) {
      setSituationText(initialPrompt);
      handleGenerate(initialPrompt);
    }
  }, [initialPrompt]);

  if (!isOpen) return null;

  const handleGenerate = async (customText?: string) => {
    const textToUse = (customText || situationText).trim();
    if (!textToUse) return;

    setIsLoading(true);
    setResult(null);
    setAiStory(null);

    const analysis = recommendationService.analyzeSituation(textToUse);
    setResult(analysis);

    try {
      const generated = await aiService.generateStory({
        description: textToUse,
        modality: userModality,
      });
      setAiStory(generated);
    } catch {
      // fallback
    }

    setIsLoading(false);
  };

  const handleCopyAi = () => {
    if (!aiStory) return;
    const text = `HOOK: ${aiStory.hook}\n\nROTEIRO:\n${aiStory.roteiro}\n\nNA PRÁTICA: ${aiStory.sugestaoVisual}\n\nCTA: ${aiStory.cta}`;
    navigator.clipboard.writeText(text);
    setCopiedAi(true);
    setTimeout(() => setCopiedAi(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white border border-neutral-200 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-neutral-200 bg-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h2 className="font-display text-2xl text-black font-black tracking-tight leading-none">
                ME DÊ UM STORY
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                O que aconteceu aí na tua academia hoje?
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

        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-left bg-white">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-bold block">
              Conta o que rolou no tatame:
            </label>
            <div className="relative">
              <textarea
                value={situationText}
                onChange={(e) => setSituationText(e.target.value)}
                placeholder="Ex: Hoje uma aluna chegou cansada e disse que quase não veio treinar..."
                rows={3}
                className="w-full bg-white border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl p-3.5 text-sm sm:text-base text-black placeholder:text-neutral-400 outline-none transition-all resize-none font-sans"
              />
            </div>

            <div>
              <span className="text-[11px] text-neutral-500 font-medium block mb-1.5">
                Ou clica numa situação comum:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {EXAMPLE_SITUATIONS.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSituationText(ex);
                      handleGenerate(ex);
                    }}
                    className="text-xs bg-white hover:bg-neutral-100 border border-neutral-200 px-2.5 py-1.5 rounded-lg text-neutral-700 hover:text-black text-left transition-all cursor-pointer font-medium"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleGenerate()}
              disabled={isLoading || !situationText.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-black hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed text-white font-extrabold text-base transition-all font-display tracking-wider cursor-pointer mt-2 shadow-xs"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin text-neutral-300" />
                  <span>ANALISANDO TATAME...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-white" />
                  <span>CRIAR STORY</span>
                </>
              )}
            </button>
          </div>

          {result && (
            <div className="space-y-4 pt-4 border-t border-neutral-200 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-black font-display font-black text-base sm:text-lg tracking-tight mb-1">
                  <span>🔥 ESSA SITUAÇÃO RENDE PELO MENOS {result.totalStoriesEstimate} STORIES!</span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Não para em um Story só. O que aconteceu aí já é ouro puro. Tu não precisa inventar conteúdo do nada — só precisa observar.
                </p>

                <div className="mt-3 pt-3 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-neutral-600 font-medium">
                    Quer postar a sequência completa ao longo do dia?
                  </span>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenComboSequence(result.comboSequence, result.situationText);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>GERAR COMBO COMPLETO</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl border border-neutral-200">
                <button
                  onClick={() => setActiveTab('templates')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'templates'
                      ? 'bg-black text-white shadow-xs'
                      : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  🥇 Top 4 Templates Recomendados
                </button>
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    activeTab === 'ai'
                      ? 'bg-black text-white shadow-xs'
                      : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Roteiro Pronto Personalizado</span>
                </button>
              </div>

              {activeTab === 'templates' && (
                <div className="space-y-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-bold block">
                    Escolha um para ver detalhes e gravar:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {result.recommendedTemplates.map((rec) => (
                      <TemplateCard
                        key={rec.template.id}
                        template={rec.template}
                        isFavorite={isFavorite(rec.template.id)}
                        onToggleFavorite={onToggleFavorite}
                        onSelect={(t) => {
                          onClose();
                          onSelectTemplate(t);
                        }}
                        badge={rec.rankBadge}
                        highlightReason={rec.matchReason}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'ai' && aiStory && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                    <span className="text-xs font-mono uppercase text-black font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-neutral-700" />
                      Roteiro Direto ({aiStory.duration})
                    </span>
                    <button
                      onClick={handleCopyAi}
                      className="text-xs text-neutral-800 hover:text-black flex items-center gap-1 bg-white border border-neutral-200 px-2.5 py-1 rounded-lg cursor-pointer font-medium hover:border-black transition-colors"
                    >
                      {copiedAi ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAi ? 'Copiado!' : 'Copiar Roteiro'}</span>
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1 font-bold">
                      01. GANCHO (PRIMEIROS 3 SEGUNDOS)
                    </span>
                    <p className="text-sm font-semibold text-neutral-900 italic bg-white p-3 rounded-lg border border-neutral-200">
                      "{aiStory.hook}"
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1 font-bold">
                      02. ROTEIRO / LEGENDA
                    </span>
                    <p className="text-sm text-neutral-800 leading-relaxed bg-white p-3 rounded-lg border border-neutral-200">
                      {aiStory.roteiro}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1 font-bold">
                      03. O QUE FILMAR NA ACADEMIA
                    </span>
                    <p className="text-xs text-neutral-700 bg-white p-3 rounded-lg border border-neutral-200">
                      {aiStory.sugestaoVisual}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1 font-bold">
                      04. CHAMADA DE AÇÃO (CTA)
                    </span>
                    <p className="text-xs font-bold text-black bg-white p-3 rounded-lg border border-neutral-200">
                      "{aiStory.cta}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
