# Arquitetura — Johnson English

## Visão Geral

Johnson English é uma aplicação web de página única (SPA) hospedada no GitHub Pages.
Construída com HTML5 puro, CSS3 e ES Modules — sem ferramentas de build,
sem frameworks, sem transpilação.

Um componente de servidor separado (Coqui TTS) executa localmente e fornece síntese
de voz via HTTP. O frontend opera completamente sem ele; a Web Speech API nativa do
navegador entra como fallback automático.

---

## Estrutura de Diretórios

```
johnson-english/
│
├── index.html                  Ponto de entrada. Shell da aplicação.
│
├── css/
│   ├── base.css                Tokens de design, reset, tipografia
│   ├── layout.css              Cabeçalho, grid, componentes, botões
│   └── mobile.css              Overrides responsivos (mobile-first)
│
├── js/
│   ├── app.js                  Bootstrap: ordem de init, eventos globais
│   ├── router.js               Roteador SPA baseado em hash
│   ├── state.js                Carregamento de dados, rastreamento de progresso
│   ├── lesson-engine.js        Hidratação pós-renderização das lições normais
│   ├── audio-engine.js         TTS, Web Speech API, cache, throttle
│   ├── shadowing-engine.js     Controlador do modo shadowing
│   │
│   ├── components/
│   │   ├── home-view.js
│   │   ├── levels-view.js
│   │   ├── module-view.js
│   │   ├── lesson-view.js             Renderizador de lições normais
│   │   ├── pronunciation-lesson-view.js  Renderizador de lições de pronúncia
│   │   ├── about-view.js
│   │   ├── not-found-view.js
│   │   └── feedback-engine.js         Helper de UI para feedback de exercícios
│   │
│   └── modules/
│       ├── grammar/
│       │   └── grammar-engine.js      Etapa de Gramática (Escuta + Repetição)
│       ├── logic/
│       │   └── logic-engine.js        Etapa de Lógica (Prática)
│       ├── rhetoric/
│       │   └── rhetoric-engine.js     Etapa de Retórica (Produção)
│       └── pronunciation/
│           └── pronunciation-engine.js  Lições de pronúncia (type: "pronunciation")
│
├── data/
│   ├── levels.json             Definições de nível CEFR (A1, A2, B1)
│   ├── modules.json            27 módulos (m01–m27)
│   └── lessons.json            101 lições com conteúdo completo
│
├── tests/
│   ├── test-runner.js          Orquestrador de testes (Node.js, zero deps)
│   ├── content-tests.js        Integridade do currículo A1
│   ├── content-tests-a2.js     Integridade do currículo A2 (689 asserções)
│   └── audio-tests.js          Testes do motor de áudio
│
├── server/
│   └── coqui-tts-service/
│       ├── README.md
│       └── wrapper.py          Wrapper Flask TTS com rate limiting
│
└── docs/
    ├── architecture.md         Este arquivo
    ├── pedagogy.md
    ├── audio-system.md
    └── development-guide.md
```

---

## Responsabilidade Única por Módulo

| Arquivo | Responsabilidade |
|---|---|
| `app.js` | Bootstrap e fiação de eventos globais |
| `router.js` | Mapeamento URL → view + despacho de engine por tipo de lição |
| `state.js` | Carregamento de dados JSON e persistência de progresso |
| `lesson-engine.js` | Hidratação pós-renderização das lições normais (type ausente) |
| `audio-engine.js` | TTS server, Web Speech API, cache, throttle, delegação de áudio |
| `shadowing-engine.js` | Ciclo de vida da atividade de shadowing |
| `lesson-view.js` | Renderização HTML de lições normais |
| `pronunciation-lesson-view.js` | Renderização HTML de lições de pronúncia |
| `pronunciation-engine.js` | Hidratação das lições de pronúncia |
| `grammar-engine.js` | Interação da etapa de Gramática |
| `logic-engine.js` | Interação da etapa de Lógica (exercícios) |
| `rhetoric-engine.js` | Interação da etapa de Retórica (produção) |
| `feedback-engine.js` | Mensagens de feedback de exercícios |

---

## Fluxo de Dados — Lição Normal

```
Mudança de Hash URL
    │
    ▼
router.js (parseHash)
    │
    ├── state.js (getLessonAsync)
    │       └── data/lessons.json (fetch na primeira acesso, cached em memória)
    │
    ├── lesson-view.js (retorna string HTML)
    │
    ▼
#app-root (innerHTML = html)
    │
    ▼
lesson-engine.js (hydrate)
    │
    ├── AudioEngine.hydrateAudioButtons()   ← delegação de cliques de áudio
    ├── grammar-engine.js (shadowing)
    ├── logic-engine.js (exercícios)
    └── rhetoric-engine.js (produção)
```

## Fluxo de Dados — Lição de Pronúncia

```
Mudança de Hash URL
    │
    ▼
router.js → state.getLessonAsync → lesson.type === 'pronunciation'
    │
    ├── pronunciation-lesson-view.js (retorna string HTML)
    │
    ▼
#app-root (innerHTML = html)
    │
    ▼
pronunciation-engine.js (hydrate)
    │
    ├── AudioEngine.hydrateAudioButtons()   ← mesmo método, compartilhado
    ├── ShadowingEngine.mount()
    ├── rhetoric-engine.js
    └── _hydrateSectionNav()
```

---

## Despacho por Tipo de Lição

O `router.js` lê `lesson.type` após carregar os dados para decidir qual engine chamar:

```javascript
if (lesson?.type === 'pronunciation') {
    PronunciationEngine.hydrate({ levelId, moduleId, lessonId, state });
} else {
    LessonEngine.hydrate({ params, state });
}
```

Tipos de lição suportados:
- `undefined` / ausente — lição normal (6 seções: Explicação, Exemplos, Escuta, Repetição, Prática, Produção)
- `"pronunciation"` — lição de pronúncia (5 seções: Som, Palavras, Pares, Repetição, Produção)

---

## Delegação de Áudio

`AudioEngine.hydrateAudioButtons()` é o único ponto de registro de cliques em
botões `.btn--audio[data-text]`. Chamado por ambos `LessonEngine` e
`PronunciationEngine`. Remove o listener anterior antes de registrar o novo,
garantindo que o contexto de `levelId/moduleId/lessonId` esteja sempre atualizado
ao navegar entre lições sem recarregar a página.

```javascript
// Padrão correto — em qualquer engine que precise de áudio:
AudioEngine.hydrateAudioButtons({ levelId, moduleId, lessonId, state });
```

---

## Roteamento

| Hash | View |
|---|---|
| `#/` ou `#/home` | Início |
| `#/levels` | Lista de níveis |
| `#/level/a1` | Módulos do A1 |
| `#/module/a1/m01` | Lições do A1/M01 |
| `#/lesson/a1/m01/l01` | Lição A1/M01/L01 |
| `#/about` | Sobre |

Roteamento por hash é utilizado em vez da History API porque o GitHub Pages
não suporta redirecionamento server-side sem configuração adicional.

---

## Currículo em Dados

### Estrutura de lição normal (`lessons.json`)

```json
{
  "id": "l01",
  "levelId": "a1",
  "moduleId": "m01",
  "order": 1,
  "title": "Hello and Goodbye",
  "description": "Cumprimentos básicos.",
  "explanation": { "text": "...", "note": "...", "tip": "..." },
  "examples":   [{ "en": "...", "pt": "..." }],
  "listening":  [{ "text": "...", "translation": "..." }],
  "repetition": [{ "text": "...", "translation": "..." }],
  "practice": [
    { "type": "multiple-choice", "prompt": "...", "options": ["..."], "answer": "..." },
    { "type": "fill-blank",      "prompt": "... [BLANK] ...", "answer": "..." },
    { "type": "reorder",         "prompt": "...", "words": ["..."], "answer": "..." }
  ],
  "production": [{ "prompt": "...", "hint": "..." }]
}
```

### Estrutura de lição de pronúncia

```json
{
  "id": "l01",
  "levelId": "a1",
  "moduleId": "m06",
  "type": "pronunciation",
  "order": 1,
  "title": "The TH Sound",
  "description": "...",
  "explanation": { "text": "...", "note": "...", "tip": "..." },
  "sounds": [{
    "symbol": "/θ/", "name": "TH surdo", "description": "...",
    "mouth_tip": "...", "color": "grammar",
    "words": [{ "en": "...", "pt": "..." }]
  }],
  "minimal_pairs": [{ "a": "...", "b": "...", "note": "..." }],
  "repetition":    [{ "text": "...", "translation": "..." }],
  "production":    [{ "prompt": "...", "hint": "..." }]
}
```

---

## Segurança

- **XSS**: todo texto proveniente de JSON é escapado via `_escape()` antes de
  inserção como `innerHTML`. Sem uso de `textContent` puro apenas onde formatação é necessária.
- **TTS**: texto sanitizado via regex `[^\w\s.,!?'"();:\-]` + limite de 500 chars
  antes de enviar ao servidor ou à Web Speech API.
- **CSP**: definida via `<meta>` em `index.html`. Scripts restritos a `'self'`.
  `'unsafe-inline'` permitido apenas para estilos (necessário para atributos `style` gerados).
- **Rate limiting**: throttle de 500ms no cliente + 30 req/60s no servidor Flask.

---

## Decisão de Design: Dados de Shadowing em `<div hidden>`

Os dados do shadowing (JSON de frases) são embutidos como `textContent` de uma
`<div hidden>` em vez de `<script type="application/json">`.

Motivo: o Firefox trata qualquer tag `<script>` como potencialmente executável
sob a diretiva CSP `script-src-elem 'self'`, bloqueando-a independentemente do
atributo `type`. A `<div hidden>` não tem semântica de script e não é bloqueada.

---

## Variáveis CSS

Todos os valores de cor, espaçamento e tipografia usam CSS custom properties
definidas em `:root` dentro de `base.css`. Nenhum valor hardcoded fora dessa seção.

Tokens de cor por contexto pedagógico:
- `--color-grammar` — etapa de Gramática (azul escuro)
- `--color-logic` — etapa de Lógica (verde oliva)
- `--color-rhetoric` — etapa de Retórica (terracota)
- `--color-pronunciation` — lições de pronúncia (roxo)
