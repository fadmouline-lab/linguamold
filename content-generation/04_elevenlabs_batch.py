#!/usr/bin/env python3
"""
ElevenLabs batch audio generator for LinguaMold.

Reads a CSV manifest (text, filename, voice_gender) and generates MP3 files
using the ElevenLabs text-to-speech API. Skips files that already exist
(resume-on-failure). Logs errors to errors.log.

Usage:
    python 04_elevenlabs_batch.py \\
        --api-key YOUR_API_KEY \\
        --input-csv audio_manifest.csv \\
        --output-dir ./audio-output \\
        --voice-id-female EXAVITQu4vr4xnSDxMaL \\
        --voice-id-male VR6AewLTigWG4xSOukaG
"""

import argparse
import csv
import os
import sys
import time
import logging


ELEVENLABS_TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
DEFAULT_MODEL = "eleven_multilingual_v2"
RATE_LIMIT_DELAY = 0.5  # seconds between requests
RETRY_DELAY = 5.0        # seconds to wait after a 429
MAX_RETRIES = 1


def setup_logging(output_dir: str) -> logging.Logger:
    log_path = os.path.join(output_dir, "errors.log")
    logger = logging.getLogger("elevenlabs_batch")
    logger.setLevel(logging.INFO)
    fh = logging.FileHandler(log_path, encoding="utf-8")
    fh.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
    ch = logging.StreamHandler()
    ch.setFormatter(logging.Formatter("%(levelname)s %(message)s"))
    logger.addHandler(fh)
    logger.addHandler(ch)
    return logger


def generate_audio(
    text: str,
    voice_id: str,
    api_key: str,
    model: str,
) -> bytes:
    """Call ElevenLabs TTS API. Returns raw MP3 bytes. Raises on error."""
    url = ELEVENLABS_TTS_URL.format(voice_id=voice_id)
    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }
    payload = {
        "text": text,
        "model_id": model,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
        },
    }
    response = requests.post(url, headers=headers, json=payload, timeout=60)

    if response.status_code == 429:
        raise RateLimitError("Rate limited (429)")
    if response.status_code != 200:
        raise APIError(f"HTTP {response.status_code}: {response.text[:200]}")

    return response.content


class RateLimitError(Exception):
    pass


class APIError(Exception):
    pass


def process_csv(
    input_csv: str,
    output_dir: str,
    api_key: str,
    voice_id_female: str,
    voice_id_male: str,
    model: str,
    logger: logging.Logger,
) -> tuple[int, int, int]:
    """
    Process all rows in the CSV. Returns (total, skipped, failed).
    """
    os.makedirs(output_dir, exist_ok=True)

    with open(input_csv, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    total = len(rows)
    skipped = 0
    failed = 0
    generated = 0

    print(f"Processing {total} rows from {input_csv}")
    print(f"Output directory: {output_dir}")
    print("-" * 60)

    for i, row in enumerate(rows, start=1):
        text = row.get("text", "").strip()
        filename = row.get("filename", "").strip()
        voice_gender = row.get("voice_gender", "female").strip().lower()

        if not text or not filename:
            logger.warning(f"Row {i}: missing text or filename — skipped")
            skipped += 1
            continue

        output_path = os.path.join(output_dir, filename)

        # Resume-on-failure: skip if file already exists and has content
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            print(f"[{i}/{total}] SKIP {filename} (already exists)")
            skipped += 1
            continue

        voice_id = voice_id_female if voice_gender == "female" else voice_id_male

        # Create subdirectories if filename contains path separators
        os.makedirs(os.path.dirname(output_path), exist_ok=True) if os.path.dirname(output_path) != output_dir else None

        # Try once, retry once on rate limit
        attempt = 0
        success = False
        while attempt <= MAX_RETRIES:
            try:
                audio_bytes = generate_audio(text, voice_id, api_key, model)
                with open(output_path, "wb") as out:
                    out.write(audio_bytes)
                print(f"[{i}/{total}] OK   {filename} ({voice_gender}, {len(audio_bytes)} bytes)")
                generated += 1
                success = True
                break
            except RateLimitError:
                if attempt < MAX_RETRIES:
                    print(f"[{i}/{total}] WAIT rate limit — retrying in {RETRY_DELAY}s…")
                    time.sleep(RETRY_DELAY)
                    attempt += 1
                else:
                    logger.error(f"Row {i} ({filename}): rate limited after retry")
                    failed += 1
                    break
            except APIError as e:
                logger.error(f"Row {i} ({filename}): {e}")
                failed += 1
                break
            except Exception as e:
                logger.error(f"Row {i} ({filename}): unexpected error — {e}")
                failed += 1
                break

        if success:
            time.sleep(RATE_LIMIT_DELAY)

    return total, skipped, failed


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate ElevenLabs audio files from a CSV manifest.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--api-key", required=True, help="ElevenLabs API key")
    parser.add_argument(
        "--input-csv",
        default="audio_manifest.csv",
        help="Path to CSV with columns: text, filename, voice_gender (default: audio_manifest.csv)",
    )
    parser.add_argument(
        "--output-dir",
        default="./audio-output",
        help="Directory for generated MP3 files (default: ./audio-output)",
    )
    parser.add_argument(
        "--voice-id-female",
        default="EXAVITQu4vr4xnSDxMaL",
        help="ElevenLabs voice ID for female voice (default: Rachel)",
    )
    parser.add_argument(
        "--voice-id-male",
        default="VR6AewLTigWG4xSOukaG",
        help="ElevenLabs voice ID for male voice (default: Arnold)",
    )
    parser.add_argument(
        "--model",
        default=DEFAULT_MODEL,
        help=f"ElevenLabs model ID (default: {DEFAULT_MODEL})",
    )

    args = parser.parse_args()

    # Defer requests import until after --help is handled
    try:
        import requests as _requests  # noqa: F401
        globals()["requests"] = _requests
    except ImportError:
        print("Error: 'requests' library not found. Install it with: pip install requests")
        sys.exit(1)

    if not os.path.exists(args.input_csv):
        print(f"Error: input CSV not found: {args.input_csv}")
        sys.exit(1)

    os.makedirs(args.output_dir, exist_ok=True)
    logger = setup_logging(args.output_dir)

    total, skipped, failed = process_csv(
        input_csv=args.input_csv,
        output_dir=args.output_dir,
        api_key=args.api_key,
        voice_id_female=args.voice_id_female,
        voice_id_male=args.voice_id_male,
        model=args.model,
        logger=logger,
    )

    generated = total - skipped - failed
    print("-" * 60)
    print(f"Done. Total: {total} | Generated: {generated} | Skipped: {skipped} | Failed: {failed}")
    if failed > 0:
        print(f"See {os.path.join(args.output_dir, 'errors.log')} for details.")
        sys.exit(1)


if __name__ == "__main__":
    main()
