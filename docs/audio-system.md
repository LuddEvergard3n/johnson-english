# Sistema de Áudio — Johnson English

## Visão Geral

O sistema de áudio opera em três camadas, detectadas automaticamente na primeira
chamada a `AudioEngine.speak()`. Nenhuma configuração manual é necessária.

```
1. Coqui TTS server (localhost:5002)   → alta qualidade, requer servidor local
2. Web Speech API (window.speechSynthesis) → nativa do navegador, zero deps
3. Fallback silencioso                 → UI exibe erro, aplicação continua
```

Todo o conteúdo é completamente utilizável em qualquer uma das três camadas.
A troca de camada é transparente para o usuário.

---

## Arquitetura

```
Botão .btn--audio clicado
    │
    ▼
AudioEngine.hydrateAudioButtons() → event delegation no #app-root
    │
    ▼
AudioEngine.speak(text)
    │
    ├── _resolveBackend()          ← detecta camada na 1ª chamada
    │       │
    │       ├── GET /health (timeout 2s) → servidor disponível?
    │       │       ├── sim  → _backend = 'server'
    │       │       └── não  → speechSynthesis presente?
    │       │               ├── sim  → _backend = 'speech'
    │       │               └── não  → _backend = 'none'
    │       │
    │       └── (resultado fixado para a sessão)
    │
    ├── 'server' → _speakViaServer()
    │       │
    │       │  POST /api/tts { text, language: 'en' }
    │       ▼
    │   Servidor TTS (localhost:5002)
    │       │  blob WAV
    │       ▼
    │   URL.createObjectURL(blob) → HTMLAudioElement.play()
    │       │
    │       └── erro em runtime → commuta para 'speech' automaticamente
    │
    ├── 'speech' → _speakViaSpeechAPI()
    │       │
    │       │  SpeechSynthesisUtterance (lang: 'en-US', rate: 0.9)
    │       ▼
    │   window.speechSynthesis.speak(utterance)
    │
    └── 'none' → onError callback
```

---

## AudioEngine — API Pública

### `AudioEngine.speak(text, callbacks)`

Reproduz o texto em voz alta. Detecta o backend na primeira chamada.

```javascript
await AudioEngine.speak("Hello!", {
    onStart: () => { /* atualizar UI */ },
    onEnd:   () => { /* marcar como concluído */ },
    onError: () => { /* mostrar estado de erro */ },
});
```

### `AudioEngine.stop()`

Para qualquer reprodução em andamento (HTMLAudioElement ou Web Speech API).

```javascript
AudioEngine.stop();
```

### `AudioEngine.hydrateAudioButtons({ levelId, moduleId, lessonId, state })`

Registra event delegation para todos os botões `.btn--audio[data-text]` dentro
do `#app-root`. Deve ser chamado uma vez por navegação de lição — por
`LessonEngine.hydrate()` e `PronunciationEngine.hydrate()`.

Remove o listener anterior antes de registrar o novo, garantindo que o contexto
de `levelId/moduleId/lessonId` esteja sempre atualizado ao navegar entre lições.

```javascript
// Padrão obrigatório em qualquer engine que use botões de áudio:
AudioEngine.hydrateAudioButtons({ levelId, moduleId, lessonId, state });
```

### `AudioEngine.prefetch(texts)`

Pré-carrega áudio para uma lista de textos em segundo plano.
Só funciona quando o backend é `'server'`. Ignorado para Web Speech API.
Erros são silenciados.

```javascript
await AudioEngine.prefetch(["Hello!", "Good morning.", "Goodbye."]);
```

### `AudioEngine.setServerUrl(url)`

Configura a URL do servidor TTS em runtime. Força nova detecção de backend.

```javascript
AudioEngine.setServerUrl("https://tts.exemplo.com");
```

### `AudioEngine.backend` (getter)

Backend ativo nesta sessão: `'unknown' | 'server' | 'speech' | 'none'`.

### `AudioEngine.isPlaying` (getter)

`true` se há áudio em reprodução no momento.

---

## Sanitização de Texto

Todo texto é sanitizado antes de ser enviado ao TTS ou à Web Speech API:

```javascript
function _sanitise(text) {
    return String(text)
        .replace(/[^\w\s.,!?'"();:\-]/gi, ' ')  // remove caracteres incomuns
        .replace(/\s{2,}/g, ' ')                  // colapsa espaços múltiplos
        .trim()
        .slice(0, 500);                           // limite rígido de 500 chars
}
```

---

## Throttle e Concorrência

- Intervalo mínimo de **500ms** entre requisições ao servidor TTS (throttle).
- Máximo de **2 requisições** simultâneas ao servidor.
- Chamadas que excedem o concorrente recebem `onError` imediatamente.
- A Web Speech API não tem throttle — `speechSynthesis.cancel()` é chamado antes
  de cada nova fala para evitar fila acumulada.

---

## Cache de Áudio

Blobs do servidor TTS são cacheados como `ObjectURL`s, indexados pelo texto
sanitizado. Uma frase já solicitada é reproduzida instantaneamente do cache na
segunda chamada, sem nova requisição HTTP.

O cache persiste durante a sessão. `AudioEngine.clearCache()` libera todos os
ObjectURLs e limpa o Map.

---

## Servidor: Wrapper Coqui TTS

Arquivo: `server/coqui-tts-service/wrapper.py`

Um wrapper Flask sobre a biblioteca Python do Coqui TTS.

### Endpoints

```
GET  /health
→ 200  (servidor disponível — usado pela detecção de backend)

POST /api/tts
Content-Type: application/json
{ "text": "...", "language": "en" }
→ 200  audio/wav
→ 400  { "error": "..." }   (entrada inválida)
→ 429  { "error": "..." }   (rate limit atingido)
→ 503  { "error": "..." }   (motor TTS indisponível)
```

### Rate Limiting

30 requisições por janela de 60 segundos, por endereço IP.
Rastreado em dicionário em memória — reinicia ao reiniciar o processo.

### CORS

`Access-Control-Allow-Origin: *` para desenvolvimento local.
Para produção, restrinja ao domínio do GitHub Pages:

```python
response.headers["Access-Control-Allow-Origin"] = "https://usuario.github.io"
```

---

## Modelos Recomendados

| Modelo | Tamanho | Qualidade | Notas |
|---|---|---|---|
| `tts_models/multilingual/multi-dataset/xtts_v2` | ~1,8 GB | Excelente | Recomendado |
| `tts_models/en/ljspeech/tacotron2-DDC` | ~100 MB | Bom | Rápido, só inglês |
| `tts_models/en/vctk/vits` | ~120 MB | Bom | Múltiplas vozes |

---

## Web Speech API — Notas de Compatibilidade

- **Chrome/Edge**: suporte completo. Vozes `en-US` nativas de alta qualidade.
  `getVoices()` retorna lista vazia na primeira chamada — o `AudioEngine.init()`
  força o carregamento via evento `voiceschanged`.
- **Firefox**: suporte funcional. Voz `en-US` disponível na maioria dos sistemas.
- **Safari**: suporte completo em macOS/iOS com vozes do sistema.

O `AudioEngine` seleciona automaticamente a melhor voz `en-US` disponível.
Se não houver voz `en-US`, usa qualquer voz `en-*`.

---

## Deploy em Produção

O GitHub Pages serve apenas arquivos estáticos. O servidor TTS deve ser hospedado
separadamente (VPS, Railway, Render, etc.).

Atualize a URL padrão em `audio-engine.js`:

```javascript
const DEFAULT_TTS_URL = 'https://seu-servidor-tts.exemplo.com';
```

Ou configure em runtime (via console ou inicialização customizada):

```javascript
window.__JE.audio.setServerUrl('https://seu-servidor-tts.exemplo.com');
```

Sem o servidor TTS configurado, a Web Speech API entra automaticamente.
Nenhum usuário vê erro por padrão.
