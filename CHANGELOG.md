## C2 Expansion

### Added
- m54 Language as System C2: absolute constructions, archaic register, deixis and deictic shift, lexical density, register blending, code-switching, conceptual metaphor and extended metaphor
- m55 Language, Power and Genre C2: Critical Discourse Analysis, euphemism and doublespeak, etymology, text genre conventions (obituary/manifesto/op-ed/executive brief), rare precise vocabulary, style mimicry

## C1 Expansion

### Added
- m52 Advanced Lexis C1: idioms, three-part phrasal verbs, advanced collocations, advanced article system
- m53 Expression and Fluency C1: formal subjunctive fixed expressions, spoken fluency strategies, word formation C1, rhetorical devices


## [Unreleased]

### Removed
- Coqui TTS server integration (`server/coqui-tts-service/`). Audio system now uses Web Speech API exclusively — no server required, fully compatible with GitHub Pages.

### Changed
- `audio-engine.js` rewritten: removed server backend, probe logic, throttle, prefetch, cache and `setServerUrl`. Single backend: Web Speech API.
- `app.js`: removed backend-poll banner. Banner now only shown if Web Speech API is absent in the browser.
- `tests/audio-tests.js`: removed throttle test (server-only concept).

# Changelog — Johnson English

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.
Formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).
Versionamento segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [1.1.0] — 2026-03-06

### Corrigido
- **Rota `#/module/{levelId}/{moduleId}` exibia "Invalid lesson URL"** — o router
  mapeava a rota `module` para `LessonView` ao invés de `ModuleView`.
- **CSP bloqueava `<script type="application/json">`** — o Firefox trata qualquer
  tag `<script>` como potencialmente executável sob `script-src-elem 'self'`,
  independentemente do atributo `type`. Os dados de shadowing foram migrados para
  uma `<div hidden>` com JSON como `textContent`.
- **CSP bloqueava atributos `style="..."`** — a diretiva `style-src 'self'` foi
  expandida para `style-src 'self' 'unsafe-inline'`.

### Modificado
- **Interface completamente em português** — toda navegação, instruções, mensagens
  de feedback, rótulos de atividade e textos de apoio traduzidos para português.
- README traduzido para português.
- Toda a documentação em `docs/` traduzida para português.
- CHANGELOG traduzido para português.
- Conteúdo em inglês nas lições permanece em inglês, sempre acompanhado da
  tradução em português como andaime cognitivo.

### Adicionado
- Classes CSS dedicadas para elementos sem estilo inline: `.lesson-header`,
  `.instruction-text`, `.production-input`, `.reorder-bank`, `.reorder-answer`,
  `.reorder-actions`, `.shadowing-panel`, `.shadowing-sentence-card`,
  `.shadowing-controls`, `.shadowing-assess`, `.shadowing-assess-buttons`.

---

## [1.0.0] — 2026-03-06

### Adicionado

**Arquitetura central**
- Aplicação de página única com roteamento por hash (sem ferramentas de build)
- Arquitetura ES Module: 11 módulos JavaScript, zero dependências externas
- Sistema CSS de três arquivos: base (tokens) → layout (componentes) → mobile (overrides)

**Dados curriculares**
- `data/levels.json`: níveis A1, A2, B1 (alinhados ao CEFR)
- `data/modules.json`: 12 módulos distribuídos em três níveis
- `data/lessons.json`: 3 lições completamente autorais com atividades Trivium completas
  - A1/M01/L01 — Hello and Goodbye
  - A1/M01/L02 — My Name and Where I Am From
  - A1/M02/L01 — Morning Habits

**Sistema de atividades Trivium**
- Etapa Gramática: Explicação, Exemplos, Escuta, Repetição (Shadowing)
- Etapa Lógica: Exercícios de prática — múltipla escolha, lacuna, reorganização
- Etapa Retórica: Prompts de produção com autoavaliação escrita

**Sistema de áudio**
- `AudioEngine`: gerenciamento de requisições TTS, cache em memória, throttle, degradação graciosa
- `ShadowingEngine`: shadowing sequencial de frases com autoavaliação
- Wrapper servidor Coqui TTS: Flask, CORS, rate limiting por IP, sanitização de input

**Interface**
- Layout responsivo: duas colunas no desktop, barra de abas no tablet, coluna única no mobile
- Visual acadêmico: paleta pergaminho quente, títulos serifados, sem gamificação
- Acessível: papéis ARIA, navegação por teclado, regiões ao vivo
- Navegação breadcrumb
- Menu hamburger mobile

**Testes**
- `tests/test-runner.js`: orquestrador Node.js (zero dependências externas)
- `tests/content-tests.js`: 19 testes de integridade de JSON
- `tests/audio-tests.js`: 13 testes de lógica de áudio e roteamento

**Documentação**
- `docs/architecture.md`, `docs/pedagogy.md`, `docs/audio-system.md`, `docs/development-guide.md`
- `server/coqui-tts-service/README.md`

---

## [Não lançado]

### Planejado
- A1 completo: 4 módulos restantes com conteúdo completo de lições
- Conteúdo de lições A2 e B1
- Modo diálogo: prática de conversa turno a turno
- Integração com Web Speech API para produção falada (melhoria progressiva)
- Painel de progresso: acompanhamento visual de conclusão por nível
- Suporte offline via Service Worker

## [1.5.0] — 2026-03-07

### Added — A2 Curriculum (26 lições, 7 módulos)

**m07 — Family and Relationships**
- l01: My Family — comparativos introdução, vocabulário de família
- l02: What Does He Look Like? — descrição física, comparativos com adj. longos
- l03: What Is She Like? — personalidade, superlativos
- l04: Comparing People and Things — as…as, less…than, comparações completas

**m08 — Shopping and Money**
- l01: At the Store — compras, preços, would like, cash/card
- l02: Too and Enough — excesso e suficiência, reclamações
- l03: Countable and Uncountable — quantifiers completo (a few/a little/much/many)
- l04: How Much Does It Cost? — negociação, reembolso, garantia

**m09 — Travel and Transport**
- l01: Getting Around — meios de transporte, direções completas, bilhetes
- l02: At the Airport and Hotel — situação real: aeroporto e hotel
- l03: What Did You Do? — Past Simple completo, irregulares, narrativa
- l04: I Will Call You — Future Will: espontâneo, promessa, previsão

**m10 — Health and the Body**
- l01: The Human Body — partes do corpo, -ache compounds
- l02: I Don't Feel Well — sintomas, doenças, should para conselhos
- l03: You Must Rest — must/have to/mustn't/don't have to
- l04: At the Doctor's — consulta médica completa, prescrição, alergias

**m11 — Work and Technology**
- l01: What Are You Doing? — Present Continuous estrutura completa
- l02: Simple vs Continuous — contraste com palavras-chave
- l03: At the Office — vocabulário de trabalho, tecnologia, e-mail
- l04: I Love Swimming — gerúndio após verbos (enjoy, love, can't stand…)

**m12 — Hobbies and Free Time**
- l01: How Often Do You…? — advérbios de frequência, posição, how often
- l02: Let's Do Something! — sugestões, convites, concordar/discordar
- l03: Tell Me About Your Weekend — narração, because, conectivos, emoções
- l04: My Hobbies and Interests — hobbies completo com todas as estruturas

**m13 — Pronunciation A2**
- l01: Question Intonation and Vowel Reduction — schwa /ə/, entonação ↑↓
- l02: Linking Words and Natural Rhythm — C→V linking, contrações na fala

### Stats
- 49 lições totais (23 A1 + 26 A2)
- 13 módulos totais (6 A1 + 7 A2)
- 689 testes de integridade A2 passando
- 57 testes do test-runner geral passando
