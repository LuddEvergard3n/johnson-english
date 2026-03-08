/**
 * levels-view.js — Página de seleção de nível
 * Johnson English — Laboratório de Língua
 */

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

    const cardsHtml = levels.map((level) => `
      <a href="#/level/${level.id}" class="card" aria-label="Nível ${_escape(level.label)}">
        <span class="level-badge">${_escape(level.id.toUpperCase())}</span>
        <h3 class="card-title">${_escape(level.label)}</h3>
        <p class="card-description">${_escape(level.description)}</p>
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
      </div>`;
  }

  function _escape(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  return { render };
})();
