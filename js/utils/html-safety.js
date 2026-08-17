/**
 * html-safety.js — Escape de HTML para inserção segura via innerHTML
 * Johnson English — Laboratório de Língua
 *
 * Fonte única desta lógica. Antes desta refatoração, a mesma função de
 * escape existia duplicada (com pequenas divergências) em 9 arquivos:
 * router.js, shadowing-engine.js, lesson-view.js, pronunciation-lesson-view.js,
 * levels-view.js, module-view.js, about-view.js, feedback-engine.js e
 * lesson-plan-engine.js. Qualquer correção de segurança feita em uma cópia
 * não se propagava às outras — este módulo elimina esse risco.
 */

/**
 * Escapa caracteres especiais de HTML para uso seguro como texto/conteúdo
 * dentro de innerHTML. Não escapa aspas simples — seguro para atributos
 * delimitados por aspas duplas, mas não para atributos com aspas simples.
 *
 * @param {*} str  Valor a escapar (será convertido para string)
 * @returns {string}
 */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Escapa para uso seguro dentro de qualquer atributo HTML, incluindo os
 * delimitados por aspas simples. Superset de escapeHtml — sempre seguro
 * também para conteúdo de texto comum.
 *
 * @param {*} str  Valor a escapar (será convertido para string)
 * @returns {string}
 */
export function escapeAttr(str) {
  return escapeHtml(str).replace(/'/g, '&#39;');
}
