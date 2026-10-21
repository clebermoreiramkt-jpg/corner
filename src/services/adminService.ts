import { supabase, isSupabaseConfigured } from './supabaseConfig';

export interface RegisteredUser {
  email: string;
  name: string;
  password?: string;
  modality: string;
  phone?: string;
  status: 'active' | 'blocked';
  role?: 'admin' | 'user';
  createdAt: string;
}

export const ADMIN_EMAILS = ['cmjfighter@gmail.com'];

const LOCAL_REGISTERED_USERS_KEY = 'corner_admin_registered_users';

export const adminService = {
  // Verifica se o e-mail tem privilégio de administrador
  isAdmin(email?: string | null): boolean {
    if (!email) return false;
    const clean = email.trim().toLowerCase();
    return ADMIN_EMAILS.includes(clean);
  },

  // Lista todos os usuários registrados
  async listUsers(): Promise<RegisteredUser[]> {
    const localUsers = this.getLocalUsers();

    // Garante que o admin mestre sempre exista na listagem
    if (!localUsers.some(u => u.email === 'cmjfighter@gmail.com')) {
      localUsers.unshift({
        email: 'cmjfighter@gmail.com',
        name: 'Administrador CORNER',
        password: '••••••••',
        modality: 'Geral',
        status: 'active',
        role: 'admin',
        createdAt: new Date().toISOString(),
      });
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('purchases')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && !error) {
          const map = new Map<string, RegisteredUser>();
          localUsers.forEach(u => map.set(u.email, u));

          data.forEach((row: any) => {
            const email = (row.email || '').trim().toLowerCase();
            if (!email) return;

            const existing = map.get(email);
            map.set(email, {
              email,
              name: row.name || existing?.name || 'Professor',
              password: existing?.password || '••••••••',
              modality: existing?.modality || 'Geral',
              phone: row.phone || existing?.phone || '',
              status: row.status === 'blocked' ? 'blocked' : 'active',
              role: ADMIN_EMAILS.includes(email) ? 'admin' : (existing?.role || 'user'),
              createdAt: row.created_at || existing?.createdAt || new Date().toISOString(),
            });
          });

          return Array.from(map.values());
        }
      } catch (err) {
        console.warn('Erro ao listar usuários do Supabase:', err);
      }
    }

    return localUsers;
  },

  // Cadastro manual de novo usuário pelo Admin
  async registerUser(userData: {
    name: string;
    email: string;
    password?: string;
    modality?: string;
    phone?: string;
  }): Promise<RegisteredUser> {
    const cleanEmail = userData.email.trim().toLowerCase();
    const cleanName = userData.name.trim();
    const cleanPassword = userData.password?.trim() || '123456789';
    const cleanModality = userData.modality?.trim() || 'Muay Thai';
    const cleanPhone = userData.phone?.trim() || '';

    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Informe um e-mail válido.');
    }
    if (!cleanName) {
      throw new Error('Informe o nome do professor ou academia.');
    }

    const newUser: RegisteredUser = {
      email: cleanEmail,
      name: cleanName,
      password: cleanPassword,
      modality: cleanModality,
      phone: cleanPhone,
      status: 'active',
      role: ADMIN_EMAILS.includes(cleanEmail) ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
    };

    // 1. Cadastra no Supabase (Auth + Tabela purchases)
    if (isSupabaseConfigured && supabase) {
      try {
        // Tenta criar login de Auth no Supabase
        await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              name: cleanName,
              modality: cleanModality,
              registered_by: 'admin_manual',
            },
          },
        });
      } catch (signUpErr) {
        console.warn('Supabase Auth signUp aviso:', signUpErr);
      }

      try {
        // Registra acesso liberado na tabela de controle
        await supabase.from('purchases').upsert({
          email: cleanEmail,
          name: cleanName,
          phone: cleanPhone,
          status: 'active',
          plan: 'Acesso Liberado pelo Admin',
          created_at: new Date().toISOString(),
        }, { onConflict: 'email' });
      } catch (tableErr) {
        console.error('Erro ao gravar usuário na tabela do Supabase:', tableErr);
      }
    }

    // 2. Salva localmente para disponibilidade offline e acesso imediato
    const users = this.getLocalUsers();
    const filtered = users.filter(u => u.email !== cleanEmail);
    filtered.unshift(newUser);
    this.saveLocalUsers(filtered);

    return newUser;
  },

  // Ativar ou bloquear usuário
  async toggleUserStatus(email: string, status: 'active' | 'blocked'): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();

    if (ADMIN_EMAILS.includes(cleanEmail) && status === 'blocked') {
      throw new Error('Não é permitido bloquear o administrador mestre.');
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('purchases')
          .update({ status })
          .eq('email', cleanEmail);
      } catch (err) {
        console.warn('Erro ao atualizar status no Supabase:', err);
      }
    }

    const users = this.getLocalUsers();
    const target = users.find(u => u.email === cleanEmail);
    if (target) {
      target.status = status;
      this.saveLocalUsers(users);
    }
  },

  // Remover usuário
  async deleteUser(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();

    if (ADMIN_EMAILS.includes(cleanEmail)) {
      throw new Error('Não é possível excluir o administrador mestre.');
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('purchases')
          .delete()
          .eq('email', cleanEmail);
      } catch (err) {
        console.warn('Erro ao excluir do Supabase:', err);
      }
    }

    const users = this.getLocalUsers();
    const filtered = users.filter(u => u.email !== cleanEmail);
    this.saveLocalUsers(filtered);
  },

  // Gera texto de boas-vindas com credenciais para enviar no WhatsApp
  generateWelcomeMessage(user: RegisteredUser, appUrl: string): string {
    return `🥋 *SEU ACESSO AO CORNER ESTÁ LIBERADO!*

Olá, *${user.name}*!
Seu acesso aos 99 Templates e Roteiros de Stories de Luta do CORNER foi liberado pela nossa equipe.

🔗 *Acesse agora:* ${appUrl}
📧 *Seu E-mail:* ${user.email}
🔑 *Sua Senha:* ${user.password || '123456789'}

Bons treinos e excelentes stories no tatame! 🥊`;
  },

  // Helpers de armazenamento local
  getLocalUsers(): RegisteredUser[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(LOCAL_REGISTERED_USERS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return [];
  },

  saveLocalUsers(users: RegisteredUser[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_REGISTERED_USERS_KEY, JSON.stringify(users));
    }
  },

  findLocalUser(email: string): RegisteredUser | undefined {
    const cleanEmail = email.trim().toLowerCase();
    return this.getLocalUsers().find(u => u.email === cleanEmail);
  }
};
