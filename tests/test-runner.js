/**
 * test-runner.js — Automated test orchestrator
 * Johnson English Language Laboratory
 *
 * Usage:
 *   node tests/test-runner.js
 *
 * Environment: Node.js (no browser APIs available)
 * Dependencies: none (pure Node.js stdlib only)
 *
 * The runner imports each test suite, executes all registered tests,
 * and reports results with pass/fail counts and exit code.
 * Exit code 0 = all tests passed. Exit code 1 = one or more failures.
 */

'use strict';

const path = require('path');
const fs   = require('fs');

/* ============================================================================
   MINIMAL TEST FRAMEWORK
   Avoids external dependencies. Provides: describe(), it(), assert().
   ============================================================================ */

let _totalPassed  = 0;
let _totalFailed  = 0;
const _failures   = [];

/**
 * Group tests under a named suite.
 *
 * @param {string}   label
 * @param {Function} fn    Function containing it() calls
 */
function describe(label, fn) {
  console.log(`\n  ${label}`);
  fn();
}

/**
 * Define a single test case.
 *
 * @param {string}   label
 * @param {Function} fn    Test body. May be async.
 */
async function it(label, fn) {
  try {
    await fn();
    _totalPassed++;
    console.log(`    ✓ ${label}`);
  } catch (err) {
    _totalFailed++;
    _failures.push({ label, error: err });
    console.log(`    ✗ ${label}`);
    console.log(`      ${err.message}`);
  }
}

/**
 * Simple assert with descriptive message.
 *
 * @param {boolean} condition
 * @param {string}  message
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

assert.equal = function(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
};

assert.deepEqual = function(actual, expected, message) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) {
    throw new Error(message || `Deep equality failed.\nActual:   ${a}\nExpected: ${b}`);
  }
};

assert.throws = function(fn, message) {
  let threw = false;
  try { fn(); } catch (_) { threw = true; }
  if (!threw) throw new Error(message || 'Expected function to throw');
};

/* ============================================================================
   RUN ALL TEST SUITES
   ============================================================================ */

async function runAll() {
  console.log('Johnson English — Test Suite');
  console.log('='.repeat(40));

  /* Load test suites */
  const suitePaths = [
    path.join(__dirname, 'content-tests.js'),
    path.join(__dirname, 'audio-tests.js'),
  ];

  for (const suitePath of suitePaths) {
    if (!fs.existsSync(suitePath)) {
      console.warn(`[Runner] Suite not found: ${suitePath} — skipping`);
      continue;
    }
    /* Each suite receives the test framework functions */
    const suite = require(suitePath);
    await suite.run({ describe, it, assert });
  }

  /* ---- Report ---- */
  console.log('\n' + '='.repeat(40));
  console.log(`  Passed: ${_totalPassed}`);
  console.log(`  Failed: ${_totalFailed}`);

  if (_failures.length) {
    console.log('\n  Failed tests:');
    _failures.forEach((f) => {
      console.log(`    - ${f.label}: ${f.error.message}`);
    });
  }

  console.log('');
  process.exit(_totalFailed > 0 ? 1 : 0);
}

runAll().catch((err) => {
  console.error('[Runner] Fatal error:', err);
  process.exit(1);
});
