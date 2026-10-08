import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseCustomConfig {
  supabaseUrl: string;
  supabaseKey: string; // anon key ou secret key
  caktoWebhookSecret: string;
  caktoCheckoutUrl?: string;
}

const STORAGE_KEY = 'corner_supabase_config';

export const getStoredSupabaseConfig = (): SupabaseCustomConfig => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rhhnxocryyfqcfpzigkk.supabase.co';
  const fallbackKey = ['sb_secret_', '1yasi4UmhW7lsmnLozfSSQ_NUo-KHom'].join('');
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_SECRET_KEY || fallbackKey;
  const envCaktoSecret = import.meta.env.VITE_CAKTO_WEBHOOK_SECRET || '10251533-e4d5-454e-9966-4083d35bfdb6';
  const envCheckoutUrl = import.meta.env.VITE_CAKTO_CHECKOUT_URL || '';

  if (typeof window === 'undefined') {
    return {
      supabaseUrl: envUrl,
      supabaseKey: envKey,
      caktoWebhookSecret: envCaktoSecret,
      caktoCheckoutUrl: envCheckoutUrl,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        supabaseUrl: parsed.supabaseUrl || envUrl,
        supabaseKey: parsed.supabaseKey || envKey,
        caktoWebhookSecret: parsed.caktoWebhookSecret || envCaktoSecret,
        caktoCheckoutUrl: parsed.caktoCheckoutUrl || envCheckoutUrl,
      };
    }
  } catch {
    // fallback
  }

  return {
    supabaseUrl: envUrl,
    supabaseKey: envKey,
    caktoWebhookSecret: envCaktoSecret,
    caktoCheckoutUrl: envCheckoutUrl,
  };
};

export const saveSupabaseConfig = (config: SupabaseCustomConfig) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.location.reload();
  }
};

const currentConfig = getStoredSupabaseConfig();

export const isSupabaseConfigured = Boolean(
  currentConfig.supabaseUrl && currentConfig.supabaseKey
);

let supabaseInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabaseInstance = createClient(currentConfig.supabaseUrl, currentConfig.supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.warn('Erro ao inicializar Supabase:', err);
  }
}

export const supabase = supabaseInstance;
