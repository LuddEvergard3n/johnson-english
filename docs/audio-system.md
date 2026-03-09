# Audio System — Johnson English

## Overview

The audio system uses the **Web Speech API** exclusively — a browser-native API requiring zero dependencies, zero server infrastructure, and fully compatible with GitHub Pages and any static hosting.

## Backend

| Backend | Availability | Quality |
|---|---|---|
| Web Speech API | All modern browsers (Chrome, Edge, Safari, Firefox) | Good — adequate for language learning |

If the browser does not support the Web Speech API, the UI displays "Áudio indisponível" gracefully — no exceptions thrown.

## Architecture

```
AudioEngine (audio-engine.js)
  ├── init()                 — preloads voice list (Chrome async issue)
  ├── speak(text, callbacks) — sanitise → pick voice → SpeechSynthesisUtterance
  ├── stop()                 — cancel current utterance
  ├── isPlaying (getter)
  └── hydrateAudioButtons()  — event delegation for .btn--audio[data-text]
```

## Voice Selection

`_pickVoice()` selects in priority order:

1. `en-US` local voice
2. Any `en-US` voice
3. Any `en-*` voice
4. Browser default (no voice set)

## Text Sanitisation

All text is sanitised before synthesis:

```
String(text)
  .replace(/[^\w\s.,!?'"();:\-]/gi, ' ')
  .replace(/\s{2,}/g, ' ')
  .trim()
  .slice(0, 500)
```

## Speech Parameters

| Parameter | Value | Rationale |
|---|---|---|
| `lang` | `en-US` | Target language |
| `rate` | `0.9` | Slightly slower — clearer for learners |
| `pitch` | `1.0` | Natural pitch |

## Event Delegation

`hydrateAudioButtons()` registers a single `click` listener on `#app-root`, matching `.btn--audio[data-text]` elements. The previous handler is removed before registering a new one, ensuring the lesson context (levelId/moduleId/lessonId) is always current.

## Error Handling

- `interrupted` error from `speechSynthesis.cancel()` is silently ignored — not a real error.
- All other errors call `onError` callback, which updates the button status to "Áudio indisponível".

## Browser Compatibility

| Browser | Support |
|---|---|
| Chrome 33+ | Full |
| Edge 14+ | Full |
| Safari 7+ | Full |
| Firefox 49+ | Full |
| Older browsers | Silent fallback (no audio, no crash) |
