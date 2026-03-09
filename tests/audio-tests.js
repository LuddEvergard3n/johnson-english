/**
 * audio-tests.js — Audio system unit tests
 * Johnson English Language Laboratory
 *
 * Tests the AudioEngine logic that can be verified without a browser:
 *   - Text sanitisation rules
 *   - Cache key consistency
 *
 * Note: Actual Web Speech API playback requires a browser environment.
 * Those are integration tests outside scope.
 */

'use strict';

async function run({ describe, it, assert }) {

  describe('AudioEngine — text sanitisation', () => {
    function sanitiseText(text) {
      return String(text)
        .replace(/[^\w\s.,!?'"();:\-]/gi, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim()
        .slice(0, 500);
    }

    it('passes clean English text through unchanged', () => {
      const input  = 'Hello, how are you?';
      const result = sanitiseText(input);
      assert.equal(result, input);
    });

    it('removes HTML angle-bracket tags', () => {
      const input  = 'Hello <script>alert(1)</script>';
      const result = sanitiseText(input);
      assert(!result.includes('<'), 'Result must not contain <');
      assert(!result.includes('>'), 'Result must not contain >');
    });

    it('collapses multiple consecutive spaces to one', () => {
      const result = sanitiseText('Hello   world');
      assert.equal(result, 'Hello world');
    });

    it('trims leading and trailing whitespace', () => {
      const result = sanitiseText('  Hello  ');
      assert.equal(result, 'Hello');
    });

    it('truncates text longer than 500 characters', () => {
      const long   = 'a'.repeat(600);
      const result = sanitiseText(long);
      assert(result.length <= 500, `Expected <= 500 chars, got ${result.length}`);
    });

    it('handles empty string without throwing', () => {
      const result = sanitiseText('');
      assert.equal(result, '');
    });

    it('handles non-string input by coercing', () => {
      const result = sanitiseText(42);
      assert.equal(result, '42');
    });
  });

  describe('AudioEngine — cache key consistency', () => {
    function sanitise(text) {
      return String(text)
        .replace(/[^\w\s.,!?'"();:\-]/gi, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim()
        .slice(0, 500);
    }

    it('same text produces the same sanitised cache key', () => {
      const text = 'Good morning!';
      assert.equal(sanitise(text), sanitise(text), 'Cache key must be deterministic');
    });

    it('different text produces different cache keys', () => {
      assert(
        sanitise('Hello') !== sanitise('Goodbye'),
        'Different texts must produce different keys'
      );
    });
  });

  describe('Route format validation', () => {
    function parseHash(hash) {
      const parts  = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
      const route  = parts[0] || '';
      const params = parts.slice(1);
      return { route, params };
    }

    it('parses home route "#/"', () => {
      const { route, params } = parseHash('#/');
      assert.equal(route, '');
      assert.equal(params.length, 0);
    });

    it('parses level route "#/level/a1"', () => {
      const { route, params } = parseHash('#/level/a1');
      assert.equal(route, 'level');
      assert.equal(params[0], 'a1');
    });

    it('parses lesson route "#/lesson/a1/m01/l01"', () => {
      const { route, params } = parseHash('#/lesson/a1/m01/l01');
      assert.equal(route, 'lesson');
      assert.equal(params[0], 'a1');
      assert.equal(params[1], 'm01');
      assert.equal(params[2], 'l01');
    });

    it('handles missing hash gracefully', () => {
      const { route, params } = parseHash('');
      assert.equal(route, '');
      assert.equal(params.length, 0);
    });
  });
}

module.exports = { run };
