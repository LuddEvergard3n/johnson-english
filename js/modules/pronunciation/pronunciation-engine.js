/**
 * pronunciation-engine.js — Controlador de lições de pronúncia
 * Johnson English — Laboratório de Língua
 *
 * Hidrata a view de pronúncia após renderização.
 * Responsabilidade exclusiva: montar ShadowingEngine e RhetoricEngine.
 * Os botões .btn--audio são tratados pelo LessonEngine via event delegation.
 */

import { ShadowingEngine } from '../../shadowing-engine.js';
import { RhetoricEngine }  from '../rhetoric/rhetoric-engine.js';
import { AudioEngine }     from '../../audio-engine.js';

export const PronunciationEngine = (() => {
  function hydrate({ params, levelId, moduleId, lessonId, state }) {
    /* Resolve params se levelId não foi passado diretamente */
    if (!levelId && params) {
      [levelId, moduleId, lessonId] = params;
    }

    /* Registra delegação de áudio — botões .btn--audio nas seções Som, Palavras e Pares */
    AudioEngine.hydrateAudioButtons({ levelId, moduleId, lessonId, state });

    _mountShadowing(levelId, moduleId, lessonId, state);
    RhetoricEngine.hydrate({ levelId, moduleId, lessonId, state });
    _hydrateSectionNav();
  }

  function _mountShadowing(levelId, moduleId, lessonId, state) {
    const mountPoint = document.getElementById('shadowing-mount');
    const dataDiv    = document.getElementById('shadowing-data');
    if (!mountPoint || !dataDiv) return;

    let sentences = [];
    try {
      sentences = JSON.parse(dataDiv.textContent);
    } catch (err) {
      console.error('[PronunciationEngine] Falha ao interpretar dados de repetição:', err);
      return;
    }

    ShadowingEngine.mount({
      container: mountPoint,
      sentences,
      onComplete: () => {
        state.markActivityComplete(levelId, moduleId, lessonId, 'repetition');
      },
    });
  }

  function _hydrateSectionNav() {
    const navItems = document.querySelectorAll('.lesson-nav-item');
    const sections = document.querySelectorAll('.lesson-section');
    if (!navItems.length || !sections.length) return;

    function showSection(targetId) {
      sections.forEach((sec) => {
        if (sec.id === targetId) {
          sec.removeAttribute('hidden');
          sec.setAttribute('aria-hidden', 'false');
        } else {
          sec.setAttribute('hidden', '');
          sec.setAttribute('aria-hidden', 'true');
        }
      });
      navItems.forEach((item) => {
        const active = item.getAttribute('data-section') === targetId;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
      });
    }

    navItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const id = item.getAttribute('data-section');
        if (id) showSection(id);
      });
    });

    if (sections[0]) showSection(sections[0].id);
  }

  return { hydrate };
})();
