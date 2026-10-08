"""Gera áudio Kokoro estático para o Johnson English.

Uso:
    python tools/generate-kokoro-audio.py a1 m01 l02
    python tools/generate-kokoro-audio.py --all

O ambiente de geração é separado do site publicado. Os alunos recebem apenas
os arquivos de áudio e o mapa JSON resultante.
"""

import argparse
import hashlib
import json
import os
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

import soundfile as sf
from kokoro_onnx import Kokoro


ROOT = Path(__file__).resolve().parents[1]
LESSONS_PATH = ROOT / "data" / "lessons.json"
MAP_PATH = ROOT / "data" / "audio-map.json"
OUTPUT_DIR = ROOT / "assets" / "audio" / "kokoro"
_WORKER = None


def init_worker(model_path, voices_path):
    """Carrega uma instância Kokoro por processo de geração."""
    global _WORKER
    _WORKER = Kokoro(model_path, voices_path)


def generate_audio(job):
    """Gera um arquivo de áudio e retorna sua entrada de mapa."""
    text, voice, speed, lang, output, relative = job
    samples, sample_rate = _WORKER.create(text, voice=voice, speed=speed, lang=lang)
    if len(samples) == 0:
        raise RuntimeError(f"Kokoro não gerou áudio para: {text}")
    sf.write(output, samples, sample_rate, format="MP3", subtype="MPEG_LAYER_III")
    return text, f"./{relative}"


def lesson_texts(lesson):
    """Retorna todo texto reproduzível da lição na ordem curricular."""
    texts = []

    def add(text):
        """Adiciona texto não vazio sem duplicá-lo dentro da lição."""
        if text and text not in texts:
            texts.append(text)

    for item in lesson.get("examples") or []:
        add(item.get("en"))
    for item in [*(lesson.get("listening") or []), *(lesson.get("repetition") or [])]:
        text = item.get("text") or item.get("en")
        add(text)
    for sound in lesson.get("sounds") or []:
        for word in sound.get("words") or []:
            add(word.get("en"))
    for pair in lesson.get("minimal_pairs") or []:
        add(pair.get("a"))
        add(pair.get("b"))
    return texts


def save_audio_map(audio_map, map_path):
    """Persiste o mapa de forma determinística para permitir retomada do lote."""
    map_path.write_text(
        json.dumps(dict(sorted(audio_map.items())), ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main():
    parser = argparse.ArgumentParser(description="Gerar áudio Kokoro para o currículo")
    parser.add_argument("level", nargs="?")
    parser.add_argument("module", nargs="?")
    parser.add_argument("lesson", nargs="?")
    parser.add_argument("--all", action="store_true", help="Gerar todo o currículo")
    parser.add_argument("--voice", default="af_heart")
    parser.add_argument("--speed", type=float, default=0.95)
    parser.add_argument("--accent", choices=("us", "gb"), default="us")
    parser.add_argument("--workers", type=int, choices=(1, 2), default=1)
    parser.add_argument(
        "--model-dir",
        type=Path,
        default=Path(os.environ.get("KOKORO_MODEL_DIR", "")),
        help="Pasta contendo kokoro-v1.0.onnx e voices-v1.0.bin",
    )
    args = parser.parse_args()

    model_path = args.model_dir / "kokoro-v1.0.onnx"
    voices_path = args.model_dir / "voices-v1.0.bin"
    if not model_path.is_file() or not voices_path.is_file():
        raise SystemExit(
            "Defina KOKORO_MODEL_DIR ou --model-dir com os arquivos do modelo Kokoro."
        )

    lessons = json.loads(LESSONS_PATH.read_text(encoding="utf-8"))
    if args.all:
        selected_lessons = lessons
    else:
        if not all((args.level, args.module, args.lesson)):
            raise SystemExit("Informe nível, módulo e lição ou use --all.")
        lesson = next((item for item in lessons if
                       item["levelId"] == args.level and
                       item["moduleId"] == args.module and
                       item["id"] == args.lesson), None)
        if lesson is None:
            raise SystemExit("Lição não encontrada")
        selected_lessons = [lesson]

    texts = []
    for selected in selected_lessons:
        for text in lesson_texts(selected):
            if text not in texts:
                texts.append(text)

    map_path = MAP_PATH if args.accent == "us" else ROOT / "data" / "audio-map-gb.json"
    lang = "en-us" if args.accent == "us" else "en-gb"
    audio_map = json.loads(map_path.read_text(encoding="utf-8"))
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    skipped = 0
    jobs = []
    for text in texts:
        mapped = audio_map.get(text)
        if mapped and (ROOT / mapped.removeprefix("./")).is_file():
            skipped += 1
            continue
        digest = hashlib.sha256(f"{args.voice}\0{text}".encode()).hexdigest()[:16]
        relative = f"assets/audio/kokoro/{digest}.mp3"
        jobs.append((text, args.voice, args.speed, lang, str(ROOT / relative), relative))

    generated = 0
    if jobs:
        if args.workers == 1:
            init_worker(str(model_path), str(voices_path))
            results = map(generate_audio, jobs)
        else:
            executor = ProcessPoolExecutor(
                max_workers=args.workers,
                initializer=init_worker,
                initargs=(str(model_path), str(voices_path)),
            )
            results = executor.map(generate_audio, jobs)
        try:
            for text, relative in results:
                audio_map[text] = relative
                generated += 1
                if not args.all:
                    print(f"{Path(relative).name}: {text}")
                elif generated % 250 == 0:
                    save_audio_map(audio_map, map_path)
                    print(f"{generated}/{len(jobs)} novas falas processadas")
        finally:
            if args.workers > 1:
                executor.shutdown()

    save_audio_map(audio_map, map_path)
    print(f"Concluído: {generated} geradas, {skipped} existentes, {len(texts)} falas únicas.")


if __name__ == "__main__":
    main()
