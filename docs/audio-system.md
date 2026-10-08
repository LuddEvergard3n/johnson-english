# Audio System — Johnson English

## Overview

The audio system prefers American (`af_heart`) or British (`bf_isabella`)
static recordings generated with **Kokoro-82M** and
uses the **Web Speech API** as a fallback. Kokoro is a content-generation tool,
not a runtime dependency: GitHub Pages serves ordinary audio files.

## Backend

| Backend | Availability | Quality |
|---|---|---|
| Kokoro recording | When the phrase exists in `data/audio-map.json` | Consistent and natural |
| Web Speech API | Modern browsers | Device-dependent fallback |

If a recording is absent, the browser voice is used. If neither option is
available, the UI displays "Áudio indisponível" without breaking the lesson.

## Architecture

```
AudioEngine (audio-engine.js)
  ├── init()                 — loads audio map and browser voices
  ├── speak(text, callbacks) — static recording → browser voice fallback
  ├── stop()                 — cancel current utterance
  ├── isPlaying (getter)
  └── hydrateAudioButtons()  — event delegation for .btn--audio[data-text]
```

## Voice Selection

When a static recording is unavailable, `_pickVoice()` selects in priority order:

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

## Generating Kokoro recordings

Kokoro generation requires a separate Python environment and never runs in the
published application. Install `kokoro-onnx` and `soundfile`, download
`kokoro-v1.0.onnx` and `voices-v1.0.bin`, and point `KOKORO_MODEL_DIR` to their
directory. Generate one lesson or the complete curriculum:

```bash
python tools/generate-kokoro-audio.py a1 m01 l02
python tools/generate-kokoro-audio.py --all
python tools/generate-kokoro-audio.py --all --voice bf_isabella --accent gb --workers 2
```

The command writes compressed MP3 files to `assets/audio/kokoro/` and updates
`data/audio-map.json` or `data/audio-map-gb.json`. Audio files are cached only
after use; they are not part of the initial PWA shell download.

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
