/**
 * audio-tests.js — Audio system & router unit tests
 * Johnson English Language Laboratory
 *
 * Tests the pure logic that can be verified without a browser:
 *   - AudioEngine.sanitiseText (text sanitisation rules, cache key consistency)
 *   - Router.parseHash (hash-route parsing)
 *
 * Estes testes importam as funções reais de js/audio-engine.js e
 * js/router.js via import() dinâmico, em vez de reimplementar a lógica
 * localmente. Antes desta reescrita, este arquivo mantinha cópias
 * manuais de sanitiseText/parseHash — se a regex de sanitização ou o
 * parsing de hash mudasse em produção sem que alguém lembrasse de
 * atualizar a cópia aqui, os testes continuariam verdes validando uma
 * implementação que já não existia mais. `test-runner.js` é CommonJS e
 * os módulos do projeto são ES Modules; import() dinâmico funciona a
 * partir de um contexto CommonJS e resolve essa interoperabilidade sem
 * precisar reescrever o runner.
 *
 * Note: Actual Web Speech API playback requires a browser environment.
 * Those are integration tests outside scope.
 */

'use strict';

const path = require('path');

async function run({ describe, it, assert }) {
  const { sanitiseText } = await import(
    'file://' + path.join(__dirname, '..', 'js', 'audio-engine.js')
  );
  const { parseHash } = await import(
    'file://' + path.join(__dirname, '..', 'js', 'router.js')
  );

  describe('AudioEngine.sanitiseText', () => {
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

  describe('AudioEngine.sanitiseText — cache key consistency', () => {
    it('same text produces the same sanitised cache key', () => {
      const text = 'Good morning!';
      assert.equal(sanitiseText(text), sanitiseText(text), 'Cache key must be deterministic');
    });

    it('different text produces different cache keys', () => {
      assert(
        sanitiseText('Hello') !== sanitiseText('Goodbye'),
        'Different texts must produce different keys'
      );
    });
  });

  describe('Router.parseHash', () => {
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
