/**
 * lesson-engine.js — Orquestração de atividades da lição
 * Johnson English — Laboratório de Língua
 *
 * Responsabilidades:
 *   - Conectar eventos nos botões de áudio (presentes em todas as seções).
 *   - Delegar para os motores de etapa (Grammar, Logic, Rhetoric).
 *   - Atualizar progresso via State após conclusão de atividade.
 *
 * Chamado pelo Router após a view da lição ser injetada no DOM.
 */

import { GrammarEngine }  from './modules/grammar/grammar-engine.js';
import { LogicEngine }    from './modules/logic/logic-engine.js';
import { RhetoricEngine } from './modules/rhetoric/rhetoric-engine.js';
import { AudioEngine }    from './audio-engine.js';

export const LessonEngine = (() => {
  function hydrate({ params, state }) {
    const [levelId, moduleId, lessonId] = params;
    if (!levelId || !moduleId || !lessonId) return;

    /* Delega ao AudioEngine — método compartilhado com PronunciationEngine */
    AudioEngine.hydrateAudioButtons({ levelId, moduleId, lessonId, state });

    GrammarEngine.hydrate({ levelId, moduleId, lessonId, state });
    LogicEngine.hydrate({ levelId, moduleId, lessonId, state });
    RhetoricEngine.hydrate({ levelId, moduleId, lessonId, state });
    _hydrateSectionNav();
  }

  /**
   * Navegação entre seções da lição via abas (sidebar).
   */
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
        const isActive = item.getAttribute('data-section') === targetId;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-selected', String(isActive));
      });
    }

    navItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = item.getAttribute('data-section');
        if (targetId) showSection(targetId);
      });
    });

    /* Ativa a primeira seção por padrão */
    const first = sections[0];
    if (first) showSection(first.id);
  }

  return { hydrate };
})();
