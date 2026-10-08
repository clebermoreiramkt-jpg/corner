import React, { useState } from 'react';
import { Heart, History, Settings, Flame, Award, Check, Clock, Key, ShieldCheck, Zap, LogOut } from 'lucide-react';
import type { Template, UserProfile, PostedStoryRecord } from '../types';
import { storageService } from '../services/storageService';
import { getTemplateById } from '../data/templates';
import { TemplateCard } from './TemplateCard';
import { formatTimeAgo } from '../utils/timeAgo';
import { useAuth } from '../context/AuthContext';

interface MyCornerViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onSelectTemplate: (template: Template) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

const MODALITIES = [
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
];

const GOALS = [
  'Lotar turmas',
  'Conseguir mais alunos particulares',
  'Construir autoridade na cidade',
  'Fidelizar os alunos atuais',
  'Destravar vergonha de gravar',
];

export const MyCornerView: React.FC<MyCornerViewProps> = ({
  userProfile,
  onUpdateProfile,
  onSelectTemplate,
  favorites,
  onToggleFavorite,
}) => {
  const { userAccess, isAccessActive, openAuthModal, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'favorites' | 'history' | 'profile'>('favorites');
  const [history, setHistory] = useState<PostedStoryRecord[]>(storageService.getHistory());
  const [apiKey, setApiKey] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('corner_gemini_key') || '' : ''
  );
  const [savedSettingsSuccess, setSavedSettingsSuccess] = useState(false);

  const [name, setName] = useState(userProfile.name);
  const [gymName, setGymName] = useState(userProfile.gymName);
  const [modality, setModality] = useState(userProfile.modality);
  const [goal, setGoal] = useState(userProfile.goal);

  const favoriteTemplates = favorites
    .map((id) => getTemplateById(id))
    .filter((t): t is Template => t !== undefined);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name, gymName, modality, goal });
    if (typeof window !== 'undefined') {
      localStorage.setItem('corner_gemini_key', apiKey.trim());
    }
    setSavedSettingsSuccess(true);
    setTimeout(() => setSavedSettingsSuccess(false), 2500);
  };

  const refreshHistory = () => {
    setHistory(storageService.getHistory());
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-3 text-left">
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center p-2.5 shadow-2xs shrink-0">
              <img src="/logo-white.png" alt="CORNER" className="w-full h-auto object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl sm:text-3xl text-slate-950 font-black tracking-tight">
                  {userProfile.name}
                </h1>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-950 text-white font-bold">
                  {userProfile.modality}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {userProfile.gymName || 'Academia'} • Objetivo: {userProfile.goal}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="flex items-center justify-center gap-1 text-slate-950">
                <Flame className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span className="font-mono text-lg font-black">{userProfile.streakDays}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono uppercase block font-semibold">
                Dias Seguidos
              </span>
            </div>

            <div className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="font-mono text-lg font-black text-slate-950 block">
                {history.length}
              </span>
              <span className="text-[10px] text-slate-400 font-mono uppercase block font-semibold">
                Postados
              </span>
            </div>

            <div className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="font-mono text-lg font-black text-slate-950 block">
                {favorites.length}
              </span>
              <span className="text-[10px] text-slate-400 font-mono uppercase block font-semibold">
                Favoritos
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-700 font-medium flex items-center gap-1.5">
          <Award className="w-4 h-4 text-slate-950 shrink-0" />
          <span>
            Seu round de conteúdo: {userProfile.streakDays} dias seguidos. Boa. Continua firme no tatame!
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'favorites'
              ? 'bg-white text-slate-950 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Favoritos ({favoriteTemplates.length})</span>
        </button>

        <button
          onClick={() => {
            refreshHistory();
            setActiveTab('history');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-white text-slate-950 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>O Que Já Postei ({history.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-white text-slate-950 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Meu Perfil</span>
        </button>
      </div>

      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl text-slate-950 font-black">
              TEMPLATES SALVOS NO TEU CORNER
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {favoriteTemplates.length} templates
            </span>
          </div>

          {favoriteTemplates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {favoriteTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isFavorite={true}
                  onToggleFavorite={onToggleFavorite}
                  onSelect={onSelectTemplate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6 space-y-2 shadow-xs">
              <Heart className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-display text-lg text-slate-950 font-black">
                Nenhum favorito salvo ainda
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Quando encontrar um template que tu curte na biblioteca, clica no coraçãozinho ♡ para salvar aqui no teu Corner.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl text-slate-950 font-black">
                O QUE EU JÁ POSTEI
              </h3>
              <p className="text-xs text-slate-500">
                Evita repetição de templates na mesma semana.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {history.length} postagens
            </span>
          </div>

          {history.length > 0 ? (
            <div className="space-y-2.5">
              {history.map((record) => {
                const template = getTemplateById(record.templateId);
                const timeAgo = formatTimeAgo(record.postedAt);

                return (
                  <div
                    key={record.id}
                    onClick={() => template && onSelectTemplate(template)}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-2xs transition-all flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center font-mono font-black text-xs shrink-0">
                        {template?.numero || '#'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-display text-base text-slate-950 font-bold group-hover:text-slate-700 transition-colors">
                            {record.templateName}
                          </h4>
                          <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {timeAgo}
                          </span>
                        </div>
                        {record.customText && (
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {record.customText}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 group-hover:text-slate-950 font-bold shrink-0">
                      Ver →
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6 space-y-2 shadow-xs">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-display text-lg text-slate-950 font-black">
                Nenhum Story marcado como postado
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Ao gravar um Story de um template, clique em "Marcar como Postado" para registrar a data e alimentar seu round de conteúdo!
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
          <h3 className="font-display text-xl text-slate-950 font-black mb-2">
            CONFIGURAÇÕES DO MEU CORNER
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono uppercase text-slate-500 font-bold block mb-1">
                Nome do Professor:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-slate-950 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-500 font-bold block mb-1">
                Nome da Academia:
              </label>
              <input
                type="text"
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-slate-950 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-500 font-bold block mb-1">
                Modalidade Principal:
              </label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-slate-950 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none font-medium cursor-pointer"
              >
                {MODALITIES.map((mod) => (
                  <option key={mod} value={mod}>
                    {mod}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-500 font-bold block mb-1">
                Objetivo Atual:
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-slate-950 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none font-medium cursor-pointer"
              >
                {GOALS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <label className="text-xs font-mono uppercase text-slate-700 font-bold block mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-950" />
              Chave Google Gemini API (Opcional):
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Se desejar usar inteligência artificial direta do Google para gerar roteiros inéditos, insira sua chave. O app já funciona 100% de fábrica sem chave através do motor tático local.
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-50 border border-slate-300 focus:border-slate-950 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none font-mono"
            />
          </div>

          {/* Cakto Webhook & Auth Section */}
          <div className="pt-3 border-t border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase text-slate-700 font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                Acesso & Webhook Cakto:
              </label>
              {isAccessActive ? (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Ativo
                </span>
              ) : (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200">
                  Não Verificado
                </span>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-900 block">
                  {userAccess?.email ? `E-mail: ${userAccess.email}` : 'Nenhum e-mail conectado'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {userAccess?.plan || 'Liberação automática via compra na Cakto'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openAuthModal}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-900 transition-all shadow-2xs cursor-pointer"
                >
                  Configurar Webhook & Login
                </button>
                {userAccess && (
                  <button
                    type="button"
                    onClick={logout}
                    className="p-1.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                    title="Sair da conta"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between">
            {savedSettingsSuccess ? (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Salvo com sucesso!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm font-display tracking-wider transition-all cursor-pointer shadow-xs"
            >
              SALVAR MEU CORNER
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
