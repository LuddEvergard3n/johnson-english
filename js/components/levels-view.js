/**
 * levels-view.js — Página de seleção de nível
 * Johnson English — Laboratório de Língua
 */

import { escapeHtml as _escape } from '../utils/html-safety.js';

export const LevelsView = (() => {
  async function render({ state }) {
    let levels = [];
    try {
      levels = await state.getLevels();
    } catch (err) {
      return `
        <div class="page-container">
          <div class="notice notice--error">
            Não foi possível carregar os níveis. Verifique sua conexão e tente novamente.
          </div>
        </div>`;
    }

    const summaries = await Promise.all(levels.map((level) => state.getProgressSummary(level.id)));
    const cardsHtml = levels.map((level, index) => `
      <a href="#/level/${level.id}" class="card" aria-label="Nível ${_escape(level.label)}">
        <span class="level-badge">${_escape(level.id.toUpperCase())}</span>
        <h3 class="card-title">${_escape(level.label)}</h3>
        <p class="card-description">${_escape(level.description)}</p>
        <div class="card-progress"><span style="width:${summaries[index].percent}%"></span></div>
        <small>${summaries[index].percent}% concluído</small>
      </a>
    `).join('');

    return `
      <div class="page-container">
        <h1>Níveis</h1>
        <p class="section-subtitle">
          Escolha um nível CEFR para começar. Percorra-os em ordem —
          cada nível se apoia no anterior.
        </p>
        <div class="card-grid">
          ${cardsHtml}
        </div>
        <div class="progress-actions"><p>O progresso é salvo somente neste navegador.</p><button id="reset-progress" class="btn btn--ghost" type="button">Limpar progresso</button></div>
      </div>`;
  }

  function hydrate({ state }) {
    document.getElementById('reset-progress')?.addEventListener('click', () => {
      if (!window.confirm('Limpar todo o progresso salvo neste navegador?')) return;
      state.resetProgress();
      location.reload();
    });
  }

  return { render, hydrate };
})();
