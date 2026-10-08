import { 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink, 
  signOut,
  onAuthStateChanged,
  type User 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebaseConfig';
import { supabase, isSupabaseConfigured } from './supabaseConfig';

export interface UserAccessData {
  email: string;
  name?: string;
  phone?: string;
  status: 'active' | 'refunded' | 'pending' | 'none';
  plan?: string;
  caktoOrderId?: string;
  purchasedAt?: string;
}

const LOCAL_PURCHASES_KEY = 'corner_local_cakto_purchases';
const SESSION_USER_KEY = 'corner_current_auth_user';

export const authService = {
  // 1. Enviar Link Mágico para o E-mail da Cakto
  async sendMagicLink(email: string): Promise<{ success: boolean; message: string; isDemo?: boolean }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Por favor, informe um e-mail válido.');
    }

    // 1. VERIFICAÇÃO RIGOROSA: O e-mail DEVE ter uma compra ativa confirmada na Cakto (via Firestore ou webhook)
    const access = await this.checkAccessStatus(cleanEmail);
    if (access.status !== 'active') {
      throw new Error(
        `Nenhuma compra aprovada foi encontrada na Cakto para o e-mail "${cleanEmail}". ` +
        `Confirme se digitou o mesmo e-mail do pagamento ou adquira o acesso para liberar o CORNER.`
      );
    }

    // Salva o e-mail localmente para usar na confirmação do link
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('corner_email_for_signin', cleanEmail);
    }

    if (!isFirebaseConfigured || !auth) {
      // Modo Demo/Simulação caso o Firebase ainda não tenha sido preenchido
      return {
        success: true,
        isDemo: true,
        message: 'Compra confirmada! O Firebase em nuvem ainda não está configurado com chaves, então você pode clicar no botão abaixo para entrar de imediato.',
      };
    }

    const actionCodeSettings = {
      // URL para redirecionar após clicar no link no e-mail
      url: `${window.location.origin}?login=magic&email=${encodeURIComponent(cleanEmail)}`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, cleanEmail, actionCodeSettings);
      return {
        success: true,
        message: `Compra confirmada na Cakto! Enviamos o link mágico para ${cleanEmail}. Clique no link do e-mail para acessar.`,
      };
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error('Erro ao enviar link mágico:', err);
      if (err.code === 'auth/quota-exceeded') {
        throw new Error('Limite de envios de e-mail excedido no Firebase. Tente novamente mais tarde.');
      }
      throw new Error(err.message || 'Erro ao enviar o link de acesso. Verifique suas configurações de autenticação no Firebase.');
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
        email = urlParams.get('email') || window.prompt('Confirme seu e-mail da compra na Cakto para concluir o acesso:');
      }

      if (email) {
        try {
          const result = await signInWithEmailLink(auth, email, href);
          window.localStorage.removeItem('corner_email_for_signin');
          // Limpa URL params para ficar limpo
          window.history.replaceState({}, document.title, window.location.pathname);
          
          if (result.user.email) {
            return await this.checkAccessStatus(result.user.email);
          }
        } catch (error) {
          console.error('Erro ao autenticar com link mágico:', error);
        }
      }
    } else if (isMagicParam) {
      // Fallback para modo demo
      const email = urlParams.get('email') || window.localStorage.getItem('corner_email_for_signin');
      window.history.replaceState({}, document.title, window.location.pathname);
      if (email) {
        return await this.mockSignIn(email);
      }
    }

    return this.getCurrentSession();
  },

  // 3. Checar status de acesso liberado na Cakto (via Firestore ou Local)
  async checkAccessStatus(email: string): Promise<UserAccessData> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Tentar Supabase se configurado
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
            name: data.name || '',
            phone: data.phone || '',
            status: data.status === 'active' || data.status === 'paid' ? 'active' : (data.status || 'none'),
            plan: data.plan || 'Acesso Vitalício CORNER',
            caktoOrderId: data.cakto_order_id || data.caktoOrderId || '',
            purchasedAt: data.created_at || data.purchasedAt || '',
          };
          this.saveCurrentSession(access);
          return access;
        }
      } catch (error) {
        console.warn('Erro ao consultar Supabase:', error);
      }
    }

    // 2. Tentar Firestore se configurado
    if (isFirebaseConfigured && db) {
      try {
        const userDocRef = doc(db, 'users', cleanEmail);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          const access: UserAccessData = {
            email: cleanEmail,
            name: data.name || data.customerName || '',
            phone: data.phone || '',
            status: data.status === 'active' ? 'active' : (data.status || 'none'),
            plan: data.plan || 'Acesso Vitalício CORNER',
            caktoOrderId: data.caktoOrderId || data.orderId || '',
            purchasedAt: data.purchasedAt || data.updatedAt || '',
          };
          this.saveCurrentSession(access);
          return access;
        }

        // Tentar buscar na coleção purchases
        const purchaseDocRef = doc(db, 'purchases', cleanEmail);
        const purchaseSnap = await getDoc(purchaseDocRef);
        if (purchaseSnap.exists()) {
          const data = purchaseSnap.data();
          const access: UserAccessData = {
            email: cleanEmail,
            name: data.customerName || data.name || '',
            phone: data.phone || '',
            status: data.status === 'active' || data.status === 'paid' ? 'active' : 'none',
            plan: data.plan || 'CORNER',
            caktoOrderId: data.orderId || '',
          };
          this.saveCurrentSession(access);
          return access;
        }
      } catch (error) {
        console.warn('Erro ao consultar Firestore:', error);
      }
    }

    // 2. Checar armazenamento local de compras da Cakto (simulador / local test)
    const localPurchases = this.getLocalPurchases();
    const found = localPurchases[cleanEmail];
    if (found) {
      this.saveCurrentSession(found);
      return found;
    }

    // Caso não encontre compra registrada
    return {
      email: cleanEmail,
      status: 'none',
    };
  },

  // 4. Mock / Demo Sign-in para testes locais imediatos
  async mockSignIn(email: string): Promise<UserAccessData> {
    const cleanEmail = email.trim().toLowerCase();
    
    // VERIFICAÇÃO: O acesso SÓ é liberado se já houver compra confirmada na Cakto
    const access = await this.checkAccessStatus(cleanEmail);
    if (access.status !== 'active') {
      throw new Error(
        `Nenhuma compra aprovada foi encontrada para o e-mail "${cleanEmail}". ` +
        `Para testar a liberação, simule uma compra aprovada na aba "Webhook Cakto".`
      );
    }

    this.saveCurrentSession(access);
    return access;
  },

  // 5. Registrar/Atualizar compra vinda da Cakto (usado pelo Webhook ou Simulador)
  async recordCaktoPurchase(data: {
    email: string;
    name?: string;
    phone?: string;
    status: 'active' | 'refunded' | 'pending';
    plan?: string;
    caktoOrderId?: string;
  }): Promise<UserAccessData> {
    const cleanEmail = data.email.trim().toLowerCase();
    const record: UserAccessData = {
      email: cleanEmail,
      name: data.name || 'Professor de Luta',
      phone: data.phone || '',
      status: data.status,
      plan: data.plan || 'Acesso Vitalício CORNER',
      caktoOrderId: data.caktoOrderId || `ORD-${Date.now().toString().slice(-6)}`,
      purchasedAt: new Date().toISOString(),
    };

    // 1. Salvar no Supabase se configurado
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('purchases')
          .upsert({
            email: cleanEmail,
            name: record.name,
            phone: record.phone,
            status: record.status,
            plan: record.plan,
            cakto_order_id: record.caktoOrderId,
            created_at: new Date().toISOString(),
          }, { onConflict: 'email' });
      } catch (err) {
        console.error('Erro ao gravar compra no Supabase:', err);
      }
    }

    // 2. Salvar no Firestore se configurado
    if (isFirebaseConfigured && db) {
      try {
        const userRef = doc(db, 'users', cleanEmail);
        await setDoc(userRef, {
          email: cleanEmail,
          name: record.name,
          phone: record.phone,
          status: record.status,
          plan: record.plan,
          caktoOrderId: record.caktoOrderId,
          updatedAt: serverTimestamp(),
          source: 'cakto_webhook',
        }, { merge: true });
      } catch (err) {
        console.error('Erro ao gravar compra no Firestore:', err);
      }
    }

    // 2. Sempre salvar no LocalStorage para testes e fallback offline
    const local = this.getLocalPurchases();
    local[cleanEmail] = record;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCAL_PURCHASES_KEY, JSON.stringify(local));
    }

    return record;
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

  getLocalPurchases(): Record<string, UserAccessData> {
    if (typeof window === 'undefined') return {};
    try {
      const raw = window.localStorage.getItem(LOCAL_PURCHASES_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return {};
  },

  async logout(): Promise<void> {
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
