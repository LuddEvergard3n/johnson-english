/**
 * audio-tests.js — Audio system unit tests
 * Johnson English Language Laboratory
 *
 * Tests the AudioEngine logic that can be verified without a browser:
 *   - Text sanitisation rules
 *   - Throttle timing logic
 *   - Cache key consistency
 *
 * Note: Actual TTS requests and HTMLAudioElement playback require a browser
 * and a running Coqui TTS server. Those are integration tests outside scope.
 */

'use strict';

async function run({ describe, it, assert }) {

  describe('AudioEngine — text sanitisation', () => {
    /* Replicate the sanitisation logic from audio-engine.js for unit testing.
       In a browser environment this would be imported; here we duplicate
       the logic so the test runs in Node.js without a DOM. */
    function sanitiseText(text) {
      return String(text)
        .replace(/[^\w\s.,!?'"();:\-]/gi, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim()
        .slice(0, 500);
    }

    it('passes clean English text through unchanged', () => {
      const input    = 'Hello, how are you?';
      const result   = sanitiseText(input);
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

  describe('AudioEngine — throttle logic', () => {
    it('respects the throttle interval (simulation)', async () => {
      /* Simulate the throttle by tracking timestamps */
      const THROTTLE_MS     = 500;
      let lastRequestTime   = 0;
      const callTimestamps  = [];

      async function simulateThrottle() {
        const now   = Date.now();
        const delta = now - lastRequestTime;
        if (delta < THROTTLE_MS) {
          await new Promise((r) => setTimeout(r, THROTTLE_MS - delta));
        }
        lastRequestTime = Date.now();
        callTimestamps.push(lastRequestTime);
      }

      /* Fire 3 simulated requests */
      await simulateThrottle();
      await simulateThrottle();
      await simulateThrottle();

      /* Each call should be at least THROTTLE_MS apart */
      for (let i = 1; i < callTimestamps.length; i++) {
        const gap = callTimestamps[i] - callTimestamps[i - 1];
        assert(
          gap >= THROTTLE_MS - 20, /* 20ms tolerance for timer imprecision */
          `Gap between calls was ${gap}ms, expected >= ${THROTTLE_MS}ms`
        );
      }
    });
  });

  describe('AudioEngine — cache key consistency', () => {
    it('same text produces the same sanitised cache key', () => {
      function sanitise(text) {
        return String(text)
          .replace(/[^\w\s.,!?'"();:\-]/gi, ' ')
          .replace(/\s{2,}/g, ' ')
          .trim()
          .slice(0, 500);
      }

      const text = 'Good morning!';
      assert.equal(sanitise(text), sanitise(text), 'Cache key must be deterministic');
    });

    it('different text produces different cache keys', () => {
      function sanitise(text) {
        return String(text)
          .replace(/[^\w\s.,!?'"();:\-]/gi, ' ')
          .replace(/\s{2,}/g, ' ')
          .trim()
          .slice(0, 500);
      }

      assert(
        sanitise('Hello') !== sanitise('Goodbye'),
        'Different texts must produce different keys'
      );
    });
  });

  describe('Route format validation', () => {
    /* Replicate parseHash logic from router.js */
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
