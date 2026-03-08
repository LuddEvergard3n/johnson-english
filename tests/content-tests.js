/**
 * content-tests.js — JSON data integrity test suite
 * Johnson English Language Laboratory
 *
 * Tests:
 *   - All JSON files are valid and parseable.
 *   - levels.json structure: required fields, types.
 *   - modules.json: required fields, valid levelId references.
 *   - lessons.json: required fields, valid levelId/moduleId references,
 *     exercise structure integrity.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

function loadJSON(filename) {
  const raw = fs.readFileSync(path.join(DATA_DIR, filename), 'utf8');
  return JSON.parse(raw);
}

/**
 * @param {object} param0  Test framework provided by test-runner.js
 */
async function run({ describe, it, assert }) {

  /* ---- 1. Parse validity ---- */
  describe('JSON files — parseable', () => {
    it('levels.json is valid JSON', () => {
      const data = loadJSON('levels.json');
      assert(Array.isArray(data), 'levels.json must be an array');
    });

    it('modules.json is valid JSON', () => {
      const data = loadJSON('modules.json');
      assert(Array.isArray(data), 'modules.json must be an array');
    });

    it('lessons.json is valid JSON', () => {
      const data = loadJSON('lessons.json');
      assert(Array.isArray(data), 'lessons.json must be an array');
    });
  });

  /* ---- 2. levels.json structure ---- */
  describe('levels.json — structure', () => {
    const levels = loadJSON('levels.json');
    const levelIds = new Set(levels.map((l) => l.id));

    it('each level has required fields: id, label, cefr, description', () => {
      levels.forEach((level, i) => {
        assert(typeof level.id          === 'string', `levels[${i}].id must be string`);
        assert(typeof level.label       === 'string', `levels[${i}].label must be string`);
        assert(typeof level.cefr        === 'string', `levels[${i}].cefr must be string`);
        assert(typeof level.description === 'string', `levels[${i}].description must be string`);
      });
    });

    it('all level IDs are lowercase', () => {
      levels.forEach((level) => {
        assert.equal(level.id, level.id.toLowerCase(), `Level ID "${level.id}" must be lowercase`);
      });
    });

    it('level IDs are unique', () => {
      assert.equal(levelIds.size, levels.length, 'Level IDs must be unique');
    });
  });

  /* ---- 3. modules.json structure ---- */
  describe('modules.json — structure', () => {
    const levels  = loadJSON('levels.json');
    const modules = loadJSON('modules.json');
    const levelIds  = new Set(levels.map((l) => l.id));
    const moduleIds = new Set(modules.map((m) => m.id));

    it('each module has required fields: id, levelId, title, description', () => {
      modules.forEach((mod, i) => {
        assert(typeof mod.id          === 'string', `modules[${i}].id must be string`);
        assert(typeof mod.levelId     === 'string', `modules[${i}].levelId must be string`);
        assert(typeof mod.title       === 'string', `modules[${i}].title must be string`);
        assert(typeof mod.description === 'string', `modules[${i}].description must be string`);
      });
    });

    it('all module levelId values reference existing levels', () => {
      modules.forEach((mod) => {
        assert(
          levelIds.has(mod.levelId),
          `Module "${mod.id}" references unknown levelId "${mod.levelId}"`
        );
      });
    });

    it('module IDs are unique within each level', () => {
      const seen = new Map();
      modules.forEach((mod) => {
        const key = `${mod.levelId}/${mod.id}`;
        assert(!seen.has(key), `Duplicate module key: ${key}`);
        seen.set(key, true);
      });
    });
  });

  /* ---- 4. lessons.json structure ---- */
  describe('lessons.json — structure', () => {
    const modules = loadJSON('modules.json');
    const lessons = loadJSON('lessons.json');

    const moduleKeys = new Set(modules.map((m) => `${m.levelId}/${m.id}`));

    it('each lesson has required fields: id, levelId, moduleId, title, description', () => {
      lessons.forEach((lesson, i) => {
        assert(typeof lesson.id          === 'string', `lessons[${i}].id must be string`);
        assert(typeof lesson.levelId     === 'string', `lessons[${i}].levelId must be string`);
        assert(typeof lesson.moduleId    === 'string', `lessons[${i}].moduleId must be string`);
        assert(typeof lesson.title       === 'string', `lessons[${i}].title must be string`);
        assert(typeof lesson.description === 'string', `lessons[${i}].description must be string`);
      });
    });

    it('all lesson levelId/moduleId pairs reference existing modules', () => {
      lessons.forEach((lesson) => {
        const key = `${lesson.levelId}/${lesson.moduleId}`;
        assert(
          moduleKeys.has(key),
          `Lesson "${lesson.id}" references unknown module "${key}"`
        );
      });
    });

    it('each lesson has an explanation object', () => {
      lessons.forEach((lesson) => {
        assert(
          lesson.explanation && typeof lesson.explanation.text === 'string',
          `Lesson "${lesson.id}" missing explanation.text`
        );
      });
    });

    it('each lesson has at least one example', () => {
      lessons.filter(l => l.type !== 'pronunciation').forEach((lesson) => {
        assert(
          Array.isArray(lesson.examples) && lesson.examples.length > 0,
          `Lesson "${lesson.id}" must have at least one example`
        );
      });
    });

    it('each example has "en" field', () => {
      lessons.forEach((lesson) => {
        (lesson.examples || []).forEach((ex, i) => {
          assert(
            typeof ex.en === 'string',
            `Lesson "${lesson.id}" example[${i}] missing "en" field`
          );
        });
      });
    });

    it('each lesson has at least one listening item', () => {
      lessons.filter(l => l.type !== 'pronunciation').forEach((lesson) => {
        assert(
          Array.isArray(lesson.listening) && lesson.listening.length > 0,
          `Lesson "${lesson.id}" must have at least one listening item`
        );
      });
    });
  });

  /* ---- 5. Exercise integrity ---- */
  describe('lessons.json — exercise integrity', () => {
    const lessons = loadJSON('lessons.json');

    it('all practice exercises have a "type" field', () => {
      lessons.forEach((lesson) => {
        (lesson.practice || []).forEach((ex, i) => {
          assert(
            typeof ex.type === 'string',
            `Lesson "${lesson.id}" practice[${i}] missing "type"`
          );
        });
      });
    });

    it('multiple-choice exercises have options and answer', () => {
      lessons.forEach((lesson) => {
        (lesson.practice || [])
          .filter((ex) => ex.type === 'multiple-choice')
          .forEach((ex, i) => {
            assert(
              Array.isArray(ex.options) && ex.options.length >= 2,
              `Lesson "${lesson.id}" mc exercise[${i}] needs >= 2 options`
            );
            assert(
              typeof ex.answer === 'string',
              `Lesson "${lesson.id}" mc exercise[${i}] missing answer`
            );
            assert(
              ex.options.includes(ex.answer),
              `Lesson "${lesson.id}" mc exercise[${i}] answer not in options`
            );
          });
      });
    });

    it('fill-blank exercises have prompt with [BLANK] and an answer', () => {
      lessons.forEach((lesson) => {
        (lesson.practice || [])
          .filter((ex) => ex.type === 'fill-blank')
          .forEach((ex, i) => {
            assert(
              ex.prompt && ex.prompt.includes('[BLANK]'),
              `Lesson "${lesson.id}" fill-blank[${i}] prompt must contain [BLANK]`
            );
            assert(
              typeof ex.answer === 'string',
              `Lesson "${lesson.id}" fill-blank[${i}] missing answer`
            );
          });
      });
    });

    it('reorder exercises have words array and answer', () => {
      lessons.forEach((lesson) => {
        (lesson.practice || [])
          .filter((ex) => ex.type === 'reorder')
          .forEach((ex, i) => {
            assert(
              Array.isArray(ex.words) && ex.words.length >= 2,
              `Lesson "${lesson.id}" reorder[${i}] needs >= 2 words`
            );
            assert(
              typeof ex.answer === 'string',
              `Lesson "${lesson.id}" reorder[${i}] missing answer`
            );
          });
      });
    });
  });

  /* Lições de pronúncia — estrutura especial (function hoisting permite chamar antes da definição) */
  runPronunciationTests(loadJSON('lessons.json'), describe, it, assert);
}

module.exports = { run };

/* ============================================================================
   TESTES DE INTEGRIDADE — Lições de pronúncia (type: 'pronunciation')
   ============================================================================ */

function runPronunciationTests(lessons, describe, it, assert) {
  const pronLessons = lessons.filter(l => l.type === 'pronunciation');

  describe('pronunciation lessons — presence', () => {
    it('at least one pronunciation lesson exists', () => {
      assert(pronLessons.length > 0, 'Nenhuma lição de pronúncia encontrada.');
    });
  });

  pronLessons.forEach((lesson) => {
    const id = `${lesson.moduleId}/${lesson.id}`;

    describe(`pronunciation lesson ${id}`, () => {
      it('has sounds array with entries', () => {
        assert(Array.isArray(lesson.sounds) && lesson.sounds.length > 0,
          `${id}: campo 'sounds' ausente ou vazio.`);
      });

      it('each sound has required fields and words', () => {
        (lesson.sounds || []).forEach((s, i) => {
          ['symbol','name','description','mouth_tip'].forEach(field => {
            assert(typeof s[field] === 'string' && s[field].length > 0,
              `${id}: sound[${i}] sem campo '${field}'.`);
          });
          assert(Array.isArray(s.words) && s.words.length > 0,
            `${id}: sound[${i}].words está vazio.`);
          s.words.forEach((w, j) => {
            assert(typeof w.en === 'string' && w.en.length > 0,
              `${id}: sound[${i}].words[${j}] sem 'en'.`);
            assert(typeof w.pt === 'string' && w.pt.length > 0,
              `${id}: sound[${i}].words[${j}] sem 'pt'.`);
          });
        });
      });

      it('has minimal_pairs with a and b fields', () => {
        assert(Array.isArray(lesson.minimal_pairs) && lesson.minimal_pairs.length > 0,
          `${id}: campo 'minimal_pairs' ausente ou vazio.`);
        (lesson.minimal_pairs || []).forEach((p, i) => {
          assert(typeof p.a === 'string' && p.a.length > 0, `${id}: minimal_pairs[${i}] sem 'a'.`);
          assert(typeof p.b === 'string' && p.b.length > 0, `${id}: minimal_pairs[${i}] sem 'b'.`);
        });
      });

      it('has repetition sentences', () => {
        assert(Array.isArray(lesson.repetition) && lesson.repetition.length > 0,
          `${id}: campo 'repetition' ausente ou vazio.`);
      });

      it('has production prompts', () => {
        assert(Array.isArray(lesson.production) && lesson.production.length > 0,
          `${id}: campo 'production' ausente ou vazio.`);
      });

      it('does not have a practice field', () => {
        assert(lesson.practice === undefined,
          `${id}: lições de pronúncia não devem ter campo 'practice'.`);
      });
    });
  });
}
