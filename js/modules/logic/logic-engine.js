/**
 * logic-engine.js — Controlador da etapa de Lógica
 * Johnson English — Laboratório de Língua
 *
 * Gerencia exercícios de prática: múltipla escolha, lacuna e reorganização.
 * Todos os textos de feedback e instrução estão em português.
 */

import { FeedbackEngine } from '../../components/feedback-engine.js';

export const LogicEngine = (() => {
  function hydrate({ levelId, moduleId, lessonId, state }) {
    _hydrateMultipleChoice(levelId, moduleId, lessonId, state);
    _hydrateFillBlank(levelId, moduleId, lessonId, state);
    _hydrateReorder(levelId, moduleId, lessonId, state);
  }

  /* =========================================================================
     MÚLTIPLA ESCOLHA
     ========================================================================= */

  function _hydrateMultipleChoice(levelId, moduleId, lessonId, state) {
    const practiceBody = document.getElementById('practice-body');
    if (!practiceBody) return;

    practiceBody.addEventListener('click', (event) => {
      const option = event.target.closest('.exercise-option');
      if (!option) return;

      const exerciseId = option.getAttribute('data-exercise');
      const exercise   = document.getElementById(exerciseId);
      if (!exercise || exercise.getAttribute('data-type') !== 'multiple-choice') return;
      if (exercise.classList.contains('answered')) return;

      exercise.classList.add('answered');

      const isCorrect = option.getAttribute('data-correct') === 'true';
      const feedback  = exercise.querySelector('.exercise-feedback');
      const answer    = exercise.getAttribute('data-answer');

      exercise.querySelectorAll('.exercise-option').forEach((btn) => {
        btn.disabled = true;
        if (btn.getAttribute('data-correct') === 'true') btn.classList.add('correct');
      });

      if (isCorrect) {
        option.classList.add('correct');
        FeedbackEngine.showCorrect(feedback, 'Correto!');
      } else {
        option.classList.add('incorrect');
        FeedbackEngine.showIncorrect(feedback, `A resposta correta é: "${answer}"`);
      }

      _checkAllComplete(practiceBody, levelId, moduleId, lessonId, state);
    });
  }

  /* =========================================================================
     LACUNA (FILL-IN-THE-BLANK)
     ========================================================================= */

  function _hydrateFillBlank(levelId, moduleId, lessonId, state) {
    const practiceBody = document.getElementById('practice-body');
    if (!practiceBody) return;

    practiceBody.addEventListener('click', (event) => {
      const checkBtn = event.target.closest('.btn--check');
      if (!checkBtn) return;

      const exerciseId = checkBtn.getAttribute('data-exercise');
      const exercise   = document.getElementById(exerciseId);
      if (!exercise || exercise.getAttribute('data-type') !== 'fill-blank') return;
      if (exercise.classList.contains('answered')) return;

      const inputs      = exercise.querySelectorAll('.blank-input');
      const singleAnswer = exercise.getAttribute('data-answer');
      const answersAttr  = exercise.getAttribute('data-answers');
      const feedback     = exercise.querySelector('.exercise-feedback');

      if (!inputs.length || (!singleAnswer && !answersAttr)) return;

      /*
       * `data-answers` (JSON array) tem uma resposta por lacuna, para os
       * casos em que cada [BLANK] exige uma palavra diferente. Na
       * ausência dele, usa `data-answer` (string única) repetido para
       * todas as lacunas — correto quando a resposta é literalmente a
       * mesma em cada uma.
       */
      let expectedList;
      try {
        expectedList = answersAttr
          ? JSON.parse(answersAttr)
          : Array.from(inputs, () => singleAnswer);
      } catch (_) {
        return;
      }

      const allCorrect = Array.from(inputs).every((input, i) =>
        input.value.trim().toLowerCase() === (expectedList[i] || '').trim().toLowerCase()
      );
      const expectedDisplay = expectedList.join(' / ');

      if (allCorrect) {
        inputs.forEach((input) => input.classList.add('correct'));
        FeedbackEngine.showCorrect(feedback, 'Correto!');
        exercise.classList.add('answered');
        inputs.forEach((input) => { input.disabled = true; });
        checkBtn.disabled = true;
      } else {
        inputs.forEach((input) => input.classList.add('incorrect'));
        FeedbackEngine.showIncorrect(feedback, `Resposta esperada: "${expectedDisplay}"`);
        setTimeout(() => {
          inputs.forEach((input) => input.classList.remove('incorrect'));
          feedback.innerHTML = '';
        }, 2000);
      }

      _checkAllComplete(practiceBody, levelId, moduleId, lessonId, state);
    });
  }

  /* =========================================================================
     REORGANIZAÇÃO (REORDER)
     ========================================================================= */

  function _hydrateReorder(levelId, moduleId, lessonId, state) {
    const practiceBody = document.getElementById('practice-body');
    if (!practiceBody) return;

    /* Mover palavra: banco → resposta ou resposta → banco */
    practiceBody.addEventListener('click', (event) => {
      const tile = event.target.closest('.word-tile');
      if (!tile) return;

      const exerciseId = tile.getAttribute('data-exercise');
      const exercise   = document.getElementById(exerciseId);
      if (!exercise || exercise.classList.contains('answered')) return;

      const bank   = exercise.querySelector(`.reorder-bank[data-exercise="${exerciseId}"]`);
      const answer = exercise.querySelector(`.reorder-answer[data-exercise="${exerciseId}"]`);

      if (bank.contains(tile)) {
        answer.appendChild(tile);
      } else {
        bank.appendChild(tile);
      }
    });

    /* Verificar resposta */
    practiceBody.addEventListener('click', (event) => {
      const checkBtn = event.target.closest('.btn--check-reorder');
      if (!checkBtn) return;

      const exerciseId = checkBtn.getAttribute('data-exercise');
      const exercise   = document.getElementById(exerciseId);
      if (!exercise || exercise.classList.contains('answered')) return;

      const answerArea = exercise.querySelector(`.reorder-answer[data-exercise="${exerciseId}"]`);
      const expected   = exercise.getAttribute('data-answer');
      const feedback   = exercise.querySelector('.exercise-feedback');

      const userSentence = Array.from(answerArea.querySelectorAll('.word-tile'))
        .map((t) => t.getAttribute('data-word'))
        .join(' ');

      if (userSentence.trim().toLowerCase() === expected.trim().toLowerCase()) {
        FeedbackEngine.showCorrect(feedback, 'Correto!');
        exercise.classList.add('answered');
        exercise.querySelectorAll('.word-tile').forEach((t) => { t.disabled = true; });
        checkBtn.disabled = true;
        exercise.querySelector('.btn--reset-reorder').disabled = true;
      } else {
        FeedbackEngine.showIncorrect(feedback, `Resposta esperada: "${expected}"`);
        setTimeout(() => { feedback.innerHTML = ''; }, 2500);
      }

      _checkAllComplete(practiceBody, levelId, moduleId, lessonId, state);
    });

    /* Recomeçar */
    practiceBody.addEventListener('click', (event) => {
      const resetBtn = event.target.closest('.btn--reset-reorder');
      if (!resetBtn) return;

      const exerciseId = resetBtn.getAttribute('data-exercise');
      const exercise   = document.getElementById(exerciseId);
      if (!exercise || exercise.classList.contains('answered')) return;

      const bank       = exercise.querySelector(`.reorder-bank[data-exercise="${exerciseId}"]`);
      const answerArea = exercise.querySelector(`.reorder-answer[data-exercise="${exerciseId}"]`);
      const feedback   = exercise.querySelector('.exercise-feedback');

      Array.from(answerArea.querySelectorAll('.word-tile')).forEach((t) => bank.appendChild(t));
      feedback.innerHTML = '';
    });
  }

  function _checkAllComplete(container, levelId, moduleId, lessonId, state) {
    /*
     * Verifica TODOS os exercícios da etapa Prática, não apenas os do tipo
     * que acabou de ser respondido — uma lição normalmente mistura
     * multiple-choice, fill-blank e reorder no mesmo array `practice`.
     */
    const all     = container.querySelectorAll('.exercise[data-type]');
    const allDone = Array.from(all).every((ex) => ex.classList.contains('answered'));
    if (allDone && all.length > 0) {
      state.markActivityComplete(levelId, moduleId, lessonId, 'practice');
    }
  }

  return { hydrate };
})();
