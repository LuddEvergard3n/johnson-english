/**
 * not-found-view.js — Página 404
 * Johnson English — Laboratório de Língua
 */

export const NotFoundView = (() => {
  async function render() {
    return `
      <div class="page-container" style="text-align:center;padding-top:4rem;">
        <h1>Página Não Encontrada</h1>
        <p class="section-subtitle">
          A página que você solicitou não existe.
        </p>
        <a href="#/" class="btn btn--primary">Voltar ao Início</a>
      </div>`;
  }
  return { render };
})();
