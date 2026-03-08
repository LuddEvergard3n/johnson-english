/**
 * rhetoric-engine.js — Controlador da etapa de Retórica
 * Johnson English — Laboratório de Língua
 */

export const RhetoricEngine = (() => {
  function hydrate({ levelId, moduleId, lessonId, state }) {
    _hydrateProduction(levelId, moduleId, lessonId, state);
  }

  function _hydrateProduction(levelId, moduleId, lessonId, state) {
    const productionBody = document.getElementById('production-body');
    if (!productionBody) return;

    const inputs = productionBody.querySelectorAll('.production-input');
    if (!inputs.length) return;

    const submitBtn       = document.createElement('button');
    submitBtn.className   = 'btn btn--primary';
    submitBtn.textContent = 'Enviar Respostas';
    submitBtn.style.marginTop = '1rem';
    productionBody.appendChild(submitBtn);

    submitBtn.addEventListener('click', () => {
      let allFilled = true;

      inputs.forEach((input) => {
        if (!input.value.trim()) {
          allFilled = false;
          input.style.borderColor = 'var(--color-error)';
        } else {
          input.style.borderColor = 'var(--color-success)';
          input.disabled = true;
        }
      });

      const feedbackEl = document.getElementById('production-feedback');

      if (!allFilled) {
        if (feedbackEl) {
          feedbackEl.innerHTML = `
            <div class="feedback-message feedback-message--incorrect">
              <span class="feedback-icon">!</span>
              <span>Responda a todos os itens antes de enviar.</span>
            </div>`;
        }
        return;
      }

      submitBtn.disabled = true;
      state.markActivityComplete(levelId, moduleId, lessonId, 'production');

      if (feedbackEl) {
        feedbackEl.innerHTML = `
          <div class="feedback-message feedback-message--correct">
            <span class="feedback-icon">&#10003;</span>
            <span>
              Respostas registradas. Releia-as em voz alta — cada frase soa natural?
              Compare com os exemplos na seção de Escuta.
            </span>
          </div>`;
      }
    });
  }

  return { hydrate };
})();
