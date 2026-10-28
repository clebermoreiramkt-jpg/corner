# Meu Corner — Atlas de Conteúdo

Aplicativo web (PWA-ready) para professores e academias de luta captarem alunos sem precisar aparecer.

## Funcionalidades
- **Mapa do Ringue (`#mapa`)**: 10 regiões interativas (`A1` a `E2`), legenda visual e método de 8 etapas.
- **100 Pranchas (`#templates`)**: Filtros por região, objetivo, formato e busca textual; planos de gravação em SVG; editor da própria versão salvo no aparelho (`localStorage`).
- **20 Anúncios Prontos (`#anuncios`)**: Player interativo 9:16 (Reels/Story) com cadeia de tensão, quebra de percepção e cópia rápida.
- **Criador de Anúncios (`#criar`)**: Construtor em tempo real com validação de Hook (40 caracteres, sem pergunta na linha 1, primeira pessoa) e prévia no player 9:16.
- **Registro de Posts (`#registro`)**: Histórico automático das pranchas marcadas como usadas com contabilização de mensagens recebidas no direct.

## Como rodar localmente

```bash
cd meu-corner
npm install
npm run dev
```

## Como fazer deploy na Vercel

### Opção 1: Pelo painel da Vercel (Git)
1. Suba o repositório para o GitHub.
2. Na Vercel, clique em **Add New Project** e importe o repositório.
3. Em **Root Directory**, selecione a pasta `meu-corner`.
4. O preset **Vite** será detectado automaticamente (`npm run build` → `dist`). Clique em **Deploy**.

### Opção 2: Pela Vercel CLI
```bash
cd meu-corner
npx vercel --prod
```
