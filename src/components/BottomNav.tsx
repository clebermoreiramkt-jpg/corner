import React from 'react';
import { Zap, BookOpen, Layers, Shield } from 'lucide-react';

export type AppTab = 'dashboard' | 'library' | 'combos' | 'mycorner';

interface BottomNavProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  favoritesCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  favoritesCount,
}) => {
  const tabs = [
    {
      id: 'dashboard' as AppTab,
      label: 'Início',
      icon: Zap,
      badge: null,
    },
    {
      id: 'library' as AppTab,
      label: 'Biblioteca',
      icon: BookOpen,
      badge: '99',
    },
    {
      id: 'combos' as AppTab,
      label: 'Combos',
      icon: Layers,
      badge: '🔥',
    },
    {
      id: 'mycorner' as AppTab,
      label: 'Meu Corner',
      icon: Shield,
      badge: favoritesCount > 0 ? favoritesCount : null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1.5 safe-bottom shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-150 select-none ${
                isActive
                  ? 'text-slate-950 bg-slate-100 font-bold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    isActive ? 'scale-105 text-slate-950 stroke-[2.3]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.badge && (
                  <span
                    className={`absolute -top-1.5 -right-3 text-[9px] font-mono px-1 rounded-full ${
                      isActive
                        ? 'bg-slate-900 text-white font-extrabold'
                        : 'bg-slate-200 text-slate-700 font-semibold border border-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight leading-none">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-4 h-0.5 rounded-full bg-slate-950" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
