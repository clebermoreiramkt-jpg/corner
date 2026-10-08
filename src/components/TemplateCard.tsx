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
      className="group relative bg-white hover:bg-[#fafafa] border border-slate-200/90 hover:border-slate-400 rounded-2xl p-4 transition-all duration-150 cursor-pointer flex flex-col justify-between text-left shadow-2xs hover:shadow-sm"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
              #{template.numero}
            </span>
            {badge && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 font-bold" title="Recomendação de ranking">
                {badge}
              </span>
            )}
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {template.categoria.split('—')[1]?.trim() || template.categoria}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleFavoriteClick}
              aria-label="Salvar nos favoritos"
              className={`p-1.5 rounded-lg transition-colors ${
                isFavorite
                  ? 'text-rose-600 bg-rose-50 border border-rose-200'
                  : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        <h3 className="font-display text-lg text-slate-950 font-bold tracking-tight group-hover:text-emerald-700 transition-colors leading-tight mb-1.5">
          {template.nome}
        </h3>

        {highlightReason && (
          <p className="text-xs text-emerald-800 font-medium bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg mb-2">
            {highlightReason}
          </p>
        )}

        <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
          {template.objetivo}
        </p>

        <div className="bg-[#f8f9fa] border border-slate-200/80 rounded-xl p-2.5 mb-3">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block mb-1">
            MODELO
          </span>
          <p className="text-xs font-medium text-slate-800 line-clamp-2 italic leading-relaxed">
            "{template.modelo}"
          </p>
        </div>
      </div>

      {usedInfo.used && usedInfo.daysAgo <= 7 && (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg mb-3">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
          <span>
            {usedInfo.daysAgo === 0
              ? 'Tu usou esse template hoje'
              : usedInfo.daysAgo === 1
              ? 'Tu usou esse template ontem'
              : `Tu usou esse template há ${usedInfo.daysAgo} dias`}
          </span>
        </div>
      )}

      <div className="pt-2 border-t border-slate-150 flex items-center justify-between text-[11px] text-slate-500 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700">
            <Video className="w-3 h-3 text-emerald-600" />
            <span className="truncate max-w-[90px]">{template.format}</span>
          </span>
          <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{template.duration}</span>
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all font-semibold text-slate-800"
            title="Copiar rápido"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-emerald-700 font-bold">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
