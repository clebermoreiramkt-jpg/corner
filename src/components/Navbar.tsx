import React from 'react';
import { Flame, Globe, Smartphone, User, Key, ShieldCheck } from 'lucide-react';
import type { UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentView: 'app' | 'landing';
  onViewChange: (view: 'app' | 'landing') => void;
  userProfile: UserProfile;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  userProfile,
  onOpenProfile,
}) => {
  const { isAccessActive, openAuthModal, userAccess } = useAuth();
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/90 px-4 py-3 shadow-xs">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Concept */}
        <div 
          onClick={() => onViewChange('app')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <img 
            src="/logo-black.png" 
            alt="CORNER" 
            className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105" 
          />
          <div className="hidden sm:block border-l border-slate-200 pl-3">
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-bold tracking-wider mr-2">
              LUTA
            </span>
            <span className="text-[11px] text-slate-500 tracking-normal font-medium">
              Tu dá aula. O CORNER encontra o conteúdo.
            </span>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Landing / App Toggle Button */}
          <button
            onClick={() => onViewChange(currentView === 'landing' ? 'app' : 'landing')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all text-slate-700 border-slate-200 hover:border-slate-400 bg-white shadow-2xs"
            title={currentView === 'landing' ? 'Ir para o Aplicativo' : 'Ver Landing Page Pública'}
          >
            {currentView === 'landing' ? (
              <>
                <Smartphone className="w-3.5 h-3.5 text-slate-900" />
                <span className="hidden sm:inline">Entrar no</span> App
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Ver</span> Site
              </>
            )}
          </button>

          {/* Cakto Auth Button */}
          {isAccessActive ? (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-all shadow-2xs cursor-pointer"
              title="Acesso Ativo via Cakto. Clique para gerenciar."
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Cakto</span> Ativo
            </button>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-950 text-white hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
              title="Entrar com o e-mail da compra na Cakto"
            >
              <Key className="w-3.5 h-3.5 text-slate-300" />
              <span>Entrar</span>
            </button>
          )}

          {/* Gamification Streak Pill */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
            title="Seu Round de Conteúdo"
          >
            <Flame className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
            <span className="font-mono font-bold">{userProfile.streakDays}</span>
            <span className="hidden xs:inline text-[11px] text-slate-500">rounds</span>
          </button>

          {/* User Profile Pill */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-xl text-xs font-medium bg-white border border-slate-200 text-slate-800 hover:border-slate-300 transition-all shadow-2xs cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
              <User className="w-3 h-3" />
            </div>
            <span className="font-medium max-w-[80px] truncate hidden xs:inline">
              {userAccess?.name || userProfile.name}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
