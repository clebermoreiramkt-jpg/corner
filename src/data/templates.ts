import type { Template } from '../types';
import { templatesPart1 } from './templatesPart1';
import { templatesPart2 } from './templatesPart2';
import { templatesPart3 } from './templatesPart3';
import { templatesPart4 } from './templatesPart4';

export const allTemplates: Template[] = [
  ...templatesPart1,
  ...templatesPart2,
  ...templatesPart3,
  ...templatesPart4,
];

// Map by ID for O(1) lookup
export const templatesByIdMap = new Map<string, Template>(
  allTemplates.map((t) => [t.id, t])
);

// Map by Number (e.g. "01", "16", "99")
export const templatesByNumberMap = new Map<string, Template>(
  allTemplates.map((t) => [t.numero, t])
);

export function getTemplateById(id: string): Template | undefined {
  return templatesByIdMap.get(id);
}

export function getTemplateByNumber(numero: string): Template | undefined {
  const padded = numero.padStart(2, '0');
  return templatesByNumberMap.get(padded);
}

export function getTemplatesByCategory(categorySlug: string): Template[] {
  return allTemplates.filter((t) => t.categoriaSlug === categorySlug);
}
