import React, { useState, useMemo } from 'react';
import { Search, X, BookOpen } from 'lucide-react';
import type { Template } from '../types';
import { allTemplates } from '../data/templates';
import { categories } from '../data/categories';
import { TemplateCard } from './TemplateCard';

interface LibraryProps {
  onSelectTemplate: (template: Template) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}

const TAG_FILTERS = [
  'Todos',
  'Venda',
  'Aluno',
  'Evolução',
  'Educação',
  'Bastidores',
  'Humanização',
  'Curiosidade',
  'Motivação',
  'Academia',
  'Iniciante',
];

export const Library: React.FC<LibraryProps> = ({
  onSelectTemplate,
  isFavorite,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('Todos');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');

  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((t) => {
      // 1. Text Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inName = t.nome.toLowerCase().includes(query);
        const inNum = t.numero.includes(query);
        const inObjective = t.objetivo.toLowerCase().includes(query);
        const inModel = t.modelo.toLowerCase().includes(query);
        const inExamples = t.exemplos.some((ex) => ex.toLowerCase().includes(query));
        const inTags = t.tags.some((tag) => tag.toLowerCase().includes(query));
        const inCategory = t.categoria.toLowerCase().includes(query);
        if (!inName && !inNum && !inObjective && !inModel && !inExamples && !inTags && !inCategory) {
          return false;
        }
      }

      // 2. Tag Filter
      if (selectedTag !== 'Todos') {
        const tagLower = selectedTag.toLowerCase();
        const hasTag = t.tags.some((tg) => tg.toLowerCase().includes(tagLower)) ||
                       t.categoria.toLowerCase().includes(tagLower) ||
                       t.objetivo.toLowerCase().includes(tagLower);
        if (!hasTag) return false;
      }

      // 3. Category Filter
      if (selectedCategory !== 'all') {
        if (t.categoriaSlug !== selectedCategory) return false;
      }

      // 4. Format Filter
      if (selectedFormat !== 'all') {
        if (t.format !== selectedFormat) return false;
      }

      return true;
    });
  }, [searchQuery, selectedTag, selectedCategory, selectedFormat]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTag('Todos');
    setSelectedCategory('all');
    setSelectedFormat('all');
  };

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto px-4 pt-3 text-left">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-slate-950 text-white">
              99 TEMPLATES COMPLETOS
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-none pt-1">
            BIBLIOTECA DO CORNER
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Nenhum Story do zero. Escolhe um modelo, ajusta e grava.
          </p>
        </div>

        <div className="text-right">
          <span className="font-mono text-2xl font-black text-slate-950 block leading-none">
            {filteredTemplates.length}
          </span>
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
            de 99 ideias
          </span>
        </div>
      </div>

      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="O que tu quer postar? (ex: armlock, aluno novo, cansaço, agenda aberta...)"
          className="w-full bg-white border border-slate-300 focus:border-slate-950 rounded-2xl pl-11 pr-10 py-3.5 text-sm sm:text-base text-slate-950 placeholder:text-slate-400 outline-none transition-all shadow-2xs font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block">
          FILTRAR POR TEMA:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-xs">
          {TAG_FILTERS.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all select-none cursor-pointer ${
                  isSelected
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block mb-1">
            CATEGORIA:
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium outline-none focus:border-slate-950 shadow-2xs cursor-pointer"
          >
            <option value="all">Todas as 10 Categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.numero} — {c.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block mb-1">
            FORMATO DO STORY:
          </label>
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium outline-none focus:border-slate-950 shadow-2xs cursor-pointer"
          >
            <option value="all">Todos os Formatos</option>
            <option value="falando para câmera">Falando para Câmera</option>
            <option value="vídeo do treino">Vídeo do Treino</option>
            <option value="texto sobre vídeo">Texto sobre Vídeo</option>
            <option value="foto">Foto</option>
            <option value="selfie">Selfie</option>
            <option value="boomerang">Boomerang</option>
            <option value="depoimento">Depoimento</option>
            <option value="bastidor">Bastidor</option>
          </select>
        </div>
      </div>

      {(searchQuery || selectedTag !== 'Todos' || selectedCategory !== 'all' || selectedFormat !== 'all') && (
        <div className="flex items-center justify-between text-xs bg-slate-100 p-2.5 rounded-xl border border-slate-200">
          <span className="text-slate-600 font-medium">
            Filtros ativos ({filteredTemplates.length} resultados)
          </span>
          <button
            onClick={clearFilters}
            className="text-slate-950 hover:underline font-bold cursor-pointer"
          >
            Limpar todos os filtros
          </button>
        </div>
      )}

      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isFavorite={isFavorite(template.id)}
              onToggleFavorite={onToggleFavorite}
              onSelect={onSelectTemplate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-display text-xl text-slate-950 font-black">
            Nenhum template encontrado
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Não encontramos nenhum template com esse filtro. Tenta buscar por "aluno", "técnica", "medo", "venda" ou limpe a busca.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
          >
            Limpar filtros e ver os 99
          </button>
        </div>
      )}
    </div>
  );
};
