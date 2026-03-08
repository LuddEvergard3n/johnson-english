/**
 * lesson-view.js — Renderizador da página de lição completa
 * Johnson English — Laboratório de Língua
 *
 * Toda a interface de navegação e instrução está em português.
 * O conteúdo em inglês (exemplos, escuta, repetição) aparece sempre
 * acompanhado da tradução em português ao lado, até o nível B1.
 *
 * NOTA DE IMPLEMENTAÇÃO: os dados do shadowing são embutidos em uma
 * <div hidden> com texto JSON ao invés de <script type="application/json">
 * porque o Firefox bloqueia qualquer tag <script> via CSP script-src-elem,
 * independentemente do atributo type.
 */

export const LessonView = (() => {
  function _escape(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /**
   * Escapa uma string para uso seguro dentro de um atributo HTML.
   * Mais restrito que _escape: também escapa aspas simples.
   */
  function _escapeAttr(str) {
    return _escape(str).replace(/'/g, '&#39;');
  }

  async function render({ params, state }) {
    const [levelId, moduleId, lessonId] = params;

    if (!levelId || !moduleId || !lessonId) {
      return '<div class="page-container"><p class="text-muted">URL de lição inválida.</p></div>';
    }

    let lesson;
    try {
      lesson = await state.getLessonAsync(levelId, moduleId, lessonId);
    } catch (err) {
      return `<div class="page-container">
        <div class="notice notice--error">Não foi possível carregar os dados da lição.</div>
      </div>`;
    }

    if (!lesson) {
      return `<div class="page-container">
        <div class="notice notice--warning">Lição não encontrada.</div>
      </div>`;
    }

    /* Seções com rótulos em português. Estágio Trivium entre parênteses. */
    const sections = [
      { id: 'section-explanation', label: 'Explicação',  stage: 'grammar'  },
      { id: 'section-examples',    label: 'Exemplos',    stage: 'grammar'  },
      { id: 'section-listening',   label: 'Escuta',      stage: 'grammar'  },
      { id: 'section-repetition',  label: 'Repetição',   stage: 'grammar'  },
      { id: 'section-practice',    label: 'Prática',     stage: 'logic'    },
      { id: 'section-production',  label: 'Produção',    stage: 'rhetoric' },
    ];

    /* Rótulos do estágio em português para a badge */
    const stagePT = { grammar: 'G', logic: 'L', rhetoric: 'R' };

    const sidebarNav = sections.map((s) => `
      <button
        class="lesson-nav-item"
        data-section="${s.id}"
        role="tab"
        aria-selected="false"
        aria-controls="${s.id}"
      >
        <span class="stage-badge stage-badge--${s.stage}" style="margin-right:0.5rem">${stagePT[s.stage]}</span>
        ${_escape(s.label)}
      </button>`).join('');

    return `
      <div class="lesson-layout">

        <aside class="lesson-sidebar" role="navigation" aria-label="Seções da lição">
          <p class="lesson-sidebar-title">${_escape(lesson.title)}</p>
          <nav class="lesson-nav" role="tablist" aria-label="Seções da lição">
            ${sidebarNav}
          </nav>
        </aside>

        <div class="lesson-content" role="main">

          <header class="lesson-header">
            <span class="level-badge">${_escape(levelId.toUpperCase())}</span>
            <h1>${_escape(lesson.title)}</h1>
            <p class="lesson-description">${_escape(lesson.description)}</p>
          </header>

          <!-- SEÇÃO 1: Explicação (Gramática) -->
          <section id="section-explanation" class="lesson-section" hidden aria-hidden="true" role="tabpanel">
            <div class="activity-panel">
              <div class="activity-panel-header activity-panel-header--grammar">
                <h2 class="activity-panel-title">Explicação</h2>
                <span class="stage-badge stage-badge--grammar">Gramática</span>
              </div>
              <div class="activity-panel-body">
                ${_renderExplanation(lesson)}
              </div>
            </div>
          </section>

          <!-- SEÇÃO 2: Exemplos (Gramática) -->
          <section id="section-examples" class="lesson-section" hidden aria-hidden="true" role="tabpanel">
            <div class="activity-panel">
              <div class="activity-panel-header activity-panel-header--grammar">
                <h2 class="activity-panel-title">Exemplos</h2>
                <span class="stage-badge stage-badge--grammar">Gramática</span>
              </div>
              <div class="activity-panel-body">
                ${_renderExamples(lesson)}
              </div>
            </div>
          </section>

          <!-- SEÇÃO 3: Escuta (Gramática) -->
          <section id="section-listening" class="lesson-section" hidden aria-hidden="true" role="tabpanel">
            <div class="activity-panel">
              <div class="activity-panel-header activity-panel-header--grammar">
                <h2 class="activity-panel-title">Escuta</h2>
                <span class="stage-badge stage-badge--grammar">Gramática</span>
              </div>
              <div class="activity-panel-body">
                ${_renderListening(lesson)}
              </div>
            </div>
          </section>

          <!-- SEÇÃO 4: Repetição / Shadowing (Gramática) -->
          <section id="section-repetition" class="lesson-section" hidden aria-hidden="true" role="tabpanel">
            <div class="activity-panel">
              <div class="activity-panel-header activity-panel-header--grammar">
                <h2 class="activity-panel-title">Repetição</h2>
                <span class="stage-badge stage-badge--grammar">Gramática</span>
              </div>
              <div class="activity-panel-body" id="repetition-body">
                ${_renderRepetition(lesson)}
              </div>
            </div>
          </section>

          <!-- SEÇÃO 5: Prática (Lógica) -->
          <section id="section-practice" class="lesson-section" hidden aria-hidden="true" role="tabpanel">
            <div class="activity-panel">
              <div class="activity-panel-header activity-panel-header--logic">
                <h2 class="activity-panel-title">Prática</h2>
                <span class="stage-badge stage-badge--logic">Lógica</span>
              </div>
              <div class="activity-panel-body" id="practice-body">
                ${_renderPractice(lesson)}
              </div>
            </div>
          </section>

          <!-- SEÇÃO 6: Produção (Retórica) -->
          <section id="section-production" class="lesson-section" hidden aria-hidden="true" role="tabpanel">
            <div class="activity-panel">
              <div class="activity-panel-header activity-panel-header--rhetoric">
                <h2 class="activity-panel-title">Produção</h2>
                <span class="stage-badge stage-badge--rhetoric">Retórica</span>
              </div>
              <div class="activity-panel-body" id="production-body">
                ${_renderProduction(lesson)}
              </div>
            </div>
          </section>

        </div>
      </div>`;
  }

  /* =========================================================================
     RENDERIZADORES DE SEÇÃO
     ========================================================================= */

  function _renderExplanation(lesson) {
    const exp = lesson.explanation;
    if (!exp) return '<p class="text-muted">Explicação não disponível.</p>';
    return `
      <div class="explanation-text">
        <p>${_escape(exp.text)}</p>
        ${exp.note ? `<blockquote>${_escape(exp.note)}</blockquote>` : ''}
        ${exp.tip  ? `<div class="notice notice--info">${_escape(exp.tip)}</div>` : ''}
      </div>`;
  }

  function _renderExamples(lesson) {
    const examples = lesson.examples || [];
    if (!examples.length) return '<p class="text-muted">Nenhum exemplo disponível.</p>';

    return `
      <p class="text-muted text-small instruction-text">
        Clique em ▶ para ouvir cada exemplo. A tradução aparece abaixo.
      </p>
      ${examples.map((ex) => `
        <div class="audio-player">
          <button
            class="btn btn--audio"
            data-text="${_escapeAttr(ex.en)}"
            aria-label="Ouvir: ${_escapeAttr(ex.en)}"
            aria-pressed="false"
          >&#9654;</button>
          <div class="audio-player-text">
            <strong lang="en">${_escape(ex.en)}</strong>
            ${ex.pt ? `<p class="audio-player-transcript">${_escape(ex.pt)}</p>` : ''}
          </div>
          <span class="audio-status" aria-live="polite"></span>
        </div>`).join('')}`;
  }

  function _renderListening(lesson) {
    const items = lesson.listening || [];
    if (!items.length) return '<p class="text-muted">Nenhum exercício de escuta disponível.</p>';

    return `
      <p class="text-muted text-small instruction-text">
        Ouça cada frase. Concentre-se no som e no ritmo antes do significado.
        A tradução está disponível para apoio.
      </p>
      ${items.map((item) => `
        <div class="audio-player">
          <button
            class="btn btn--audio"
            data-text="${_escapeAttr(item.text)}"
            aria-label="Ouvir frase"
            aria-pressed="false"
          >&#9654;</button>
          <div class="audio-player-text">
            <p lang="en">${_escape(item.text)}</p>
            ${item.translation ? `<p class="audio-player-transcript">${_escape(item.translation)}</p>` : ''}
          </div>
          <span class="audio-status" aria-live="polite"></span>
        </div>`).join('')}`;
  }

  function _renderRepetition(lesson) {
    const items = lesson.repetition || lesson.listening || [];
    if (!items.length) return '<p class="text-muted">Nenhum exercício de repetição disponível.</p>';

    /*
     * Os dados do shadowing são embutidos em uma <div hidden> com JSON como
     * textContent. Isso evita o bloqueio de CSP que afeta tags <script>,
     * mesmo quando type="application/json" (comportamento do Firefox).
     */
    const jsonData = JSON.stringify(
      items.map((i) => ({ text: i.text || i.en, translation: i.translation || i.pt }))
    );

    return `
      <p class="text-muted text-small instruction-text">
        Ouça a frase e repita em voz alta, imitando o ritmo e a entonação do falante.
        Avalie você mesmo: você acertou? A tradução está disponível para referência.
      </p>
      <div id="shadowing-mount"></div>
      <div id="shadowing-data" hidden aria-hidden="true">${_escape(jsonData)}</div>`;
  }

  function _renderPractice(lesson) {
    const exercises = lesson.practice || [];
    if (!exercises.length) return '<p class="text-muted">Nenhum exercício de prática disponível ainda.</p>';

    return `
      <p class="text-muted text-small instruction-text">
        Responda cada exercício em inglês.
      </p>
      ${exercises.map((ex, i) => _renderExercise(ex, i)).join('')}`;
  }

  function _renderProduction(lesson) {
    const prompts = lesson.production || [];
    if (!prompts.length) return '<p class="text-muted">Nenhuma atividade de produção disponível ainda.</p>';

    return `
      <p class="text-muted text-small instruction-text">
        Responda cada pergunta em inglês. Escreva sua resposta e, se possível,
        diga-a em voz alta antes de registrar.
      </p>
      ${prompts.map((p, i) => `
        <div class="exercise" data-production-index="${i}">
          <p class="exercise-prompt">${_escape(p.prompt)}</p>
          <textarea
            class="production-input"
            rows="3"
            placeholder="Escreva sua resposta em inglês aqui…"
            aria-label="Sua resposta"
          ></textarea>
          ${p.hint ? `<p class="text-small text-muted hint-text">Dica: ${_escape(p.hint)}</p>` : ''}
        </div>`).join('')}
      <div id="production-feedback"></div>`;
  }

  function _renderExercise(ex, index) {
    const id = `ex-${index}`;
    switch (ex.type) {
      case 'multiple-choice': return _renderMultipleChoice(ex, id);
      case 'fill-blank':      return _renderFillBlank(ex, id);
      case 'reorder':         return _renderReorder(ex, id);
      default: return `<p class="text-muted">Tipo de exercício desconhecido: ${_escape(ex.type)}</p>`;
    }
  }

  function _renderMultipleChoice(ex, id) {
    const optionsHtml = (ex.options || []).map((opt, i) => `
      <button
        class="exercise-option"
        data-exercise="${id}"
        data-option="${i}"
        data-correct="${opt === ex.answer ? 'true' : 'false'}"
        aria-pressed="false"
      >${_escape(opt)}</button>`).join('');

    return `
      <div class="exercise" id="${id}" data-type="multiple-choice" data-answer="${_escapeAttr(ex.answer)}">
        <p class="exercise-prompt">${_escape(ex.prompt)}</p>
        <div class="exercise-options" role="group" aria-label="Opções">
          ${optionsHtml}
        </div>
        <div class="exercise-feedback" aria-live="polite"></div>
      </div>`;
  }

  function _renderFillBlank(ex, id) {
    const promptHtml = _escape(ex.prompt).replace(
      /\[BLANK\]/g,
      `<input
         type="text"
         class="blank-input"
         data-exercise="${id}"
         aria-label="Complete a lacuna"
         autocomplete="off"
         spellcheck="false"
       />`
    );
    return `
      <div class="exercise" id="${id}" data-type="fill-blank" data-answer="${_escapeAttr(ex.answer)}">
        <p class="exercise-prompt">${promptHtml}</p>
        <button class="btn btn--secondary btn--check" data-exercise="${id}">Verificar</button>
        <div class="exercise-feedback" aria-live="polite"></div>
      </div>`;
  }

  function _renderReorder(ex, id) {
    const words    = ex.words || [];
    const shuffled = [...words].sort(() => Math.random() - 0.5);

    const wordButtons = shuffled.map((w, i) => `
      <button
        class="btn btn--ghost word-tile"
        data-exercise="${id}"
        data-word="${_escapeAttr(w)}"
        data-index="${i}"
      >${_escape(w)}</button>`).join('');

    return `
      <div class="exercise" id="${id}" data-type="reorder" data-answer="${_escapeAttr(ex.words.join(' '))}">
        <p class="exercise-prompt">${_escape(ex.prompt)}</p>
        <div class="reorder-bank" data-exercise="${id}">
          ${wordButtons}
        </div>
        <div class="reorder-answer" data-exercise="${id}" aria-label="Sua frase"></div>
        <div class="reorder-actions">
          <button class="btn btn--secondary btn--check-reorder" data-exercise="${id}">Verificar</button>
          <button class="btn btn--ghost btn--reset-reorder" data-exercise="${id}">Recomeçar</button>
        </div>
        <div class="exercise-feedback" aria-live="polite"></div>
      </div>`;
  }

  return { render };
})();
