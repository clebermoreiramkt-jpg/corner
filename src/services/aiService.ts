import type { AiGeneratedStory } from '../types';
import { recommendationService } from './recommendationService';

export interface GenerateStoryInput {
  description: string;
  modality?: string;
  gymName?: string;
  apiKey?: string;
}

export const aiService = {
  /**
   * Generates a tailor-made story breakdown for any situation.
   * If a Gemini API key is provided, it calls the Gemini API;
   * otherwise, it uses our built-in tactical combat prompt engine.
   */
  async generateStory(input: GenerateStoryInput): Promise<AiGeneratedStory> {
    const { description, modality = 'Muay Thai / Artes Marciais', gymName = 'Academia' } = input;
    const recResult = recommendationService.analyzeSituation(description);
    const topTemplate = recResult.recommendedTemplates[0]?.template;

    // Check if an API key is available in environment or localStorage
    const key = input.apiKey || (typeof window !== 'undefined' ? localStorage.getItem('corner_gemini_key') : '') || import.meta.env.VITE_GEMINI_API_KEY;

    if (key) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Você é o CORNER, assistente de conteúdo direto, sem enrolação e sem jargões corporativos para professores de luta e academias de combate.
                Modalidade: ${modality}. Academia: ${gymName}.
                Situação do professor: "${description}".
                Linguagem: informal brasileira, direta, usando "tu".
                Retorne estritamente um JSON no formato:
                {
                  "hook": "frase de impacto inicial de 1 linha",
                  "roteiro": "roteiro direto de 2-3 frases para falar ou legendar",
                  "sugestaoVisual": "o que filmar na academia (ex: close na manopla, panning no tatame)",
                  "cta": "chamada de ação curta para direct ou bio",
                  "format": "falando para câmera",
                  "duration": "15 segundos"
                }`
              }]
            }],
            generationConfig: {
              responseMimeType: 'application/json',
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const parsed = JSON.parse(data.candidates[0].content.parts[0].text);
          return {
            situation: description,
            hook: parsed.hook,
            roteiro: parsed.roteiro,
            sugestaoVisual: parsed.sugestaoVisual,
            cta: parsed.cta,
            baseTemplateId: topTemplate?.id,
            tags: recResult.detectedTags,
            format: (parsed.format as any) || topTemplate?.format || 'falando para câmera',
            duration: (parsed.duration as any) || topTemplate?.duration || '15 segundos',
          };
        }
      } catch (err) {
        console.warn('Fallback to local intelligent engine:', err);
      }
    }

    // High quality tactical fallback simulation engine
    return this.generateTacticalStoryLocal(description, modality, topTemplate);
  },

  generateTacticalStoryLocal(
    description: string,
    modality: string,
    topTemplate?: any
  ): AiGeneratedStory {
    const descLower = description.toLowerCase();

    let hook = 'Tu não precisa de motivação todo dia. Tu só precisa não negociar com a preguiça.';
    let roteiro = `Hoje aqui no tatame de ${modality}: ${description}. Enquanto muita gente arruma desculpa, quem quer resultado vem e faz o que precisa ser feito.`;
    let sugestaoVisual = 'Filme os alunos suados batendo palma ou as luvas no tatame logo após o último gongo.';
    let cta = 'Quer sentir essa energia no teu dia? Me chama no direct pra agendar tua aula teste.';

    if (descLower.includes('alun') && (descLower.includes('novo') || descLower.includes('primeir') || descLower.includes('começou'))) {
      hook = 'O round mais difícil da luta é vencer a vergonha de pisar no tatame pela primeira vez.';
      roteiro = `Olha quem encarou o primeiro treino de ${modality} hoje. Começou com receio, mas fechou o treino com um sorriso de orelha a orelha. Ninguém nasce lutador: a confiança se constrói a cada round.`;
      sugestaoVisual = 'Selfie rápida batendo luva com o aluno novo sorrindo no final da aula.';
      cta = 'Tu também tá criando coragem? Manda "INICIANTE" no direct que eu te explico tudo.';
    } else if (descLower.includes('evolu') || descLower.includes('conseguiu') || descLower.includes('acertou')) {
      hook = 'Parece sorte ou talento pra quem vê de fora. Mas é pura repetição com método.';
      roteiro = `Hoje rolou isso aqui no tatame: ${description}. Há poucas semanas essa técnica parecia impossível pro aluno. Consistência vence qualquer pressa no ${modality}.`;
      sugestaoVisual = 'Vídeo curto de 10s mostrando a técnica sendo executada com fluidez na manopla ou tatame.';
      cta = 'Quer destravar tua evolução também? Link na bio com horários abertos.';
    } else if (descLower.includes('cansad') || descLower.includes('chuva') || descLower.includes('quase não')) {
      hook = 'Vir treinar motivado é fácil. O segredo tá em aparecer no dia em que nada colabora.';
      roteiro = `Hoje foi exatamente isso: ${description}. O cansaço tentou falar mais alto, mas o compromisso com a própria saúde venceu. Esse é o espírito da nossa academia.`;
      sugestaoVisual = 'Texto em caixa alta em cima de um vídeo dinâmico do treino acontecendo forte.';
      cta = 'Quem veio hoje já venceu o dia. Quem faltou, amanhã o tatame tá te esperando.';
    }

    return {
      situation: description,
      hook,
      roteiro,
      sugestaoVisual,
      cta,
      baseTemplateId: topTemplate?.id,
      tags: topTemplate?.tags || ['disciplina', 'evolução', 'tatame'],
      format: topTemplate?.format || 'falando para câmera',
      duration: topTemplate?.duration || '15 segundos',
    };
  },
};
