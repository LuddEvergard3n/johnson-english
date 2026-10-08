/** Ferramentas compartilhadas de estudo: voz, compartilhamento e navegação. */

import { AudioEngine } from './audio-engine.js';

/** @param {object} environment @returns {boolean} */
export function supportsRecording(environment = globalThis) {
  return Boolean(environment.MediaRecorder && environment.navigator?.mediaDevices?.getUserMedia);
}

/** Gera o hash canônico de uma lição, com seção opcional. */
export function buildLessonHash(levelId, moduleId, lessonId, section = '') {
  return `#/lesson/${levelId}/${moduleId}/${lessonId}${section ? `/${section}` : ''}`;
}

export const StudyTools = (() => {
  let _stream = null;
  let _recorder = null;
  let _audioUrl = null;

  function _disposeRecording() {
    if (_audioUrl) URL.revokeObjectURL(_audioUrl);
    _audioUrl = null;
    _stream?.getTracks().forEach((track) => track.stop());
    _stream = null;
    _recorder = null;
  }

  function _mountRecorder() {
    const section = document.getElementById('section-repetition') || document.getElementById('pron-repetition');
    if (!section) return;
    const panel = document.createElement('div');
    panel.className = 'recording-panel';
    panel.innerHTML = `<div><strong>Compare sua pronúncia</strong><p>Grave uma tentativa, ouça e compare com o modelo. Nada é enviado ou salvo.</p></div><div class="recording-actions"><button class="btn btn--secondary record-start" type="button">Gravar minha voz</button><button class="btn btn--ghost record-stop" type="button" hidden>Parar</button></div><p class="recording-status" role="status"></p>`;
    section.appendChild(panel);
    const start = panel.querySelector('.record-start');
    const stop = panel.querySelector('.record-stop');
    const status = panel.querySelector('.recording-status');

    if (!supportsRecording(window)) {
      start.disabled = true;
      status.textContent = 'Gravação indisponível neste navegador. As demais atividades continuam funcionando.';
      return;
    }

    start.addEventListener('click', async () => {
      _disposeRecording();
      try {
        _stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const chunks = [];
        _recorder = new MediaRecorder(_stream);
        _recorder.addEventListener('dataavailable', (event) => { if (event.data.size) chunks.push(event.data); });
        _recorder.addEventListener('stop', () => {
          _audioUrl = URL.createObjectURL(new Blob(chunks, { type: _recorder.mimeType || 'audio/webm' }));
          const oldAudio = panel.querySelector('audio');
          if (oldAudio) oldAudio.remove();
          const audio = document.createElement('audio');
          audio.controls = true;
          audio.src = _audioUrl;
          audio.setAttribute('aria-label', 'Sua gravação');
          panel.insertBefore(audio, status);
          status.textContent = 'Gravação pronta. Ouça, compare e grave novamente se quiser.';
          start.textContent = 'Gravar novamente';
          start.hidden = false;
          stop.hidden = true;
          _stream?.getTracks().forEach((track) => track.stop());
          _stream = null;
        });
        _recorder.start();
        start.hidden = true;
        stop.hidden = false;
        status.textContent = 'Gravando…';
      } catch (_) {
        status.textContent = 'Não foi possível acessar o microfone. Verifique a permissão do navegador.';
      }
    });
    stop.addEventListener('click', () => { if (_recorder?.state === 'recording') _recorder.stop(); });
  }

  async function _mountNavigation({ state, levelId, moduleId, lessonId }) {
    const header = document.querySelector('.lesson-header');
    if (!header) return;
    const lessons = await state.getAllLessons();
    const index = lessons.findIndex((item) => item.levelId === levelId && item.moduleId === moduleId && item.id === lessonId);
    const previous = lessons[index - 1];
    const next = lessons[index + 1];
    const href = (item) => item ? buildLessonHash(item.levelId, item.moduleId, item.id) : null;
    const tools = document.createElement('div');
    tools.className = 'lesson-tools';
    tools.innerHTML = `<label>Sotaque <select class="audio-accent" aria-label="Sotaque do áudio"><option value="us">Americano</option><option value="gb">Britânico</option></select></label><label>Velocidade <select class="audio-rate" aria-label="Velocidade do áudio"><option value="0.7">0,7x</option><option value="0.9">0,9x</option><option value="1">1x</option><option value="1.15">1,15x</option></select></label><a class="btn btn--ghost" href="#/plano/${levelId}/${moduleId}/${lessonId}">Planejar esta aula</a><button class="btn btn--ghost share-lesson" type="button">Compartilhar lição</button>`;
    header.appendChild(tools);
    const select = tools.querySelector('.audio-rate');
    select.value = String(state.getAudioRate());
    select.addEventListener('change', () => AudioEngine.setRate(state.setAudioRate(select.value)));
    const accent = tools.querySelector('.audio-accent');
    accent.value = state.getAudioAccent();
    accent.addEventListener('change', () => AudioEngine.setAccent(state.setAudioAccent(accent.value)));
    tools.querySelector('.share-lesson').addEventListener('click', async (event) => {
      const button = event.currentTarget;
      const data = { title: document.title, text: header.querySelector('h1')?.textContent || 'Johnson English', url: location.href };
      try {
        if (navigator.share) await navigator.share(data);
        else await navigator.clipboard.writeText(data.url);
        button.textContent = navigator.share ? 'Compartilhado' : 'Link copiado';
      } catch (error) {
        if (error.name !== 'AbortError') button.textContent = 'Copie o endereço do navegador';
      }
    });

    const nav = document.createElement('nav');
    nav.className = 'lesson-sequence';
    nav.setAttribute('aria-label', 'Navegação entre lições');
    nav.innerHTML = `${previous ? `<a class="btn btn--ghost" href="${href(previous)}">Lição anterior</a>` : '<span></span>'}${next ? `<a class="btn btn--primary" href="${href(next)}">Próxima lição</a>` : '<a class="btn btn--primary" href="#/levels">Rever níveis</a>'}`;
    document.querySelector('.lesson-content')?.appendChild(nav);
  }

  function _markCompleted({ state, levelId, moduleId, lessonId }) {
    const completed = new Set(state.getCompletedActivities(levelId, moduleId, lessonId));
    document.querySelectorAll('.lesson-nav-item').forEach((item) => {
      const id = item.dataset.section || '';
      const activity = id.includes('listening') ? 'listening' : id.includes('repetition') ? 'repetition' : id.includes('practice') ? 'practice' : id.includes('production') ? 'production' : null;
      if (activity && completed.has(activity)) item.classList.add('completed');
    });
  }

  function hydrate(context) {
    _disposeRecording();
    _mountRecorder();
    _markCompleted(context);
    _mountNavigation(context);
  }

  return { hydrate, dispose: _disposeRecording };
})();
