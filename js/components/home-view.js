/** Página inicial e retomada de estudo. */

import { escapeHtml as _escape, escapeAttr as _escapeAttr } from '../utils/html-safety.js';

export const HomeView = (() => {
  async function render({ state }) {
    let levels = [];
    let summary = { percent: 0, lessons: 0 };
    let lastLesson = null;
    try {
      levels = await state.getLevels();
      summary = await state.getProgressSummary();
      const lastKey = state.getLastLesson();
      if (lastKey) {
        const [levelId, moduleId, lessonId] = lastKey.split('/');
        const lesson = await state.getLessonAsync(levelId, moduleId, lessonId);
        if (lesson) lastLesson = { ...lesson, href: `#/lesson/${lastKey}` };
      }
    } catch (_) {}

    return `
      <section class="hero hero--home"><div class="hero-content home-hero-grid">
        <div><p class="hero-eyebrow">Laboratório de Língua</p><h1 class="hero-title">Inglês para compreender, praticar e usar.</h1>
          <p class="hero-lead">Um percurso completo do A1 ao C2, com escuta, estrutura, pronúncia e produção real.</p>
          <div class="hero-actions"><a href="${lastLesson ? _escapeAttr(lastLesson.href) : '#/levels'}" class="btn btn--primary">${lastLesson ? 'Continuar estudando' : 'Começar a estudar'}</a><a href="#/buscar" class="btn btn--ghost">Explorar conteúdo</a></div>
        </div>
        <aside class="study-summary" aria-label="Seu progresso neste dispositivo"><span class="study-summary-label">Neste dispositivo</span><strong class="study-summary-value">${summary.percent}%</strong><span class="study-summary-caption">do percurso concluído</span><div class="progress-track" role="progressbar" aria-valuenow="${summary.percent}" aria-valuemin="0" aria-valuemax="100"><span style="width:${summary.percent}%"></span></div>${lastLesson ? `<p>Última lição: <a href="${_escapeAttr(lastLesson.href)}">${_escape(lastLesson.title)}</a></p>` : '<p>Seu progresso fica salvo apenas neste navegador.</p>'}</aside>
      </div></section>
      <div class="page-container home-sections">
        <form id="home-search" class="search-callout" role="search"><div><h2>O que você quer estudar?</h2><p>Busque uma habilidade, situação, tema ou ponto gramatical.</p></div><div class="search-field-row"><label class="sr-only" for="home-search-input">Buscar no curso</label><input id="home-search-input" type="search" placeholder="Ex.: viagem, present perfect, pronúncia" required><button class="btn btn--primary" type="submit">Buscar</button></div></form>
        <section class="section"><div class="section-heading-row"><div><p class="hero-eyebrow">Percurso CEFR</p><h2 class="section-title">Seis níveis, uma progressão clara</h2></div><a href="#/levels" class="text-link">Ver todos os níveis</a></div><div class="level-strip">${levels.map((level) => `<a href="#/level/${_escapeAttr(level.id)}"><strong>${_escape(level.id.toUpperCase())}</strong><span>${_escape(level.label)}</span></a>`).join('')}</div></section>
        <section class="section"><p class="hero-eyebrow">Método</p><h2 class="section-title">Da absorção à expressão</h2><p class="section-subtitle">Cada lição conduz você por três movimentos complementares.</p><div class="trivium-stages">
          <article class="trivium-stage trivium-stage--grammar"><p class="trivium-stage-number">01</p><h3 class="trivium-stage-name">Gramática</h3><p>Escute, observe e repita até reconhecer os padrões da língua.</p></article>
          <article class="trivium-stage trivium-stage--logic"><p class="trivium-stage-number">02</p><h3 class="trivium-stage-name">Lógica</h3><p>Organize, compare e pratique para compreender como a estrutura funciona.</p></article>
          <article class="trivium-stage trivium-stage--rhetoric"><p class="trivium-stage-number">03</p><h3 class="trivium-stage-name">Retórica</h3><p>Escreva e fale para transformar conhecimento em comunicação.</p></article>
        </div></section>
        <section class="section home-note"><div><p class="hero-eyebrow">Estudo complementar</p><h2 class="section-title">Leve a aula com você</h2></div><p>Use as lições entre os encontros, repita o áudio no seu ritmo e grave sua voz sem enviar dados a nenhum servidor.</p></section>
      </div>`;
  }
  function hydrate() { document.getElementById('home-search')?.addEventListener('submit', (event) => { event.preventDefault(); const query = document.getElementById('home-search-input')?.value.trim(); if (query) location.hash = `#/buscar/${encodeURIComponent(query)}`; }); }
  return { render, hydrate };
})();
