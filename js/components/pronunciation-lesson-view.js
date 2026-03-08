/**
 * pronunciation-lesson-view.js — Renderizador de lições de pronúncia
 * Johnson English — Laboratório de Língua
 *
 * Estrutura completamente diferente das lições padrão (lesson-view.js):
 *
 *   Seção 1 — Som       : cards IPA com descrição articulatória e dica da boca
 *   Seção 2 — Palavras  : exemplos agrupados por som, com áudio por cor
 *   Seção 3 — Pares     : pares mínimos lado a lado para comparação auditiva
 *   Seção 4 — Repetição : frases com o som-alvo (usa ShadowingEngine)
 *   Seção 5 — Produção  : produção guiada
 *
 * Não tem seção de Prática (exercícios de lacuna/reorder não se aplicam).
 */

export const PronunciationLessonView = (() => {
  function _escape(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

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
      return '<div class="page-container"><p class="text-muted">Lição não encontrada.</p></div>';
    }

    /* Seções da lição de pronúncia — sem "Prática" */
    const sections = [
      { id: 'pron-sound',      label: 'Som',       icon: '🔊' },
      { id: 'pron-words',      label: 'Palavras',   icon: '📋' },
      { id: 'pron-pairs',      label: 'Pares',      icon: '⚖' },
      { id: 'pron-repetition', label: 'Repetição',  icon: '🗣' },
      { id: 'pron-production', label: 'Produção',   icon: '✍' },
    ];

    const sidebarNav = sections.map((s) => `
      <button
        class="lesson-nav-item"
        data-section="${s.id}"
        role="tab"
        aria-selected="false"
        aria-controls="${s.id}"
      >
        <span class="pron-nav-icon" aria-hidden="true">${s.icon}</span>
        ${_escape(s.label)}
      </button>`).join('');

    return `
      <div class="lesson-layout">

        <aside class="lesson-sidebar" role="navigation" aria-label="Seções da lição">
          <p class="lesson-sidebar-title">${_escape(lesson.title)}</p>
          <div class="pron-badge">Pronúncia</div>
          <nav class="lesson-nav" role="tablist" aria-label="Seções da lição">
            ${sidebarNav}
          </nav>
        </aside>

        <div class="lesson-content" role="main">

          <header class="lesson-header">
            <span class="level-badge">${_escape(levelId.toUpperCase())}</span>
            <span class="pron-type-badge">Pronúncia</span>
            <h1>${_escape(lesson.title)}</h1>
            <p class="lesson-description">${_escape(lesson.description)}</p>
          </header>

          <!-- SEÇÃO 1: Som — IPA e articulação -->
          <section id="pron-sound" class="lesson-section" hidden aria-hidden="true" role="tabpanel">
            ${_renderSoundSection(lesson)}
          </section>

          <!-- SEÇÃO 2: Palavras — exemplos por som com áudio -->
          <section id="pron-words" class="lesson-section" hidden aria-hidden="true" role="tabpanel">
            ${_renderWordsSection(lesson)}
          </section>

          <!-- SEÇÃO 3: Pares Mínimos — comparação lado a lado -->
          <section id="pron-pairs" class="lesson-section" hidden aria-hidden="true" role="tabpanel">
            ${_renderPairsSection(lesson)}
          </section>

          <!-- SEÇÃO 4: Repetição — frases com o som-alvo -->
          <section id="pron-repetition" class="lesson-section" hidden aria-hidden="true" role="tabpanel">
            ${_renderRepetitionSection(lesson)}
          </section>

          <!-- SEÇÃO 5: Produção -->
          <section id="pron-production" class="lesson-section" hidden aria-hidden="true" role="tabpanel">
            ${_renderProductionSection(lesson)}
          </section>

        </div>
      </div>`;
  }

  /* =========================================================================
     RENDERIZADORES DE SEÇÃO
     ========================================================================= */

  function _renderSoundSection(lesson) {
    const sounds = lesson.sounds || [];
    if (!sounds.length) return '<div class="page-container"><p class="text-muted">Dados de som não disponíveis.</p></div>';

    const soundCards = sounds.map((sound) => `
      <div class="sound-card sound-card--${_escape(sound.color)}">
        <div class="sound-card-header">
          <span class="ipa-symbol">${_escape(sound.symbol)}</span>
          <span class="sound-name">${_escape(sound.name)}</span>
        </div>
        <p class="sound-description">${_escape(sound.description)}</p>
        <div class="mouth-tip">
          <span class="mouth-tip-label">Posição da boca:</span>
          <span>${_escape(sound.mouth_tip)}</span>
        </div>
      </div>`).join('');

    return `
      <div class="activity-panel">
        <div class="activity-panel-header activity-panel-header--pronunciation">
          <h2 class="activity-panel-title">O Som</h2>
          <span class="stage-badge stage-badge--pronunciation">Pronúncia</span>
        </div>
        <div class="activity-panel-body">
          <div class="explanation-text">
            <p>${_escape(lesson.explanation.text)}</p>
            ${lesson.explanation.note ? `<blockquote>${_escape(lesson.explanation.note)}</blockquote>` : ''}
            ${lesson.explanation.tip  ? `<div class="notice notice--info">${_escape(lesson.explanation.tip)}</div>` : ''}
          </div>
          <div class="sound-cards">
            ${soundCards}
          </div>
        </div>
      </div>`;
  }

  function _renderWordsSection(lesson) {
    const sounds = lesson.sounds || [];
    if (!sounds.length) return '<p class="text-muted">Palavras não disponíveis.</p>';

    const soundGroups = sounds.map((sound) => `
      <div class="word-group">
        <div class="word-group-header sound-card--${_escape(sound.color)}">
          <span class="ipa-symbol ipa-symbol--small">${_escape(sound.symbol)}</span>
          <span class="sound-name">${_escape(sound.name)}</span>
        </div>
        <div class="word-group-items">
          ${(sound.words || []).map((w) => `
            <div class="word-audio-row">
              <button
                class="btn btn--audio"
                data-text="${_escapeAttr(w.en)}"
                aria-label="Ouvir: ${_escapeAttr(w.en)}"
                aria-pressed="false"
              >&#9654;</button>
              <div class="word-audio-text">
                <strong class="word-en" lang="en">${_escape(w.en)}</strong>
                <span class="word-pt">${_escape(w.pt)}</span>
              </div>
              <span class="audio-status" aria-live="polite"></span>
            </div>`).join('')}
        </div>
      </div>`).join('');

    return `
      <div class="activity-panel">
        <div class="activity-panel-header activity-panel-header--pronunciation">
          <h2 class="activity-panel-title">Palavras</h2>
          <span class="stage-badge stage-badge--pronunciation">Pronúncia</span>
        </div>
        <div class="activity-panel-body">
          <p class="instruction-text text-muted text-small">
            Ouça cada palavra. Observe a diferença entre os dois sons.
            Clique várias vezes para comparar.
          </p>
          <div class="word-groups">
            ${soundGroups}
          </div>
        </div>
      </div>`;
  }

  function _renderPairsSection(lesson) {
    const pairs  = lesson.minimal_pairs || [];
    const sounds = lesson.sounds || [];
    if (!pairs.length) return '<p class="text-muted">Pares mínimos não disponíveis.</p>';

    /* Cores dos sons para os botões dos pares */
    const colorA = sounds[0]?.color || 'grammar';
    const colorB = sounds[1]?.color || 'logic';

    const pairRows = pairs.map((pair, i) => `
      <div class="pair-row" id="pair-${i}">
        <div class="pair-side pair-side--a">
          <button
            class="btn btn--audio pair-btn pair-btn--${_escape(colorA)}"
            data-text="${_escapeAttr(pair.a)}"
            aria-label="Ouvir: ${_escapeAttr(pair.a)}"
          >&#9654;</button>
          <span class="pair-word" lang="en">${_escape(pair.a)}</span>
          <span class="audio-status" aria-live="polite"></span>
        </div>
        <div class="pair-vs">vs</div>
        <div class="pair-side pair-side--b">
          <button
            class="btn btn--audio pair-btn pair-btn--${_escape(colorB)}"
            data-text="${_escapeAttr(pair.b)}"
            aria-label="Ouvir: ${_escapeAttr(pair.b)}"
          >&#9654;</button>
          <span class="pair-word" lang="en">${_escape(pair.b)}</span>
          <span class="audio-status" aria-live="polite"></span>
        </div>
        ${pair.note ? `<p class="pair-note text-small text-muted">${_escape(pair.note)}</p>` : ''}
      </div>`).join('');

    return `
      <div class="activity-panel">
        <div class="activity-panel-header activity-panel-header--pronunciation">
          <h2 class="activity-panel-title">Pares Mínimos</h2>
          <span class="stage-badge stage-badge--pronunciation">Pronúncia</span>
        </div>
        <div class="activity-panel-body">
          <p class="instruction-text text-muted text-small">
            Ouça os dois sons lado a lado. A única diferença é o som que você está estudando.
            Alterne entre os dois botões várias vezes até sentir a distinção.
          </p>
          <div class="pairs-list">
            ${pairRows}
          </div>
        </div>
      </div>`;
  }

  function _renderRepetitionSection(lesson) {
    const items = lesson.repetition || [];
    if (!items.length) return '<p class="text-muted">Frases de repetição não disponíveis.</p>';

    const jsonData = JSON.stringify(
      items.map((i) => ({ text: i.text, translation: i.translation }))
    );

    return `
      <div class="activity-panel">
        <div class="activity-panel-header activity-panel-header--pronunciation">
          <h2 class="activity-panel-title">Repetição</h2>
          <span class="stage-badge stage-badge--pronunciation">Pronúncia</span>
        </div>
        <div class="activity-panel-body">
          <p class="instruction-text text-muted text-small">
            Ouça a frase completa. Depois repita em voz alta, prestando atenção especial
            nos sons estudados. A tradução está disponível para referência.
          </p>
          <div id="shadowing-mount"></div>
          <div id="shadowing-data" hidden aria-hidden="true">${_escape(jsonData)}</div>
        </div>
      </div>`;
  }

  function _renderProductionSection(lesson) {
    const prompts = lesson.production || [];
    if (!prompts.length) return '<p class="text-muted">Atividade de produção não disponível.</p>';

    return `
      <div class="activity-panel">
        <div class="activity-panel-header activity-panel-header--pronunciation">
          <h2 class="activity-panel-title">Produção</h2>
          <span class="stage-badge stage-badge--pronunciation">Pronúncia</span>
        </div>
        <div class="activity-panel-body">
          <p class="instruction-text text-muted text-small">
            Diga as frases em voz alta antes de escrever.
            Grave-se se possível — ouvir a si mesmo acelera a correção.
          </p>
          ${prompts.map((p, i) => `
            <div class="exercise" data-production-index="${i}">
              <p class="exercise-prompt">${_escape(p.prompt)}</p>
              <textarea
                class="production-input"
                rows="3"
                placeholder="Escreva sua resposta aqui…"
                aria-label="Sua resposta"
              ></textarea>
              ${p.hint ? `<p class="text-small text-muted hint-text">Dica: ${_escape(p.hint)}</p>` : ''}
            </div>`).join('')}
          <div id="production-feedback"></div>
        </div>
      </div>`;
  }

  return { render };
})();
