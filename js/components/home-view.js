/**
 * home-view.js — Página inicial
 * Johnson English — Laboratório de Língua
 */

export const HomeView = (() => {
  async function render({ state }) {
    let levelCount = 0;
    try {
      const levels = await state.getLevels();
      levelCount   = levels.length;
    } catch (_) {}

    return `
      <section class="hero">
        <div class="hero-content">
          <p class="hero-eyebrow">Laboratório de Língua</p>
          <h1 class="hero-title">Johnson English</h1>
          <p class="hero-lead">
            Um curso acadêmico de inglês baseado no método clássico do Trivium —
            Absorção, Estrutura e Produção — para quem quer compreender a língua,
            não apenas sobreviver nela.
          </p>
          <a href="#/levels" class="btn btn--primary">Começar a Estudar</a>
          <a href="#/about" class="btn btn--ghost" style="margin-left:0.75rem">Como funciona</a>
        </div>
      </section>

      <div class="page-container">
        <section class="section">
          <h2 class="section-title">O Método do Trivium</h2>
          <p class="section-subtitle">
            Todas as lições seguem três etapas, nessa ordem. Você absorve antes de
            analisar. Você analisa antes de produzir.
          </p>
          <div class="trivium-stages">
            <div class="trivium-stage trivium-stage--grammar">
              <p class="trivium-stage-number">Etapa 1</p>
              <h3 class="trivium-stage-name">Gramática</h3>
              <p class="trivium-stage-description">
                Absorva a língua. Ouça, repita, pratique <em>shadowing</em>.
                Os padrões entram na mente antes de as regras serem explicadas.
              </p>
            </div>
            <div class="trivium-stage trivium-stage--logic">
              <p class="trivium-stage-number">Etapa 2</p>
              <h3 class="trivium-stage-name">Lógica</h3>
              <p class="trivium-stage-description">
                Compreenda a estrutura. Reorganize frases, complete lacunas,
                corrija erros. Raciocine sobre como a língua funciona.
              </p>
            </div>
            <div class="trivium-stage trivium-stage--rhetoric">
              <p class="trivium-stage-number">Etapa 3</p>
              <h3 class="trivium-stage-name">Retórica</h3>
              <p class="trivium-stage-description">
                Produza linguagem. Responda perguntas, descreva situações e
                simule conversas reais em inglês.
              </p>
            </div>
          </div>
        </section>

        <section class="section">
          <h2 class="section-title">Níveis</h2>
          <p class="section-subtitle">
            ${levelCount > 0
              ? `${levelCount} nível${levelCount !== 1 ? 'is' : ''} CEFR disponív${levelCount !== 1 ? 'eis' : 'el'}.`
              : 'Carregando níveis…'}
            Siga-os em ordem para melhores resultados.
          </p>
          <a href="#/levels" class="btn btn--secondary">Ver Todos os Níveis</a>
        </section>

        <section class="section">
          <h2 class="section-title">Ecossistema Educacional</h2>
          <p class="section-subtitle">
            Johnson English é um dos quatro laboratórios de aprendizagem interligados.
          </p>
          <div class="card-grid">
            <div class="card">
              <p class="card-eyebrow">História</p>
              <h3 class="card-title">Heródoto</h3>
              <p class="card-description">Narrativas históricas, fontes primárias e análise cronológica seguindo o modelo clássico.</p>
            </div>
            <div class="card">
              <p class="card-eyebrow">Matemática</p>
              <h3 class="card-title">Euclides</h3>
              <p class="card-description">Matemática interativa alinhada ao currículo BNCC/ENEM, da aritmética ao cálculo.</p>
            </div>
            <div class="card">
              <p class="card-eyebrow">Língua Portuguesa</p>
              <h3 class="card-title">Quintiliano</h3>
              <p class="card-description">Língua portuguesa, literatura e retórica enraizadas na tradição do Trivium.</p>
            </div>
            <div class="card">
              <p class="card-eyebrow">Língua Inglesa</p>
              <h3 class="card-title">Johnson English</h3>
              <p class="card-description">Este site. Laboratório de inglês por meio de escuta, estrutura e produção.</p>
            </div>
          </div>
        </section>
      </div>`;
  }

  function hydrate() {}

  return { render, hydrate };
})();
