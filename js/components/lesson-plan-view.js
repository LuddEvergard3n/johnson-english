/**
 * lesson-plan-view.js — Gerador de Plano de Aula
 * Johnson English — Laboratório de Língua
 *
 * Retorna o HTML do layout de dois painéis (formulário + preview).
 * Toda a interactividade é gerida por lesson-plan-engine.js após hydrate().
 */

export const LessonPlanView = (() => {

  async function render() {
    return `
      <div class="plan-layout">

        <!-- ── Painel esquerdo: formulário ─────────────────────────── -->
        <div class="plan-form-panel">
          <div class="plan-form-header">
            <h2>Plano de Aula</h2>
            <p>Preencha os campos e clique em Gerar Plano</p>
          </div>
          <div class="plan-form-body">

            <div class="plan-section-title">Identificação</div>

            <div class="plan-row">
              <div class="plan-field">
                <label for="pf-professor">Professor(a)</label>
                <input type="text" id="pf-professor" placeholder="Nome do professor">
              </div>
              <div class="plan-field">
                <label for="pf-turma">Turma / Grupo</label>
                <input type="text" id="pf-turma" placeholder="Ex: 9º A / Adultos B1">
              </div>
            </div>

            <div class="plan-row plan-row--3">
              <div class="plan-field">
                <label for="pf-data">Data</label>
                <input type="date" id="pf-data">
              </div>
              <div class="plan-field">
                <label for="pf-naulas">Nº de Aulas</label>
                <input type="number" id="pf-naulas" min="1" max="10" value="1"
                       oninput="window._planCalcCarga()">
              </div>
              <div class="plan-field">
                <label for="pf-carga">Carga Total</label>
                <input type="text" id="pf-carga" readonly>
              </div>
            </div>

            <div class="plan-row plan-row--3">
              <div class="plan-field">
                <label for="pf-nivel">Nível CEFR</label>
                <select id="pf-nivel" onchange="window._planOnNivel()">
                  <option value="">Selecione…</option>
                  <option value="a1">A1 — Iniciante</option>
                  <option value="a2">A2 — Elementar</option>
                  <option value="b1">B1 — Intermediário</option>
                  <option value="b2">B2 — Interm. Superior</option>
                  <option value="c1">C1 — Avançado</option>
                  <option value="c2">C2 — Domínio</option>
                </select>
              </div>
              <div class="plan-field">
                <label for="pf-dur">Duração / Aula</label>
                <select id="pf-dur" onchange="window._planCalcCarga()">
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="50" selected>50 min</option>
                  <option value="60">60 min</option>
                  <option value="90">1h30</option>
                  <option value="120">2h</option>
                </select>
              </div>
              <div class="plan-field">
                <label for="pf-habilidade">Habilidade Principal</label>
                <select id="pf-habilidade">
                  <option value="">Selecione…</option>
                  <option value="Listening">Listening</option>
                  <option value="Speaking">Speaking</option>
                  <option value="Reading">Reading</option>
                  <option value="Writing">Writing</option>
                  <option value="Grammar">Grammar</option>
                  <option value="Vocabulary">Vocabulary</option>
                  <option value="Pronunciation">Pronunciation</option>
                  <option value="Integrada">Integrada (4 habilidades)</option>
                </select>
              </div>
            </div>

            <div class="plan-row">
              <div class="plan-field" style="grid-column:1/-1">
                <label for="pf-tema">Tema / Título da Aula</label>
                <input type="text" id="pf-tema" placeholder="Ex: Present Perfect — Experiências de Vida">
              </div>
            </div>

            <div class="plan-section-title">Objetivos de Aprendizagem</div>
            <div id="box-obj" class="checkbox-panel">
              <p class="plan-placeholder">Selecione o nível CEFR acima…</p>
            </div>
            <div class="plan-field">
              <label for="pf-obj-extra">Adicionar objetivo livre</label>
              <textarea id="pf-obj-extra" placeholder="Descreva objetivos adicionais…"></textarea>
            </div>

            <div class="plan-section-title">Atividades</div>
            <div id="box-ativ" class="checkbox-panel">
              <p class="plan-placeholder">Selecione o nível CEFR acima…</p>
            </div>
            <div class="plan-field">
              <label for="pf-ativ-extra">Atividades adicionais</label>
              <textarea id="pf-ativ-extra" placeholder="Descreva atividades específicas…"></textarea>
            </div>

            <div class="plan-section-title">Recursos Didáticos</div>
            <div id="box-rec" class="checkbox-panel"></div>
            <div class="plan-field">
              <label for="pf-rec-extra">Outros recursos</label>
              <textarea id="pf-rec-extra" placeholder="Ex: vídeo específico, material impresso…"></textarea>
            </div>

            <div class="plan-section-title">Avaliação</div>
            <div id="box-ava" class="checkbox-panel"></div>
            <div class="plan-field">
              <label for="pf-ava-extra">Critérios adicionais</label>
              <textarea id="pf-ava-extra" placeholder="Critérios específicos de avaliação…"></textarea>
            </div>

            <div class="plan-section-title">Observações</div>
            <div class="plan-field">
              <label for="pf-obs">Notas, adaptações, diferenciação</label>
              <textarea id="pf-obs" rows="3" placeholder="Alunos com necessidades especiais, adaptações curriculares…"></textarea>
            </div>

          </div><!-- /plan-form-body -->

          <div class="plan-actions">
            <button class="btn btn--primary" onclick="window._planGerar()">Gerar Plano</button>
            <button class="btn btn--ghost"   onclick="window._planLimpar()">Limpar</button>
          </div>
        </div><!-- /plan-form-panel -->

        <!-- ── Painel direito: preview ──────────────────────────────── -->
        <div class="plan-preview-panel">
          <div class="plan-preview-header">
            <h3>Pré-visualização</h3>
            <button class="btn btn--secondary" onclick="window.print()" style="font-size:0.8rem;padding:4px 12px">
              Imprimir / Salvar PDF
            </button>
          </div>
          <div id="plan-doc">
            <p class="plan-empty">Preencha o formulário e clique em <strong>Gerar Plano</strong>.</p>
          </div>
        </div>

      </div><!-- /plan-layout -->
    `;
  }

  return { render };
})();
