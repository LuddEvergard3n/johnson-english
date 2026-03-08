/**
 * app.js — Bootstrap da aplicação
 * Johnson English — Laboratório de Língua
 *
 * Responsabilidades:
 *   - Importar e inicializar todos os módulos de nível superior na ordem correta.
 *   - Registrar event listeners globais (toggle de navegação, mudanças de rota).
 *   - Exibir banner informativo sobre o backend de áudio detectado.
 *
 * Não contém lógica de negócio — delega para os módulos dedicados.
 */

import { State }       from './state.js';
import { Router }      from './router.js';
import { AudioEngine } from './audio-engine.js';

/* ============================================================================
   ORDEM DE INICIALIZAÇÃO
   1. State   — deve existir antes que Router ou qualquer componente leia dados.
   2. Audio   — inicializar cedo; componentes referenciam durante render.
   3. Router  — lê o hash atual e renderiza a view inicial.
   ============================================================================ */

const state  = State.init();
const audio  = AudioEngine.init();
const router = Router.init(state, audio);

/* ============================================================================
   TOGGLE DE NAVEGAÇÃO (menu hamburger)
   ============================================================================ */
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.getElementById('nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
  });

  navLinks.addEventListener('click', (event) => {
    if (event.target.matches('a')) {
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('click', (event) => {
    if (!navToggle.contains(event.target) && !navLinks.contains(event.target)) {
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ============================================================================
   DESTAQUE DO LINK DE NAVEGAÇÃO ATIVO
   ============================================================================ */
function syncNavHighlight() {
  const hash = window.location.hash.split('/')[1] || 'home';
  document.querySelectorAll('.nav-link').forEach((link) => {
    const route = link.getAttribute('data-route');
    if (route === hash) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

window.addEventListener('hashchange', syncNavHighlight);
syncNavHighlight();

/* ============================================================================
   BANNER DE STATUS DO ÁUDIO
   Detecta o backend após a primeira interação e informa o usuário de forma
   discreta — especialmente útil quando o servidor TTS não está rodando.
   ============================================================================ */
const audioBanner = document.getElementById('audio-banner');

/**
 * Exibe o banner com a mensagem informando o backend detectado.
 * O banner fecha automaticamente após 5 segundos.
 *
 * @param {string} message
 * @param {string} type  'info' | 'warning'
 */
function showAudioBanner(message, type = 'info') {
  if (!audioBanner) return;
  audioBanner.textContent = message;
  audioBanner.className   = `audio-banner audio-banner--${type}`;
  audioBanner.classList.remove('hidden');

  /* Fecha automaticamente */
  setTimeout(() => {
    audioBanner.classList.add('hidden');
  }, 6000);
}

/*
 * Monitora o backend detectado pelo AudioEngine.
 * Na primeira vez que a propriedade sai de 'unknown', exibe o banner.
 */
let _bannerShown = false;
const _backendPoll = setInterval(() => {
  const backend = AudioEngine.backend;
  if (backend === 'unknown' || _bannerShown) return;

  _bannerShown = true;
  clearInterval(_backendPoll);

  if (backend === 'speech') {
    showAudioBanner(
      'Áudio ativado via voz do navegador. Para qualidade maior, inicie o servidor Coqui TTS.',
      'info'
    );
  } else if (backend === 'none') {
    showAudioBanner(
      'Áudio indisponível neste ambiente. O conteúdo pode ser estudado sem som.',
      'warning'
    );
  }
  /* Backend 'server': nenhum banner necessário — é o comportamento esperado. */
}, 300);

/* Expõe módulos na janela para inspeção em desenvolvimento */
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  window.__JE = { state, audio, router };
}
