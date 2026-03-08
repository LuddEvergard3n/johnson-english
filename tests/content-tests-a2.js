/**
 * content-tests-a2.js
 * Testes de integridade do currículo A2.
 * Complementa content-tests.js (A1).
 */
'use strict';

const lessons = require('../data/lessons.json');
const modules = require('../data/modules.json');
const a2lessons = lessons.filter(l => l.levelId === 'a2');
const a2modules = modules.filter(m => m.levelId === 'a2');

let passed = 0, failed = 0;
const results = [];

function assert(name, condition, detail = '') {
  if (condition) {
    results.push({ status: 'PASS', name });
    passed++;
  } else {
    results.push({ status: 'FAIL', name, detail });
    failed++;
  }
}

// --- Estrutura geral ---
assert('A2: 7 módulos definidos',    a2modules.length === 7, `got ${a2modules.length}`);
assert('A2: 26 lições definidas',    a2lessons.length === 26, `got ${a2lessons.length}`);

const normalA2  = a2lessons.filter(l => l.type !== 'pronunciation');
const pronA2    = a2lessons.filter(l => l.type === 'pronunciation');
assert('A2: 24 lições normais',      normalA2.length  === 24, `got ${normalA2.length}`);
assert('A2: 2 lições de pronúncia',  pronA2.length    === 2,  `got ${pronA2.length}`);

// --- IDs de módulos ---
const modIds = a2modules.map(m => m.id).sort();
assert('A2: IDs de módulos corretos (m07–m13)',
  JSON.stringify(modIds) === JSON.stringify(['m07','m08','m09','m10','m11','m12','m13']));

// --- 4 lições por módulo normal, 2 para pronunciação ---
['m07','m08','m09','m10','m11','m12'].forEach(mid => {
  const count = a2lessons.filter(l => l.moduleId === mid).length;
  assert(`A2: ${mid} tem 4 lições`, count === 4, `got ${count}`);
});
assert('A2: m13 tem 2 lições', a2lessons.filter(l => l.moduleId === 'm13').length === 2);

// --- Campos obrigatórios: lições normais ---
normalA2.forEach(l => {
  const id = `${l.moduleId}/${l.id}`;
  assert(`${id}: tem explanation`,   !!l.explanation?.text);
  assert(`${id}: tem examples (≥4)`, Array.isArray(l.examples) && l.examples.length >= 4);
  assert(`${id}: tem listening (≥6)`,Array.isArray(l.listening) && l.listening.length >= 6);
  assert(`${id}: tem repetition (≥4)`,Array.isArray(l.repetition) && l.repetition.length >= 4);
  assert(`${id}: tem practice (5 exercícios)`, Array.isArray(l.practice) && l.practice.length === 5);
  assert(`${id}: tem production (2 itens)`,    Array.isArray(l.production) && l.production.length === 2);
  l.practice.forEach((ex, i) => {
    assert(`${id} practice[${i}]: tem type`,   ['multiple-choice','fill-blank','reorder'].includes(ex.type));
    assert(`${id} practice[${i}]: tem prompt`, typeof ex.prompt === 'string' && ex.prompt.length > 0);
    assert(`${id} practice[${i}]: tem answer`, typeof ex.answer === 'string' && ex.answer.length > 0);
    if (ex.type === 'multiple-choice') {
      assert(`${id} practice[${i}]: 4 options`, Array.isArray(ex.options) && ex.options.length === 4);
      assert(`${id} practice[${i}]: answer in options`, ex.options.includes(ex.answer));
    }
    if (ex.type === 'reorder') {
      assert(`${id} practice[${i}]: tem words array`, Array.isArray(ex.words) && ex.words.length >= 3);
    }
  });
});

// --- Campos obrigatórios: lições de pronúncia ---
pronA2.forEach(l => {
  const id = `${l.moduleId}/${l.id}`;
  assert(`${id}: type === pronunciation`,    l.type === 'pronunciation');
  assert(`${id}: tem sounds (≥1)`,           Array.isArray(l.sounds) && l.sounds.length >= 1);
  assert(`${id}: tem minimal_pairs (≥4)`,    Array.isArray(l.minimal_pairs) && l.minimal_pairs.length >= 4);
  assert(`${id}: tem repetition (≥4)`,       Array.isArray(l.repetition) && l.repetition.length >= 4);
  assert(`${id}: tem production (2 itens)`,  Array.isArray(l.production) && l.production.length === 2);
  l.sounds.forEach((s, i) => {
    assert(`${id} sound[${i}]: tem symbol`,      typeof s.symbol === 'string');
    assert(`${id} sound[${i}]: tem description`, typeof s.description === 'string');
    assert(`${id} sound[${i}]: tem words (≥4)`,  Array.isArray(s.words) && s.words.length >= 4);
  });
});

// --- Cobertura gramatical spec A2 ---
const allText = JSON.stringify(a2lessons).toLowerCase();
const grammarSpec = [
  ['present continuous -ing', ['am studying','is working','are watching','am reading']],
  ['simple vs continuous', ['usually work','working from home','usually go running']],
  ['past simple irregulares', ['went','bought','saw','drank','had','made','took']],
  ['past simple did/didn\'t', ["didn't","did you","what did"]],
  ['future will', ["i'll call","i will","won't","will you"]],
  ['comparatives', ['taller than','more intelligent','more expensive','as tall as']],
  ['superlatives', ['the tallest','the best','the most expensive','the kindest']],
  ['adverbs of frequency', ['always','usually','often','sometimes','rarely','never']],
  ['must / have to', ['must take','have to work','mustn\'t',"don't have to"]],
  ['quantifiers', ['a few','a little','much time','a lot of','not much']],
  ['countable/uncountable', ['information','luggage','furniture','uncountable']],
  ['too / enough', ['too heavy','not hot enough','too expensive','enough money']],
  ['gerund', ['love swimming','enjoy cooking','can\'t stand waiting','prefer cycling']],
];
grammarSpec.forEach(([name, samples]) => {
  const found = samples.some(s => allText.includes(s.toLowerCase()));
  assert(`A2 gramática: ${name}`, found, `nenhum sample encontrado: ${samples.join(', ')}`);
});

// --- Cobertura vocabulário spec A2 ---
const vocabSpec = [
  ['família A2', ['mother','father','brother','sister','husband','wife','grandfather','aunt','cousin']],
  ['casa A2', ['apartment','kitchen','living room','bedroom']],
  ['transporte', ['bus','train','subway','taxi','plane']],
  ['trabalho', ['office','boss','salary','meeting','project','deadline']],
  ['comida A2', ['restaurant','breakfast','lunch','dinner']],
  ['compras', ['price','cheap','expensive','store','cash','card','receipt','refund']],
  ['hobbies', ['music','movies','sports','gaming','reading','travel','photography','hiking']],
  ['tecnologia', ['phone','computer','internet','email','attachment','password']],
];
vocabSpec.forEach(([name, words]) => {
  const found = words.some(w => allText.includes(w.toLowerCase()));
  assert(`A2 vocabulário: ${name}`, found, `nenhuma palavra encontrada: ${words.join(', ')}`);
});

// --- Situações reais ---
const situacoes = [
  ['fazer compras', ["i'm looking for","how much is","receipt","refund"]],
  ['hotel', ['reservation','check-out','boarding pass','room service']],
  ['aeroporto', ['baggage claim','boarding pass','check in','window seat']],
  ['direções', ['turn left','go straight','traffic lights','return ticket']],
  ['médico', ["what seems to be","i'll prescribe","allergic to","tablet"]],
  ['sugestões/convites', ["let's go","why don't we","how about","i'd love to"]],
];
situacoes.forEach(([name, samples]) => {
  const found = samples.some(s => allText.includes(s.toLowerCase()));
  assert(`A2 situação real: ${name}`, found, `nenhum sample: ${samples.join(', ')}`);
});

// --- Pronúncia A2 ---
const pronText = JSON.stringify(pronA2).toLowerCase();
assert('A2 pronúncia: schwa /ə/', pronText.includes('/ə/') || pronText.includes('schwa'));
assert('A2 pronúncia: entonação perguntas', pronText.includes('entonaç') || pronText.includes('intonation') || pronText.includes('↑') || pronText.includes('yes/no'));
assert('A2 pronúncia: linking words', pronText.includes('linking') || pronText.includes('ligação'));
assert('A2 pronúncia: contrações', pronText.includes('gonna') || pronText.includes('contração') || pronText.includes('wanna'));

// --- Relatório ---
console.log('\n=== TESTES A2 ===');
results.filter(r => r.status === 'FAIL').forEach(r =>
  console.log(`  FAIL: ${r.name}${r.detail ? ' — ' + r.detail : ''}`)
);
console.log(`\nResultado: ${passed} passed, ${failed} failed / ${passed+failed} total`);
process.exit(failed > 0 ? 1 : 0);
