# Changelog — Johnson English

Todas as mudanças notáveis neste projeto estão documentadas neste arquivo.
Formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).
Versões mais recentes primeiro.

---

## [2.0.0] — 2026-03-11

### Adicionado — Três novas seções e ecossistema completo

**Guia do Professor (`#/guia`)**
- Nova rota e view `teacher-guide-view.js` — layout sidebar (260px sticky) + conteúdo longo
- Navegação por âncoras com 10 destinos: método Trivium, estrutura de lição, imersão progressiva, 5 actividades práticas, orientações por nível, limitações
- 5 actividades práticas com cards estruturados (número, título, nível, duração, modo, variante): Shadowing em Dupla, Gramática Induzida, Produção Guiada em Cadeia, Debate por Nível, Pronúncia em Foco
- Tabela de estrutura das 6 seções de uma lição normal vs lições de pronúncia
- Tabela de política de imersão (A1–B2 em português, C1–C2 em inglês)
- Callouts (.callout--tip/.callout--note/.callout--info) para estratégias e avisos
- Badges de nível (A/B/C) nas actividades

**Gerador de Plano de Aula (`#/plano`)**
- Nova rota, view `lesson-plan-view.js` (layout dois painéis: formulário 460px + preview 1fr) e engine `lesson-plan-engine.js`
- Formulário: professor, turma, data, nível CEFR, duração, habilidade principal, tema
- Carga horária calculada automaticamente: Nº de aulas × duração, formatada como Xh ou XhYYmin
- Objetivos e atividades dinâmicos: checkboxes renderizados em função do nível CEFR selecionado (6 níveis × dois conjuntos de presets)
- Recursos e avaliação: checkboxes fixos (independentes de nível)
- Campos de texto livre ("Adicionar livremente") em todas as secções
- Geração de documento: HTML estruturado na preview com labels, grelha de identificação, listas de itens
- Impressão/PDF: `window.print()` com `@media print` completo (oculta formulário e UI, margem de página, `print-color-adjust: exact`)

**Sobre (`#/about`) — reescrito**
- Epígrafe de Samuel Johnson (1755)
- Grid de 6 métricas: 209 lições, 55 módulos, 6 níveis CEFR, A1–C2, 3 etapas/lição, 0 dependências
- Badge de versão inline no título das métricas
- Secção de imersão progressiva (nova)
- Secção "O Nome" expandida com contexto histórico do Dictionary
- Notas técnicas actualizadas (Web Speech API, sem Coqui)
- Secção de ecossistema educacional: band escura com eco-cards para todos os 7 projectos

**Ecossistema — Archimedes adicionado**
- Archimedes (Física e Ciências) adicionado a: about-view.js, README.md, index.html footer
- Repositório: https://github.com/LuddEvergard3n/archimedes
- Site: https://luddevergard3n.github.io/archimedes/
- Footer do index.html reescrito com links clicáveis para todos os 6 projectos irmãos

### Alterado
- `index.html`: navegação expandida de 3 para 5 itens (+ Guia do Professor, + Plano de Aula)
- `index.html`: footer com links externos para todas as plataformas do ecossistema
- `js/router.js`: rotas `guia` e `plano` adicionadas; hydration de `LessonPlanEngine` em `_hydrateView`
- `css/layout.css`: +650 linhas de novos componentes (about metrics, ecosystem band, guide layout, activity cards, plan layout, print styles)
- `docs/architecture.md`: tabela de rotas e estrutura de ficheiros actualizadas
- `README.md`: tabela do ecossistema expandida com colunas Repositório + Site para todos os 7 projectos

---


### Alterado
- README.md: tabela do ecossistema educacional completa com links GitHub Pages para todas as cinco plataformas (Euclides, Quintiliano, Humboldt, Heródoto, Lavoisier)
- README.md: removidas tabelas de módulos duplicadas (B1, C1, C2 apareciam duas vezes); corrigida secção de áudio partida; removido bloco pip install TTS obsoleto
- docs/architecture.md: removido fragmento órfão no topo; corrigida descrição do sistema de áudio
- docs/development-guide.md: removidas referências ao servidor TTS e DEFAULT_TTS_URL na secção Deploy
- docs/pedagogy.md: tabela de progressão actualizada com todos os 6 níveis e contagens correctas; adicionados perfis detalhados de C1 e C2

---

## [1.9.2] — 2026-03-09

### Adicionado — C2 Expansion (8 lições, 2 módulos)

**m54 — Language as System C2**
- l01: Absolute Constructions and Literary Register — construções absolutas (participial presente/passado, preposicional, with + NP); distinção dangling participle vs absolute; vocabulário arcaico produtivo: albeit, hitherto, therein lies, whereupon, notwithstanding, henceforth, inasmuch as
- l02: Deixis, Reference and Deictic Shift — quatro sistemas deíticos (pessoal/espacial/temporal/discursivo); we retórico vs genérico; proximal this vs distal that como ferramenta analítica; deictic shift em prosa literária e argumentativa
- l03: Lexical Density, Register Blending and Code-Switching — fórmula de densidade lexical; spoken ~40-50% vs academic ~55-65%; register blending deliberado; code-switching como indexação de identidade
- l04: Conceptual Metaphor and Extended Metaphor — teoria de Lakoff & Johnson; seis metáforas conceptuais centrais; extended metaphor; subversão de metáfora; análise de metáfora ideológica

**m55 — Language, Power and Genre C2**
- l01: Euphemism, Doublespeak and the Language of Power — Critical Discourse Analysis; eufemismo por categoria; doublespeak e passiva agentless; vocabulário ideológico; quatro perguntas de análise CDA
- l02: Etymology and Word History for Productive Use — raízes latinas (-fer-/-vert-/-dict-/-scrib-/-port-/-cap-/-cept-/-pon-/-pos-) e gregas (-logy/-graph-/-phon-/-meter/-archy); etymological fallacy; split Anglo-Saxon/Latinate
- l03: Text Genre Conventions — obituário, manifesto, op-ed, executive brief: estrutura, registo e marcadores de género de cada um
- l04: Rare Vocabulary, Style Mimicry and the Limits of C2 — tendentious, specious, apposite, invidious, putative, ostensible, germane, expedient, venal, inimical; style mimicry como transcrição linguística; o que C2 confere e não confere

### Estatísticas
- C2: 7 módulos, 26 lições → 9 módulos, 34 lições
- Total: 53 módulos, 201 lições → 55 módulos, 209 lições
- Testes: 105/105

---

## [1.9.1] — 2026-03-09

### Adicionado — C1 Expansion (8 lições, 2 módulos)

**m52 — Advanced Lexis C1**
- l01: Idioms C1 — at the eleventh hour, watershed moment, double-edged sword, tip of the iceberg, come full circle, sit on the fence, open a can of worms, play devil's advocate, read between the lines; nota de registo
- l02: Three-Part Phrasal Verbs — come up against, live up to, put down to, come to terms with, look up to, get away with; regra de inseparabilidade; equivalentes latinos
- l03: Advanced Collocations C1 — exert pressure, wield influence, bear the brunt, garner support, mount a challenge, brook no dissent, spark controversy, dispel a misconception; restrições colocacionais
- l04: Advanced Article System — the + adjectivo como classe nominal (the elderly — sempre plural); três padrões de referência genérica; zero article vs the com nomes próprios; artigo indefinido em instância notável

**m53 — Expression and Fluency C1**
- l01: The Formal Subjunctive — as it were, be that as it may, come what may, suffice it to say, far be it from me, lest + subjuntivo, so be it, were this to occur
- l02: Spoken Fluency C1 — fillers calibrados por registo; off the top of my head; floor-holding; auto-correcção e repair; sinalização de complexidade; pausa controlada em fronteira de cláusula
- l03: Word Formation C1 — zero-derivação/conversão (to chair, to underpin); cadeias derivacionais complexas; prefixos over-/under-/counter-/mis-/re-; sufixos -ise/-ification/-ity
- l04: Rhetoric and Persuasion C1 — anáfora, paralelismo, antítese, tricólon, quiasmo, lítotes, questão retórica; identificação, nomeação e produção deliberada

### Estatísticas
- C1: 7 módulos, 26 lições → 9 módulos, 34 lições
- Total: 51 módulos, 193 lições → 53 módulos, 201 lições
- Testes: 105/105

---

## [1.9.0] — 2026-03-09

### Removido
- Integração Coqui TTS (server/coqui-tts-service/) eliminada inteiramente. Sistema de áudio passa a usar exclusivamente a Web Speech API — sem servidor, sem dependências, compatível com GitHub Pages.

### Alterado
- audio-engine.js reescrito: removidos backend server, probe logic, throttle, prefetch, cache, setServerUrl, _backend, _inflight, DEFAULT_TTS_URL, TTS_PROBE_TIMEOUT_MS. Backend único: Web Speech API.
- app.js: removido intervalo de polling ao backend. Banner exibido apenas se Web Speech API ausente.
- tests/audio-tests.js: removido teste de throttle (conceito exclusivo do servidor).

### Adicionado — Currículo C2 Completo (26 lições, 7 módulos: m35–m41)

**m35 — Rhetoric and Style C2**: fronting e ênfase, paralelismo retórico estratégico, discourse grammar (tema/rema), controlo estilístico (ritmo, densidade, arquitectura de prosa)

**m36 — Pragmatics and Implicature C2**: implicatura (Grice, máximas conversacionais), ironia/understatement/overstatement, estratégias de polidez (Brown & Levinson, positive/negative face, FTAs), register shifting dentro de um turno

**m37 — Lexical Mastery C2**: colocações à escala (redes colocacionais), competência idiomática com contenção, precisão emocional e psicológica, vocabulário abstracto e filosófico

**m38 — Advanced Writing C2**: escrita académica C2 (densidade, coesão, voz crítica), argumentação estratégica, síntese de fontes múltiplas, revisão como ofício

**m39 — Speaking and Listening C2**: fala estendida com argumento estratificado, escuta de input denso (conteúdo/posição/implicação/estrutura), debate C2, improvisação e reformulação em tempo real

**m40 — C2 Real World**: discurso académico e intelectual C2, inglês profissional high-stakes, leitura literária (estilo, voz, ironia), síntese final

**m41 — Pronunciation C2**: contrastive stress como dispositivo semântico (seis leituras de "I didn't say he stole it"), entoação discursiva (ironia, concessão, suspense, framing retórico)

### Adicionado — Currículo C1 Completo (26 lições, 7 módulos: m28–m34)

**m28 — Advanced Grammar I**: inversão com adverbiais negativos/restritivos, cleft sentences, participle clauses, nominalização académica

**m29 — Advanced Grammar II**: passiva de verbos de reporte (is said to / is expected to), ellipsis e substituição, padrões verbais avançados, controlo de registo

**m30 — Conditionals and Modals C1**: mixed conditionals C1, sistema retrospectivo modal completo, hedging epistémico, especulação e inferência

**m31 — Discourse and Argument C1**: discourse markers avançados (hence/whereas/accordingly/granted), reported speech C1 (atribuição e distanciamento), ensaio académico C1, leitura e síntese crítica

**m32 — Language in Use C1**: colocações C1 (draw a conclusion / pose a threat / raise an issue), precisão vocabular (conotação, registo), nominalização em contexto, fala C1 fluente

**m33 — C1 Real World**: discussão académica (seminário, conferência), inglês profissional C1 (relatórios, propostas), comentário cultural e social, debate e síntese C1

**m34 — Pronunciation C1**: formas fracas e fala conectada (arquitectura oculta do inglês), prosódia e registo (stress, ritmo, significado social da entoação)

---

## [1.8.1] — 2026-03-08

### Adicionado — B2 Expansion (8 lições, 2 módulos)

**m50 — Advanced Grammar B2**
- l01: Inversão formal — Never have I, Rarely does, Not only did, Had I known, Should you (condicional sem IF), So do I / Neither have I
- l02: Participle Clauses + Nominalização — Having finished, Written in...; verbo→substantivo (arrive→arrival, decide→decision)
- l03: Ellipsis + Perguntas Embutidas — I hope so / Neither do I; ordem afirmativa após Could you tell me where...
- l04: Subjuntivo Mandativo + Phrasal Verbs B2 — recommend that X be; put up with / come up with / carry out / look forward to / rule out

**m51 — Style and Register B2**
- l01: Registo Formal vs Informal — mapeamento Latinate vs phrasal verb, transformação informal→formal
- l02: Certeza e Probabilidade — bound to / highly likely / doubtful; hedging académico (one might argue / it would appear)
- l03: Colocações Avançadas — carry out research, shed light on, raise concerns, reach an agreement, pose a risk
- l04: Leitura e Escuta Crítica — 4 níveis (conteúdo/posição/implicação/estratégia), argue/claim/concede/challenge/imply/infer

---

## [1.8.0] — 2026-03-08

### Adicionado — Currículo B2 Completo (26 lições, 7 módulos: m21–m27)

**m21 — Perfect Tenses**: Present Perfect Continuous, Past Perfect, Past Perfect Continuous

**m22 — Hypothetical World**: Second/Third Conditional, Mixed Conditionals, Wish/If Only

**m23 — Reporting and Voice**: Reported Speech completo, Passive Voice B2 (todos os tempos), Passiva Impessoal, Reporting Verbs (claim/argue/suggest/admit/deny/warn)

**m24 — Future and Speculation**: Future Perfect/Continuous, dedução modal (must have / can't have / might have), graus de certeza

**m25 — Argument and Discourse**: discourse markers B2 (nevertheless/consequently/moreover/whereby), estrutura de argumento, relative clauses avançadas (whose/whereby/what)

**m26 — B2 Real World**: globalização e sociedade, trabalho e economia, ambiente e tecnologia, debate B2

**m27 — Pronunciation B2**: padrões de entonação, stress em palavras complexas (sufixos -tion/-ic/-ity), compound nouns vs adj+noun

---

## [1.7.1] — 2026-03-08

### Adicionado — B1 Expansion (8 lições, 2 módulos)

**m48 — Grammar Depth B1**
- l01: Third Conditional — IF + Past Perfect + WOULD HAVE, could have/might have
- l02: Mixed Conditionals + Wish/If Only — passado hipotético→presente, wish + Past Simple/Past Perfect/would
- l03: Present Perfect Continuous — duração em andamento, PPC vs PP Simple (processo vs resultado), stative verbs
- l04: Adjectivos Compostos + Medidas — hífen obrigatório, substantivo singular em composto (three-hour), medidas com "of"

**m49 — Practical English B1**
- l01: Escrita Formal — estrutura e-mail, Yours sincerely vs faithfully
- l02: Conselhos B1 — escala might→should→ought to→had better→If I were you
- l03: Saúde e Estilo de Vida — cut down on/give up/take up, run-down/burnout/cope with
- l04: Habilidades de Discussão — PONTO→RAZÃO→EXEMPLO→CONCLUSÃO, While it's true that...

---

## [1.7.0] — 2026-03-08

### Adicionado — Currículo B1 Completo (26 lições, 7 módulos: m14–m20)

**m14 — Experiences and the Past**: Present Perfect vs Past Simple, ever/never/already/yet/just/for/since

**m15 — Stories and Memories**: Past Continuous, Past Continuous + Past Simple, narrativa integrada

**m16 — Plans and Possibilities**: Future arrangements, will espontâneo, First Conditional, unless, might/may/could

**m17 — The World Around Us**: Passive Voice (presente e passado), Relative Clauses (who/which/that, defining vs non-defining)

**m18 — How to Express Yourself**: Gerund vs Infinitive (com mudança de sentido), Reported Speech B1

**m19 — B1 Real Life**: entrevista de emprego, viagem internacional, negociação e resolução de problemas

**m20 — Pronunciation B1**: word stress, sentence stress (conteúdo vs funcional), connected speech (assimilação, elisão)

---

## [1.6.0] — 2026-03-07

### Adicionado — A2 Expansion (16 lições, 4 módulos: m44–m47)

**m44 — Language Tools A2**: used to, Reported Speech básico, ordem de adjectivos, both/neither/either, comunicação digital

**m45 — Life and Society A2**: escola e educação, transporte detalhado, férias e tempo livre, números grandes e frações

**m46 — Grammar in Use A2**: Second Conditional, connectors (although/however/despite), preposições compostas, question tags

**m47 — Home, Food and Opinions**: casa e moradia, culinária, dar e pedir opiniões, inglês social (convites, desculpas, small talk)

---

## [1.5.0] — 2026-03-07

### Adicionado — Currículo A2 Completo (26 lições, 7 módulos: m07–m13)

**m07 — Family and Relationships**: comparativos (adj. curtos e longos), superlativos, as…as, less…than

**m08 — Shopping and Money**: would like, too/enough, countable/uncountable, quantifiers, negociação e reclamação

**m09 — Travel and Transport**: direcções completas, Past Simple irregular, Future Will, situações reais em aeroporto e hotel

**m10 — Health and the Body**: partes do corpo, -ache compounds, should/must/have to/mustn't, consulta médica

**m11 — Work and Technology**: Present Continuous completo, contraste Simple vs Continuous, vocabulário de trabalho e tecnologia

**m12 — Hobbies and Free Time**: advérbios de frequência, sugestões e convites, narração com conectivos

**m13 — Pronunciation A2**: schwa /ə/ e redução vocálica, entonação em perguntas, C→V linking, contrações na fala

---

## [1.4.0] — 2026-03-07

### Adicionado — A1 Expansion (8 lições, 2 módulos: m42–m43)

**m42 — The World Around You**: tempo climático, estações do ano, roupas e cores, animais e pets

**m43 — Alphabet, Spelling and Questions**: alfabeto inglês, soletrar em situações reais, números ordinais com datas, Wh-questions completo

---

## [1.1.0] — 2026-03-06

### Corrigido
- Rota #/module/{levelId}/{moduleId} exibia "Invalid lesson URL" — router mapeava module para LessonView em vez de ModuleView
- CSP bloqueava script type="application/json" no Firefox — dados de shadowing migrados para div hidden com JSON como textContent
- CSP bloqueava atributos style="..." — directiva style-src expandida para style-src 'self' 'unsafe-inline'

### Alterado
- Interface completamente em português — navegação, instruções, feedback, rótulos de actividade
- README, docs/ e CHANGELOG traduzidos para português

### Adicionado
- Classes CSS dedicadas para elementos sem estilo inline: .lesson-header, .instruction-text, .production-input, .reorder-bank, .reorder-answer, .reorder-actions, .shadowing-panel, .shadowing-sentence-card, .shadowing-controls, .shadowing-assess, .shadowing-assess-buttons

---

## [1.0.0] — 2026-03-06

### Adicionado

**Arquitectura central**
- SPA com roteamento por hash — sem ferramentas de build, sem transpilação
- ES Modules: 11 ficheiros JavaScript, zero dependências externas
- CSS de três ficheiros: base (tokens) → layout (componentes) → mobile (overrides)

**Dados curriculares iniciais**
- data/levels.json: níveis A1, A2, B1
- data/modules.json: 6 módulos A1 (m01–m06)
- data/lessons.json: 3 lições completas (A1/m01/l01, A1/m01/l02, A1/m02/l01)

**Sistema de actividades Trivium**
- Etapa Gramática: Explicação, Exemplos, Escuta, Repetição (Shadowing)
- Etapa Lógica: múltipla escolha, lacuna, reorganização
- Etapa Retórica: prompts de produção com autoavaliação

**Sistema de áudio**
- AudioEngine: Web Speech API, voz en-US, rate 0.9, pitch 1.0, fallback silencioso
- ShadowingEngine: shadowing sequencial com autoavaliação

**Interface**
- Layout responsivo: duas colunas no desktop, abas no tablet, coluna única no mobile
- Paleta académica (pergaminho quente, títulos serifados), sem gamificação
- ARIA, navegação por teclado, regiões ao vivo, breadcrumb, menu hamburger

**Testes**
- tests/test-runner.js: orquestrador Node.js, zero dependências
- tests/content-tests.js: integridade de JSON
- tests/audio-tests.js: lógica do motor de áudio
