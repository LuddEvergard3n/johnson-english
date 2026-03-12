/**
 * about-view.js — Página "Sobre o Johnson English"
 * Johnson English — Laboratório de Língua
 *
 * Conteúdo: epígrafe, métricas, método Trivium, o nome, notas técnicas,
 * secção do ecossistema educacional.
 */

export const AboutView = (() => {

  function _escape(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  const ECOSYSTEM = [
    { name: 'Johnson English', subject: 'Língua Inglesa',    url: 'https://luddevergard3n.github.io/johnson-english/', active: true },
    { name: 'Heródoto',        subject: 'História',           url: 'https://luddevergard3n.github.io/Herodoto/'        },
    { name: 'Euclides',        subject: 'Matemática',         url: 'https://luddevergard3n.github.io/euclides/'        },
    { name: 'Quintiliano',     subject: 'Língua Portuguesa',  url: 'https://luddevergard3n.github.io/quintiliano/'     },
    { name: 'Lavoisier',       subject: 'Química',            url: 'https://luddevergard3n.github.io/lavoisier/'       },
    { name: 'Humboldt',        subject: 'Geografia',          url: 'https://luddevergard3n.github.io/humboldt/'        },
    { name: 'Archimedes',      subject: 'Física e Ciências',  url: 'https://luddevergard3n.github.io/archimedes/'      },
  ];

  function _renderEcosystem() {
    const cards = ECOSYSTEM.map(p => {
      if (p.active) {
        return `<div class="eco-card eco-card--active">
          <span class="eco-name">${_escape(p.name)}</span>
          <span class="eco-subject">${_escape(p.subject)}</span>
        </div>`;
      }
      return `<a href="${_escape(p.url)}" class="eco-card" target="_blank" rel="noopener noreferrer">
        <span class="eco-name">${_escape(p.name)}</span>
        <span class="eco-subject">${_escape(p.subject)}</span>
      </a>`;
    }).join('');

    return `
      <div class="ecosystem-band">
        <div class="ecosystem-band-inner">
          <p class="ecosystem-band-title">Ecossistema Educacional</p>
          <div class="ecosystem-grid">${cards}</div>
        </div>
      </div>`;
  }

  async function render() {
    return `
      <div class="page-container">
        <h1>Sobre o Johnson English</h1>
        <p class="section-subtitle">Um laboratório de língua &mdash; não um jogo de língua.</p>

        <blockquote class="about-epigraph">
          &laquo;He that will learn to write well must first learn to read well,
          and he that would speak properly must first learn to think correctly.
          Words are the daughters of earth, and things are the sons of heaven.&raquo;
          <cite>&mdash; Samuel Johnson, <em>A Dictionary of the English Language</em>, 1755</cite>
        </blockquote>

        <h2 class="about-section-title">
          O Projeto em Números
          <span style="font-family:var(--font-sans);font-size:0.72rem;font-weight:700;
                       background:var(--color-accent);color:#fff;padding:2px 8px;
                       border-radius:3px;vertical-align:middle;margin-left:0.5rem;
                       letter-spacing:0.04em">v1.9</span>
        </h2>
        <div class="about-metrics">
          <div class="metric-card"><span class="metric-value">209</span><span class="metric-label">Lições</span></div>
          <div class="metric-card"><span class="metric-value">55</span><span class="metric-label">Módulos</span></div>
          <div class="metric-card"><span class="metric-value">6</span><span class="metric-label">Níveis CEFR</span></div>
          <div class="metric-card"><span class="metric-value">A1–C2</span><span class="metric-label">Cobertura</span></div>
          <div class="metric-card"><span class="metric-value">3</span><span class="metric-label">Etapas / Lição</span></div>
          <div class="metric-card"><span class="metric-value">0</span><span class="metric-label">Dependências externas</span></div>
        </div>

        <section class="section">
          <h2 class="about-section-title">O Método do Trivium</h2>
          <p>O Trivium clássico era o currículo fundamental das universidades medievais europeias,
          composto por três artes da linguagem: Gramática, Lógica (Dialética) e Retórica.
          Aplicadas à aquisição de inglês, essas três etapas descrevem a ordem natural pela qual
          os seres humanos absorvem, analisam e produzem linguagem.</p>
          <p>O Johnson English segue essa ordem deliberadamente. Você não começa memorizando
          tabelas de conjugação. Você começa ouvindo — deixando que os padrões do inglês
          entrem na sua mente antes de nomeá-los conscientemente.</p>
          <div class="trivium-stages">
            <div class="trivium-stage trivium-stage--grammar">
              <p class="trivium-stage-number">Etapa 1 &mdash; Gramática</p>
              <h3 class="trivium-stage-name">Absorção</h3>
              <p class="trivium-stage-description">
                O aluno ouve, repete e pratica <em>shadowing</em>. O vocabulário é
                encontrado em contexto antes das definições. Esta etapa treina a
                memória fonológica e lexical.
              </p>
            </div>
            <div class="trivium-stage trivium-stage--logic">
              <p class="trivium-stage-number">Etapa 2 &mdash; Lógica</p>
              <h3 class="trivium-stage-name">Estrutura</h3>
              <p class="trivium-stage-description">
                O aluno reorganiza frases, preenche lacunas e responde questões de
                múltipla escolha. O padrão se torna regra consciente.
              </p>
            </div>
            <div class="trivium-stage trivium-stage--rhetoric">
              <p class="trivium-stage-number">Etapa 3 &mdash; Retórica</p>
              <h3 class="trivium-stage-name">Produção</h3>
              <p class="trivium-stage-description">
                O aluno responde perguntas abertas, simula diálogos e descreve
                experiências pessoais em inglês.
              </p>
            </div>
          </div>
        </section>

        <section class="section">
          <h2 class="about-section-title">Imersão Progressiva: A1–B2 em Português, C1–C2 em Inglês</h2>
          <p>Nos níveis A1 a B2, todas as explicações, exemplos e feedback estão em português —
          o suporte cognitivo é necessário quando a língua ainda é um obstáculo ao pensamento.
          A partir do módulo C1 (m28), o sistema muda: todo o conteúdo passa a ser
          integralmente em inglês, sem traduções.</p>
          <p>Esta decisão é pedagógica. Um falante C1 já internalizou os mecanismos fundamentais
          da língua. Continuar em português nessa fase seria manter um andaime numa construção
          já sólida. A imersão total não é desafio adicional — é reconhecimento do nível real.</p>
        </section>

        <section class="section">
          <h2 class="about-section-title">O Nome</h2>
          <p>Samuel Johnson (1709–1784) compilou o primeiro dicionário abrangente da
          língua inglesa, publicado em 1755 após quase nove anos de trabalho. A obra continha
          42.773 verbetes, cada um ilustrado com citações de autores canónicos — Shakespeare,
          Milton, Dryden — demonstrando o uso real das palavras em contexto, não apenas
          definições abstratas.</p>
          <p>Este laboratório leva seu nome como reconhecimento de que o inglês, como
          qualquer língua, recompensa o estudo sério e metódico — e de que o sentido
          das palavras não existe em abstrato, mas no uso.</p>
        </section>

        <section class="section">
          <h2 class="about-section-title">Notas Técnicas</h2>
          <p>O Johnson English é construído com HTML5, CSS3 e ES Modules de JavaScript —
          sem frameworks, sem dependências externas, sem etapa de build. O site funciona
          diretamente do repositório no GitHub Pages.</p>
          <p>O áudio é gerado pela <strong>Web Speech API</strong> nativa do browser —
          sem servidor, sem conta, sem instalação. Degrada silenciosamente quando o browser
          não suporta a API.</p>
          <p>Código-fonte:
          <a href="https://github.com/LuddEvergard3n/johnson-english" target="_blank" rel="noopener noreferrer">
            github.com/LuddEvergard3n/johnson-english
          </a> — Licença MIT.</p>
        </section>
      </div>

      ${_renderEcosystem()}
    `;
  }

  return { render };
})();
