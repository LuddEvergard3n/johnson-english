/**
 * about-view.js — Página "Sobre"
 * Johnson English — Laboratório de Língua
 */

export const AboutView = (() => {
  async function render() {
    return `
      <div class="page-container">
        <h1>Sobre o Johnson English</h1>
        <p class="section-subtitle">
          Um laboratório de língua — não um jogo de língua.
        </p>

        <section class="section">
          <h2>O Trivium Aplicado à Língua</h2>
          <p>
            O Trivium clássico era o currículo fundamental das universidades
            medievais europeias, composto por três artes da linguagem:
            Gramática, Lógica (Dialética) e Retórica. Aplicadas à aquisição
            de língua, essas três etapas descrevem uma ordem natural pela qual
            os seres humanos absorvem, analisam e produzem linguagem.
          </p>
          <p>
            O Johnson English segue essa ordem deliberadamente. Você não começa
            memorizando tabelas de conjugação. Você começa ouvindo — deixando
            que os padrões do inglês entrem na sua mente antes de nomeá-los
            conscientemente.
          </p>
        </section>

        <section class="section">
          <h2>As Três Etapas</h2>
          <div class="trivium-stages">
            <div class="trivium-stage trivium-stage--grammar">
              <p class="trivium-stage-number">Etapa 1 — Gramática</p>
              <h3 class="trivium-stage-name">Absorção</h3>
              <p class="trivium-stage-description">
                O aluno ouve, repita e pratica <em>shadowing</em>. O vocabulário é
                encontrado em contexto antes das definições. Esta etapa treina
                a memória fonológica e lexical.
              </p>
            </div>
            <div class="trivium-stage trivium-stage--logic">
              <p class="trivium-stage-number">Etapa 2 — Lógica</p>
              <h3 class="trivium-stage-name">Estrutura</h3>
              <p class="trivium-stage-description">
                O aluno reorganiza frases, preenche lacunas, corrige erros e
                transforma estruturas. Padrão se torna regra. Esta etapa torna
                explícito o conhecimento implícito.
              </p>
            </div>
            <div class="trivium-stage trivium-stage--rhetoric">
              <p class="trivium-stage-number">Etapa 3 — Retórica</p>
              <h3 class="trivium-stage-name">Produção</h3>
              <p class="trivium-stage-description">
                O aluno responde perguntas, simula diálogos e descreve
                experiências pessoais. A língua se torna comunicação.
              </p>
            </div>
          </div>
        </section>

        <section class="section">
          <h2>O Nome</h2>
          <p>
            Samuel Johnson (1709–1784) compilou o primeiro dicionário abrangente
            da língua inglesa, publicado em 1755. Seu trabalho demonstrou que o
            inglês poderia ser estudado com o mesmo rigor e disciplina do grego
            ou do latim. Este laboratório leva seu nome como reconhecimento de
            que o inglês, como qualquer língua, recompensa o estudo sério e metódico.
          </p>
        </section>

        <section class="section">
          <h2>Notas Técnicas</h2>
          <p>
            Este site é construído com HTML5 puro, CSS3 e ES Modules de JavaScript
            — sem frameworks. O áudio é gerado por um servidor Coqui TTS hospedado
            localmente. O site funciona completamente sem o servidor de áudio; as
            atividades de escuta exibem um estado alternativo quando o servidor
            não está disponível.
          </p>
          <p>
            Johnson English faz parte de um ecossistema educacional de quatro sites:
            Heródoto (História), Euclides (Matemática), Quintiliano (Língua Portuguesa)
            e Johnson English.
          </p>
        </section>
      </div>`;
  }

  return { render };
})();
