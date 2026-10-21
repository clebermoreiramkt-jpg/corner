import React, { useState } from 'react';
import { X, Heart, Copy, Check, Video, Clock, Camera, MessageSquare, AlertCircle, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Template } from '../types';
import { storageService } from '../services/storageService';

interface TemplateDetailModalProps {
  template: Template | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (templateId: string) => void;
  onOpenComboForTemplate?: (template: Template) => void;
}

export const TemplateDetailModal: React.FC<TemplateDetailModalProps> = ({
  template,
  onClose,
  isFavorite,
  onToggleFavorite,
  onOpenComboForTemplate,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [justPosted, setJustPosted] = useState(false);
  const [customBlanks, setCustomBlanks] = useState<string[]>(['', '', '']);

  if (!template) return null;

  const usedInfo = storageService.getTemplateLastUsed(template.id);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleMarkAsPosted = () => {
    storageService.markAsPosted(template.id, template.nome);
    setJustPosted(true);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#ffffff', '#047857', '#34d399'],
      });
    } catch {
      // fallback
    }

    setTimeout(() => {
      setJustPosted(false);
    }, 3000);
  };

  const parts = template.modelo.split('______');
  const filledModelText = parts.reduce((acc, part, i) => {
    const blankVal = customBlanks[i] || '______';
    return i === 0 ? part : `${acc}${blankVal}${part}`;
  }, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white border border-neutral-200 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-neutral-200 bg-white flex items-start justify-between gap-3 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-black text-white">
                #{template.numero}
              </span>
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                {template.categoria}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 font-semibold border border-neutral-200">
                {template.difficulty}
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl text-black font-black tracking-tight leading-none">
              {template.nome}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(template.id)}
              className={`p-2 rounded-xl transition-all border cursor-pointer ${
                isFavorite
                  ? 'text-black bg-neutral-100 border-black'
                  : 'text-neutral-400 hover:text-black bg-white border-neutral-200'
              }`}
              title={isFavorite ? 'Salvo no seu Corner' : 'Salvar no seu Corner'}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-black text-black' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-black bg-white hover:bg-neutral-100 border border-neutral-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-left bg-white">
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-neutral-200 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-50 text-neutral-800 border border-neutral-200 font-medium">
              <Video className="w-3.5 h-3.5 text-neutral-600" />
              <span className="font-semibold text-black">Formato:</span> {template.format}
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-50 text-neutral-800 border border-neutral-200 font-medium">
              <Clock className="w-3.5 h-3.5 text-neutral-600" />
              <span className="font-semibold text-black">Duração:</span> {template.duration}
            </div>
            {usedInfo.used && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black text-white border border-black font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-white" />
                <span>
                  {usedInfo.daysAgo === 0
                    ? 'Postado hoje'
                    : usedInfo.daysAgo === 1
                    ? 'Postado ontem'
                    : `Postado há ${usedInfo.daysAgo} dias`}
                </span>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 font-bold mb-1.5">
              OBJETIVO DO STORY
            </h4>
            <p className="text-sm sm:text-base text-neutral-800 leading-relaxed bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
              {template.objetivo}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 font-bold">
                ESTRUTURA / MODELO
              </h4>
              <button
                onClick={() => copyToClipboard(filledModelText, 'model')}
                className="text-xs text-neutral-600 hover:text-black flex items-center gap-1 transition-colors font-semibold cursor-pointer"
              >
                {copiedSection === 'model' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-black font-bold" />
                    <span className="text-black font-bold">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar modelo</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-black p-4 rounded-xl border border-neutral-900 relative group">
              <p className="text-sm sm:text-base font-medium text-white italic leading-relaxed">
                "{template.modelo}"
              </p>
            </div>

            {parts.length > 1 && (
              <div className="mt-2.5 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 block font-bold">
                  Preencher lacunas para copiar pronto:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {parts.slice(0, parts.length - 1).map((_, idx) => (
                    <input
                      key={idx}
                      type="text"
                      placeholder={`Lacuna ${idx + 1}...`}
                      value={customBlanks[idx] || ''}
                      onChange={(e) => {
                        const next = [...customBlanks];
                        next[idx] = e.target.value;
                        setCustomBlanks(next);
                      }}
                      className="text-xs bg-white border border-neutral-300 focus:border-black rounded-lg px-3 py-2 text-black outline-none placeholder:text-neutral-400 font-medium"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 font-bold mb-2">
              EXEMPLOS PRONTOS PARA PROFESSORES DE LUTA
            </h4>
            <div className="space-y-2.5">
              {template.exemplos.map((ex, i) => (
                <div
                  key={i}
                  className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 flex items-start justify-between gap-3 group hover:border-black transition-colors"
                >
                  <div className="text-xs sm:text-sm text-neutral-800 leading-relaxed">
                    <span className="text-black font-mono font-bold mr-1.5">
                      0{i + 1}.
                    </span>
                    {ex}
                  </div>
                  <button
                    onClick={() => copyToClipboard(ex, `ex-${i}`)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-200 transition-all shrink-0 cursor-pointer"
                    title="Copiar este exemplo"
                  >
                    {copiedSection === `ex-${i}` ? (
                      <Check className="w-4 h-4 text-black" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 font-bold mb-1.5 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-neutral-700" />
              NA PRÁTICA (O QUE FILMAR)
            </h4>
            <div className="bg-neutral-50 border border-neutral-200 p-3.5 rounded-xl text-xs sm:text-sm text-neutral-800 leading-relaxed font-medium">
              {template.filming_tip}
            </div>
          </div>

          {template.cta && template.cta.length > 0 && (
            <div>
              <h4 className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 font-bold mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-neutral-700" />
                CHAMADA PARA AÇÃO (CTA)
              </h4>
              <div className="space-y-1.5">
                {template.cta.map((ctaText, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs sm:text-sm text-neutral-800"
                  >
                    <span className="font-medium">“{ctaText}”</span>
                    <button
                      onClick={() => copyToClipboard(ctaText, `cta-${i}`)}
                      className="p-1 text-neutral-400 hover:text-black cursor-pointer"
                      title="Copiar CTA"
                    >
                      {copiedSection === `cta-${i}` ? (
                        <Check className="w-3.5 h-3.5 text-black" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 pt-2">
            {template.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-5 border-t border-neutral-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            onClick={() => {
              const fullText = `${template.nome}\n\n${template.exemplos[0]}\n\nCTA: ${template.cta[0] || ''}`;
              copyToClipboard(fullText, 'full');
            }}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-black hover:bg-neutral-800 text-white font-extrabold text-sm shadow-xs transition-all font-display tracking-wider cursor-pointer"
          >
            {copiedSection === 'full' ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>STORY COPIADO!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>COPIAR STORY PRONTO</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenComboForTemplate && (
              <button
                onClick={() => {
                  onClose();
                  onOpenComboForTemplate(template);
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-xl bg-white hover:bg-neutral-100 text-black border border-neutral-300 text-xs font-bold transition-all cursor-pointer"
                title="Transformar este Story em uma sequência inteira"
              >
                <Layers className="w-4 h-4 text-neutral-700" />
                <span>Gerar Combo</span>
              </button>
            )}

            <button
              onClick={handleMarkAsPosted}
              disabled={justPosted}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                justPosted
                  ? 'bg-black text-white border-black'
                  : 'bg-white hover:bg-neutral-100 text-black border-neutral-300'
              }`}
            >
              <Check className={`w-4 h-4 ${justPosted ? 'text-white' : 'text-neutral-500'}`} />
              <span>{justPosted ? 'Postado! +1 Round' : 'Marcar Postado'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
