export type CategorySlug = 
  | 'preparacao'
  | 'alunos'
  | 'evolucao'
  | 'educacao'
  | 'curiosidade'
  | 'humanizacao'
  | 'bastidores'
  | 'venda'
  | 'relacionamento'
  | 'provocativo';

export type TemplateFormat = 
  | 'falando para câmera'
  | 'texto sobre vídeo'
  | 'foto'
  | 'vídeo do treino'
  | 'boomerang'
  | 'selfie'
  | 'depoimento'
  | 'bastidor';

export type TemplateDuration = 
  | '5 segundos'
  | '10 segundos'
  | '15 segundos'
  | '30 segundos';

export type DifficultyLevel = 'Fácil' | 'Médio' | 'Rápido';

export interface Template {
  id: string;
  numero: string; // "01" - "99"
  nome: string;
  categoria: string; // e.g. "01 — PREPARAÇÃO"
  categoriaSlug: CategorySlug;
  objetivo: string;
  modelo: string;
  exemplos: string[];
  filming_tip: string; // "Na prática"
  cta: string[];
  tags: string[];
  difficulty: DifficultyLevel;
  format: TemplateFormat;
  duration: TemplateDuration;
  created_at: string;
}

export interface CategoryInfo {
  id: string;
  slug: CategorySlug;
  title: string;
  numero: string;
  description: string;
  iconName: string;
}

export interface SituationCard {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  defaultPrompt: string;
  recommendedTemplateIds: string[];
  comboTemplateIds: string[];
  colorTheme?: string;
}

export interface ComboSequence {
  id: string;
  title: string;
  situation: string;
  description: string;
  roundStoryIds: string[];
  tacticalTip: string;
}

export interface PostedStoryRecord {
  id: string;
  templateId: string;
  templateName: string;
  postedAt: string; // ISO date string
  customText?: string;
  notes?: string;
}

export interface UserProfile {
  name: string;
  gymName: string;
  modality: string;
  goal: string;
  streakDays: number;
  lastActiveDate: string;
  avatarUrl?: string;
}

export interface RecommendationResult {
  situationText: string;
  detectedTags: string[];
  recommendedTemplates: {
    template: Template;
    matchScore: number;
    matchReason: string;
    rankBadge: '🥇' | '🥈' | '🥉' | '🔥';
  }[];
  comboSequence: Template[];
  totalStoriesEstimate: number;
}

export interface AiGeneratedStory {
  situation: string;
  hook: string;
  roteiro: string;
  sugestaoVisual: string;
  cta: string;
  baseTemplateId?: string;
  tags: string[];
  format: TemplateFormat;
  duration: TemplateDuration;
}
