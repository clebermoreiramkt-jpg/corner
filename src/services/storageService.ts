import type { UserProfile, PostedStoryRecord } from '../types';

const STORAGE_KEYS = {
  FAVORITES: 'corner_favorites',
  POSTED_HISTORY: 'corner_posted_history',
  USER_PROFILE: 'corner_user_profile',
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Professor',
  gymName: 'Academia Corner',
  modality: 'Muay Thai',
  goal: 'Lotar turmas',
  streakDays: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
};

export const storageService = {
  // --- FAVORITES ---
  getFavorites(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : ['tpl-01', 'tpl-12', 'tpl-21', 'tpl-71'];
    } catch {
      return ['tpl-01', 'tpl-12', 'tpl-21', 'tpl-71'];
    }
  },

  toggleFavorite(templateId: string): boolean {
    const favs = this.getFavorites();
    const index = favs.indexOf(templateId);
    let isNowFavorite = false;
    if (index >= 0) {
      favs.splice(index, 1);
      isNowFavorite = false;
    } else {
      favs.push(templateId);
      isNowFavorite = true;
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
    return isNowFavorite;
  },

  isFavorite(templateId: string): boolean {
    return this.getFavorites().includes(templateId);
  },

  // --- POSTED STORIES HISTORY ---
  getHistory(): PostedStoryRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.POSTED_HISTORY);
      if (data) {
        return JSON.parse(data);
      }
      // Seed realistic initial history so user sees it in action immediately
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      const initial: PostedStoryRecord[] = [
        {
          id: 'hist-1',
          templateId: 'tpl-21',
          templateName: 'PROVA',
          postedAt: yesterday.toISOString(),
          customText: 'Evolução da aluna que começou sem conseguir 1 round.',
        },
        {
          id: 'hist-2',
          templateId: 'tpl-41',
          templateName: 'CURIOSO',
          postedAt: twoDaysAgo.toISOString(),
          customText: 'Tu sabia que 1h de boxe queima até 800 calorias?',
        },
        {
          id: 'hist-3',
          templateId: 'tpl-71',
          templateName: 'AGENDA ABERTA',
          postedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          customText: '3 horários abertos para novos alunos.',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.POSTED_HISTORY, JSON.stringify(initial));
      return initial;
    } catch {
      return [];
    }
  },

  markAsPosted(templateId: string, templateName: string, customText?: string): PostedStoryRecord {
    const history = this.getHistory();
    const newRecord: PostedStoryRecord = {
      id: `hist-${Date.now()}`,
      templateId,
      templateName,
      postedAt: new Date().toISOString(),
      customText,
    };
    const updated = [newRecord, ...history];
    localStorage.setItem(STORAGE_KEYS.POSTED_HISTORY, JSON.stringify(updated));

    // Update streak
    this.incrementStreak();

    return newRecord;
  },

  getTemplateLastUsed(templateId: string): { used: boolean; daysAgo: number; date: Date | null } {
    const history = this.getHistory();
    const record = history.find((h) => h.templateId === templateId);
    if (!record) {
      return { used: false, daysAgo: 999, date: null };
    }
    const recordDate = new Date(record.postedAt);
    const diffMs = Date.now() - recordDate.getTime();
    const daysAgo = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return { used: true, daysAgo, date: recordDate };
  },

  // --- USER PROFILE & STREAK ---
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? { ...DEFAULT_PROFILE, ...JSON.parse(data) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: Partial<UserProfile>): UserProfile {
    const current = this.getProfile();
    const updated = { ...current, ...profile };
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updated));
    return updated;
  },

  incrementStreak() {
    const profile = this.getProfile();
    const today = new Date().toISOString().split('T')[0];
    if (profile.lastActiveDate !== today) {
      profile.streakDays = (profile.streakDays || 0) + 1;
      profile.lastActiveDate = today;
      this.saveProfile(profile);
    }
  },
};
