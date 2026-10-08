import type { Template, RecommendationResult } from '../types';
import { allTemplates, getTemplateById } from '../data/templates';

interface KeywordRule {
  keywords: string[];
  templateIds: string[];
  tags: string[];
}

const RULES: KeywordRule[] = [
  {
    keywords: ['alun', 'começou', 'primeir', 'nov', 'iniciante', 'estreia', 'primeiro dia'],
    templateIds: ['tpl-12', 'tpl-13', 'tpl-18', 'tpl-14', 'tpl-15', 'tpl-16', 'tpl-75'],
    tags: ['iniciante', 'aluno', 'acolhimento'],
  },
  {
    keywords: ['evolu', 'conseguiu', 'sequência', 'semanas', 'acertou', 'passou', 'raspou', 'destravou', 'vitória', 'resultado'],
    templateIds: ['tpl-21', 'tpl-22', 'tpl-23', 'tpl-25', 'tpl-30', 'tpl-78', 'tpl-89'],
    tags: ['evolução', 'prova', 'conquista', 'aluno'],
  },
  {
    keywords: ['medo', 'receio', 'apanhar', 'machucar', 'vergonha', 'tímido', 'insegur'],
    templateIds: ['tpl-14', 'tpl-15', 'tpl-13', 'tpl-94', 'tpl-95', 'tpl-74'],
    tags: ['segurança', 'medo', 'iniciante', 'acolhimento'],
  },
  {
    keywords: ['cansad', 'chuva', 'frio', 'preguiça', 'quase não veio', 'desculpa', 'trabalho', 'dia pesado'],
    templateIds: ['tpl-20', 'tpl-13', 'tpl-92', 'tpl-59', 'tpl-91', 'tpl-29'],
    tags: ['disciplina', 'compromisso', 'superação'],
  },
  {
    keywords: ['venda', 'matrícula', 'vaga', 'agenda', 'alun', 'começar', 'experimental', 'preço', 'plano'],
    templateIds: ['tpl-71', 'tpl-72', 'tpl-74', 'tpl-75', 'tpl-77', 'tpl-80'],
    tags: ['venda', 'agenda', 'vagas', 'oportunidade'],
  },
  {
    keywords: ['engraçad', 'riu', 'risad', 'caiu', 'zoeira', 'resenha', 'mancada'],
    templateIds: ['tpl-57', 'tpl-47', 'tpl-46', 'tpl-70', 'tpl-88'],
    tags: ['humor', 'comunidade', 'leveza'],
  },
  {
    keywords: ['técnic', 'golpe', 'cruzad', 'jab', 'direto', 'chute', 'guarda', 'armlock', 'passagem', 'clinch', 'detalhe'],
    templateIds: ['tpl-08', 'tpl-31', 'tpl-32', 'tpl-33', 'tpl-36', 'tpl-45'],
    tags: ['técnica', 'educação', 'autoridade', 'detalhe'],
  },
  {
    keywords: ['bastidor', 'limp', 'tatame', 'abrin', 'prepara', 'manopla', 'luva', 'saco', 'cedo'],
    templateIds: ['tpl-01', 'tpl-02', 'tpl-04', 'tpl-06', 'tpl-09', 'tpl-66', 'tpl-67'],
    tags: ['bastidores', 'preparação', 'cuidado', 'rotina'],
  },
  {
    keywords: ['acabei', 'termin', 'lotad', 'cheia', 'energia', 'suor', 'moído', 'forninho', 'noite'],
    templateIds: ['tpl-61', 'tpl-62', 'tpl-65', 'tpl-69', 'tpl-70', 'tpl-86'],
    tags: ['fim-de-treino', 'energia', 'aula-cheia', 'calor-do-momento'],
  },
  {
    keywords: ['treinei', 'meu treino', 'puxei', 'sparring', 'fôlego', 'gás', 'peso'],
    templateIds: ['tpl-53', 'tpl-05', 'tpl-26', 'tpl-48', 'tpl-51'],
    tags: ['meu-treino', 'autoridade', 'exemplo'],
  },
];

export const recommendationService = {
  analyzeSituation(situationText: string): RecommendationResult {
    const textLower = situationText.toLowerCase().trim();
    const scores = new Map<string, number>();
    const detectedTagsSet = new Set<string>();

    // Baseline score for all templates
    allTemplates.forEach((t) => scores.set(t.id, 0));

    // Rule-based boosting
    RULES.forEach((rule) => {
      const matchedKeyword = rule.keywords.some((kw) => textLower.includes(kw));
      if (matchedKeyword) {
        rule.tags.forEach((tag) => detectedTagsSet.add(tag));
        rule.templateIds.forEach((id, index) => {
          const current = scores.get(id) || 0;
          const boost = (rule.templateIds.length - index) * 5;
          scores.set(id, current + boost + 10);
        });
      }
    });

    // Content text matching
    const words = textLower.split(/\s+/).filter((w) => w.length > 2);
    allTemplates.forEach((template) => {
      let extra = 0;
      words.forEach((w) => {
        if (template.nome.toLowerCase().includes(w)) extra += 6;
        if (template.objetivo.toLowerCase().includes(w)) extra += 4;
        if (template.modelo.toLowerCase().includes(w)) extra += 3;
        if (template.tags.some((tag) => tag.toLowerCase().includes(w))) {
          extra += 5;
          detectedTagsSet.add(w);
        }
      });
      const current = scores.get(template.id) || 0;
      scores.set(template.id, current + extra);
    });

    // Sort by score descending
    const sorted = [...scores.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id, score]) => ({ template: getTemplateById(id)!, score }))
      .filter((item) => item.template !== undefined);

    let top4 = sorted.slice(0, 4);
    if (top4[0].score === 0) {
      top4 = [
        { template: getTemplateById('tpl-21')!, score: 10 },
        { template: getTemplateById('tpl-13')!, score: 8 },
        { template: getTemplateById('tpl-31')!, score: 6 },
        { template: getTemplateById('tpl-71')!, score: 4 },
      ];
    }

    const rankBadges: ('🥇' | '🥈' | '🥉' | '🔥')[] = ['🥇', '🥈', '🥉', '🔥'];

    const recommendedTemplates = top4.map((item, idx) => ({
      template: item.template,
      matchScore: item.score,
      matchReason: this.getMatchReason(item.template, idx),
      rankBadge: rankBadges[idx],
    }));

    // Build the dynamic 4-5 story combo
    const comboSequence = this.buildDynamicCombo(recommendedTemplates.map((r) => r.template));

    return {
      situationText,
      detectedTags: Array.from(detectedTagsSet),
      recommendedTemplates,
      comboSequence,
      totalStoriesEstimate: Math.max(4, comboSequence.length),
    };
  },

  getMatchReason(template: Template, rankIndex: number): string {
    const reasons = [
      `Encaixe perfeito: transforma o fato em prova social imediata (${template.nome}).`,
      `Ângulo complementar: aprofunda a técnica ou a lição de tatame (${template.nome}).`,
      `Humanização: conecta a dificuldade do aluno com empatia (${template.nome}).`,
      `Conversão: fecha a sequência abrindo oportunidade de treino (${template.nome}).`,
    ];
    return reasons[rankIndex] || `Ideia de impacto para a situação: ${template.nome}.`;
  },

  buildDynamicCombo(topTemplates: Template[]): Template[] {
    const sequence: Template[] = [];
    const usedIds = new Set<string>();

    // Step 1: The primary event
    if (topTemplates[0]) {
      sequence.push(topTemplates[0]);
      usedIds.add(topTemplates[0].id);
    }

    // Step 2: The lesson / human element
    const humanOrEdu = allTemplates.find(
      (t) =>
        (t.categoriaSlug === 'alunos' || t.categoriaSlug === 'educacao' || t.categoriaSlug === 'evolucao') &&
        !usedIds.has(t.id) &&
        (topTemplates.some((rec) => rec.id === t.id) || t.numero === '13' || t.numero === '22')
    );
    if (humanOrEdu) {
      sequence.push(humanOrEdu);
      usedIds.add(humanOrEdu.id);
    }

    // Step 3: The backstage / professor pride
    const prideOrBackstage = allTemplates.find(
      (t) =>
        (t.categoriaSlug === 'bastidores' || t.numero === '30' || t.numero === '61' || t.numero === '09') &&
        !usedIds.has(t.id)
    );
    if (prideOrBackstage) {
      sequence.push(prideOrBackstage);
      usedIds.add(prideOrBackstage.id);
    }

    // Step 4: The motivator / provocative perspective
    const motivator = allTemplates.find(
      (t) =>
        (t.categoriaSlug === 'provocativo' || t.numero === '59' || t.numero === '91' || t.numero === '20') &&
        !usedIds.has(t.id)
    );
    if (motivator) {
      sequence.push(motivator);
      usedIds.add(motivator.id);
    }

    // Step 5: The clear CTA / Open Schedule
    const ctaVenda = allTemplates.find(
      (t) =>
        t.categoriaSlug === 'venda' &&
        !usedIds.has(t.id) &&
        (t.numero === '71' || t.numero === '74' || t.numero === '80' || t.numero === '75')
    );
    if (ctaVenda) {
      sequence.push(ctaVenda);
      usedIds.add(ctaVenda.id);
    }

    return sequence;
  },
};
