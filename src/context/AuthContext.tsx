import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, type UserAccessData } from '../services/authService';

interface AuthContextType {
  userAccess: UserAccessData | null;
  isAuthenticated: boolean;
  isAccessActive: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  sendMagicLink: (email: string) => Promise<{ success: boolean; message: string; isDemo?: boolean }>;
  loginInstantDemo: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccess: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userAccess, setUserAccess] = useState<UserAccessData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // 1. Checa link mágico na URL ou sessão existente ao iniciar
    const initAuth = async () => {
      try {
        const session = await authService.verifyMagicLinkOnLoad();
        if (session && session.status === 'active') {
          setUserAccess(session);
        } else {
          setUserAccess(null);
        }
      } catch (err) {
        console.error('Erro na inicialização de autenticação:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // 2. Escuta mudanças de auth do Firebase
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser?.email) {
        const access = await authService.checkAccessStatus(firebaseUser.email);
        setUserAccess(access);
      }
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const sendMagicLink = async (email: string) => {
    return await authService.sendMagicLink(email);
  };

  const loginInstantDemo = async (email: string) => {
    const access = await authService.mockSignIn(email);
    setUserAccess(access);
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    await authService.logout();
    setUserAccess(null);
  };

  const refreshAccess = async () => {
    if (userAccess?.email) {
      const updated = await authService.checkAccessStatus(userAccess.email);
      setUserAccess(updated);
    }
  };

  const isAccessActive = userAccess?.status === 'active';
  const isAuthenticated = Boolean(userAccess && isAccessActive);

  return (
    <AuthContext.Provider
      value={{
        userAccess,
        isAuthenticated,
        isAccessActive,
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        sendMagicLink,
        loginInstantDemo,
        logout,
        refreshAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
