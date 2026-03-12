/**
 * teacher-guide-view.js — Guia do Professor
 * Johnson English — Laboratório de Língua
 *
 * Página com sidebar de navegação por âncoras e cartões de actividades práticas.
 * Layout: sidebar fixa (260px) + conteúdo longo.
 * Sem hidratação: conteúdo totalmente estático.
 */

export const TeacherGuideView = (() => {

  async function render() {
    return `
      <div class="guide-layout">

        <!-- ── Sidebar de navegação ─────────────────────────────────── -->
        <aside class="guide-sidebar" aria-label="Índice do guia">
          <div class="guide-sidebar-panel">
            <div class="guide-sidebar-title">Guia do Professor</div>

            <div class="guide-nav-group">Sobre o método</div>
            <a class="guide-nav-link" href="#o-que-e">O que é o Johnson English?</a>
            <a class="guide-nav-link" href="#trivium">O Trivium na sala de aula</a>
            <a class="guide-nav-link" href="#estrutura">Estrutura de uma lição</a>
            <a class="guide-nav-link" href="#imersa">Imersão progressiva</a>

            <div class="guide-nav-group">Atividades práticas</div>
            <a class="guide-nav-link" href="#ativ-1">1 — Shadowing em dupla</a>
            <a class="guide-nav-link" href="#ativ-2">2 — Gramática induzida</a>
            <a class="guide-nav-link" href="#ativ-3">3 — Produção guiada</a>
            <a class="guide-nav-link" href="#ativ-4">4 — Debate por nível</a>
            <a class="guide-nav-link" href="#ativ-5">5 — Pronúncia em foco</a>

            <div class="guide-nav-group">Referência</div>
            <a class="guide-nav-link" href="#por-nivel">Orientações por nível</a>
            <a class="guide-nav-link" href="#limitacoes">Limitações e boas práticas</a>
          </div>
        </aside>

        <!-- ── Conteúdo principal ───────────────────────────────────── -->
        <div class="guide-content">

          <!-- 1. O que é -->
          <div class="guide-section" id="o-que-e">
            <h2>O que é o Johnson English?</h2>
            <p>O Johnson English é um laboratório académico de língua inglesa construído sobre
            o método clássico do Trivium. Não é um jogo de vocabulário, não é um sistema
            de pontos, não é um substituto para a sala de aula. É uma plataforma de prática
            estruturada que complementa o ensino presencial — especialmente útil quando o
            professor precisa de actividades com progressão pedagógica clara e rastreável.</p>
            <p>O currículo cobre os seis níveis CEFR (A1 a C2), com 55 módulos e 209 lições.
            Cada lição segue o mesmo padrão de três etapas: Gramática (absorção), Lógica
            (estrutura) e Retórica (produção).</p>
            <div class="callout callout--info">
              <strong>Para o professor:</strong> o site funciona diretamente no browser,
              sem instalação, sem conta, sem anúncios. Pode ser exibido no projetor da
              sala ou usado individualmente pelos alunos em dispositivos pessoais.
            </div>
          </div>

          <!-- 2. Trivium -->
          <div class="guide-section" id="trivium">
            <h2>O Trivium na Sala de Aula</h2>
            <p>O Trivium medieval era o currículo base das universidades europeias:
            Gramática, Lógica e Retórica. Aplicado à aquisição de língua, descreve a
            ordem natural de assimilação:</p>

            <h3>Etapa 1 — Gramática (Absorção)</h3>
            <p>O aluno é exposto à língua antes de a analisar. Ouve frases, repete,
            faz <em>shadowing</em>. O vocabulário aparece em contexto antes das
            definições. O objetivo não é compreender a regra — é reconhecer o padrão.</p>
            <div class="callout callout--tip">
              <strong>Estratégia em sala:</strong> use a etapa de Escuta como aquecimento.
              Reproduza o áudio sem mostrar o texto. Peça que os alunos identifiquem
              palavras que reconhecem antes de abrir a lição.
            </div>

            <h3>Etapa 2 — Lógica (Estrutura)</h3>
            <p>O aluno analisa o que já reconhece. Reorganiza frases, preenche lacunas,
            escolhe entre opções. A regra é introduzida <em>depois</em> do contato com
            a estrutura — cognitivamente mais eficaz do que apresentar a regra a frio.</p>
            <div class="callout callout--tip">
              <strong>Estratégia em sala:</strong> pause antes dos exercícios e pergunte:
              "Vocês já viram essa estrutura antes? Onde?" A discussão reativa o input
              da etapa anterior e prepara o processamento analítico.
            </div>

            <h3>Etapa 3 — Retórica (Produção)</h3>
            <p>O aluno usa a língua. Responde perguntas abertas, descreve situações,
            simula conversas. O objetivo é transferir o conhecimento formal para uso real.
            Esta é a etapa mais difícil — e a mais importante.</p>
            <div class="callout callout--tip">
              <strong>Estratégia em sala:</strong> os prompts de produção são propositalmente
              abertos. Use-os como ponto de partida para conversas em duplas ou pequenos
              grupos, não apenas como escrita individual.
            </div>
          </div>

          <!-- 3. Estrutura -->
          <div class="guide-section" id="estrutura">
            <h2>Estrutura de uma Lição</h2>
            <p>Cada lição normal tem seis seções sequenciais. As lições de pronúncia
            têm uma estrutura própria diferente.</p>

            <table class="skill-table">
              <thead>
                <tr><th>Seção</th><th>Nome</th><th>Etapa Trivium</th><th>O que acontece</th></tr>
              </thead>
              <tbody>
                <tr><td>1</td><td>Explicação</td><td>Gramática</td><td>Exposição da estrutura ou vocabulário com nota e dica</td></tr>
                <tr><td>2</td><td>Exemplos</td><td>Gramática</td><td>Frases-exemplo com áudio e tradução</td></tr>
                <tr><td>3</td><td>Escuta</td><td>Gramática</td><td>Frases para ouvir e repetir; botão de áudio por frase</td></tr>
                <tr><td>4</td><td>Repetição</td><td>Gramática</td><td>Shadowing guiado; o aluno tenta replicar o ritmo e pronúncia</td></tr>
                <tr><td>5</td><td>Prática</td><td>Lógica</td><td>Múltipla escolha, preencher lacuna, reorganizar frases</td></tr>
                <tr><td>6</td><td>Produção</td><td>Retórica</td><td>Prompts abertos; o aluno responde por escrito ou oralmente</td></tr>
              </tbody>
            </table>

            <h3>Lições de Pronúncia</h3>
            <p>Seis módulos são dedicados exclusivamente à pronúncia: m06 (A1), m13 (A2),
            m20 (B1), m27 (B2), m34 (C1) e m41 (C2). Essas lições têm estrutura diferente:
            Sons com símbolo IPA e dica articulatória, Pares Mínimos para contraste auditivo,
            Repetição e Produção. Não há seção de Prática com exercícios formais — pronúncia
            é verificada auditivamente, não por múltipla escolha.</p>
          </div>

          <!-- 4. Imersão -->
          <div class="guide-section" id="imersa">
            <h2>Imersão Progressiva</h2>
            <p>O Johnson English usa duas línguas de instrução dependendo do nível:</p>
            <table class="skill-table">
              <thead>
                <tr><th>Nível</th><th>Módulos</th><th>Língua de instrução</th><th>Rationale</th></tr>
              </thead>
              <tbody>
                <tr><td>A1–B2</td><td>m01–m27 + m42–m51</td><td>Português</td><td>A língua ainda é obstáculo cognitivo; suporte necessário</td></tr>
                <tr><td>C1–C2</td><td>m28–m41 + m52–m55</td><td>Inglês (total)</td><td>A imersão total é o estágio final antes da proficiência nativa</td></tr>
              </tbody>
            </table>
            <div class="callout callout--note">
              <strong>Atenção:</strong> não há traduções em nenhuma parte do C1 ou C2 —
              nem nos exercícios, nem nas explicações, nem no vocabulário. Prepare os
              alunos para esta transição antes de chegarem ao m28.
            </div>
          </div>

          <!-- Actividade 1 -->
          <div class="guide-section" id="ativ-1">
            <h2>Atividades Práticas para a Sala</h2>

            <div class="activity-card">
              <div class="activity-header">
                <span class="activity-num">Ativ. 1</span>
                <h3 class="activity-title">Shadowing em Dupla</h3>
              </div>
              <div class="activity-body">
                <div class="activity-meta">
                  <span class="meta-tag"><strong>Nível:</strong>
                    <span class="level-badge level-badge--a">A1</span>
                    <span class="level-badge level-badge--a">A2</span>
                    <span class="level-badge level-badge--b">B1</span>
                    <span class="level-badge level-badge--b">B2</span>
                  </span>
                  <span class="meta-tag"><strong>Duração:</strong> 15–20 min</span>
                  <span class="meta-tag"><strong>Modo:</strong> Duplas</span>
                </div>
                <p>Abra a seção de Repetição de qualquer lição. Um aluno lê a frase em voz alta.
                O parceiro ouve, espera 3 segundos e tenta reproduzir com o mesmo ritmo e entonação —
                sem olhar para o texto. Alternam após cada frase.</p>
                <p><strong>Variante:</strong> o parceiro dá feedback apenas sobre ritmo (rápido/lento/correto),
                não sobre pronúncia isolada de sons. Isso desloca o foco para fluência, não perfeição fonética.</p>
              </div>
            </div>

            <!-- Actividade 2 -->
            <div class="activity-card" id="ativ-2">
              <div class="activity-header">
                <span class="activity-num">Ativ. 2</span>
                <h3 class="activity-title">Gramática Induzida</h3>
              </div>
              <div class="activity-body">
                <div class="activity-meta">
                  <span class="meta-tag"><strong>Nível:</strong>
                    <span class="level-badge level-badge--b">B1</span>
                    <span class="level-badge level-badge--b">B2</span>
                  </span>
                  <span class="meta-tag"><strong>Duração:</strong> 20–30 min</span>
                  <span class="meta-tag"><strong>Modo:</strong> Grupos de 3–4</span>
                </div>
                <p>Antes de abrir a explicação da lição, mostre apenas os exemplos.
                Peça que os grupos identifiquem: (a) a estrutura gramatical usada,
                (b) a regra que a governa, (c) quando se usaria no dia a dia.
                Apenas depois compare com a explicação do site.</p>
                <p><strong>Variante:</strong> use lições de níveis diferentes em grupos diferentes.
                Cada grupo apresenta "sua" estrutura para a turma. Funciona bem com
                B1/B2 em aulas de revisão.</p>
              </div>
            </div>

            <!-- Actividade 3 -->
            <div class="activity-card" id="ativ-3">
              <div class="activity-header">
                <span class="activity-num">Ativ. 3</span>
                <h3 class="activity-title">Produção Guiada em Cadeia</h3>
              </div>
              <div class="activity-body">
                <div class="activity-meta">
                  <span class="meta-tag"><strong>Nível:</strong>
                    <span class="level-badge level-badge--a">A2</span>
                    <span class="level-badge level-badge--b">B1</span>
                    <span class="level-badge level-badge--b">B2</span>
                  </span>
                  <span class="meta-tag"><strong>Duração:</strong> 25–35 min</span>
                  <span class="meta-tag"><strong>Modo:</strong> Turma / roda</span>
                </div>
                <p>Use o prompt de Produção de uma lição como ponto de partida.
                O primeiro aluno responde com uma frase. O segundo deve continuar
                a história ou argumento do primeiro, acrescentando uma frase nova.
                E assim por diante. A cadeia termina quando um aluno não conseguir
                continuar coerentemente.</p>
                <p><strong>Regra:</strong> cada frase deve usar pelo menos uma palavra
                da frase anterior (connecting thread). Obriga a escuta ativa e raciocínio
                sobre coesão textual.</p>
              </div>
            </div>

            <!-- Actividade 4 -->
            <div class="activity-card" id="ativ-4">
              <div class="activity-header">
                <span class="activity-num">Ativ. 4</span>
                <h3 class="activity-title">Debate por Nível — "Agree or Disagree"</h3>
              </div>
              <div class="activity-body">
                <div class="activity-meta">
                  <span class="meta-tag"><strong>Nível:</strong>
                    <span class="level-badge level-badge--b">B2</span>
                    <span class="level-badge level-badge--c">C1</span>
                    <span class="level-badge level-badge--c">C2</span>
                  </span>
                  <span class="meta-tag"><strong>Duração:</strong> 30–45 min</span>
                  <span class="meta-tag"><strong>Modo:</strong> Dois grupos</span>
                </div>
                <p>Use os prompts de produção das lições C1 (m28–m34) ou C2 (m35–m41)
                como afirmações para debate. Divida a turma em dois grupos — um defende,
                outro ataca — independente de opiniões pessoais. O objetivo é praticar
                a argumentação em inglês, não chegar a uma conclusão.</p>
                <p>Para C1+: exija que cada argumento seja acompanhado de um <em>hedge</em>
                explícito ("It could be argued that...", "While this may be true...").
                Penalize argumentos categóricos sem qualificação — uma habilidade central de C1.</p>
              </div>
            </div>

            <!-- Actividade 5 -->
            <div class="activity-card" id="ativ-5">
              <div class="activity-header">
                <span class="activity-num">Ativ. 5</span>
                <h3 class="activity-title">Pronúncia em Foco — Pares Mínimos</h3>
              </div>
              <div class="activity-body">
                <div class="activity-meta">
                  <span class="meta-tag"><strong>Nível:</strong>
                    <span class="level-badge level-badge--a">A1</span>
                    <span class="level-badge level-badge--b">B1</span>
                    <span class="level-badge level-badge--c">C1</span>
                  </span>
                  <span class="meta-tag"><strong>Duração:</strong> 10–15 min</span>
                  <span class="meta-tag"><strong>Modo:</strong> Turma</span>
                </div>
                <p>Abra um módulo de pronúncia (m06, m13, m20, m27, m34 ou m41) e use
                a seção de Pares Mínimos. O professor diz uma palavra em voz alta (sem
                mostrar o texto). Os alunos levantam a mão esquerda para a palavra A
                ou a direita para a palavra B. Quem errar explica o que ouviu
                diferente — isso revela o problema fonológico específico.</p>
                <p><strong>Variante C1:</strong> use pares mínimos em frases completas.
                "He <em>lives</em> here" vs "He <em>leaves</em> here" — o significado
                muda; os alunos devem identificar a frase que faz sentido contextualmente.</p>
              </div>
            </div>
          </div>

          <!-- Por nível -->
          <div class="guide-section" id="por-nivel">
            <h2>Orientações por Nível</h2>

            <h3>A1–A2 — Construir a Fundação</h3>
            <p>Nestes níveis, o foco é a exposição repetida. Não corrija pronúncia em
            tempo real durante o shadowing — interromper o ritmo prejudica a fluência
            emergente. Reserve a correção para depois da atividade.</p>
            <p>Use tradução em português como andaime: o site fornece tradução automática
            em todos os exemplos e exercícios A1–A2. Não hesite em usá-la — a tradução
            aqui é ferramenta pedagógica, não muleta.</p>

            <h3>B1–B2 — Construir Precisão</h3>
            <p>A transição mais crítica do percurso. Os alunos B1 já se comunicam — o risco
            é fossilizar erros gramaticais por falta de atenção à estrutura. Use as lições
            de Lógica (seção de Prática) com foco analítico: peça que os alunos expliquem
            por que escolheram determinada resposta, não apenas qual escolheram.</p>

            <h3>C1–C2 — Construir Controlo</h3>
            <p>Toda a instrução é em inglês a partir do m28. Prepare os alunos antes da
            transição: avise com antecedência, fale sobre a política de imersão, normalize
            o desconforto inicial. Nos primeiros módulos C1, o aumento de dificuldade é
            intencional — não é falha do aluno.</p>
            <div class="callout callout--note">
              <strong>C2 — Language, Power and Genre (m55):</strong> este módulo introduz
              Critical Discourse Analysis. O conteúdo pode gerar debate sobre temas
              politicamente sensíveis (eufemismo, doublespeak, ideologia na linguagem).
              Considere estabelecer normas de discussão com a turma antes da lição.
            </div>
          </div>

          <!-- Limitações -->
          <div class="guide-section" id="limitacoes">
            <h2>Limitações e Boas Práticas</h2>
            <p>O Johnson English não avalia a produção oral — o site não grava nem analisa
            fala. As atividades de produção são autorreguladas: o aluno escreve ou fala,
            mas o site não valida a qualidade. <strong>O professor é o único avaliador
            da produção real.</strong></p>
            <p>O áudio é gerado por síntese de voz (Web Speech API) — a qualidade é
            adequada para reconhecimento de pronúncia e ritmo, mas não substitui o áudio
            gravado por falantes nativos para fins de perfeição prosódica.</p>
            <p>O currículo cobre conteúdo CEFR mas não é alinhado a nenhum exame
            específico (IELTS, TOEFL, Cambridge). Alunos que preparam certificações
            precisarão de material complementar focado no formato de exame.</p>
            <div class="callout callout--info">
              Comunicar estas limitações explicitamente aos alunos é parte do
              aprendizado: desenvolver um olhar crítico sobre ferramentas digitais
              de língua é tão importante quanto dominar as ferramentas em si.
            </div>
          </div>

        </div><!-- /guide-content -->
      </div><!-- /guide-layout -->
    `;
  }

  return { render };
})();
