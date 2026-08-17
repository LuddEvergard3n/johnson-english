/**
 * content-tests-a2.js — Testes de integridade do currículo A2
 * Johnson English Language Laboratory
 *
 * Complementa content-tests.js (que cobre a estrutura geral A1–C2) com
 * verificações específicas de conteúdo A2: cobertura gramatical,
 * vocabulário e situações reais previstas no plano curricular do nível.
 *
 * Histórico: este arquivo existia desde a formação original do nível A2
 * (módulos m07–m13, 26 lições) mas nunca foi conectado ao test-runner.js
 * — usava um formato próprio (`process.exit()` direto, sem exportar
 * `run()`) incompatível com o framework compartilhado. Quando o currículo
 * A2 foi expandido (m44–m47, mais 16 lições), as contagens hardcoded
 * ficaram desatualizadas e ninguém percebeu, porque o arquivo nunca
 * rodava como parte da suíte automatizada. Reescrito para usar
 * describe/it/assert como os demais arquivos de teste, com as contagens
 * corrigidas para a estrutura atual (11 módulos, 42 lições).
 */

'use strict';

const lessons = require('../data/lessons.json');
const modules = require('../data/modules.json');

async function run({ describe, it, assert }) {
  const a2lessons = lessons.filter((l) => l.levelId === 'a2');
  const a2modules = modules.filter((m) => m.levelId === 'a2');
  const normalA2  = a2lessons.filter((l) => l.type !== 'pronunciation');
  const pronA2    = a2lessons.filter((l) => l.type === 'pronunciation');

  describe('A2 — estrutura geral', () => {
    it('11 módulos definidos', () => {
      assert(a2modules.length === 11, `got ${a2modules.length}`);
    });
    it('42 lições definidas', () => {
      assert(a2lessons.length === 42, `got ${a2lessons.length}`);
    });
    it('40 lições normais', () => {
      assert(normalA2.length === 40, `got ${normalA2.length}`);
    });
    it('2 lições de pronúncia', () => {
      assert(pronA2.length === 2, `got ${pronA2.length}`);
    });
    it('IDs de módulos corretos (m07–m13, m44–m47)', () => {
      const modIds = a2modules.map((m) => m.id).sort();
      const expected = ['m07','m08','m09','m10','m11','m12','m13','m44','m45','m46','m47'];
      assert(
        JSON.stringify(modIds) === JSON.stringify(expected),
        `got ${JSON.stringify(modIds)}`
      );
    });
  });

  describe('A2 — lições por módulo', () => {
    ['m07','m08','m09','m10','m11','m12','m44','m45','m46','m47'].forEach((mid) => {
      it(`${mid} tem 4 lições`, () => {
        const count = a2lessons.filter((l) => l.moduleId === mid).length;
        assert(count === 4, `got ${count}`);
      });
    });
    it('m13 tem 2 lições', () => {
      const count = a2lessons.filter((l) => l.moduleId === 'm13').length;
      assert(count === 2, `got ${count}`);
    });
  });

  describe('A2 — campos obrigatórios (lições normais)', () => {
    normalA2.forEach((l) => {
      const id = `${l.moduleId}/${l.id}`;
      it(`${id}: tem explanation`, () => {
        assert(!!l.explanation?.text);
      });
      it(`${id}: tem examples (≥4)`, () => {
        assert(Array.isArray(l.examples) && l.examples.length >= 4);
      });
      it(`${id}: tem listening (≥6)`, () => {
        assert(Array.isArray(l.listening) && l.listening.length >= 6);
      });
      it(`${id}: tem repetition (≥4)`, () => {
        assert(Array.isArray(l.repetition) && l.repetition.length >= 4);
      });
      it(`${id}: tem practice (5 exercícios)`, () => {
        assert(Array.isArray(l.practice) && l.practice.length === 5);
      });
      it(`${id}: tem production (2 itens)`, () => {
        assert(Array.isArray(l.production) && l.production.length === 2);
      });
      (l.practice || []).forEach((ex, i) => {
        it(`${id} practice[${i}]: tem type`, () => {
          assert(['multiple-choice', 'fill-blank', 'reorder'].includes(ex.type));
        });
        it(`${id} practice[${i}]: tem prompt`, () => {
          assert(typeof ex.prompt === 'string' && ex.prompt.length > 0);
        });
        it(`${id} practice[${i}]: tem answer`, () => {
          assert(typeof ex.answer === 'string' && ex.answer.length > 0);
        });
        if (ex.type === 'multiple-choice') {
          it(`${id} practice[${i}]: 4 options`, () => {
            assert(Array.isArray(ex.options) && ex.options.length === 4);
          });
          it(`${id} practice[${i}]: answer in options`, () => {
            assert(ex.options.includes(ex.answer));
          });
        }
        if (ex.type === 'reorder') {
          it(`${id} practice[${i}]: tem words array`, () => {
            assert(Array.isArray(ex.words) && ex.words.length >= 3);
          });
        }
      });
    });
  });

  describe('A2 — campos obrigatórios (lições de pronúncia)', () => {
    pronA2.forEach((l) => {
      const id = `${l.moduleId}/${l.id}`;
      it(`${id}: type === pronunciation`, () => {
        assert(l.type === 'pronunciation');
      });
      it(`${id}: tem sounds (≥1)`, () => {
        assert(Array.isArray(l.sounds) && l.sounds.length >= 1);
      });
      it(`${id}: tem minimal_pairs (≥4)`, () => {
        assert(Array.isArray(l.minimal_pairs) && l.minimal_pairs.length >= 4);
      });
      it(`${id}: tem repetition (≥4)`, () => {
        assert(Array.isArray(l.repetition) && l.repetition.length >= 4);
      });
      it(`${id}: tem production (2 itens)`, () => {
        assert(Array.isArray(l.production) && l.production.length === 2);
      });
      (l.sounds || []).forEach((s, i) => {
        it(`${id} sound[${i}]: tem symbol`, () => {
          assert(typeof s.symbol === 'string');
        });
        it(`${id} sound[${i}]: tem description`, () => {
          assert(typeof s.description === 'string');
        });
        it(`${id} sound[${i}]: tem words (≥4)`, () => {
          assert(Array.isArray(s.words) && s.words.length >= 4);
        });
      });
    });
  });

  describe('A2 — cobertura gramatical', () => {
    const allText = JSON.stringify(a2lessons).toLowerCase();
    const grammarSpec = [
      ['present continuous -ing', ['am studying', 'is working', 'are watching', 'am reading']],
      ['simple vs continuous', ['usually work', 'working from home', 'usually go running']],
      ['past simple irregulares', ['went', 'bought', 'saw', 'drank', 'had', 'made', 'took']],
      ['past simple did/didn\'t', ["didn't", 'did you', 'what did']],
      ['future will', ["i'll call", 'i will', "won't", 'will you']],
      ['comparatives', ['taller than', 'more intelligent', 'more expensive', 'as tall as']],
      ['superlatives', ['the tallest', 'the best', 'the most expensive', 'the kindest']],
      ['adverbs of frequency', ['always', 'usually', 'often', 'sometimes', 'rarely', 'never']],
      ['must / have to', ['must take', 'have to work', "mustn't", "don't have to"]],
      ['quantifiers', ['a few', 'a little', 'much time', 'a lot of', 'not much']],
      ['countable/uncountable', ['information', 'luggage', 'furniture', 'uncountable']],
      ['too / enough', ['too heavy', 'not hot enough', 'too expensive', 'enough money']],
      ['gerund', ['love swimming', 'enjoy cooking', "can't stand waiting", 'prefer cycling']],
    ];
    grammarSpec.forEach(([name, samples]) => {
      it(`gramática: ${name}`, () => {
        const found = samples.some((s) => allText.includes(s.toLowerCase()));
        assert(found, `nenhum sample encontrado: ${samples.join(', ')}`);
      });
    });
  });

  describe('A2 — cobertura de vocabulário', () => {
    const allText = JSON.stringify(a2lessons).toLowerCase();
    const vocabSpec = [
      ['família A2', ['mother', 'father', 'brother', 'sister', 'husband', 'wife', 'grandfather', 'aunt', 'cousin']],
      ['casa A2', ['apartment', 'kitchen', 'living room', 'bedroom']],
      ['transporte', ['bus', 'train', 'subway', 'taxi', 'plane']],
      ['trabalho', ['office', 'boss', 'salary', 'meeting', 'project', 'deadline']],
      ['comida A2', ['restaurant', 'breakfast', 'lunch', 'dinner']],
      ['compras', ['price', 'cheap', 'expensive', 'store', 'cash', 'card', 'receipt', 'refund']],
      ['hobbies', ['music', 'movies', 'sports', 'gaming', 'reading', 'travel', 'photography', 'hiking']],
      ['tecnologia', ['phone', 'computer', 'internet', 'email', 'attachment', 'password']],
    ];
    vocabSpec.forEach(([name, words]) => {
      it(`vocabulário: ${name}`, () => {
        const found = words.some((w) => allText.includes(w.toLowerCase()));
        assert(found, `nenhuma palavra encontrada: ${words.join(', ')}`);
      });
    });
  });

  describe('A2 — situações reais', () => {
    const allText = JSON.stringify(a2lessons).toLowerCase();
    const situacoes = [
      ['fazer compras', ["i'm looking for", 'how much is', 'receipt', 'refund']],
      ['hotel', ['reservation', 'check-out', 'boarding pass', 'room service']],
      ['aeroporto', ['baggage claim', 'boarding pass', 'check in', 'window seat']],
      ['direções', ['turn left', 'go straight', 'traffic lights', 'return ticket']],
      ['médico', ['what seems to be', "i'll prescribe", 'allergic to', 'tablet']],
      ['sugestões/convites', ["let's go", "why don't we", 'how about', "i'd love to"]],
    ];
    situacoes.forEach(([name, samples]) => {
      it(`situação: ${name}`, () => {
        const found = samples.some((s) => allText.includes(s.toLowerCase()));
        assert(found, `nenhum sample: ${samples.join(', ')}`);
      });
    });
  });

  describe('A2 — pronúncia', () => {
    const pronText = JSON.stringify(pronA2).toLowerCase();
    it('cobre schwa /ə/', () => {
      assert(pronText.includes('/ə/') || pronText.includes('schwa'));
    });
    it('cobre entonação de perguntas', () => {
      assert(
        pronText.includes('entonaç') ||
        pronText.includes('intonation') ||
        pronText.includes('↑') ||
        pronText.includes('yes/no')
      );
    });
    it('cobre linking words', () => {
      assert(pronText.includes('linking') || pronText.includes('ligação'));
    });
    it('cobre contrações informais', () => {
      assert(
        pronText.includes('gonna') ||
        pronText.includes('contração') ||
        pronText.includes('wanna')
      );
    });
  });
}

module.exports = { run };
