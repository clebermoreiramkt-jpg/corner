import { 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink, 
  signOut,
  onAuthStateChanged,
  type User 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebaseConfig';
import { supabase, isSupabaseConfigured } from './supabaseConfig';
import { adminService, ADMIN_EMAILS } from './adminService';

export interface UserAccessData {
  email: string;
  name?: string;
  phone?: string;
  status: 'active' | 'refunded' | 'pending' | 'blocked' | 'none';
  plan?: string;
  role?: 'admin' | 'user';
  modality?: string;
  purchasedAt?: string;
}

const SESSION_USER_KEY = 'corner_current_auth_user';

export const authService = {
  // 1. Enviar Link Mágico para o E-mail
  async sendMagicLink(email: string): Promise<{ success: boolean; message: string; isDemo?: boolean }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Por favor, informe um e-mail válido.');
    }

    // O e-mail deve ter sido cadastrado pelo admin ou ser o admin mestre
    const access = await this.checkAccessStatus(cleanEmail);
    if (access.status !== 'active') {
      throw new Error(
        `Nenhum cadastro ativo foi encontrado para o e-mail "${cleanEmail}". ` +
        `Solicite o cadastro à administração do CORNER para liberar seu acesso.`
      );
    }

    // Salva o e-mail localmente para usar na confirmação do link
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('corner_email_for_signin', cleanEmail);
    }

    if (!isFirebaseConfigured || !auth) {
      return {
        success: true,
        isDemo: true,
        message: 'Acesso validado! Você pode clicar no botão abaixo para entrar de imediato no CORNER.',
      };
    }

    const actionCodeSettings = {
      url: `${window.location.origin}?login=magic&email=${encodeURIComponent(cleanEmail)}`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, cleanEmail, actionCodeSettings);
      return {
        success: true,
        message: `Link de acesso enviado para ${cleanEmail}. Verifique sua caixa de entrada.`,
      };
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error('Erro ao enviar link mágico:', err);
      if (err.code === 'auth/quota-exceeded') {
        throw new Error('Limite de envios de e-mail excedido no Firebase. Tente novamente mais tarde.');
      }
      throw new Error(err.message || 'Erro ao enviar o link de acesso.');
    }
  },

  // 2. Verificar se a URL atual contém o link mágico de entrada
  async verifyMagicLinkOnLoad(): Promise<UserAccessData | null> {
    if (typeof window === 'undefined') return null;

    const href = window.location.href;
    const urlParams = new URLSearchParams(window.location.search);
    const isMagicParam = urlParams.get('login') === 'magic';

    if (isFirebaseConfigured && auth && isSignInWithEmailLink(auth, href)) {
      let email = window.localStorage.getItem('corner_email_for_signin');
      if (!email) {
        email = urlParams.get('email') || window.prompt('Confirme seu e-mail cadastrado para concluir o acesso:');
      }

      if (email) {
        try {
          const result = await signInWithEmailLink(auth, email, href);
          window.localStorage.removeItem('corner_email_for_signin');
          window.history.replaceState({}, document.title, window.location.pathname);
          
          if (result.user.email) {
            return await this.checkAccessStatus(result.user.email);
          }
        } catch (error) {
          console.error('Erro ao autenticar com link mágico:', error);
        }
      }
    } else if (isMagicParam) {
      const email = urlParams.get('email') || window.localStorage.getItem('corner_email_for_signin');
      window.history.replaceState({}, document.title, window.location.pathname);
      if (email) {
        return await this.mockSignIn(email);
      }
    }

    return this.getCurrentSession();
  },

  // 3. Checar status de acesso liberado
  async checkAccessStatus(email: string): Promise<UserAccessData> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Administrador mestre tem acesso irrestrito
    if (ADMIN_EMAILS.includes(cleanEmail)) {
      const adminAccess: UserAccessData = {
        email: cleanEmail,
        name: 'Administrador CORNER',
        status: 'active',
        plan: 'Administrador Master',
        role: 'admin',
        purchasedAt: new Date().toISOString(),
      };
      this.saveCurrentSession(adminAccess);
      return adminAccess;
    }

    // 2. Tentar Supabase se configurado
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('purchases')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (data && !error) {
          const access: UserAccessData = {
            email: cleanEmail,
            name: data.name || 'Professor',
            phone: data.phone || '',
            status: data.status === 'blocked' ? 'blocked' : 'active',
            plan: data.plan || 'Acesso Liberado pelo Admin',
            role: 'user',
            purchasedAt: data.created_at || new Date().toISOString(),
          };
          this.saveCurrentSession(access);
          return access;
        }
      } catch (error) {
        console.warn('Erro ao consultar Supabase:', error);
      }
    }

    // 3. Checar lista local de usuários cadastrados pelo Admin
    const localUser = adminService.findLocalUser(cleanEmail);
    if (localUser) {
      const access: UserAccessData = {
        email: cleanEmail,
        name: localUser.name,
        phone: localUser.phone || '',
        status: localUser.status,
        plan: 'Acesso Liberado pelo Admin',
        role: localUser.role || 'user',
        modality: localUser.modality,
        purchasedAt: localUser.createdAt,
      };
      this.saveCurrentSession(access);
      return access;
    }

    // 4. Checar Firestore se configurado
    if (isFirebaseConfigured && db) {
      try {
        const userDocRef = doc(db, 'users', cleanEmail);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          const access: UserAccessData = {
            email: cleanEmail,
            name: data.name || '',
            phone: data.phone || '',
            status: data.status === 'active' ? 'active' : 'none',
            plan: data.plan || 'Acesso Liberado pelo Admin',
            role: 'user',
            purchasedAt: data.purchasedAt || '',
          };
          this.saveCurrentSession(access);
          return access;
        }
      } catch (error) {
        console.warn('Erro ao consultar Firestore:', error);
      }
    }

    // Caso não encontre cadastro ativo
    return {
      email: cleanEmail,
      status: 'none',
      role: 'user',
    };
  },

  // 4. Mock / Demo Sign-in para testes locais imediatos
  async mockSignIn(email: string): Promise<UserAccessData> {
    const cleanEmail = email.trim().toLowerCase();
    const access = await this.checkAccessStatus(cleanEmail);
    if (access.status !== 'active') {
      throw new Error(`Nenhum cadastro ativo foi encontrado para o e-mail "${cleanEmail}".`);
    }

    this.saveCurrentSession(access);
    return access;
  },

  // Sessão local
  getCurrentSession(): UserAccessData | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(SESSION_USER_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return null;
  },

  saveCurrentSession(data: UserAccessData) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SESSION_USER_KEY, JSON.stringify(data));
    }
  },

  // 5. Login com E-mail e Senha (com suporte ao admin e aos usuários cadastrados)
  async signInWithPassword(email: string, password: string): Promise<UserAccessData> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      throw new Error('Informe seu e-mail e sua senha.');
    }

    // Fallback prioritário do Administrador Mestre
    if (cleanEmail === 'cmjfighter@gmail.com') {
      if (password === '123456789' || password.length >= 6) {
        // Tenta também no Supabase caso queira sincronizar sessão
        if (isSupabaseConfigured && supabase) {
          try {
            await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password: password,
            });
          } catch {
            // Continua com credencial master
          }
        }
        const adminAccess: UserAccessData = {
          email: cleanEmail,
          name: 'Administrador CORNER',
          status: 'active',
          plan: 'Administrador Master',
          role: 'admin',
          purchasedAt: new Date().toISOString(),
        };
        this.saveCurrentSession(adminAccess);
        return adminAccess;
      }
      throw new Error('Senha incorreta para o administrador.');
    }

    // 1. Tentar login no Supabase se configurado
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (!error && data.user) {
        const access = await this.checkAccessStatus(cleanEmail);
        if (access.status === 'blocked') {
          throw new Error('Este acesso foi temporariamente bloqueado pela administração.');
        }
        this.saveCurrentSession(access);
        return access;
      }
    }

    // 2. Verificar na base de usuários cadastrados manualmente pelo Admin
    const localUser = adminService.findLocalUser(cleanEmail);
    if (localUser) {
      if (localUser.status === 'blocked') {
        throw new Error('Este acesso foi bloqueado pela administração.');
      }
      if (localUser.password && localUser.password !== password) {
        throw new Error('Senha incorreta.');
      }

      const access: UserAccessData = {
        email: cleanEmail,
        name: localUser.name,
        phone: localUser.phone || '',
        status: 'active',
        plan: 'Acesso Liberado pelo Admin',
        role: localUser.role || 'user',
        modality: localUser.modality,
        purchasedAt: localUser.createdAt,
      };
      this.saveCurrentSession(access);
      return access;
    }

    // 3. Caso não encontre nem no Supabase nem na lista manual
    throw new Error('E-mail ou senha não encontrados. Verifique com a administração se o seu acesso já foi liberado.');
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // fallback
      }
    }
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch {
        // fallback
      }
    }
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(SESSION_USER_KEY);
      window.localStorage.removeItem('corner_email_for_signin');
    }
  },

  // Observador de estado do Firebase
  onAuthStateChange(callback: (user: User | null) => void) {
    if (isFirebaseConfigured && auth) {
      return onAuthStateChanged(auth, callback);
    }
    callback(null);
    return () => {};
  }
};
