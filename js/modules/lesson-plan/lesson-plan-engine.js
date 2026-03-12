/**
 * lesson-plan-engine.js — Lógica interactiva do Gerador de Plano de Aula
 * Johnson English — Laboratório de Língua
 *
 * Responsabilidades:
 *   - Expor funções globais usadas pelos event handlers inline do HTML
 *     (window._planGerar, window._planOnNivel, window._planCalcCarga, window._planLimpar)
 *   - Renderizar checkboxes dinâmicos por nível
 *   - Gerar o documento HTML na preview
 *   - Calcular carga horária automaticamente
 *
 * Dependências: nenhuma (vanilla JS, sem imports externos)
 */

export const LessonPlanEngine = (() => {

  /* ── Dados: Objetivos por nível ────────────────────────────────────── */
  const OBJETIVOS = {
    a1: [
      'Identificar e usar cumprimentos básicos em inglês',
      'Compreender e usar o verbo "to be" em frases simples',
      'Nomear objetos e lugares do cotidiano',
      'Produzir frases afirmativas e negativas no Present Simple',
      'Responder perguntas simples sobre si mesmo (nome, origem, profissão)',
      'Reconhecer vocabulário de família, números e cores',
    ],
    a2: [
      'Usar comparativos e superlativos com precisão',
      'Narrar eventos no Past Simple (regulares e irregulares)',
      'Expressar planos futuros com "will" e "going to"',
      'Usar modais básicos: must, have to, should, can',
      'Compreender e produzir textos descritivos simples',
      'Fazer e responder perguntas em situações cotidianas (viagem, compras, saúde)',
    ],
    b1: [
      'Distinguir e usar Present Perfect vs Past Simple corretamente',
      'Narrar histórias com Past Continuous + Past Simple',
      'Formular e responder ao First Conditional',
      'Usar a Voz Passiva no presente e no passado',
      'Produzir parágrafos coerentes com conectivos de contraste e causa',
      'Manter conversas de 5–10 minutos sobre temas familiares',
      'Usar Relative Clauses (who/which/that) em produção escrita',
    ],
    b2: [
      'Usar os tempos perfeitos com precisão (PP, PPC, Past Perfect)',
      'Formular hipóteses complexas com Second/Third/Mixed Conditionals',
      'Redigir ensaios argumentativos com discourse markers B2',
      'Usar Passive Voice em todos os tempos incluindo formas contínuas',
      'Inferir intenção e atitude do autor em textos densos',
      'Debater temas abstratos com estrutura argumento-evidência-conclusão',
    ],
    c1: [
      'Usar inversão formal com adverbiais negativos (Never have I / Not until)',
      'Produzir cleft sentences para ênfase e foco informacional',
      'Escrever com densidade académica (nominalização, hedging epistémico)',
      'Identificar e produzir dispositivos retóricos (anáfora, antítese, tricólon)',
      'Controlar o registo conscientemente em função do contexto',
      'Argumentar com precisão e sofisticação em discussão académica',
    ],
    c2: [
      'Usar construções absolutas e vocabulário arcaico/literário produtivamente',
      'Analisar o funcionamento ideológico da linguagem (CDA)',
      'Produzir texto em qualquer género convencional (op-ed, executive brief, obituário)',
      'Identificar e produzir metáforas conceptuais e extended metaphors',
      'Controlar density lexical e register blending deliberadamente',
      'Distinguir e usar vocabulário raro com precisão (tendentious, specious, apposite)',
    ],
  };

  /* ── Dados: Atividades por nível ───────────────────────────────────── */
  const ATIVIDADES = {
    a1: [
      'Shadowing de frases simples com áudio (Johnson English)',
      'Jogo de vocabulário: objeto → palavra em inglês',
      'Diálogo guiado: cumprimentos e apresentações',
      'Exercícios de múltipla escolha no Present Simple',
      'Atividade de preencher lacunas com verbo "to be"',
      'Flash cards de vocabulário temático',
    ],
    a2: [
      'Shadowing de narrativas curtas no Past Simple',
      'Role-play: situação real (compras, viagem, consulta médica)',
      'Exercício de comparação: descrever duas pessoas/lugares',
      'Listening: identificar informações específicas em diálogos',
      'Escrita: parágrafo descritivo com comparativos e superlativos',
      'Jogo de perguntas e respostas sobre experiências passadas',
    ],
    b1: [
      'Shadowing de diálogos mais longos (B1 Real Life)',
      'Discussão em pares: temas familiares com Present Perfect',
      'Análise de erros: identificar e corrigir frases incorretas',
      'Escrita guiada: e-mail formal ou carta de reclamação',
      'Role-play: entrevista de emprego em inglês',
      'Gramática induzida: identificar padrão antes da regra',
    ],
    b2: [
      'Debate estruturado com argumento-evidência-conclusão',
      'Análise de texto: identificar posição e hedging do autor',
      'Escrita: ensaio argumentativo de 200–250 palavras',
      'Transformação gramatical: ativo ↔ passivo em contexto',
      'Listening crítico: identificar discourse markers em áudio',
      'Apresentação oral: 3 minutos sobre tema abstrato',
    ],
    c1: [
      'Produção de parágrafo académico com nominalização e hedging',
      'Análise retórica: identificar dispositivos em texto autêntico',
      'Debate com regra de hedging obrigatório por argumento',
      'Escrita: reformular parágrafo informal em registo académico',
      'Atividade de word formation: cadeias derivacionais',
      'Shadowing de discurso académico (TED Talk / lecture extract)',
    ],
    c2: [
      'Análise CDA de texto jornalístico ou político',
      'Produção de género textual específico (op-ed, manifesto, executive brief)',
      'Discussão: metáforas conceptuais em discurso público',
      'Exercício de style mimicry: identificar e replicar estilo de um autor',
      'Debate filosófico com vocabulário raro (tendentious, specious, apposite)',
      'Análise de densidade lexical em texto académico vs jornalístico',
    ],
  };

  /* ── Dados: Recursos (fixos, independentes de nível) ────────────────── */
  const RECURSOS = [
    'Johnson English (plataforma online)',
    'Quadro branco / projetor',
    'Material impresso (worksheets)',
    'Dispositivos individuais (tablet/computador)',
    'Áudio / Web Speech API',
    'Dicionário monolíngue em inglês',
    'Vídeo / excerto de podcast',
    'Cartões de vocabulário (flash cards)',
  ];

  /* ── Dados: Avaliação (fixos) ─────────────────────────────────────── */
  const AVALIACOES = [
    'Observação de participação oral',
    'Correcção de exercícios escritos',
    'Autoavaliação após atividade de produção',
    'Role-play / diálogo avaliado',
    'Entrega escrita (parágrafo / ensaio)',
    'Teste de vocabulário ou gramática',
    'Avaliação por pares (peer correction)',
    'Portfólio de produções da unidade',
  ];

  /* ── Utilitário: escape HTML ─────────────────────────────────────── */
  function _esc(str) {
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  /* ── Renderiza lista de checkboxes num painel ────────────────────── */
  function _renderChecks(boxId, items, prefix) {
    const box = document.getElementById(boxId);
    if (!box) return;
    if (!items || !items.length) {
      box.innerHTML = '<p class="plan-placeholder">Selecione o nível CEFR acima…</p>';
      return;
    }
    box.innerHTML = items.map((item, i) => `
      <label class="plan-item">
        <input type="checkbox" id="ck-${prefix}-${i}" class="${prefix}-ck"
               data-text="${_esc(item)}">
        <span>${_esc(item)}</span>
      </label>`).join('');
  }

  /* ── Coleta checkboxes marcados + textarea livre ─────────────────── */
  function _collect(prefix, extraId) {
    const checked = [...document.querySelectorAll(`.${prefix}-ck:checked`)]
      .map(c => c.dataset.text);
    const extra = (document.getElementById(extraId)?.value || '').trim();
    return extra ? [...checked, extra] : checked;
  }

  /* ── Gera uma seção do documento ─────────────────────────────────── */
  function _docSection(label, items) {
    if (!items || !items.length) return '';
    const list = items.map(i => `<li>${_esc(i)}</li>`).join('');
    return `
      <div class="doc-section">
        <span class="doc-section-label">${_esc(label)}</span>
        <div class="doc-section-content"><ul>${list}</ul></div>
      </div>`;
  }

  function _docField(label, value) {
    if (!value) return '';
    return `
      <div class="doc-section">
        <span class="doc-section-label">${_esc(label)}</span>
        <div class="doc-section-content"><p>${_esc(value)}</p></div>
      </div>`;
  }

  /* ── Calcula carga horária total ─────────────────────────────────── */
  function calcCarga() {
    const n   = parseInt(document.getElementById('pf-naulas')?.value || '1', 10) || 1;
    const dur = parseInt(document.getElementById('pf-dur')?.value    || '50', 10) || 50;
    const tot = n * dur;
    let txt;
    if (tot >= 60) {
      const h = Math.floor(tot / 60), r = tot % 60;
      txt = r ? `${h}h${String(r).padStart(2,'0')}min` : `${h}h`;
    } else {
      txt = `${tot} min`;
    }
    const el = document.getElementById('pf-carga');
    if (el) el.value = txt;
  }

  /* ── Atualiza checkboxes ao mudar o nível ────────────────────────── */
  function onNivel() {
    const nivel = document.getElementById('pf-nivel')?.value;
    _renderChecks('box-obj',  OBJETIVOS[nivel]  || null, 'obj');
    _renderChecks('box-ativ', ATIVIDADES[nivel] || null, 'ativ');
  }

  /* ── Gera o documento de plano de aula ──────────────────────────── */
  function gerar() {
    const get = id => (document.getElementById(id)?.value || '').trim();

    const professor  = get('pf-professor');
    const turma      = get('pf-turma');
    const data       = get('pf-data');
    const nivel      = document.getElementById('pf-nivel')?.options[document.getElementById('pf-nivel').selectedIndex]?.text || '';
    const habilidade = get('pf-habilidade');
    const tema       = get('pf-tema');
    const naulas     = get('pf-naulas') || '1';
    const carga      = get('pf-carga');
    const obs        = get('pf-obs');

    const objetivos  = _collect('obj',  'pf-obj-extra');
    const atividades = _collect('ativ', 'pf-ativ-extra');
    const recursos   = _collect('rec',  'pf-rec-extra');
    const avaliacao  = _collect('ava',  'pf-ava-extra');

    const dataFmt = data
      ? new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })
      : '—';

    const html = `
      <div class="doc-header">
        <div class="doc-title">${_esc(tema || 'Plano de Aula — Johnson English')}</div>
        <div class="doc-meta">Johnson English &mdash; Laboratório de Língua</div>
      </div>

      <div class="doc-id-grid">
        <div class="doc-id-item"><strong>Professor(a)</strong>${_esc(professor || '—')}</div>
        <div class="doc-id-item"><strong>Turma</strong>${_esc(turma || '—')}</div>
        <div class="doc-id-item"><strong>Data</strong>${dataFmt}</div>
        <div class="doc-id-item"><strong>Nível CEFR</strong>${_esc(nivel || '—')}</div>
        <div class="doc-id-item"><strong>Habilidade</strong>${_esc(habilidade || '—')}</div>
        <div class="doc-id-item"><strong>Carga</strong>${_esc(naulas)} aula(s) &times; ${_esc(carga)}</div>
      </div>

      <hr class="doc-divider">
      ${_docSection('Objetivos de Aprendizagem', objetivos)}
      ${_docSection('Atividades',                atividades)}
      ${_docSection('Recursos Didáticos',        recursos)}
      ${_docSection('Avaliação',                 avaliacao)}
      ${_docField('Observações / Adaptações',    obs)}
    `;

    const doc = document.getElementById('plan-doc');
    if (doc) doc.innerHTML = html;
  }

  /* ── Limpa formulário e preview ─────────────────────────────────── */
  function limpar() {
    const doc = document.getElementById('plan-doc');
    if (doc) doc.innerHTML = '<p class="plan-empty">Preencha o formulário e clique em <strong>Gerar Plano</strong>.</p>';

    ['pf-professor','pf-turma','pf-tema','pf-obj-extra','pf-ativ-extra',
     'pf-rec-extra','pf-ava-extra','pf-obs'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    const nivel = document.getElementById('pf-nivel');
    if (nivel) nivel.value = '';

    onNivel(); // repõe placeholders
    calcCarga();
  }

  /* ── Hidratação: expõe funções globais + inicializa ─────────────── */
  function hydrate() {
    /* Expor ao escopo global para os event handlers inline do HTML */
    window._planGerar     = gerar;
    window._planOnNivel   = onNivel;
    window._planCalcCarga = calcCarga;
    window._planLimpar    = limpar;

    /* Estado inicial */
    const dataEl = document.getElementById('pf-data');
    if (dataEl) dataEl.valueAsDate = new Date();

    calcCarga();

    /* Renderiza checkboxes fixos (recursos e avaliação) */
    _renderChecks('box-rec', RECURSOS,   'rec');
    _renderChecks('box-ava', AVALIACOES, 'ava');
  }

  return { hydrate };
})();
