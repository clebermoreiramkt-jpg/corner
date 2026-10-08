import type { ComboSequence } from '../types';

export const presetCombos: ComboSequence[] = [
  {
    id: 'combo-aluno-comecou',
    title: 'O Aluno Começou Hoje',
    situation: 'Chegou aluno novo para a primeira aula experimental.',
    description: 'Transforme o primeiro dia de um aluno em uma sequência emocionante de 5 rounds que gera acolhimento e novas matrículas.',
    roundStoryIds: ['tpl-12', 'tpl-13', 'tpl-09', 'tpl-59', 'tpl-71'],
    tacticalTip: 'Poste com intervalo de 1 a 2 horas entre cada Story ao longo do dia para manter a retenção alta.',
  },
  {
    id: 'combo-evolucao-destravada',
    title: 'A Sequência da Superação',
    situation: 'Um aluno conseguiu executar uma técnica difícil ou completou meta.',
    description: 'Mostre que no seu tatame todo mundo evolui com método, da pequena vitória até o convite de matrícula.',
    roundStoryIds: ['tpl-23', 'tpl-22', 'tpl-25', 'tpl-30', 'tpl-78'],
    tacticalTip: 'Mostre o antes e depois sem expor ninguém. Foque no sorriso de alívio do aluno.',
  },
  {
    id: 'combo-segunda-tatame-cheio',
    title: 'Segunda Sem Desculpas',
    situation: 'Começo de semana com energia alta e academia movimentada.',
    description: 'Uma sequência certeira de segunda-feira para puxar quem ainda está enrolando no sofá.',
    roundStoryIds: ['tpl-02', 'tpl-20', 'tpl-62', 'tpl-91', 'tpl-72'],
    tacticalTip: 'Grave o primeiro round bem cedo (6h-8h) e feche com a aula cheia da noite às 21h.',
  },
  {
    id: 'combo-desmistificando-o-medo',
    title: 'Destruindo o Medo de Começar',
    situation: 'Pessoas com vergonha ou medo de que a luta seja agressiva.',
    description: 'Quebre as maiores objeções dos seguidores receosos em 4 passos lógicos e acolhedores.',
    roundStoryIds: ['tpl-15', 'tpl-16', 'tpl-49', 'tpl-74'],
    tacticalTip: 'Use tom acolhedor e seguro. Mostre alunos comuns treinando com respeito mútuo.',
  },
  {
    id: 'combo-bastidor-autoridade',
    title: 'Método & Bastidores de Mestre',
    situation: 'Você montando a aula e cuidando de cada detalhe com amor e método.',
    description: 'Construa autoridade sólida provando que sua aula é pensada cientificamente e o ambiente é higienizado.',
    roundStoryIds: ['tpl-01', 'tpl-06', 'tpl-08', 'tpl-66', 'tpl-80'],
    tacticalTip: 'Ideal para quinta ou sexta-feira para consolidar o profissionalismo da academia.',
  },
  {
    id: 'combo-resenha-comunidade',
    title: 'A Família do Tatame',
    situation: 'Momento de alegria, resenha e amizade pós-aula.',
    description: 'Mostre que sua academia é muito mais que treino físico: é um refúgio de amizades leais.',
    roundStoryIds: ['tpl-57', 'tpl-70', 'tpl-86', 'tpl-90'],
    tacticalTip: 'Deixe a resenha fluir naturalmente sem parecer forçado. Vídeos curtos de 5 segundos.',
  },
];
