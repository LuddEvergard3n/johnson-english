/**
 * audio-engine.js — Controlador de síntese de voz e reprodução de áudio
 * Johnson English — Laboratório de Língua
 *
 * Estratégia de áudio (em ordem de prioridade):
 *
 *   1. Coqui TTS Server (POST /api/tts)
 *      Alta qualidade, voz natural. Requer servidor local rodando.
 *
 *   2. Web Speech API (window.speechSynthesis)
 *      Nativa do navegador, zero dependências, zero CORS.
 *      Qualidade menor, mas funciona em qualquer ambiente.
 *
 *   3. Fallback silencioso
 *      Se nenhuma opção estiver disponível, onError é chamado
 *      e a UI exibe "Áudio indisponível".
 *
 * Design decision: a Web Speech API é testada primeiro de forma assíncrona
 * (via _probeTTS). Se o servidor Coqui não responder em 2s, o engine
 * commuta permanentemente para Web Speech API nessa sessão.
 */

/** URL base do servidor Coqui TTS. Configurável em runtime. */
const DEFAULT_TTS_URL = 'http://localhost:5002';

/** Timeout em ms para detectar se o servidor TTS está disponível. */
const TTS_PROBE_TIMEOUT_MS = 2000;

/** Intervalo mínimo entre requisições TTS ao servidor (throttle). */
const TTS_THROTTLE_MS = 500;

/** Máximo de requisições TTS simultâneas ao servidor. */
const MAX_CONCURRENT_TTS = 2;

export const AudioEngine = (() => {
  /* -------------------------------------------------------------------------
     Estado privado
     ------------------------------------------------------------------------- */

  /** Cache de áudio em memória. Chave: texto sanitizado. Valor: ObjectURL. */
  const _cache = new Map();

  /** HTMLAudioElement em reprodução, se houver. */
  let _currentAudio = null;

  /** SpeechSynthesisUtterance em reprodução, se houver. */
  let _currentUtterance = null;

  /** Timestamp da última requisição ao servidor TTS. */
  let _lastRequestTime = 0;

  /** Número de requisições em andamento ao servidor. */
  let _inflight = 0;

  /**
   * Estado do backend de áudio para esta sessão.
   *   'unknown'   → não testado ainda
   *   'server'    → usando Coqui TTS server
   *   'speech'    → usando Web Speech API
   *   'none'      → nenhum backend disponível
   */
  let _backend = 'unknown';

  /** URL configurada do servidor TTS. */
  let _ttsUrl = DEFAULT_TTS_URL;

  /* -------------------------------------------------------------------------
     DETECÇÃO DE BACKEND
     ------------------------------------------------------------------------- */

  /**
   * Testa se o servidor Coqui TTS está acessível.
   * Usa uma requisição HEAD com timeout curto para não bloquear a UI.
   *
   * @returns {Promise<boolean>}
   */
  async function _probeServer() {
    try {
      const controller = new AbortController();
      const timer      = setTimeout(() => controller.abort(), TTS_PROBE_TIMEOUT_MS);

      const response = await fetch(`${_ttsUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timer);
      return response.ok;
    } catch (_err) {
      return false;
    }
  }

  /**
   * Determina e fixa o backend para esta sessão.
   * Chamado na primeira tentativa de speak().
   *
   * @returns {Promise<void>}
   */
  async function _resolveBackend() {
    if (_backend !== 'unknown') return;

    const serverUp = await _probeServer();

    if (serverUp) {
      _backend = 'server';
      console.info('[AudioEngine] Backend: Coqui TTS server');
      return;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      _backend = 'speech';
      console.info('[AudioEngine] Backend: Web Speech API (servidor TTS indisponível)');
      return;
    }

    _backend = 'none';
    console.warn('[AudioEngine] Nenhum backend de áudio disponível.');
  }

  /* -------------------------------------------------------------------------
     HELPERS PRIVADOS
     ------------------------------------------------------------------------- */

  /**
   * Sanitiza o texto antes de enviar ao TTS ou Web Speech API.
   * Permite apenas caracteres seguros para síntese de voz.
   *
   * @param {string} text
   * @returns {string}
   */
  function _sanitise(text) {
    return String(text)
      .replace(/[^\w\s.,!?'"();:\-]/gi, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .slice(0, 500);
  }

  /** Aplica throttle entre requisições ao servidor TTS. */
  function _throttle() {
    const now   = Date.now();
    const delta = now - _lastRequestTime;
    if (delta >= TTS_THROTTLE_MS) {
      _lastRequestTime = now;
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        _lastRequestTime = Date.now();
        resolve();
      }, TTS_THROTTLE_MS - delta);
    });
  }

  /** Para qualquer reprodução em andamento (servidor ou Web Speech). */
  function _stopAll() {
    /* Parar HTMLAudioElement */
    if (_currentAudio) {
      _currentAudio.pause();
      _currentAudio.src = '';
      _currentAudio     = null;
    }

    /* Parar Web Speech API */
    if (_currentUtterance && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      _currentUtterance = null;
    }
  }

  /* -------------------------------------------------------------------------
     BACKENDS DE REPRODUÇÃO
     ------------------------------------------------------------------------- */

  /**
   * Reproduz áudio via servidor Coqui TTS.
   *
   * @param {string}   text
   * @param {Function} onStart
   * @param {Function} onEnd
   * @param {Function} onError
   */
  async function _speakViaServer(text, onStart, onEnd, onError) {
    if (_inflight >= MAX_CONCURRENT_TTS) {
      onError && onError(new Error('Muitas requisições simultâneas.'));
      return;
    }

    await _throttle();
    _inflight++;

    let audioUrl;
    try {
      if (_cache.has(text)) {
        audioUrl = _cache.get(text);
      } else {
        const response = await fetch(`${_ttsUrl}/api/tts`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ text, language: 'en' }),
        });

        if (!response.ok) {
          throw new Error(`Servidor TTS retornou HTTP ${response.status}`);
        }

        const blob = await response.blob();
        audioUrl   = URL.createObjectURL(blob);
        _cache.set(text, audioUrl);
      }
    } catch (err) {
      _inflight--;
      console.warn('[AudioEngine] TTS server falhou, tentando Web Speech API:', err.message);

      /* Commuta para Web Speech API se o servidor falhar em runtime */
      if (window.speechSynthesis) {
        _backend = 'speech';
        _speakViaSpeechAPI(text, onStart, onEnd, onError);
      } else {
        onError && onError(err);
      }
      return;
    }

    _inflight--;

    const audio    = new Audio(audioUrl);
    _currentAudio  = audio;

    audio.addEventListener('play',  () => onStart && onStart());
    audio.addEventListener('ended', () => {
      _currentAudio = null;
      onEnd && onEnd();
    });
    audio.addEventListener('error', (e) => {
      _currentAudio = null;
      onError && onError(e);
    });

    audio.play().catch((err) => {
      console.warn('[AudioEngine] audio.play() rejeitado:', err);
      onError && onError(err);
    });
  }

  /**
   * Reproduz áudio via Web Speech API nativa do navegador.
   * Seleciona automaticamente uma voz em inglês, se disponível.
   *
   * @param {string}   text
   * @param {Function} onStart
   * @param {Function} onEnd
   * @param {Function} onError
   */
  function _speakViaSpeechAPI(text, onStart, onEnd, onError) {
    if (!window.speechSynthesis) {
      onError && onError(new Error('Web Speech API não disponível.'));
      return;
    }

    /* Cancela qualquer fala em andamento */
    window.speechSynthesis.cancel();

    const utterance  = new SpeechSynthesisUtterance(text);
    utterance.lang   = 'en-US';
    utterance.rate   = 0.9;    /* Levemente mais lento — mais claro para aprendizes */
    utterance.pitch  = 1.0;

    /* Seleciona a melhor voz em inglês disponível */
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find((v) => v.lang.startsWith('en-US') && !v.localService === false)
                 || voices.find((v) => v.lang.startsWith('en-US'))
                 || voices.find((v) => v.lang.startsWith('en'));

    if (enVoice) {
      utterance.voice = enVoice;
    }

    utterance.onstart = () => onStart && onStart();
    utterance.onend   = () => {
      _currentUtterance = null;
      onEnd && onEnd();
    };
    utterance.onerror = (e) => {
      _currentUtterance = null;
      /* 'interrupted' não é um erro real — acontece quando cancel() é chamado */
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
     * Chamado uma vez por app.js.
     *
     * @returns {object}
     */
    init() {
      /*
       * Pré-carrega a lista de vozes da Web Speech API.
       * O Chrome carrega as vozes de forma assíncrona; sem isso,
       * getVoices() retorna [] na primeira chamada.
       */
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.addEventListener('voiceschanged', () => {
          window.speechSynthesis.getVoices(); /* Força cache interno */
        });
      }
      return this;
    },

    /**
     * Configura a URL do servidor TTS em runtime.
     *
     * @param {string} url
     */
    setServerUrl(url) {
      _ttsUrl  = url.replace(/\/$/, '');
      _backend = 'unknown'; /* Força nova detecção */
    },

    /**
     * Backend em uso nesta sessão.
     * Valores: 'unknown' | 'server' | 'speech' | 'none'
     *
     * @returns {string}
     */
    get backend() {
      return _backend;
    },

    /**
     * Reproduz o texto em voz alta.
     * Detecta o backend disponível na primeira chamada.
     *
     * @param {string}   text
     * @param {object}   [callbacks]
     * @param {Function} [callbacks.onStart]
     * @param {Function} [callbacks.onEnd]
     * @param {Function} [callbacks.onError]
     * @returns {Promise<void>}
     */
    async speak(text, { onStart, onEnd, onError } = {}) {
      const sanitised = _sanitise(text);
      if (!sanitised) return;

      _stopAll();

      /* Resolve o backend na primeira chamada (probe assíncrono) */
      await _resolveBackend();

      if (_backend === 'server') {
        await _speakViaServer(sanitised, onStart, onEnd, onError);
      } else if (_backend === 'speech') {
        _speakViaSpeechAPI(sanitised, onStart, onEnd, onError);
      } else {
        onError && onError(new Error('Nenhum backend de áudio disponível.'));
      }
    },

    /** Para qualquer reprodução em andamento. */
    stop() {
      _stopAll();
    },

    /** Indica se há áudio sendo reproduzido no momento. */
    get isPlaying() {
      return (
        (_currentAudio     !== null && !_currentAudio.paused) ||
        (_currentUtterance !== null && window.speechSynthesis?.speaking)
      );
    },

    /**
     * Pré-carrega áudio para uma lista de textos (best-effort, erros ignorados).
     * Só faz sentido quando o backend for 'server'; ignorado para Web Speech API.
     *
     * @param {string[]} texts
     */
    async prefetch(texts) {
      if (_backend !== 'server') return;

      for (const text of texts) {
        const s = _sanitise(text);
        if (s && !_cache.has(s)) {
          fetch(`${_ttsUrl}/api/tts`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ text: s, language: 'en' }),
          })
            .then((r) => r.blob())
            .then((b) => _cache.set(s, URL.createObjectURL(b)))
            .catch(() => {});
          await new Promise((r) => setTimeout(r, 200));
        }
      }
    },

    /** Limpa o cache de áudio e libera ObjectURLs. */
    clearCache() {
      _cache.forEach((url) => URL.revokeObjectURL(url));
      _cache.clear();
    },

    /**
     * Registra event delegation para todos os botões .btn--audio[data-text]
     * dentro do #app-root. Deve ser chamado por qualquer engine que precise
     * de botões de áudio — LessonEngine e PronunciationEngine.
     *
     * Remove o listener anterior antes de registrar o novo, garantindo que
     * o contexto de levelId/moduleId/lessonId esteja sempre atualizado ao
     * navegar entre lições sem recarregar a página.
     *
     * @param {object}   opts
     * @param {string}   opts.levelId
     * @param {string}   opts.moduleId
     * @param {string}   opts.lessonId
     * @param {object}   opts.state
     * @param {Function} [opts.onPlayed]  callback após reprodução bem-sucedida
     */
    hydrateAudioButtons({ levelId, moduleId, lessonId, state, onPlayed } = {}) {
      const appRoot = document.getElementById('app-root');
      if (!appRoot) return;

      function _setStatus(btn, text, modifier) {
        /* Procura .audio-status no row pai (.word-audio-row, .pair-side, .audio-player) */
        const row = btn.closest('[class*="-row"], [class*="-side"], .audio-player');
        const statusEl = row?.querySelector('.audio-status');
        if (!statusEl) return;
        statusEl.textContent = text;
        statusEl.className   = modifier ? `audio-status ${modifier}` : 'audio-status';
      }

      const handler = async (event) => {
        const btn = event.target.closest('.btn--audio[data-text]');
        if (!btn) return;

        if (btn.classList.contains('playing')) {
          AudioEngine.stop();
          btn.classList.remove('playing');
          btn.setAttribute('aria-pressed', 'false');
          _setStatus(btn, '');
          return;
        }

        const text = btn.getAttribute('data-text');
        btn.classList.add('playing');
        btn.setAttribute('aria-pressed', 'true');
        _setStatus(btn, 'Reproduzindo…', 'audio-status--playing');

        await AudioEngine.speak(text, {
          onEnd: () => {
            btn.classList.remove('playing');
            btn.setAttribute('aria-pressed', 'false');
            _setStatus(btn, '');
            if (state && levelId && moduleId && lessonId) {
              state.markActivityComplete(levelId, moduleId, lessonId, 'listening');
            }
            onPlayed && onPlayed(text);
          },
          onError: () => {
            btn.classList.remove('playing');
            btn.setAttribute('aria-pressed', 'false');
            _setStatus(btn, 'Áudio indisponível', 'audio-status--error');
          },
        });
      };

      /* Remove listener anterior — garante contexto atualizado ao trocar de lição */
      if (appRoot._audioHandler) {
        appRoot.removeEventListener('click', appRoot._audioHandler);
      }
      appRoot._audioHandler = handler;
      appRoot.addEventListener('click', handler);
    },
  };
})();

