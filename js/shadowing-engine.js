/**
 * shadowing-engine.js — Controlador do modo de repetição em sombra (shadowing)
 * Johnson English — Laboratório de Língua
 *
 * Interface totalmente em português. O conteúdo (frases em inglês) aparece
 * com tradução em português para apoio do aluno.
 */

import { AudioEngine } from './audio-engine.js';

export const ShadowingEngine = (() => {
  let _sentences  = [];
  let _current    = 0;
  let _container  = null;
  let _onComplete = null;

  function _render() {
    if (!_container) return;

    const sentence    = _sentences[_current];
    const isLast      = _current === _sentences.length - 1;
    const total       = _sentences.length;
    const progressPct = Math.round((_current / total) * 100);

    _container.innerHTML = `
      <div class="shadowing-panel">

        <div class="progress-bar-wrapper" role="progressbar"
             aria-valuenow="${progressPct}" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-bar-fill" style="width:${progressPct}%"></div>
        </div>
        <p class="progress-label">${_current + 1} de ${total}</p>

        <div class="shadowing-sentence-card">
          <p class="shadowing-text" lang="en">${_escape(sentence.text)}</p>
          ${sentence.translation
            ? `<p class="shadowing-translation text-muted text-small">${_escape(sentence.translation)}</p>`
            : ''}
        </div>

        <div class="shadowing-controls">
          <button id="shadow-play" class="btn btn--primary">Ouvir</button>
        </div>

        <div id="shadow-assess" class="shadowing-assess" hidden>
          <p class="text-small text-muted">
            Agora diga a frase em voz alta. Como foi?
          </p>
          <div class="shadowing-assess-buttons">
            <button id="shadow-good"  class="btn btn--secondary">Acertei</button>
            <button id="shadow-again" class="btn btn--ghost">Tentar de novo</button>
            ${!isLast
              ? `<button id="shadow-next" class="btn btn--primary" hidden>Próxima</button>`
              : `<button id="shadow-finish" class="btn btn--primary" hidden>Concluir</button>`
            }
          </div>
        </div>

      </div>`;

    _attachHandlers(isLast);
  }

  function _attachHandlers(isLast) {
    const playBtn   = document.getElementById('shadow-play');
    const assessDiv = document.getElementById('shadow-assess');
    const goodBtn   = document.getElementById('shadow-good');
    const againBtn  = document.getElementById('shadow-again');
    const nextBtn   = document.getElementById('shadow-next');
    const finishBtn = document.getElementById('shadow-finish');

    playBtn?.addEventListener('click', async () => {
      playBtn.disabled    = true;
      playBtn.textContent = 'Reproduzindo…';

      await AudioEngine.speak(_sentences[_current].text, {
        onEnd: () => {
          playBtn.disabled    = false;
          playBtn.textContent = 'Ouvir novamente';
          if (assessDiv) assessDiv.removeAttribute('hidden');
        },
        onError: () => {
          playBtn.disabled    = false;
          playBtn.textContent = 'Ouvir';
          if (assessDiv) assessDiv.removeAttribute('hidden');
        },
      });
    });

    goodBtn?.addEventListener('click', () => {
      nextBtn?.removeAttribute('hidden');
      finishBtn?.removeAttribute('hidden');
      goodBtn.disabled  = true;
      againBtn.disabled = true;
    });

    againBtn?.addEventListener('click', async () => {
      if (assessDiv) assessDiv.setAttribute('hidden', '');
      await AudioEngine.speak(_sentences[_current].text, {
        onEnd: () => { if (assessDiv) assessDiv.removeAttribute('hidden'); },
      });
    });

    nextBtn?.addEventListener('click', () => {
      _current++;
      _render();
    });

    finishBtn?.addEventListener('click', () => {
      if (_onComplete) _onComplete();
      _container.innerHTML = `
        <div class="feedback-message feedback-message--correct">
          <span class="feedback-icon">&#10003;</span>
          <span>Repetição concluída. Todas as frases foram praticadas.</span>
        </div>`;
    });
  }

  function _escape(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  return {
    mount({ container, sentences, onComplete }) {
      _container  = container;
      _sentences  = sentences || [];
      _current    = 0;
      _onComplete = onComplete || null;

      if (!_sentences.length) {
        _container.innerHTML = '<p class="text-muted">Nenhuma frase para praticar.</p>';
        return;
      }

      _render();
    },
  };
})();
