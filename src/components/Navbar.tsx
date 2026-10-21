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
  const { isAccessActive, openAuthModal, userAccess, isAdmin } = useAuth();
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 px-4 py-3">
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
          <div className="hidden sm:block border-l border-neutral-200 pl-3">
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-black text-white font-bold tracking-wider mr-2">
              LUTA
            </span>
            <span className="text-[11px] text-neutral-600 tracking-normal font-medium">
              Tu dá aula. O CORNER encontra o conteúdo.
            </span>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Landing / App Toggle Button */}
          <button
            onClick={() => onViewChange(currentView === 'landing' ? 'app' : 'landing')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-neutral-300 hover:border-black bg-white text-black transition-all cursor-pointer"
            title={currentView === 'landing' ? 'Ir para o Aplicativo' : 'Ver Landing Page Pública'}
          >
            {currentView === 'landing' ? (
              <>
                <Smartphone className="w-3.5 h-3.5 text-black" />
                <span className="hidden sm:inline">Entrar no</span> App
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5 text-neutral-600" />
                <span className="hidden sm:inline">Ver</span> Site
              </>
            )}
          </button>

          {/* Admin User Registration Button */}
          {isAdmin && (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-black text-white hover:bg-neutral-800 transition-all cursor-pointer shadow-xs"
              title="Painel Admin: Cadastrar e Gerenciar Usuários"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Admin:</span> Cadastrar
            </button>
          )}

          {/* Auth Button */}
          {!isAdmin && (isAccessActive ? (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-neutral-100 border border-neutral-300 text-black hover:border-black transition-all cursor-pointer"
              title="Sua conta está ativa. Clique para gerenciar."
            >
              <ShieldCheck className="w-3.5 h-3.5 text-black" />
              <span className="hidden sm:inline">Acesso</span> Ativo
            </button>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-black text-white hover:bg-neutral-800 transition-all cursor-pointer"
              title="Entrar com e-mail e senha"
            >
              <Key className="w-3.5 h-3.5 text-white" />
              <span>Entrar</span>
            </button>
          ))}

          {/* Gamification Streak Pill */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-neutral-300 hover:border-black text-black transition-all cursor-pointer"
            title="Seu Round de Conteúdo"
          >
            <Flame className="w-3.5 h-3.5 text-black fill-black" />
            <span className="font-mono">{userProfile.streakDays}</span>
            <span className="hidden xs:inline text-[11px] text-neutral-500 font-normal">rounds</span>
          </button>

          {/* User Profile Pill */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-neutral-300 hover:border-black text-black transition-all cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-neutral-100 text-black flex items-center justify-center font-bold text-[10px]">
              <User className="w-3 h-3" />
            </div>
            <span className="max-w-[80px] truncate hidden xs:inline font-mono">
              {userAccess?.name || userProfile.name}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
