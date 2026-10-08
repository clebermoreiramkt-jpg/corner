import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import type { AppTab } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { Library } from './components/Library';
import { CombosView } from './components/CombosView';
import { MyCornerView } from './components/MyCornerView';
import { LandingPageView } from './components/LandingPageView';
import { GiveMeAStoryModal } from './components/GiveMeAStoryModal';
import { TemplateDetailModal } from './components/TemplateDetailModal';
import { AuthModal } from './components/AuthModal';
import type { Template, UserProfile } from './types';
import { storageService } from './services/storageService';
import { useAuth } from './context/AuthContext';

export function App() {
  const { isAuthModalOpen, closeAuthModal, openAuthModal, isAccessActive } = useAuth();
  const [view, setView] = useState<'app' | 'landing'>(() => {
    return isAccessActive ? 'app' : 'landing';
  });
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [userProfile, setUserProfile] = useState<UserProfile>(storageService.getProfile());
  const [favorites, setFavorites] = useState<string[]>(storageService.getFavorites());

  // Modals state
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isGiveMeAStoryOpen, setIsGiveMeAStoryOpen] = useState(false);
  const [giveMeAStoryInitialPrompt, setGiveMeAStoryInitialPrompt] = useState('');

  // Active combo sequence state
  const [activeCustomCombo, setActiveCustomCombo] = useState<{
    templates: Template[];
    situation: string;
  } | null>(null);

  // Trava de Acesso Rigorosa: sem compra ativa na Cakto, mantém na Landing Page. Com acesso ativo, entra no App.
  useEffect(() => {
    if (!isAccessActive) {
      setView('landing');
    } else {
      setView('app');
    }
  }, [isAccessActive]);

  const handleEnterApp = () => {
    if (!isAccessActive) {
      openAuthModal();
      return;
    }
    setView('app');
  };

  const handleToggleFavorite = (templateId: string) => {
    storageService.toggleFavorite(templateId);
    setFavorites(storageService.getFavorites());
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    const saved = storageService.saveProfile(updated);
    setUserProfile(saved);
  };

  const handleOpenGiveMeAStory = (initialPrompt?: string) => {
    setGiveMeAStoryInitialPrompt(initialPrompt || '');
    setIsGiveMeAStoryOpen(true);
  };

  const handleOpenComboSequence = (templates: Template[], situationTitle: string) => {
    setActiveCustomCombo({ templates, situation: situationTitle });
    setActiveTab('combos');
    setView('app');
  };

  const handleOpenComboForTemplate = (template: Template) => {
    const situation = `Situação ligada a: ${template.nome} (${template.objetivo})`;
    setActiveCustomCombo({
      templates: [template],
      situation,
    });
    setActiveTab('combos');
    setView('app');
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-[#09090b] flex flex-col justify-between selection:bg-slate-900 selection:text-white">
      {view === 'landing' || !isAccessActive ? (
        <LandingPageView 
          onEnterApp={handleEnterApp} 
          onOpenAuthModal={openAuthModal}
          isAccessActive={isAccessActive} 
        />
      ) : (
        <>
          <Navbar
            currentView={view}
            onViewChange={(target) => {
              if (target === 'app' && !isAccessActive) {
                openAuthModal();
                return;
              }
              setView(target);
            }}
            userProfile={userProfile}
            onOpenProfile={() => setActiveTab('mycorner')}
          />

          <main className="flex-1 w-full max-w-4xl mx-auto py-2">
            {activeTab === 'dashboard' && (
              <Dashboard
                userProfile={userProfile}
                onOpenGiveMeAStory={handleOpenGiveMeAStory}
                onSelectTemplate={setSelectedTemplate}
                onNavigateToTab={(tab) => setActiveTab(tab)}
                isFavorite={(id) => favorites.includes(id)}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

            {activeTab === 'library' && (
              <Library
                onSelectTemplate={setSelectedTemplate}
                isFavorite={(id) => favorites.includes(id)}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

            {activeTab === 'combos' && (
              <CombosView
                onSelectTemplate={setSelectedTemplate}
                activeCustomCombo={activeCustomCombo}
              />
            )}

            {activeTab === 'mycorner' && (
              <MyCornerView
                userProfile={userProfile}
                onUpdateProfile={handleUpdateProfile}
                onSelectTemplate={setSelectedTemplate}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
          </main>

          <BottomNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            favoritesCount={favorites.length}
          />
        </>
      )}

      {/* ⚡ ME DÊ UM STORY Modal */}
      {isAccessActive && (
        <GiveMeAStoryModal
          isOpen={isGiveMeAStoryOpen}
          onClose={() => {
            setIsGiveMeAStoryOpen(false);
            setGiveMeAStoryInitialPrompt('');
          }}
          onSelectTemplate={setSelectedTemplate}
          onOpenComboSequence={handleOpenComboSequence}
          isFavorite={(id) => favorites.includes(id)}
          onToggleFavorite={handleToggleFavorite}
          userModality={userProfile.modality}
          initialPrompt={giveMeAStoryInitialPrompt}
        />
      )}

      {/* Template Detail & Copy Modal */}
      {isAccessActive && (
        <TemplateDetailModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          isFavorite={selectedTemplate ? favorites.includes(selectedTemplate.id) : false}
          onToggleFavorite={handleToggleFavorite}
          onOpenComboForTemplate={handleOpenComboForTemplate}
        />
      )}

      {/* 🥋 Cakto Authentication & Webhook Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
      />
    </div>
  );
}

export default App;
