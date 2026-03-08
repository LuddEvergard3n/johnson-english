# Coqui TTS Service — Johnson English

This directory contains configuration and setup instructions for the
[Coqui TTS](https://github.com/coqui-ai/TTS) server that provides speech
synthesis for Johnson English.

## Requirements

- Python 3.9 or later
- pip

## Installation

```bash
pip install TTS flask flask-cors
```

## Starting the Server

The Coqui TTS server exposes an HTTP API that Johnson English calls
to synthesise speech. The simplest way to start it:

```bash
# English, XTTS v2 model (recommended — highest quality)
tts-server \
  --model_name "tts_models/multilingual/multi-dataset/xtts_v2" \
  --port 5002
```

On first run, the model (~1.8 GB) will be downloaded automatically.

## API Contract

Johnson English sends POST requests to `/api/tts`:

```
POST http://localhost:5002/api/tts
Content-Type: application/json

{ "text": "Hello, how are you?", "language": "en" }
```

Response: `audio/wav` binary stream.

> Note: The default Coqui TTS server uses `/api/tts` as its endpoint.
> If your installation uses a different path, update `DEFAULT_TTS_URL`
> in `js/audio-engine.js`.

## Custom Wrapper (optional)

If you need rate limiting, authentication, or CORS configuration
beyond what the default server provides, a minimal Flask wrapper
is included in `wrapper.py`. Start it instead:

```bash
python wrapper.py
```

## Fallback Behaviour

Johnson English degrades gracefully when the TTS server is unavailable.
Audio buttons display "Audio unavailable" rather than crashing.
All text content remains readable and interactive.

## Security Notes

- The TTS server should **never** be exposed publicly without authentication.
- Rate limiting is enforced on the frontend (see `audio-engine.js`).
- For production deployments, put a reverse proxy (nginx) in front and
  enable HTTPS.
