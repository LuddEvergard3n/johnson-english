# Guia de Desenvolvimento — Johnson English

## Pré-requisitos

- Editor de texto (VS Code recomendado)
- Servidor HTTP local (necessário para ES Modules — `file://` não funciona)
- Node.js 18+ (para executar os testes)

---

## Executar Localmente

```bash
# Python (sem instalação adicional)
python3 -m http.server 8080

# Node.js via npx
npx serve .

# Extensão VS Code Live Server
# Clique com botão direito em index.html → Open with Live Server
```

Abra `http://localhost:8080`.

---

## Executar Testes

```bash
node tests/test-runner.js
```

Saída esperada:

```
Johnson English — Test Suite
========================================

  JSON files — parseable
    ✓ levels.json is valid JSON
    ...

========================================
  Passed: 105
  Failed: 0
```

Os testes cobrem: parseabilidade dos JSONs, integridade estrutural das lições (A1, A2, B1), roteamento do SPA, e lógica do motor de áudio. Nenhuma dependência externa — apenas stdlib do Node.js.

---

## Adicionar uma Lição Normal

1. Abra `data/lessons.json`
2. Adicione um objeto com a estrutura abaixo:

```json
{
  "id": "l03",
  "levelId": "a1",
  "moduleId": "m01",
  "order": 3,
  "title": "Your Lesson Title",
  "description": "Descrição em uma frase.",
  "explanation": {
    "text": "Texto de explicação em português.",
    "note": "Nota opcional (exibida como blockquote).",
    "tip":  "Dica opcional (exibida em caixa de info)."
  },
  "examples": [
    { "en": "English sentence.", "pt": "Tradução em português." }
  ],
  "listening": [
    { "text": "Frase para escuta.", "translation": "Tradução." }
  ],
  "repetition": [
    { "text": "Frase para shadowing.", "translation": "Tradução." }
  ],
  "practice": [
    {
      "type": "multiple-choice",
      "prompt": "Pergunta?",
      "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
      "answer": "Opção A"
    },
    {
      "type": "fill-blank",
      "prompt": "Complete esta [BLANK].",
      "answer": "frase"
    },
    {
      "type": "reorder",
      "prompt": "Reorganize as palavras:",
      "words": ["palavra1", "palavra2", "palavra3"],
      "answer": "palavra1 palavra2 palavra3"
    }
  ],
  "production": [
    {
      "prompt": "Responda esta pergunta em inglês.",
      "hint": "Dica opcional para o aluno."
    }
  ]
}
```

3. Execute os testes para validar:

```bash
node tests/test-runner.js
```

---

## Adicionar uma Lição de Pronúncia

Lições de pronúncia usam `"type": "pronunciation"` e têm estrutura diferente:
sem seção `practice`, sem seção `examples`, sem seção `listening` padrão.
Em vez disso, têm `sounds`, `minimal_pairs` e `repetition` próprios.

```json
{
  "id": "l01",
  "levelId": "b1",
  "moduleId": "m20",
  "type": "pronunciation",
  "order": 1,
  "title": "The TH Sound",
  "description": "Descrição em uma frase.",
  "explanation": {
    "text": "Explicação em português.",
    "note": "Nota opcional.",
    "tip": "Dica opcional."
  },
  "sounds": [
    {
      "symbol": "/θ/",
      "name": "TH surdo",
      "description": "Descrição articulatória.",
      "mouth_tip": "Posição da língua e lábios.",
      "color": "grammar",
      "words": [
        { "en": "think /θɪŋk/", "pt": "pensar" }
      ]
    }
  ],
  "minimal_pairs": [
    { "a": "think", "b": "sink", "note": "Nota de contraste opcional." }
  ],
  "repetition": [
    { "text": "Frase para shadowing.", "translation": "Tradução." }
  ],
  "production": [
    { "prompt": "Prompt de produção.", "hint": "Dica opcional." }
  ]
}
```

Cores válidas para `sounds[].color`: `"grammar"`, `"logic"`, `"rhetoric"`, `"pronunciation"`.
Esses valores mapeiam para CSS custom properties em `base.css`.

O `router.js` detecta `lesson.type === 'pronunciation'` e ativa o
`PronunciationEngine` em vez do `LessonEngine`. Nenhuma outra configuração necessária.

---

## Adicionar um Novo Módulo

1. Abra `data/modules.json`
2. Adicione um objeto:

```json
{
  "id": "m21",
  "levelId": "b2",
  "order": 1,
  "title": "Título do Módulo",
  "description": "Descrição do módulo em uma frase."
}
```

IDs de módulo seguem sequência global (m01–m20 já usados). O próximo módulo
B2 começa em m21.

---

## Adicionar Áudio a um Novo Contexto

Qualquer engine que renderize botões `.btn--audio[data-text]` deve chamar
`AudioEngine.hydrateAudioButtons()` após a renderização:

```javascript
import { AudioEngine } from '../../audio-engine.js';

// Dentro do método hydrate() do engine:
AudioEngine.hydrateAudioButtons({ levelId, moduleId, lessonId, state });
```

Este método registra um event listener no `#app-root` via event delegation,
remove automaticamente o listener anterior ao ser chamado novamente,
e garante que o contexto de `levelId/moduleId/lessonId` esteja sempre atualizado.

Não registre listeners de áudio diretamente em botões individuais — isso quebra
ao navegar entre lições sem recarregar a página.

---

## Adicionar um Novo Tipo de Exercício

1. Adicione renderização em `js/components/lesson-view.js` dentro de `_renderExercise()`:

```javascript
case 'seu-novo-tipo':
    return _renderSeuNovoTipo(ex, id);
```

2. Implemente o renderizador como função privada no mesmo arquivo.

3. Adicione lógica de hidratação em `js/modules/logic/logic-engine.js`.

4. Chame dentro de `LogicEngine.hydrate()`.

5. Adicione um teste em `tests/content-tests.js` validando a estrutura JSON.

---

## Convenções CSS

- Todos os valores de cor, espaçamento e tipografia usam CSS custom properties de `:root` em `base.css`.
- Nunca hardcode valores de cor ou pixels fora de `base.css`.
- Mobile-first: estilos base em `layout.css`, overrides para telas pequenas em `mobile.css`.
- Tokens de cor por contexto: `--color-grammar`, `--color-logic`, `--color-rhetoric`, `--color-pronunciation`.

---

## Convenções JavaScript

- Todo módulo usa o padrão IIFE + objeto retornado (sem classes, sem globais).
- Todas as funções públicas são documentadas com JSDoc.
- Prefixo `_underscore` = privado, uso interno apenas.
- Sem `console.log` em código de produção (apenas `console.info` e `console.warn` onde justificado).
- Toda inserção de HTML usa `_escape()` para prevenir XSS.
- Sem dependências externas — zero `npm install`.

---

## Política de Tamanho de Arquivo

Nenhum arquivo deve exceder 400 linhas (excluindo comentários).
Se um arquivo se aproximar desse limite, divida por responsabilidade.

---

## Deploy no GitHub Pages

1. Faça push do repositório para o GitHub.
2. Configurações do repositório → Pages → Source: branch `main`, raiz `/`.
3. O GitHub Pages servirá `index.html` da raiz do repositório.
4. Áudio funciona nativamente via Web Speech API do browser — nenhuma configuração adicional necessária.

Ver `docs/audio-system.md` para detalhes de deploy do servidor TTS.

---

## Changelog

Atualize `CHANGELOG.md` a cada mudança significativa:

```markdown
## [1.6.0] — 2026-03-07
### Adicionado
- Currículo B1 completo: 7 módulos (m14–m20), 26 lições, 75 total (A1+A2+B1)
- AudioEngine.hydrateAudioButtons() — delegação de áudio compartilhada

### Corrigido
- Botões de áudio sem funcionamento em lições de pronúncia
  (PronunciationEngine não registrava listeners de clique)
```

---

## Changelog — Expansão A1 e A2

### A1 — 8 módulos, 31 lições (+8 lições)
Novos módulos adicionados ao A1 (m42–m43):
- **m42 — The World Around You**: tempo climático, estações do ano, roupas e cores, animais e pets
- **m43 — Alphabet, Spelling and Questions**: alfabeto inglês, soletrar em situações reais, números ordinais com datas, Wh-questions completo

### A2 — 11 módulos, 42 lições (+16 lições)
Novos módulos adicionados ao A2 (m44–m47):
- **m44 — Language Tools A2**: used to, Reported Speech básico (say/tell), ordem de adjetivos, both/neither/either, telefone e comunicação digital
- **m45 — Life and Society A2**: escola e educação, transporte detalhado (single/return/platform), férias e tempo livre, números grandes e frações
- **m46 — Grammar in Use A2**: Second Conditional, connectors (although/however/despite/in spite of), preposições compostas e avançadas (by/since/due to/instead of), question tags
- **m47 — Home, Food and Opinions**: casa e moradia (rent/landlord/flatmate), culinária (bake/fry/chop/recipe), dar e pedir opiniões (in my opinion/I see your point), inglês social (convites, desculpas, small talk)

### Totais actualizados
- Módulos: 55 (m01–m55)
- Lições: 209
- Testes: 105 (todos passando)

### m50–m51 — B2 Expansion (Advanced Grammar + Style and Register)

- m50: Inversão formal (Never have I / Had I known / Should you), participle clauses (Having finished / Written in...), nominalização (arrival/development/failure), ellipsis e substituição (So do I / Neither have I / I hope so), perguntas embutidas (Could you tell me where... / I wonder whether...), subjuntivo mandativo (It is essential that... be), phrasal verbs B2 (put up with / come up with / carry out / look forward to / rule out)
- m51: Registo formal vs informal (Latinate verbs vs phrasal verbs), vocabulário de precisão e certeza (bound to / highly likely / it would appear / one might argue), colocações avançadas (carry out / shed light on / raise concerns / reach an agreement), leitura e escuta crítica (argue/claim/concede/challenge/imply/infer, stance, hedging académico)

### m52–m53 — C1 Expansion (Advanced Lexis + Expression and Fluency)

- m52: Idioms C1 (at the eleventh hour, watershed moment, double-edged sword, come full circle, sit on the fence, play devil's advocate, tip of the iceberg, open a can of worms); three-part phrasal verbs (come up against, live up to, put down to, come to terms with, look up to, get away with); advanced collocations (exert pressure, wield influence, bear the brunt, garner support, mount a challenge, brook no dissent, spark controversy, dispel a misconception); advanced article system (the + adjective as noun class, generic reference patterns, zero article vs definite with proper nouns)
- m53: Formal subjunctive in fixed expressions (as it were, be that as it may, come what may, suffice it to say, far be it from me, lest + subjunctive, so be it); spoken fluency strategies (off the top of my head, floor-holding, buying time, self-correction, complexity signals); word formation C1 (zero-derivation/conversion, complex derivational chains, productive prefixes over-/under-/counter-/mis-/re-, suffixes -ise/-ification/-ity); rhetorical devices (anaphora, antithesis, tricolon, chiasmus, litotes, rhetorical question — identification and production)
- All C1 content: full English immersion — zero translations

### m54–m55 — C2 Expansion (Language as System + Language, Power and Genre)

- m54 Language as System C2: construções absolutas (present/past participial, with + NP) com vocabulário arcaico produtivo (albeit, hitherto, whereupon, notwithstanding, therein, henceforth, inasmuch as); deixis completa (person/spatial/temporal/discourse deixis) e deictic shift; densidade lexical (ratio conteúdo/total, comparação spoken ≈40% vs academic ≈65%), register blending deliberado e code-switching; metáfora conceptual (ARGUMENT IS WAR, TIME IS MONEY, LIFE IS A JOURNEY, THEORIES ARE BUILDINGS) e extended metaphor — incluindo subversão consciente de frames metafóricos
- m55 Language, Power and Genre C2: Critical Discourse Analysis — eufemismo por categoria (morte/violência económica/violência política), doublespeak e passiva agentless, vocabulário ideológico e análise de framing; etimologia produtiva — raízes latinas (-fer-/-vert-/-dict-/-scrib-/-port-/-cap-/-cept-/-pon-/-pos-) e gregas (-logy/-graph-/-phon-/-meter/-archy), etymological fallacy; convenções de género textual (obituário, manifesto, op-ed, executive brief) — estrutura, registo e marcadores de género; vocabulário raro e preciso (tendentious, specious, apposite, invidious, putative, ostensible, germane, expedient, venal, inimical); style mimicry como análise e produção
- Toda a expansão C2: imersão total em inglês — zero traduções
