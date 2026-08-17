/**
 * feedback-engine.js — Renderizador de feedback de exercícios
 * Johnson English — Laboratório de Língua
 */

import { escapeHtml as _escape } from '../utils/html-safety.js';

export const FeedbackEngine = (() => {
  return {
    showCorrect(container, message) {
      if (!container) return;
      container.innerHTML = `
        <div class="feedback-message feedback-message--correct" role="alert">
          <span class="feedback-icon" aria-hidden="true">&#10003;</span>
          <span>${_escape(message)}</span>
        </div>`;
    },

    showIncorrect(container, message) {
      if (!container) return;
      container.innerHTML = `
        <div class="feedback-message feedback-message--incorrect" role="alert">
          <span class="feedback-icon" aria-hidden="true">&#10007;</span>
          <span>${_escape(message)}</span>
        </div>`;
    },

    clear(container) {
      if (!container) return;
      container.innerHTML = '';
    },
  };
})();
