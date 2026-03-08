"""
wrapper.py — Minimal Flask wrapper around Coqui TTS
Johnson English Language Laboratory

Adds:
  - CORS headers (for local GitHub Pages development)
  - Request rate limiting per IP address
  - Input sanitisation before passing to TTS engine
  - Security headers on all responses

Usage:
  pip install TTS flask flask-cors
  python wrapper.py

The wrapper listens on port 5002 by default (matching Johnson English
frontend configuration in audio-engine.js).
"""

import re
import time
import threading
from flask import Flask, request, Response, jsonify

# Assumption: Coqui TTS is importable. Install with: pip install TTS
try:
    from TTS.api import TTS as CoquiTTS
    TTS_AVAILABLE = True
except ImportError:
    TTS_AVAILABLE = False
    print("[WARNING] Coqui TTS not installed. Returning 503 for all TTS requests.")

app = Flask(__name__)

# ============================================================================
# CONFIGURATION
# ============================================================================

TTS_MODEL    = "tts_models/multilingual/multi-dataset/xtts_v2"
TTS_LANGUAGE = "en"
PORT         = 5002
DEBUG        = False

# Rate limiting: max requests per window per IP
RATE_LIMIT_WINDOW   = 60    # seconds
RATE_LIMIT_MAX      = 30    # max requests per window

# Input limits
MAX_TEXT_LENGTH = 500

# ============================================================================
# RATE LIMITER (simple in-memory, per IP)
# ============================================================================

_rate_store  = {}   # { ip: [timestamp, ...] }
_rate_lock   = threading.Lock()


def is_rate_limited(ip: str) -> bool:
    """Return True if the IP has exceeded the rate limit."""
    now = time.time()
    with _rate_lock:
        history = _rate_store.get(ip, [])
        # Remove timestamps outside the window
        history = [t for t in history if now - t < RATE_LIMIT_WINDOW]
        if len(history) >= RATE_LIMIT_MAX:
            return True
        history.append(now)
        _rate_store[ip] = history
    return False


# ============================================================================
# TEXT SANITISATION
# ============================================================================

# Allow only safe characters for TTS input
_ALLOWED_CHARS = re.compile(r"[^\w\s.,!?'\"();:\-]", flags=re.UNICODE)


def sanitise_text(text: str) -> str:
    """Remove disallowed characters and enforce length limit."""
    cleaned = _ALLOWED_CHARS.sub(" ", text)
    cleaned = re.sub(r"\s{2,}", " ", cleaned).strip()
    return cleaned[:MAX_TEXT_LENGTH]


# ============================================================================
# TTS ENGINE
# ============================================================================

_tts_engine  = None
_tts_lock    = threading.Lock()


def get_tts_engine():
    """Lazy initialise the TTS engine (thread-safe)."""
    global _tts_engine
    if not TTS_AVAILABLE:
        return None
    with _tts_lock:
        if _tts_engine is None:
            print(f"[TTS] Loading model: {TTS_MODEL}")
            _tts_engine = CoquiTTS(model_name=TTS_MODEL, progress_bar=False)
            print("[TTS] Model loaded.")
    return _tts_engine


# ============================================================================
# ROUTES
# ============================================================================

@app.after_request
def add_security_headers(response):
    """Attach security headers to every response."""
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"]         = "DENY"
    response.headers["Cache-Control"]           = "no-store"
    # CORS: allow requests from any origin (development only).
    # For production, restrict to the actual GitHub Pages domain.
    response.headers["Access-Control-Allow-Origin"]  = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@app.route("/api/tts", methods=["OPTIONS"])
def tts_preflight():
    """Handle CORS preflight."""
    return Response(status=204)


@app.route("/api/tts", methods=["POST"])
def tts():
    """
    Synthesise speech for the given text.

    Request body (JSON):
      { "text": "...", "language": "en" }

    Response:
      audio/wav binary, or JSON error.
    """
    ip = request.remote_addr

    if is_rate_limited(ip):
        return jsonify({"error": "Rate limit exceeded. Please wait."}), 429

    body = request.get_json(silent=True)
    if not body or "text" not in body:
        return jsonify({"error": "Missing 'text' field."}), 400

    raw_text = body.get("text", "")
    text     = sanitise_text(str(raw_text))

    if not text:
        return jsonify({"error": "Text is empty after sanitisation."}), 400

    tts_engine = get_tts_engine()
    if tts_engine is None:
        return jsonify({"error": "TTS engine not available."}), 503

    try:
        import io
        import soundfile as sf
        import numpy as np

        # Synthesise to in-memory buffer
        wav = tts_engine.tts(text=text, language=TTS_LANGUAGE)

        buf = io.BytesIO()
        sf.write(buf, np.array(wav), samplerate=22050, format="WAV")
        buf.seek(0)

        return Response(buf.read(), mimetype="audio/wav")

    except Exception as exc:
        print(f"[TTS] Synthesis error: {exc}")
        return jsonify({"error": "TTS synthesis failed."}), 500


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint. Returns 200 when the server is ready."""
    return jsonify({"status": "ok", "tts_available": TTS_AVAILABLE})


# ============================================================================
# ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    print(f"[Server] Starting Johnson English TTS wrapper on port {PORT}")
    # threaded=True allows concurrent requests (important for prefetch)
    app.run(host="0.0.0.0", port=PORT, debug=DEBUG, threaded=True)
