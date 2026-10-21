import React from 'react';
import { Heart, Clock, Video, Copy, Check, AlertCircle } from 'lucide-react';
import type { Template } from '../types';
import { storageService } from '../services/storageService';

interface TemplateCardProps {
  template: Template;
  isFavorite: boolean;
  onToggleFavorite: (templateId: string) => void;
  onSelect: (template: Template) => void;
  badge?: string;
  highlightReason?: string;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isFavorite,
  onToggleFavorite,
  onSelect,
  badge,
  highlightReason,
}) => {
  const [copied, setCopied] = React.useState(false);
  const usedInfo = storageService.getTemplateLastUsed(template.id);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `${template.nome} (${template.numero})\n\nObjetivo: ${template.objetivo}\n\nModelo:\n${template.modelo}\n\nExemplo:\n${template.exemplos[0]}\n\nNa prática:\n${template.filming_tip}\n\nCTA:\n${template.cta[0] || ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(template.id);
  };

  return (
    <div
      onClick={() => onSelect(template)}
      className="group relative bg-white border border-neutral-200 hover:border-black rounded-2xl p-4 transition-all duration-150 cursor-pointer flex flex-col justify-between text-left"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-black text-white">
              #{template.numero}
            </span>
            {badge && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-300 text-black font-bold" title="Recomendação de ranking">
                {badge}
              </span>
            )}
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider font-mono">
              {template.categoria.split('—')[1]?.trim() || template.categoria}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleFavoriteClick}
              aria-label="Salvar nos favoritos"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isFavorite
                  ? 'text-black bg-neutral-100 border border-neutral-300'
                  : 'text-neutral-400 hover:text-black hover:bg-neutral-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-black text-black' : ''}`} />
            </button>
          </div>
        </div>

        <h3 className="font-display text-lg text-black font-black tracking-tight leading-tight mb-1.5">
          {template.nome}
        </h3>

        {highlightReason && (
          <p className="text-xs text-black font-bold bg-neutral-100 border border-neutral-300 px-2.5 py-1 rounded-lg mb-2">
            {highlightReason}
          </p>
        )}

        <p className="text-xs text-neutral-600 line-clamp-2 mb-3 leading-relaxed">
          {template.objetivo}
        </p>

        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 mb-3">
          <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 font-bold block mb-1">
            MODELO
          </span>
          <p className="text-xs font-medium text-black line-clamp-2 italic leading-relaxed">
            "{template.modelo}"
          </p>
        </div>
      </div>

      {usedInfo.used && usedInfo.daysAgo <= 7 && (
        <div className="flex items-center gap-1.5 text-[11px] text-black bg-neutral-100 border border-neutral-300 px-2 py-1 rounded-lg mb-3">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-black" />
          <span>
            {usedInfo.daysAgo === 0
              ? 'Tu usou esse template hoje'
              : usedInfo.daysAgo === 1
              ? 'Tu usou esse template ontem'
              : `Tu usou esse template há ${usedInfo.daysAgo} dias`}
          </span>
        </div>
      )}

      <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-[11px] text-neutral-600 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-neutral-300 text-black font-mono text-[10px]">
            <Video className="w-3 h-3 text-black" />
            <span className="truncate max-w-[90px]">{template.format}</span>
          </span>
          <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-neutral-300 text-black font-mono text-[10px]">
            <Clock className="w-3 h-3 text-black" />
            <span>{template.duration}</span>
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-neutral-100 border border-neutral-300 hover:border-black transition-all font-bold text-black cursor-pointer"
            title="Copiar rápido"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-black" />
                <span className="text-black font-bold">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-neutral-600" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
