/**
 * module-view.js — Página de módulos e lições
 * Johnson English — Laboratório de Língua
 *
 * Lida com duas formas de rota:
 *   #/level/{levelId}              → lista todos os módulos do nível
 *   #/module/{levelId}/{moduleId}  → lista todas as lições do módulo
 */

export const ModuleView = (() => {
  function _escape(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  async function render({ route, params, state }) {
    if (route === 'level') {
      return _renderModuleList(params[0], state);
    }
    if (route === 'module' && params[1]) {
      return _renderLessonList(params[0], params[1], state);
    }
    return '<div class="page-container"><p class="text-muted">Página não encontrada.</p></div>';
  }

  async function _renderModuleList(levelId, state) {
    let level, modules;
    try {
      level   = await state.getLevel(levelId);
      modules = await state.getModulesForLevel(levelId);
    } catch (err) {
      return `<div class="page-container">
        <div class="notice notice--error">Não foi possível carregar os módulos.</div>
      </div>`;
    }

    if (!level) {
      return `<div class="page-container">
        <div class="notice notice--warning">Nível "${_escape(levelId)}" não encontrado.</div>
      </div>`;
    }

    const cardsHtml = modules.map((mod) => `
      <a href="#/module/${_escape(levelId)}/${_escape(mod.id)}" class="card">
        <span class="level-badge">${_escape(levelId.toUpperCase())}</span>
        <h3 class="card-title">${_escape(mod.title)}</h3>
        <p class="card-description">${_escape(mod.description)}</p>
      </a>`).join('');

    return `
      <div class="page-container">
        <p class="hero-eyebrow">Nível ${_escape(levelId.toUpperCase())}</p>
        <h1>${_escape(level.label)}</h1>
        <p class="section-subtitle">${_escape(level.description)}</p>
        <div class="card-grid">
          ${cardsHtml || '<p class="text-muted">Nenhum módulo disponível ainda.</p>'}
        </div>
      </div>`;
  }

  async function _renderLessonList(levelId, moduleId, state) {
    let mod, lessons;
    try {
      mod     = state.getModule(levelId, moduleId)
                 || await state.getModulesForLevel(levelId).then((ms) =>
                      ms.find((m) => m.id === moduleId.toLowerCase()) || null);
      lessons = await state.getLessonsForModule(levelId, moduleId);
    } catch (err) {
      return `<div class="page-container">
        <div class="notice notice--error">Não foi possível carregar as lições.</div>
      </div>`;
    }

    const cardsHtml = lessons.map((lesson, i) => `
      <a href="#/lesson/${_escape(levelId)}/${_escape(moduleId)}/${_escape(lesson.id)}" class="card">
        <span class="card-eyebrow">Lição ${i + 1}</span>
        <h3 class="card-title">${_escape(lesson.title)}</h3>
        <p class="card-description">${_escape(lesson.description)}</p>
      </a>`).join('');

    return `
      <div class="page-container">
        <p class="hero-eyebrow">${_escape(levelId.toUpperCase())}</p>
        <h1>${mod ? _escape(mod.title) : _escape(moduleId)}</h1>
        ${mod ? `<p class="section-subtitle">${_escape(mod.description)}</p>` : ''}
        <div class="card-grid">
          ${cardsHtml || '<p class="text-muted">Nenhuma lição disponível ainda.</p>'}
        </div>
      </div>`;
  }

  return { render };
})();
