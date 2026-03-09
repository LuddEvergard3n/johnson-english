# Johnson English — Laboratório de Língua

Plataforma académica de aprendizado de inglês baseada no método clássico do **Trivium**:
Gramática (absorção) → Lógica (estrutura) → Retórica (produção).

Parte de um ecossistema educacional ao lado de **Heródoto** (História),
**Euclides** (Matemática) e **Quintiliano** (Língua Portuguesa).

---

## Início Rápido

```bash
git clone https://github.com/seu-usuario/johnson-english.git
cd johnson-english
python3 -m http.server 8080
open http://localhost:8080
```

```bash
# Opcional: servidor TTS local
pip install TTS flask flask-cors soundfile numpy
python server/coqui-tts-service/wrapper.py
```

```bash
node tests/test-runner.js
```

---

## Currículo Completo — A1 a C2

| Nível | Módulos | Lições | Imersão | Perfil CEFR |
|---|---|---|---|---|
| A1 | 8 (m01–m06, m42–m43) | 31 | PT+EN | Expressões cotidianas, apresentação pessoal |
| A2 | 11 (m07–m13, m44–m47) | 42 | PT+EN | Comunicação rotineira, narrativa básica |
| B1 | 7 (m14–m20) | 26 | PT+EN | Narrativa, opinião, explicação |
| B2 | 7 (m21–m27) | 26 | PT+EN | Argumentação, análise, debate |
| C1 | 7 (m28–m34) | 26 | EN only | Argumentação sofisticada, precisão discursiva |
| C2 | 7 (m35–m41) | 26 | EN only | Domínio retórico, pragmático e estilístico |
| **Total** | **47** | **177** | | |

**C1–C2 — imersão total:** a partir do módulo m28, todas as explicações, exemplos e exercícios estão integralmente em inglês. Não há traduções.

---

### Módulos A1 (m01–m06)

| ID | Título | Foco |
|---|---|---|
| m01 | Presenting Yourself | Present Simple, verbo to be |
| m02 | Daily Routine | Present Simple, adv. de frequência |
| m03 | Food and Drinks | There is/are, some/any |
| m04 | Places in the City | Preposições de lugar, imperativo |
| m05 | Time and Dates | Horas, datas, preposições de tempo |
| m06 | Pronunciation A1 | TH sound, vogais longas e curtas |

### Módulos A2 (m07–m13, m44–m47)

| ID | Título | Foco |
|---|---|---|
| m07 | Family and Relationships | Comparativos, superlativos |
| m08 | Shopping and Money | Too/enough, countable/uncountable |
| m09 | Travel and Transport | Direções, Past Simple, Future Will |
| m10 | Health and the Body | Corpo, sintomas, must/have to |
| m11 | Work and Technology | Present Continuous, gerúndio |
| m12 | Hobbies and Free Time | Adv. de frequência, narração passada |
| m13 | Pronunciation A2 | Schwa /ə/, entonação, linking |
| m44 | Language Tools A2 | Used to, Reported Speech básico, ordem de adjetivos, both/neither/either, telefone e e-mail |
| m45 | Life and Society A2 | Escola e educação, transporte, férias e tempo livre, números grandes |
| m46 | Grammar in Use A2 | Second Conditional, connectors (although/however/despite), preposições compostas, question tags |
| m47 | Home, Food and Opinions | Casa e moradia, vocabulário de culinária, dar e pedir opiniões, inglês social |

### Módulos B1 (m14–m20)

| ID | Título | Foco |
|---|---|---|
| m14 | Experiences and the Past | Present Perfect vs Past Simple |
| m15 | Stories and Memories | Past Continuous, narrativa integrada |
| m16 | Plans and Possibilities | Future, First Conditional, modals |
| m17 | The World Around Us | Passive Voice, Relative Clauses |
| m18 | How to Express Yourself | Gerund vs Infinitive, Reported Speech B1 |
| m19 | B1 Real Life | Entrevista, viagem, negociação |
| m20 | Pronunciation B1 | Word/sentence stress, fala conectada |

### Módulos B2 (m21–m27)

| ID | Título | Foco |
|---|---|---|
| m21 | Perfect Tenses | PP Continuous, Past Perfect, Past Perfect Continuous |
| m22 | Hypothetical World | Second/Third Conditional, Mixed Conditionals, wishes |
| m23 | Reporting and Voice | Reported Speech avançado, Passive Voice B2 |
| m24 | Future and Speculation | Future Perfect/Continuous, modal deduction |
| m25 | Argument and Discourse | Discourse markers B2, argumentação, relative clauses |
| m26 | B2 Real World | Sociedade, trabalho, meio ambiente, debate |
| m27 | Pronunciation B2 | Padrões de entonação, stress em palavras complexas |

### Módulos C1 — English Only (m28–m34)

| ID | Título | Foco |
|---|---|---|
| m28 | Advanced Grammar I | Inversion, cleft sentences, participle clauses, nominalisation |
| m29 | Advanced Grammar II | Advanced passive, ellipsis/substitution, verb patterns, register |
| m30 | Conditionals and Modals C1 | Mixed conditionals C1, retrospective modals, hedging, inference |
| m31 | Discourse and Argument C1 | Discourse markers C1, reported speech C1, academic essay, critical reading |
| m32 | Language in Use C1 | Collocations C1, vocabulary precision, nominalisation in context |
| m33 | C1 Real World | Academic discussion, professional writing, cultural commentary |
| m34 | Pronunciation C1 | Weak forms and connected speech, prosody and register |

### Módulos C2 — English Only (m35–m41)

| ID | Título | Foco |
|---|---|---|
| m35 | Rhetoric and Style C2 | Fronting, rhetorical parallelism, discourse grammar, stylistic control |
| m36 | Pragmatics and Implicature C2 | Implicature, irony/understatement, politeness strategies, register shifting |
| m37 | Lexical Mastery C2 | Collocations at scale, idiomatic restraint, emotional precision, abstract vocabulary |
| m38 | Advanced Writing C2 | Academic writing C2, argument precision, synthesis, revision as craft |
| m39 | Speaking and Listening C2 | Extended speaking, listening to dense input, debate, improvisation |
| m40 | C2 Real World | Academic discourse, high-stakes professional English, literary reading, final synthesis |
| m41 | Pronunciation C2 | Contrastive stress, discourse intonation (irony, concession, suspense) |

---

## Progressão Pedagógica

| Nível | Explicações | Exemplos | Exercícios |
|---|---|---|---|
| A1–B2 | Português | EN + PT | EN + PT |
| C1–C2 | English only | EN only | EN only |

A diferença real entre os níveis:

| Nível | O que o usuário faz |
|---|---|
| B2 | Argumenta |
| C1 | Argumenta com precisão e sofisticação |
| C2 | Argumenta com precisão, estratégia e controle estilístico — a língua deixou de ser obstáculo |

---

## Arquitetura

```
index.html
css/
  base.css / layout.css / mobile.css
js/
  app.js / router.js / state.js
  lesson-engine.js / audio-engine.js / shadowing-engine.js
  components/
  modules/
    grammar/ logic/ rhetoric/ pronunciation/
data/
  levels.json       6 níveis (A1–C2)
  modules.json      47 módulos (m01–m47)
  lessons.json      177 lições
tests/
  test-runner.js    105 testes (Node.js, zero dependências)
server/
  coqui-tts-service/
docs/
  architecture.md / pedagogy.md / audio-system.md / development-guide.md
```

---

## Lições de Pronúncia

Seis módulos usam `"type": "pronunciation"`:
m06 (A1), m13 (A2), m20 (B1), m27 (B2), m34 (C1), m41 (C2).

Activam o `PronunciationEngine`: Sons → Pares Mínimos → Repetição → Produção.
A partir de m34 (C1), os campos `pt` em `sound.words` são omitidos.

---

## Sistema de Áudio

1. **Coqui TTS** — alta qualidade, servidor local porta 5002
2. **Web Speech API** — fallback nativo do browser
3. **Fallback silencioso** — degradação sem exceção

---

## Deploy (GitHub Pages)

1. Push para repositório GitHub
2. Settings → Pages → Source: `main`, raiz `/`
3. URL: `https://usuario.github.io/johnson-english/`

---

## Licença

MIT License.
