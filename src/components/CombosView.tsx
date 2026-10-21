import React, { useState } from 'react';
import { Flame, ArrowRight, Clock, Video, Copy, Check, Sparkles } from 'lucide-react';
import type { Template } from '../types';
import { presetCombos } from '../data/combos';
import { getTemplateById } from '../data/templates';
import { recommendationService } from '../services/recommendationService';

interface CombosViewProps {
  onSelectTemplate: (template: Template) => void;
  activeCustomCombo?: { templates: Template[]; situation: string } | null;
}

export const CombosView: React.FC<CombosViewProps> = ({
  onSelectTemplate,
  activeCustomCombo,
}) => {
  const [selectedComboId, setSelectedComboId] = useState<string>(presetCombos[0].id);
  const [customSituation, setCustomSituation] = useState('');
  const [dynamicCombo, setDynamicCombo] = useState<Template[] | null>(null);
  const [checkedStories, setCheckedStories] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  React.useEffect(() => {
    if (activeCustomCombo) {
      setDynamicCombo(activeCustomCombo.templates);
      setCustomSituation(activeCustomCombo.situation);
      setSelectedComboId('custom');
    }
  }, [activeCustomCombo]);

  const handleGenerateCustomCombo = () => {
    if (!customSituation.trim()) return;
    const analysis = recommendationService.analyzeSituation(customSituation);
    setDynamicCombo(analysis.comboSequence);
    setSelectedComboId('custom');
  };

  const currentCombo = selectedComboId === 'custom' && dynamicCombo
    ? {
        id: 'custom',
        title: 'Combo Personalizado',
        situation: customSituation || 'Situação personalizada do tatame',
        description: 'Sequência sob medida gerada a partir do que rolou na sua academia.',
        roundStoryIds: dynamicCombo.map((t) => t.id),
        tacticalTip: 'Poste com intervalo de 1 a 2 horas entre cada Story ao longo do dia para reter a atenção.',
      }
    : presetCombos.find((c) => c.id === selectedComboId) || presetCombos[0];

  const currentTemplates = selectedComboId === 'custom' && dynamicCombo
    ? dynamicCombo
    : currentCombo.roundStoryIds
        .map((id) => getTemplateById(id))
        .filter((t): t is Template => t !== undefined);

  const toggleCheck = (id: string) => {
    setCheckedStories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyStory = (template: Template) => {
    const text = `${template.nome} (${template.numero})\n\n${template.exemplos[0]}\n\nCTA: ${template.cta[0] || ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-3 text-left">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase px-2 py-0.5 rounded-md bg-black text-white flex items-center gap-1 font-bold">
            <Flame className="w-3 h-3 fill-white" />
            GERADOR DE COMBOS
          </span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-black text-black tracking-tight leading-none pt-1">
          COMBOS DE CONTEÚDO
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-xl">
          “Não para nesse Story. Esse acontecimento rende mais.” Uma única situação na tua academia pode virar um dia inteiro de narrativa.
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-5 space-y-3">
        <label className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-bold block">
          Gerar combo para uma situação específica:
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={customSituation}
            onChange={(e) => setCustomSituation(e.target.value)}
            placeholder="Ex: Aluno começou hoje com medo de se machucar..."
            className="flex-1 bg-white border border-neutral-300 focus:border-black rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-black outline-none font-medium placeholder:text-neutral-400"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateCustomCombo()}
          />
          <button
            onClick={handleGenerateCustomCombo}
            disabled={!customSituation.trim()}
            className="px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 disabled:opacity-40 text-white font-extrabold text-xs sm:text-sm tracking-wider font-display shrink-0 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>CRIAR COMBO</span>
          </button>
        </div>
      </div>

      <div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-bold block mb-2">
          OU ESCOLHA UM COMBO PRONTO:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          {dynamicCombo && (
            <button
              onClick={() => setSelectedComboId('custom')}
              className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all border cursor-pointer ${
                selectedComboId === 'custom'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-neutral-300 hover:border-black'
              }`}
            >
              🔥 Combo Personalizado
            </button>
          )}

          {presetCombos.map((combo) => {
            const isSelected = selectedComboId === combo.id;
            return (
              <button
                key={combo.id}
                onClick={() => setSelectedComboId(combo.id)}
                className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-black text-white border-black'
                    : 'bg-white hover:border-black text-black border-neutral-300'
                }`}
              >
                {combo.title}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-3xl p-4 sm:p-6 space-y-5">
        <div className="border-b border-neutral-200 pb-4">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-mono uppercase text-neutral-500 font-bold">
              {currentTemplates.length} ROUNDS PROGRAMADOS
            </span>
            <span className="text-xs text-neutral-500 font-mono">
              {Object.values(checkedStories).filter(Boolean).length} de {currentTemplates.length} gravados
            </span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl text-black font-black tracking-tight leading-tight">
            {currentCombo.title}
          </h2>

          <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed">
            {currentCombo.description}
          </p>

          <div className="mt-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-black font-medium">
            <span className="font-bold text-black font-mono uppercase mr-1">
              DICA TÁTICA:
            </span>
            {currentCombo.tacticalTip}
          </div>
        </div>

        <div className="space-y-3">
          {currentTemplates.map((template, idx) => {
            const isChecked = !!checkedStories[template.id];
            const roundNum = `ROUND 0${idx + 1}`;

            return (
              <div
                key={template.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isChecked
                    ? 'bg-neutral-100 border-black'
                    : 'bg-white border-neutral-200 hover:border-black'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-black text-white">
                      {roundNum}
                    </span>
                    <span className="font-mono text-xs text-neutral-500 font-bold">
                      #{template.numero}
                    </span>
                    <span className="font-display text-lg text-black font-black">
                      {template.nome}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleCheck(template.id)}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                      isChecked
                        ? 'bg-black text-white'
                        : 'bg-white text-black hover:border-black border border-neutral-300'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isChecked ? 'Gravado' : 'Marcar'}</span>
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-black italic mb-3 bg-neutral-50 p-3 rounded-xl border border-neutral-200 font-medium">
                  "{template.exemplos[0]}"
                </p>

                <div className="flex items-center justify-between text-xs text-neutral-600 gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-neutral-300 text-[11px] font-bold text-black font-mono">
                      <Video className="w-3.5 h-3.5 text-black" />
                      {template.format}
                    </span>
                    <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-neutral-300 text-[11px] font-bold text-black font-mono">
                      <Clock className="w-3.5 h-3.5 text-black" />
                      {template.duration}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyStory(template)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-neutral-100 text-black border border-neutral-300 hover:border-black flex items-center gap-1 text-xs font-bold cursor-pointer"
                    >
                      {copiedId === template.id ? (
                        <>
                          <Check className="w-3 h-3 text-black" />
                          <span className="text-black font-bold">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onSelectTemplate(template)}
                      className="px-2.5 py-1 rounded-lg bg-black hover:bg-neutral-800 text-white flex items-center gap-1 text-xs font-bold cursor-pointer"
                    >
                      <span>Ver detalhes</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
