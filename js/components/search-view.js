/** Busca local no currículo. */
import { escapeHtml as _escape, escapeAttr as _escapeAttr } from '../utils/html-safety.js';

export const SearchView = (() => {
  async function render({ params, state }) {
    const query = params[0] ? decodeURIComponent(params[0]) : '';
    const results = query ? await state.search(query) : [];
    return `<div class="page-container search-page"><p class="hero-eyebrow">Catálogo completo</p><h1>Buscar no Johnson English</h1>
      <form id="catalog-search" class="catalog-search" role="search"><label class="sr-only" for="catalog-search-input">Buscar no curso</label><input id="catalog-search-input" type="search" value="${_escapeAttr(query)}" placeholder="Tema, habilidade ou ponto gramatical" autofocus><button class="btn btn--primary" type="submit">Buscar</button></form>
      <div id="search-results" aria-live="polite">${query ? `<p class="search-count">${results.length} resultado${results.length === 1 ? '' : 's'} para <strong>${_escape(query)}</strong></p>` : '<p class="search-count">Digite o que deseja estudar.</p>'}<div class="search-results-grid">
        ${results.map((lesson) => `<a class="search-result" href="#/lesson/${_escapeAttr(lesson.levelId)}/${_escapeAttr(lesson.moduleId)}/${_escapeAttr(lesson.id)}"><span class="level-badge">${_escape(lesson.levelId.toUpperCase())}</span><div><h2>${_escape(lesson.title)}</h2><p>${_escape(lesson.description)}</p></div></a>`).join('') || (query ? '<div class="empty-state"><h2>Nenhuma lição encontrada</h2><p>Tente termos mais gerais, como “viagem”, “passado” ou “pronúncia”.</p></div>' : '')}
      </div></div></div>`;
  }
  function hydrate() { document.getElementById('catalog-search')?.addEventListener('submit', (event) => { event.preventDefault(); const query = document.getElementById('catalog-search-input')?.value.trim(); location.hash = query ? `#/buscar/${encodeURIComponent(query)}` : '#/buscar'; }); }
  return { render, hydrate };
})();
