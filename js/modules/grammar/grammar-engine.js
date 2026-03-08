/**
 * grammar-engine.js — Controlador da etapa de Gramática
 * Johnson English — Laboratório de Língua
 *
 * Lê os dados do shadowing da <div id="shadowing-data" hidden>, que contém
 * JSON como textContent. Essa abordagem evita o bloqueio de CSP que o Firefox
 * aplica a qualquer tag <script>, mesmo com type="application/json".
 */

import { ShadowingEngine } from '../../shadowing-engine.js';

export const GrammarEngine = (() => {
  function hydrate({ levelId, moduleId, lessonId, state }) {
    _mountShadowingEngine(levelId, moduleId, lessonId, state);
  }

  function _mountShadowingEngine(levelId, moduleId, lessonId, state) {
    const mountPoint = document.getElementById('shadowing-mount');
    const dataDiv    = document.getElementById('shadowing-data');

    if (!mountPoint || !dataDiv) return;

    let sentences = [];
    try {
      /* textContent é seguro: não executa scripts nem interpreta HTML */
      sentences = JSON.parse(dataDiv.textContent);
    } catch (err) {
      console.error('[GrammarEngine] Não foi possível interpretar dados de shadowing:', err);
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

  return { hydrate };
})();
