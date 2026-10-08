'use strict';

const fs = require('fs');
const path = require('path');

async function run({ describe, it, assert }) {
  const root = path.join(__dirname, '..');
  const { calculateProgress, searchCatalog, normaliseMeta } = await import('file://' + path.join(root, 'js', 'state.js'));
  const { supportsRecording, buildLessonHash } = await import('file://' + path.join(root, 'js', 'study-tools.js'));
  const { escapeHtml } = await import('file://' + path.join(root, 'js', 'utils', 'html-safety.js'));
  const { LessonView } = await import('file://' + path.join(root, 'js', 'components', 'lesson-view.js'));
  const { PronunciationLessonView } = await import('file://' + path.join(root, 'js', 'components', 'pronunciation-lesson-view.js'));
  const lessons = JSON.parse(fs.readFileSync(path.join(root, 'data', 'lessons.json'), 'utf8'));
  const modules = JSON.parse(fs.readFileSync(path.join(root, 'data', 'modules.json'), 'utf8'));

  describe('Johnson English 3.0 — progress and search', () => {
    it('calculates bounded lesson progress from available activities', () => {
      assert.equal(calculateProgress(['listening', 'practice', 'unknown'], ['listening', 'practice', 'production']), 67);
      assert.equal(calculateProgress([], []), 0);
    });
    it('searches title, description, level and module without case sensitivity', () => {
      const result = searchCatalog(lessons, modules, 'present perfect');
      assert(result.length > 0, 'Expected Present Perfect search results');
      assert(result.every((lesson) => lesson.title || lesson.description), 'Every result must be a lesson');
      assert(searchCatalog(lessons, modules, 'termo-que-nao-existe').length === 0, 'Unknown term must return no results');
    });
    it('migrates missing preferences and bounds stored audio speed', () => {
      assert.deepEqual(normaliseMeta({}), { lastLesson: null, audioRate: 0.9, audioAccent: 'us' });
      assert.equal(normaliseMeta({ lastLesson: 'a1/m01/l01', audioRate: 4 }).audioRate, 1.25);
      assert.equal(normaliseMeta({ audioAccent: 'gb' }).audioAccent, 'gb');
    });
    it('generates stable lesson and section links', () => {
      assert.equal(buildLessonHash('a1', 'm01', 'l01'), '#/lesson/a1/m01/l01');
      assert.equal(buildLessonHash('a1', 'm01', 'l01', 'practice'), '#/lesson/a1/m01/l01/practice');
    });
  });

  describe('Johnson English 3.0 — recording fallback', () => {
    it('detects complete, missing and partial recording support', () => {
      assert(supportsRecording({ MediaRecorder() {}, navigator: { mediaDevices: { getUserMedia() {} } } }));
      assert(!supportsRecording({ navigator: { mediaDevices: { getUserMedia() {} } } }));
      assert(!supportsRecording({ MediaRecorder() {}, navigator: {} }));
    });
    it('keeps optional study tools from blocking lesson engines', () => {
      const engines = [
        path.join(root, 'js', 'lesson-engine.js'),
        path.join(root, 'js', 'modules', 'pronunciation', 'pronunciation-engine.js'),
      ];
      engines.forEach((file) => {
        const source = fs.readFileSync(file, 'utf8');
        assert(!/^import .*study-tools/m.test(source), `${path.basename(file)} must not require optional study tools`);
        assert(source.includes("import('./study-tools.js')") || source.includes("import('../../study-tools.js')"), `${path.basename(file)} must load study tools optionally`);
      });
    });
  });

  let allLessonsTest;
  describe('Johnson English 3.0 — all lesson routes', () => {
    allLessonsTest = it('renders every lesson with its title and expected sections', async () => {
      for (const lesson of lessons) {
        const state = { getLessonAsync: async () => lesson };
        const view = lesson.type === 'pronunciation' ? PronunciationLessonView : LessonView;
        const html = await view.render({ params: [lesson.levelId, lesson.moduleId, lesson.id], state });
        const expectedSections = lesson.type === 'pronunciation' ? 5 : 6;
        assert(html.includes(`<h1>${escapeHtml(lesson.title)}</h1>`), `${lesson.levelId}/${lesson.moduleId}/${lesson.id} did not render its title`);
        assert(!html.includes('notice--error'), `${lesson.levelId}/${lesson.moduleId}/${lesson.id} rendered an error`);
        assert.equal((html.match(/class="lesson-section"/g) || []).length, expectedSections, `${lesson.levelId}/${lesson.moduleId}/${lesson.id} rendered incomplete sections`);
      }
    });
  });
  await allLessonsTest;

  describe('Johnson English 3.0 — PWA shell', () => {
    it('manifest and every cached local asset exist', () => {
      JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
      const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
      const assets = [...sw.matchAll(/'\.\/([^']+)'/g)].map((match) => match[1]).filter(Boolean);
      assets.forEach((asset) => assert(fs.existsSync(path.join(root, asset)), `Missing cached asset: ${asset}`));
    });
    it('reloads an open page when a new service worker takes control', () => {
      const app = fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8');
      assert(app.includes("addEventListener('controllerchange'"), 'Missing service worker update reload');
    });
    it('maps every recorded phrase to an existing local audio file', () => {
      const audioMap = JSON.parse(fs.readFileSync(path.join(root, 'data', 'audio-map.json'), 'utf8'));
      const audioTexts = [];
      const add = (text) => { if (text && !audioTexts.includes(text)) audioTexts.push(text); };
      lessons.forEach((lesson) => {
        (lesson.examples || []).forEach((item) => add(item.en));
        (lesson.listening || []).forEach((item) => add(item.text));
        (lesson.repetition || []).forEach((item) => add(item.text || item.en));
        (lesson.sounds || []).forEach((sound) => (sound.words || []).forEach((word) => add(word.en)));
        (lesson.minimal_pairs || []).forEach((pair) => { add(pair.a); add(pair.b); });
      });
      assert.equal(Object.keys(audioMap).length, audioTexts.length, 'Audio map must match every unique curriculum phrase');
      audioTexts.forEach((text) => assert(audioMap[text], `Missing recorded phrase: ${text}`));
      Object.values(audioMap).forEach((asset) => {
        assert(asset.startsWith('./assets/audio/'), `Unexpected audio path: ${asset}`);
        assert(fs.existsSync(path.join(root, asset.slice(2))), `Missing recorded audio: ${asset}`);
      });
      assert.equal(new Set(Object.values(audioMap)).size, audioTexts.length, 'Every phrase must have its own audio file');
    });
    it('keeps a complete British audio map', () => {
      const us = JSON.parse(fs.readFileSync(path.join(root, 'data', 'audio-map.json'), 'utf8'));
      const gb = JSON.parse(fs.readFileSync(path.join(root, 'data', 'audio-map-gb.json'), 'utf8'));
      assert.equal(Object.keys(gb).length, Object.keys(us).length, 'British map must cover the complete curriculum');
      Object.keys(us).forEach((text) => {
        assert(gb[text], `Missing British recording: ${text}`);
        assert(fs.existsSync(path.join(root, gb[text].slice(2))), `Missing British audio file: ${gb[text]}`);
      });
    });
  });
}

module.exports = { run };
