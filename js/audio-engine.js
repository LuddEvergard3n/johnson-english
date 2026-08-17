/**
 * audio-engine.js — Controlador de síntese de voz
 * Johnson English — Laboratório de Língua
 *
 * Utiliza exclusivamente a Web Speech API nativa do navegador.
 * Zero dependências externas. Compatível com GitHub Pages e qualquer
 * ambiente de hospedagem estática.
 *
 * Se a Web Speech API não estiver disponível (browser sem suporte),
 * onError é chamado e a UI exibe "Áudio indisponível" — sem excepções.
 */

/**
 * Sanitiza o texto antes de enviar à Web Speech API.
 * Permite apenas caracteres seguros para síntese de voz.
 *
 * Função pura, exportada separadamente do AudioEngine para ser testável
 * diretamente (ver tests/audio-tests.js) sem duplicar esta lógica.
 *
 * @param {string} text
 * @returns {string}
 */
export function sanitiseText(text) {
  return String(text)
    .replace(/[^\w\s.,!?'"();:\-]/gi, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 500);
}

export const AudioEngine = (() => {
  /* -------------------------------------------------------------------------
     Estado privado
     ------------------------------------------------------------------------- */

  /** SpeechSynthesisUtterance em reprodução, se houver. */
  let _currentUtterance = null;

  /* -------------------------------------------------------------------------
     HELPERS PRIVADOS
     ------------------------------------------------------------------------- */

  /** Para qualquer reprodução em andamento. */
  function _stopAll() {
    if (_currentUtterance && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      _currentUtterance = null;
    }
  }

  /**
   * Seleciona a melhor voz em inglês disponível na Web Speech API.
   * Prefere vozes en-US locais; aceita qualquer voz en-* como fallback.
   *
   * @returns {SpeechSynthesisVoice|null}
   */
  function _pickVoice() {
    if (!window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((v) => v.lang.startsWith('en-US') && v.localService) ||
      voices.find((v) => v.lang.startsWith('en-US'))                   ||
      voices.find((v) => v.lang.startsWith('en'))                      ||
      null
    );
  }

  /**
   * Reproduz texto via Web Speech API.
   *
   * @param {string}   text
   * @param {Function} onStart
   * @param {Function} onEnd
   * @param {Function} onError
   */
  function _speak(text, onStart, onEnd, onError) {
    if (!window.speechSynthesis) {
      onError && onError(new Error('Web Speech API não disponível neste navegador.'));
      return;
    }

    window.speechSynthesis.cancel();

    const utterance  = new SpeechSynthesisUtterance(text);
    utterance.lang   = 'en-US';
    utterance.rate   = 0.9;   /* Levemente mais lento — mais claro para aprendizes */
    utterance.pitch  = 1.0;

    const voice = _pickVoice();
    if (voice) utterance.voice = voice;

    utterance.onstart = () => onStart && onStart();

    utterance.onend = () => {
      _currentUtterance = null;
      onEnd && onEnd();
    };

    utterance.onerror = (e) => {
      _currentUtterance = null;
      /* 'interrupted' não é um erro real — ocorre quando cancel() é chamado */
      if (e.error === 'interrupted') return;
      console.warn('[AudioEngine] Web Speech error:', e.error);
      onError && onError(e);
    };

    _currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    onStart && onStart();
  }

  /* -------------------------------------------------------------------------
     API PÚBLICA
     ------------------------------------------------------------------------- */
  return {
    /**
     * Inicializa o motor de áudio.
     * Pré-carrega a lista de vozes da Web Speech API.
     * O Chrome carrega as vozes de forma assíncrona; sem isto,
     * getVoices() retorna [] na primeira chamada.
     *
     * @returns {object}
     */
    init() {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.addEventListener('voiceschanged', () => {
          window.speechSynthesis.getVoices();
        });
      }
      return this;
    },

    /**
     * Reproduz o texto em voz alta via Web Speech API.
     *
     * @param {string}   text
     * @param {object}   [callbacks]
     * @param {Function} [callbacks.onStart]
     * @param {Function} [callbacks.onEnd]
     * @param {Function} [callbacks.onError]
     */
    speak(text, { onStart, onEnd, onError } = {}) {
      const sanitised = sanitiseText(text);
      if (!sanitised) return;
      _stopAll();
      _speak(sanitised, onStart, onEnd, onError);
    },

    /** Para qualquer reprodução em andamento. */
    stop() {
      _stopAll();
    },

    /** Indica se há áudio sendo reproduzido no momento. */
    get isPlaying() {
      return _currentUtterance !== null && window.speechSynthesis?.speaking === true;
    },

    /**
     * Registra event delegation para todos os botões .btn--audio[data-text]
     * dentro do #app-root. Deve ser chamado por qualquer engine que precise
     * de botões de áudio — LessonEngine e PronunciationEngine.
     *
     * Remove o listener anterior antes de registrar o novo, garantindo que
     * o contexto de levelId/moduleId/lessonId esteja sempre actualizado ao
     * navegar entre lições sem recarregar a página.
     *
     * @param {object}   opts
     * @param {string}   opts.levelId
     * @param {string}   opts.moduleId
     * @param {string}   opts.lessonId
     * @param {object}   opts.state
     * @param {Function} [opts.onPlayed]
     */
    hydrateAudioButtons({ levelId, moduleId, lessonId, state, onPlayed } = {}) {
      const appRoot = document.getElementById('app-root');
      if (!appRoot) return;

      function _setStatus(btn, text, modifier) {
        const row      = btn.closest('[class*="-row"], [class*="-side"], .audio-player');
        const statusEl = row?.querySelector('.audio-status');
        if (!statusEl) return;
        statusEl.textContent = text;
        statusEl.className   = modifier ? `audio-status ${modifier}` : 'audio-status';
      }

      /*
       * Rastreia o botão atualmente tocando. Necessário porque, ao
       * interromper uma fala em andamento para iniciar outra, o
       * `onerror` do SpeechSynthesisUtterance dispara com
       * error === 'interrupted' — e o AudioEngine.speak() ignora esse
       * caso silenciosamente (ver comentário em _speak), sem notificar
       * o chamador. Sem este rastreamento, o botão anterior ficava com
       * a classe "playing" presa indefinidamente.
       */
      let activeBtn = null;

      function _resetButton(btn) {
        btn.classList.remove('playing');
        btn.setAttribute('aria-pressed', 'false');
        _setStatus(btn, '');
      }

      const handler = (event) => {
        const btn = event.target.closest('.btn--audio[data-text]');
        if (!btn) return;

        if (btn.classList.contains('playing')) {
          AudioEngine.stop();
          _resetButton(btn);
          activeBtn = null;
          return;
        }

        /* Outro botão estava tocando: restaura sua UI antes de trocar. */
        if (activeBtn && activeBtn !== btn) {
          _resetButton(activeBtn);
        }

        const text = btn.getAttribute('data-text');
        btn.classList.add('playing');
        btn.setAttribute('aria-pressed', 'true');
        _setStatus(btn, 'Reproduzindo…', 'audio-status--playing');
        activeBtn = btn;

        AudioEngine.speak(text, {
          onEnd: () => {
            _resetButton(btn);
            if (activeBtn === btn) activeBtn = null;
            if (state && levelId && moduleId && lessonId) {
              state.markActivityComplete(levelId, moduleId, lessonId, 'listening');
            }
            onPlayed && onPlayed(text);
          },
          onError: () => {
            _resetButton(btn);
            if (activeBtn === btn) activeBtn = null;
            _setStatus(btn, 'Áudio indisponível', 'audio-status--error');
          },
        });
      };

      if (appRoot._audioHandler) {
        appRoot.removeEventListener('click', appRoot._audioHandler);
      }
      appRoot._audioHandler = handler;
      appRoot.addEventListener('click', handler);
    },
  };
})();
