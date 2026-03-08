# Johnson English — Laboratório de Língua

Plataforma acadêmica de aprendizado de inglês baseada no método clássico do **Trivium**:
Gramática (absorção) → Lógica (estrutura) → Retórica (produção).

Parte de um ecossistema educacional ao lado de **Heródoto** (História),
**Euclides** (Matemática) e **Quintiliano** (Língua Portuguesa).

---

## Início Rápido

```bash
git clone https://github.com/seu-usuario/johnson-english.git
cd johnson-english

# ES Modules exigem HTTP — file:// não funciona
python3 -m http.server 8080
# ou: npx serve .

open http://localhost:8080
```

### Opcional: servidor TTS

```bash
pip install TTS flask flask-cors soundfile numpy
python server/coqui-tts-service/wrapper.py
```

Sem o servidor TTS, a Web Speech API nativa do navegador entra como fallback
automático. A aplicação funciona completamente em qualquer caso.

### Executar testes

```bash
node tests/test-runner.js
```

---

## Currículo Completo

| Nível | Módulos | Lições | Perfil CEFR |
|---|---|---|---|
| A1 | 6 (m01–m06) | 23 | Expressões cotidianas, apresentação pessoal, perguntas simples |
| A2 | 7 (m07–m13) | 26 | Comunicação rotineira, situações reais, narrativa básica |
| B1 | 7 (m14–m20) | 26 | Narrativa, opinião, explicação — usuário independente |
| B2 | 7 (m21–m27) | 26 | Argumentação, análise, debate — usuário independente avançado |
| **Total** | **27** | **101** | |

### Módulos A1

| ID | Título | Gramática principal |
|---|---|---|
| m01 | Presenting Yourself | Present Simple, verbo to be |
| m02 | Daily Routine | Present Simple, adv. de frequência |
| m03 | Food and Drinks | There is/are, some/any |
| m04 | Places in the City | Preposições de lugar, imperativo |
| m05 | Time and Dates | Horas, datas, preposições de tempo |
| m06 | Pronunciation A1 | TH sound, vogais longas e curtas |

### Módulos A2

| ID | Título | Gramática principal |
|---|---|---|
| m07 | Family and Relationships | Comparativos, superlativos, as…as |
| m08 | Shopping and Money | Too/enough, countable/uncountable, quantifiers |
| m09 | Travel and Transport | Direções, Past Simple completo, Future Will |
| m10 | Health and the Body | Corpo, sintomas, must/have to/mustn't |
| m11 | Work and Technology | Present Continuous, Simple vs Continuous, gerúndio |
| m12 | Hobbies and Free Time | Adv. de frequência, sugestões, narração passada |
| m13 | Pronunciation A2 | Schwa /ə/, entonação ↑↓, linking, contrações |

### Módulos B1

| ID | Título | Gramática principal |
|---|---|---|
| m14 | Experiences and the Past | Present Perfect (ever/never, already/yet/just, for/since) vs Past Simple |
| m15 | Stories and Memories | Past Continuous, ação interrompida, narrativa integrada |
| m16 | Plans and Possibilities | Future arrangements, First Conditional, might/may/could |
| m17 | The World Around Us | Passive Voice, Relative Clauses, vocabulário de sociedade |
| m18 | How to Express Yourself | Gerund vs Infinitive, Reported Speech, linking words B1 |
| m19 | B1 Real Life | Entrevista, viagem internacional, negociação, síntese B1 |
| m20 | Pronunciation B1 | Word/sentence stress, assimilação, elisão, fala conectada |

### Módulos B2

| ID | Título | Gramática principal |
|---|---|---|
| m21 | Perfect Tenses | PP Continuous, Past Perfect, Past Perfect Continuous, integração |
| m22 | Hypothetical World | Second/Third Conditional, Mixed Conditionals, wishes e regrets |
| m23 | Reporting and Voice | Reported Speech avançado, Passive Voice B2, passiva impessoal, reporting verbs |
| m24 | Future and Speculation | Future Perfect/Continuous, modal deduction B2, graus de certeza |
| m25 | Argument and Discourse | Discourse markers B2, argumentação, relative clauses avançadas, essay B2 |
| m26 | B2 Real World | Sociedade/cultura, trabalho/economia, meio ambiente/IA, debate e apresentação |
| m27 | Pronunciation B2 | Padrões de entonação, stress em palavras complexas, compostos |

---

## Arquitetura

```
index.html              Shell da aplicação (SPA)
css/
  base.css              Tokens de design, reset, tipografia
  layout.css            Componentes, grid, botões, exercícios
  mobile.css            Overrides responsivos
js/
  app.js                Bootstrap e eventos globais
  router.js             Roteamento por hash (#/lesson/a1/m01/l01)
  state.js              Dados JSON e persistência de progresso
  lesson-engine.js      Hidratação das lições normais
  audio-engine.js       TTS + Web Speech API + fallback silencioso
  shadowing-engine.js   Modo shadowing
  components/           Renderizadores de views (strings HTML)
  modules/
    grammar/            GrammarEngine (Escuta + Repetição)
    logic/              LogicEngine (Prática)
    rhetoric/           RhetoricEngine (Produção)
    pronunciation/      PronunciationEngine (type:"pronunciation")
data/
  levels.json           Níveis CEFR (A1, A2, B1, B2)
  modules.json          27 módulos (m01–m27)
  lessons.json          101 lições com conteúdo completo
tests/
  test-runner.js        Orquestrador (Node.js, zero dependências)
  content-tests.js      Integridade A1
  content-tests-a2.js   Integridade A2
  audio-tests.js        Motor de áudio
server/
  coqui-tts-service/    Wrapper Flask para Coqui TTS
docs/
  architecture.md       Estrutura técnica detalhada
  pedagogy.md           Método Trivium e alinhamento CEFR
  audio-system.md       Sistema de áudio multicamada
  development-guide.md  Guia de contribuição e convenções
```

---

## Stack Tecnológico

| Camada | Tecnologia | Motivo |
|---|---|---|
| Frontend | HTML5, CSS3, ES Modules | Sem build tools, compatível com GitHub Pages |
| Roteamento | SPA por hash | Sem configuração de servidor |
| Áudio primário | Coqui TTS (XTTS v2) | Open source, local, sem custo de API |
| Áudio fallback | Web Speech API | Nativa do navegador, zero dependências |
| Testes | stdlib do Node.js | Sem framework externo |

---

## Método Pedagógico

Cada lição segue três etapas em sequência rígida:

1. **Gramática (Absorção)** — Escuta e shadowing antes de qualquer análise
2. **Lógica (Estrutura)** — Reordenação, lacunas, identificação de padrões
3. **Retórica (Produção)** — Prompts de escrita e simulação de diálogo

Ver `docs/pedagogy.md` para a justificativa completa.

---

## Lições de Pronúncia

Quatro módulos usam `"type": "pronunciation"` em `lessons.json`:
m06 (A1), m13 (A2), m20 (B1), m27 (B2).

Esse tipo ativa o `PronunciationEngine` com estrutura diferente:
**Som → Palavras → Pares Mínimos → Repetição → Produção** (sem Prática).

---

## Sistema de Áudio

Detecção automática em três camadas:

1. **Coqui TTS** — alta qualidade, servidor local na porta 5002
2. **Web Speech API** — fallback nativo, zero configuração
3. **Fallback silencioso** — UI exibe estado de erro sem exceção

---

## Segurança

- Dados JSON escapados via `_escape()` antes de toda inserção como innerHTML
- Entrada TTS sanitizada no frontend e no servidor
- CSP via `<meta>` em `index.html`
- Rate limiting: throttle de 500ms no cliente + 30 req/60s no servidor
- Sem dependências externas de CDN em produção

---

## Deploy (GitHub Pages)

1. Push para repositório GitHub
2. Settings → Pages → Source: `main`, raiz `/`
3. Site disponível em `https://usuario.github.io/johnson-english/`
4. Para áudio de alta qualidade: hospede o servidor TTS separadamente
   e atualize `DEFAULT_TTS_URL` em `js/audio-engine.js`

---

## Licença

MIT License.
