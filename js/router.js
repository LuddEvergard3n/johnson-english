/**
 * router.js — Hash-based single-page application router
 * Johnson English Language Laboratory
 *
 * Responsibilities:
 *   - Parse window.location.hash to determine the current route.
 *   - Map routes to view-rendering functions.
 *   - Inject rendered HTML into #app-root.
 *   - Update breadcrumb navigation on every route change.
 *
 * Route format:   #/{route}/{param1}/{param2}
 * Examples:
 *   #/               → home
 *   #/levels         → levels list
 *   #/level/a1       → modules for level A1
 *   #/module/a1/m01  → lessons for module m01 within A1
 *   #/lesson/a1/m01/l01  → lesson content
 *   #/about          → about page
 *
 * Design decision: hash routing is used (not History API) so the site works
 * on GitHub Pages without a server-side redirect configuration.
 */

import { HomeView }    from './components/home-view.js';
import { LevelsView }  from './components/levels-view.js';
import { ModuleView }  from './components/module-view.js';
import { LessonView }              from './components/lesson-view.js';
import { PronunciationLessonView } from './components/pronunciation-lesson-view.js';
import { AboutView }   from './components/about-view.js';
import { NotFoundView } from './components/not-found-view.js';

export const Router = (() => {
  /**
   * Route table: maps a route name to a view factory function.
   * Each factory receives (params, state, audio) and returns a Promise<string>
   * resolving to the HTML to inject into #app-root.
   *
   * @type {Record<string, Function>}
   */
  const ROUTES = {
    '':       HomeView.render,
    'home':   HomeView.render,
    'levels': LevelsView.render,
    'level':  ModuleView.render,   /* #/level/{levelId}              → module list */
    'module': ModuleView.render,   /* #/module/{levelId}/{moduleId}  → lesson list */
    'lesson': _lessonDispatcher,   /* #/lesson/{levelId}/{moduleId}/{lessonId} — despacha por tipo */
    'about':  AboutView.render,
  };

  /** @type {HTMLElement} */
  const appRoot = document.getElementById('app-root');

  /** @type {HTMLElement} */
  const breadcrumbEl = document.getElementById('breadcrumb');

  /**
   * Parse the current hash into a structured route object.
   *
   * @param {string} hash  e.g. "#/lesson/a1/m01/l01"
   * @returns {{ route: string, params: string[] }}
   */
  function parseHash(hash) {
    /* Strip leading "#/" and split on "/" */
    const parts  = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    const route  = parts[0] || '';
    const params = parts.slice(1);
    return { route, params };
  }

  /**
   * Build and inject breadcrumb links based on the current route.
   *
   * @param {string}   route
   * @param {string[]} params
   * @param {object}   state
   */
  function renderBreadcrumb(route, params, state) {
    const items = [{ label: 'Início', href: '#/' }];

    if (route === 'levels' || route === 'level' || route === 'module' || route === 'lesson') {
      items.push({ label: 'Níveis', href: '#/levels' });
    }

    if ((route === 'level' || route === 'module' || route === 'lesson') && params[0]) {
      const levelId = params[0].toUpperCase();
      items.push({ label: levelId, href: `#/level/${params[0]}` });
    }

    if ((route === 'module' || route === 'lesson') && params[1]) {
      /* Try to look up the module name from state */
      const moduleData = state.getModule(params[0], params[1]);
      const label      = moduleData ? moduleData.title : params[1];
      items.push({ label, href: `#/module/${params[0]}/${params[1]}` });
    }

    if (route === 'lesson' && params[2]) {
      const lessonData = state.getLesson(params[0], params[1], params[2]);
      const label      = lessonData ? lessonData.title : params[2];
      items.push({ label, href: null });  /* current page — no link */
    }

    /* Render only if there is more than just Home */
    if (items.length <= 1) {
      breadcrumbEl.innerHTML = '';
      return;
    }

    const html = `
      <div class="breadcrumb-inner" aria-label="Breadcrumb">
        ${items.map((item, i) => {
          const isLast = i === items.length - 1;
          if (item.href && !isLast) {
            return `<a href="${item.href}" class="breadcrumb-item">${_escape(item.label)}</a>`;
          }
          return `<span class="breadcrumb-item" ${isLast ? 'aria-current="page"' : ''}>${_escape(item.label)}</span>`;
        }).join('')}
      </div>`;

    breadcrumbEl.innerHTML = html;
  }

  /**
   * Navigate to the view corresponding to the current hash.
   * Called on every hashchange event and on initial load.
   *
   * @param {object} state
   * @param {object} audio
   */
  async function handleRoute(state, audio) {
    const { route, params } = parseHash(window.location.hash);

    /* Show loading indicator while the view renders */
    appRoot.innerHTML = '<div class="loading-screen"><p>Carregando&hellip;</p></div>';
    appRoot.setAttribute('aria-busy', 'true');

    /* Update breadcrumb */
    renderBreadcrumb(route, params, state);

    const viewFactory = ROUTES[route] || NotFoundView.render;

    try {
      const html = await viewFactory({ route, params, state, audio });
      appRoot.innerHTML = html;

      /* After injecting HTML, hydrate interactive components */
      await _hydrateView(route, params, state, audio);

      /* Scroll to top on every navigation */
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (err) {
      console.error('[Router] View render error:', err);
      appRoot.innerHTML = `
        <div class="page-container">
          <div class="notice notice--error">
            Ocorreu um erro ao carregar esta página. Tente novamente.
          </div>
        </div>`;
    } finally {
      appRoot.setAttribute('aria-busy', 'false');
    }
  }

  /**
   * Despachante da rota 'lesson'.
   * Inspeciona lesson.type nos dados e escolhe o view correto.
   *   type === 'pronunciation' → PronunciationLessonView
   *   type ausente / qualquer outro → LessonView (padrão)
   *
   * @param {object} context  — { route, params, state }
   * @returns {Promise<string>}
   */
  async function _lessonDispatcher(context) {
    const [levelId, moduleId, lessonId] = context.params;
    let lesson = null;
    try {
      lesson = await context.state.getLessonAsync(levelId, moduleId, lessonId);
    } catch (_) {}

    if (lesson?.type === 'pronunciation') {
      return PronunciationLessonView.render(context);
    }
    return LessonView.render(context);
  }

  /**
   * Hydrate interactive components after HTML is injected into the DOM.
   * Separated from rendering so view factories remain pure (return HTML strings).
   *
   * @param {string}   route
   * @param {string[]} params
   * @param {object}   state
   * @param {object}   audio
   */
  async function _hydrateView(route, params, state, audio) {
    if (route === 'lesson') {
      /* Detecta o tipo da lição para despachar para o engine correto */
      const [levelId, moduleId, lessonId] = params;
      let lesson = null;
      try {
        lesson = await state.getLessonAsync(levelId, moduleId, lessonId);
      } catch (_) {}

      if (lesson?.type === 'pronunciation') {
        const { PronunciationEngine } = await import('./modules/pronunciation/pronunciation-engine.js');
        PronunciationEngine.hydrate({ params, levelId, moduleId, lessonId, state, audio });
      } else {
        const { LessonEngine } = await import('./lesson-engine.js');
        LessonEngine.hydrate({ params, state, audio });
      }
    }
    if (route === '' || route === 'home') {
      HomeView.hydrate({ state, audio });
    }
  }

  /**
   * Escape HTML special characters to prevent XSS in breadcrumb labels.
   *
   * @param {string} str
   * @returns {string}
   */
  function _escape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  return {
    /**
     * Initialise the router.
     * Registers hashchange listener and renders the initial route.
     *
     * @param {object} state
     * @param {object} audio
     */
    init(state, audio) {
      window.addEventListener('hashchange', () => handleRoute(state, audio));
      handleRoute(state, audio);
      return { navigate: (hash) => { window.location.hash = hash; } };
    },
  };
})();
