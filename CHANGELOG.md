# Changelog — Johnson English

Todas as mudanças notáveis neste projeto estão documentadas neste arquivo.
Formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).
Versões mais recentes primeiro.

---

## [2.0.1] — 2026-07-24 (3ª rodada — infraestrutura de testes)

### Corrigido

**`content-tests-a2.js` nunca rodava — 1109 asserções órfãs**
- O arquivo existia desde a formação original do nível A2, mas usava um
  formato próprio (`process.exit()` direto, sem exportar `run()`)
  incompatível com `test-runner.js`, então nunca esteve na lista de
  suítes executadas. Rodando standalone, **4 das suas asserções
  falhavam de verdade**: esperava 7 módulos A2 / 26 lições (contagens de
  quando o arquivo foi escrito), mas o currículo A2 já tinha crescido
  para 11 módulos / 42 lições (adição dos módulos m44–m47) sem que
  ninguém percebesse a regressão, porque o teste nunca rodava.
  Reescrito para o formato `describe`/`it`/`assert` compartilhado, com
  as contagens corrigidas para a estrutura atual, e conectado em
  `test-runner.js`. Suíte total: 106 → **1215 testes**.

**Duplicação de lógica entre testes e produção**
- `tests/audio-tests.js` mantinha cópias manuais de `sanitiseText`
  (audio-engine.js) e `parseHash` (router.js) em vez de importar as
  funções reais — se a regex de sanitização ou o parsing de hash
  mudasse em produção sem atualizar a cópia do teste, a suíte
  continuaria verde validando uma implementação que já não existia.
  `sanitiseText` e `parseHash` agora são exports nomeados de nível de
  módulo (antes eram funções privadas dentro do IIFE de `AudioEngine`/
  `Router`) — mesma lógica, mesmo comportamento, agora testável
  diretamente. `audio-tests.js` importa as duas via `import()` dinâmico
  (necessário porque `test-runner.js` é CommonJS e os módulos do
  projeto são ES Modules).
- Isso expôs um problema secundário: `router.js` resolvia
  `document.getElementById('app-root'/'breadcrumb')` no momento da
  avaliação do módulo (fora de qualquer função), então importar
  `router.js` — mesmo só para pegar `parseHash` — quebrava em ambiente
  sem DOM (Node puro do test-runner). Corrigido: resolução de
  `appRoot`/`breadcrumbEl` passou a ser preguiçosa (só busca no DOM
  quando uma função do Router é de fato chamada), sem nenhuma mudança
  de comportamento em produção — confirmado com teste funcional via
  jsdom simulando `Router.init()` e navegação real por hash.

**Bug de ordenação na saída do próprio framework de testes**
- `it()` era declarada `async function` incondicionalmente, então
  mesmo testes 100% síncronos (todos os do projeto) tinham seu
  `console.log` de resultado adiado para um microtask — os cabeçalhos
  de `describe()` de suítes diferentes apareciam todos agrupados antes
  dos `✓`/`✗` correspondentes, em vez de intercalados na ordem certa.
  As contagens de passou/falhou sempre estiveram corretas; só a leitura
  da saída ficava confusa para depuração. Corrigido: `it()` só recorre
  a Promise quando o corpo do teste de fato retorna algo "thenable".

### Estatísticas
- Testes: **1215/1215** (106 + 1109 do A2 recém-conectado)

---

## [2.0.1] — 2026-07-24

### Corrigido — Auditoria completa (2ª rodada)

**Bancos de palavras de reorder desalinhados da resposta — 37 de 197 exercícios**
- `data/lessons.json`: auditoria sistêmica (diff de multiset entre `words` e
  os tokens de `answer`) encontrou 38 exercícios de reorder — todos na
  posição `practice[4]` de suas lições — em que o banco de palavras não
  contém exatamente os tokens necessários para montar a resposta correta:
  tiles faltando, sobrando, duplicados, ou com a forma verbal errada
  (ex.: "agrees" no banco quando a resposta pede "agree" após "does").
  37 foram corrigidos ressincronizando o banco com a `answer` (que se
  confirmou correta contra os próprios exemplos/explicações de cada
  lição); 2 desses 37 também precisavam de correção na própria `answer`:
  - **a2/m11/l02**: faltava a preposição "from" — "I'm working home" →
    "I'm working **from** home" (confirmado pelo exemplo da lição:
    "I usually work in an office, but today I'm working from home.")
  - **c2/m38/l04**: o banco tinha palavras de um rascunho anterior da
    frase ("decision"+"came"); resincronizado para a versão final e
    correta já armazenada em `answer` ("decided"), que reflete
    literalmente o exemplo AFTER da própria lição sobre concisão.
  1 exercício (**c1/m53/l02**) ficou com a `answer` truncada — termina
  em "— is" sem completar a frase (o exemplo da lição termina em
  "...is causality."). Não foi corrigido: completar a frase exigiria
  inventar conteúdo que não estava nos dados originais. Fica sinalizado
  para revisão manual.

**Multiple-choice e demais tipos de exercício — auditados, sem problemas**
- Verificação sistêmica confirmou que todos os 392 exercícios
  multiple-choice têm `answer` presente entre as `options`, sem
  duplicatas. `production`, `listening`, `repetition` e `vocabulary`
  também auditados; a ausência de tradução (`pt`/`translation`) em
  C1/C2 é decisão de design (imersão total), não bug.

**"undefined" visível em lições de pronúncia C1/C2**
- `pronunciation-lesson-view.js`: `w.pt` era renderizado sem proteção
  condicional, ao contrário do padrão usado em todo o resto do código.
  Como C1/C2 não têm tradução por design, a palavra literal "undefined"
  aparecia na tela ao lado de 48 itens em 4 lições
  (c1/m34/l01, c1/m34/l02, c2/m41/l01, c2/m41/l02). Corrigido para
  seguir o mesmo padrão condicional (`w.pt ? ... : ''`) já usado nos
  demais campos opcionais do projeto.

**Botão "Limpar" do Gerador de Plano de Aula não limpava tudo**
- `lesson-plan-engine.js`: `limpar()` resetava os campos de texto e os
  checkboxes de Objetivos/Atividades (via `onNivel()`), mas não os de
  Recursos Didáticos e Avaliação — esses são fixos e independentes de
  nível, então `onNivel()` nunca os alcançava. Um professor que
  marcasse esses checkboxes e clicasse em Limpar via as marcações
  permanecerem. Corrigido: `limpar()` agora re-renderiza os 4 painéis.

**Documentação — resíduos remanescentes do servidor TTS removido**
- `index.html`: comentário do banner de áudio ainda dizia "aparece ao
  detectar o backend" (sistema pré-v1.9.0); corrigido para refletir o
  gatilho real (ausência de suporte à Web Speech API no navegador).
  CSP recomendada no `<head>` ainda sugeria liberar `connect-src` para
  um servidor TTS inexistente; removido.

### Estatísticas
- Testes: 106/106
- Exercícios de reorder auditados: 197/197 (37 corrigidos, 1 sinalizado)
- Exercícios multiple-choice auditados: 392/392 (0 problemas)

---

## [2.0.1] — 2026-07-24 (1ª rodada)

### Corrigido

**Exercícios de reorganização (reorder) — bug crítico**
- `lesson-view.js`: o gabarito (`data-answer`) era montado a partir de `ex.words.join(' ')`
  — a ordem já embaralhada armazenada no JSON — em vez do campo `ex.answer`, que contém
  a frase correta de fato. Afetava os 197 exercícios de reorder de todo o currículo
  (A1–C2): não havia forma pedagogicamente correta de acertá-los.
- `lesson-view.js`: embaralhamento do banco de palavras trocado de
  `array.sort(() => Math.random() - 0.5)` (enviesado) para Fisher-Yates uniforme.

**Conclusão prematura da etapa Prática**
- `logic-engine.js`: `_checkAllComplete` verificava apenas os exercícios do mesmo
  tipo recém-respondido (`multiple-choice`, `fill-blank` ou `reorder`
  isoladamente). Como toda lição com prática mistura os três tipos no mesmo
  array, a etapa era marcada como concluída assim que só um tipo fosse
  finalizado, ignorando os demais. Corrigido para exigir todos os exercícios
  da etapa, independentemente do tipo.

**Shadowing — barra de progresso**
- `shadowing-engine.js`: a percentagem usava o índice 0-based da frase atual
  e nunca chegava a 100%, mesmo na última frase. Corrigido para refletir a
  frase em andamento (1-based).

**Navegação do Guia do Professor — bug crítico**
- `teacher-guide-view.js`: os 11 links do índice lateral usavam fragmentos
  simples (`#trivium`, `#estrutura`...) sem o prefixo `#/` das rotas do
  app. Como o router trata qualquer mudança de hash como navegação,
  clicar em qualquer um desses links levava à página "Não encontrada",
  substituindo o guia inteiro. Corrigido interceptando os cliques e
  fazendo scroll manual, sem tocar em `location.hash` — nova função
  `TeacherGuideView.hydrate()`, registrada em `router.js`.

**Fill-blank com múltiplas lacunas no mesmo prompt**
- `logic-engine.js`: exercícios com dois `[BLANK]` no mesmo prompt (5 no
  currículo) validavam apenas o primeiro campo (`querySelector` em vez de
  `querySelectorAll`) — a segunda lacuna podia ficar vazia ou errada e o
  exercício ainda marcava "Correto!". Corrigido para validar todos os
  campos.
- `data/lessons.json`: 3 desses 5 exercícios exigem palavras diferentes em
  cada lacuna (ex.: "can" / "can't"), mas o modelo de dados só suportava
  um `answer` compartilhado. Adicionado campo opcional `answers` (array,
  uma resposta por lacuna); os outros 391 fill-blank do currículo
  continuam usando `answer` (string única) sem alteração. Respostas
  corrigidas com base nos próprios exemplos e explicações de cada lição:
  - "I `[can]` swim, but I `[can't]` drive." (m04/l03)
  - "I usually `[drink]` coffee, but today I `[am drinking]` tea." (m11/l02)
  - "She `[lives]` in Brasília, but she `[is staying]` in São Paulo this
    week." (m11/l02)
- `lesson-view.js`: `_renderFillBlank` agora emite `data-answers` (JSON)
  quando `ex.answers` está presente.
- `tests/content-tests.js`: novo teste garante que todo fill-blank com
  2+ `[BLANK]` e `answers` definido tem exatamente um item por lacuna.

**Produção — campos travados antes da hora**
- `rhetoric-engine.js`: campos já preenchidos eram desabilitados mesmo
  quando a submissão inteira era rejeitada por outro campo vazio,
  impedindo revisão antes de completar o resto. Corrigido: só desabilita
  depois que todos os campos passam na validação.

**Áudio "fantasma"**
- `audio-engine.js`: clicar num botão de áudio enquanto outro já tocava
  nunca resetava a UI do botão anterior — ficava preso mostrando
  "Reproduzindo…" indefinidamente, porque o `onerror` de interrupção do
  Speech Synthesis retorna cedo sem notificar o chamador. Corrigido
  rastreando o botão ativo e resetando-o proativamente ao trocar.

**Selo de versão desatualizado**
- `about-view.js`: "Sobre" mostrava `v1.9` fixo no HTML; corrigido para
  `v2.0.1`, com comentário lembrando de atualizar a cada release.

### Alterado — Remoção de redundâncias

- Nova fonte única `js/utils/html-safety.js` (`escapeHtml` / `escapeAttr`),
  substituindo 9 implementações independentes e ligeiramente divergentes da
  mesma função de escape de HTML (`_escape`, `_escapeAttr`, `_esc`), antes
  duplicadas em: `router.js`, `shadowing-engine.js`, `lesson-view.js`,
  `pronunciation-lesson-view.js`, `levels-view.js`, `module-view.js`,
  `about-view.js`, `feedback-engine.js` e `lesson-plan-engine.js`.
- `rhetoric-engine.js` e `shadowing-engine.js`: mensagens de feedback
  construídas manualmente via `innerHTML` substituídas por chamadas ao
  `FeedbackEngine` já existente, eliminando markup duplicado.
- `server/` (integração Coqui TTS, já dada como removida no changelog da
  v1.9.0 mas ainda presente no repositório como código órfão) removido
  definitivamente do repositório.
- `docs/architecture.md`, `README.md`, `docs/development-guide.md`:
  referências obsoletas ao servidor Flask, rate limiting server-side e
  `_escape()` corrigidas para refletir o estado real do código
  (Web Speech API pura, sem servidor; escape centralizado em `js/utils/`).

### Estatísticas
- Testes: 106/106

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
