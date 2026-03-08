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
  Passed: 81
  Failed: 0
```

Os testes cobrem: parseabilidade dos JSONs, integridade estrutural de todas as 75 lições
(A1, A2 e B1), roteamento do SPA, e lógica do motor de áudio. Nenhuma dependência
externa — apenas stdlib do Node.js.

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
4. Para áudio de alta qualidade: hospede o servidor TTS separadamente
   e atualize `DEFAULT_TTS_URL` em `js/audio-engine.js`.
   Sem o servidor, a Web Speech API nativa entra automaticamente como fallback.

Ver `docs/audio-system.md` para detalhes de deploy do servidor TTS.

---

## Changelog

Atualize `CHANGELOG.md` a cada mudança significativa:

```markdown
## [1.6.0] — 2026-03-07
### Adicionado
- Currículo B1 completo: 7 módulos (m14–m20), 26 lições, 75 total
- AudioEngine.hydrateAudioButtons() — delegação de áudio compartilhada

### Corrigido
- Botões de áudio sem funcionamento em lições de pronúncia
  (PronunciationEngine não registrava listeners de clique)
```
