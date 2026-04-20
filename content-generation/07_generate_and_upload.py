#!/usr/bin/env python3
#!/usr/bin/env python3
"""
AWS Polly audio generator + Supabase uploader for LinguaMold.

Reads exercises from the live Supabase DB, generates MP3 audio via AWS Polly,
uploads to Supabase Storage, and updates exercise content with audio URLs.

Usage:
    pip install boto3 python-dotenv supabase
    python 07_generate_and_upload.py                    # full run
    python 07_generate_and_upload.py --dry-run           # estimate only
    python 07_generate_and_upload.py --limit 10          # first 10 exercises
    python 07_generate_and_upload.py --module salutations # one module only

Required .env variables:
    AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
    EXPO_PUBLIC_SUPABASE_URL
    SUPABASE_SERVICE_ROLE_KEY
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import time
import unicodedata
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict

try:
    import boto3
    from botocore.exceptions import ClientError, BotoCoreError
    from dotenv import load_dotenv
    from supabase import create_client
except ImportError as e:
    print(f"Missing dependency: {e}")
    print("Install with: pip install boto3 python-dotenv supabase")
    sys.exit(1)

from polly_voice_config import (
    AUDIO_MOLD_TYPES,
    MOLD_CLIP_TYPE,
    detect_module_orientation,
    extract_text,
    get_engine_tier,
    pick_gender,
    pick_voice,
)

USAGE_FILE = Path(__file__).parent / ".polly-usage.json"
LOCAL_AUDIO_DIR = Path(__file__).parent / "audio-output"
SUPABASE_BUCKET = "audio"
STORAGE_PATH_PREFIX = "en"  # {language_code}/{filename}.mp3


# ── Helpers ──────────────────────────────────────────────────────────────────

def sanitize_filename(text: str, exercise_id: str) -> str:
    """Generate a filesystem-safe filename from text, with ID suffix for uniqueness."""
    normalized = unicodedata.normalize('NFKD', text)
    ascii_text = normalized.encode('ascii', 'ignore').decode('ascii')
    slug = re.sub(r'[^a-z0-9]+', '-', ascii_text.lower()).strip('-')
    slug = slug[:50]
    short_id = exercise_id[:8]
    return f"{slug}-{short_id}.mp3"


def load_usage() -> dict:
    current_month = datetime.now().strftime('%Y-%m')
    if USAGE_FILE.exists():
        data = json.loads(USAGE_FILE.read_text())
        if data.get('month') == current_month:
            return data
    return {'month': current_month, 'standard': 0, 'neural': 0, 'generative': 0}


def save_usage(data: dict):
    USAGE_FILE.write_text(json.dumps(data, indent=2))


def validate_mp3(data: bytes) -> bool:
    if len(data) < 4:
        return False
    return data[:3] == b'ID3' or data[:2] == b'\xff\xfb' or data[:2] == b'\xff\xf3'


# ── Core ─────────────────────────────────────────────────────────────────────

def validate_credentials(region: str) -> str:
    try:
        sts = boto3.client("sts", region_name=region)
        identity = sts.get_caller_identity()
        return identity["Arn"]
    except (ClientError, BotoCoreError) as e:
        print(f"Error: AWS credentials invalid — {e}")
        sys.exit(1)


def fetch_exercises(supabase, module_slug: Optional[str], json_file: Optional[str] = None) -> List[Dict]:
    """Fetch exercises that need audio. Uses JSON file if provided, else Supabase."""
    if json_file:
        with open(json_file) as f:
            exercises = json.load(f)
        if module_slug:
            exercises = [e for e in exercises if e.get('module_slug') == module_slug]
        return exercises

    query = supabase.table('exercises').select(
        'id, mold_type, content, lesson_id'
    ).eq('is_published', True).in_('mold_type', list(AUDIO_MOLD_TYPES))

    result = query.execute()
    exercises = result.data

    # Attach module_slug to every exercise via lessons → modules join.
    # Required for flashcard orientation detection (front vs back = English).
    lessons_result = supabase.table('lessons').select('id, module_id').execute()
    modules_result = supabase.table('modules').select('id, slug').execute()

    module_id_to_slug = {m['id']: m['slug'] for m in modules_result.data}
    lesson_id_to_module = {l['id']: module_id_to_slug.get(l['module_id'], '') for l in lessons_result.data}

    for ex in exercises:
        ex['module_slug'] = lesson_id_to_module.get(ex.get('lesson_id', ''), '')

    if module_slug:
        exercises = [e for e in exercises if e.get('module_slug') == module_slug]

    return exercises


def generate_audio(polly, text: str, voice_config: dict) -> bytes:
    """Call Polly synthesize_speech with retry on throttling."""
    for attempt in range(4):
        try:
            response = polly.synthesize_speech(
                Text=text,
                OutputFormat='mp3',
                VoiceId=voice_config['VoiceId'],
                Engine=voice_config['Engine'],
            )
            return response['AudioStream'].read()
        except ClientError as e:
            if e.response['Error']['Code'] == 'ThrottlingException' and attempt < 3:
                wait = 2 ** attempt
                print(f"    Throttled, retrying in {wait}s...")
                time.sleep(wait)
            else:
                raise
    return b''


def upload_to_supabase(supabase, bucket: str, path: str, data: bytes) -> str:
    """Upload MP3 to Supabase Storage, return public URL."""
    supabase.storage.from_(bucket).upload(
        path,
        data,
        file_options={"content-type": "audio/mpeg", "upsert": "true"}
    )
    base = str(supabase.supabase_url).rstrip('/')
    url = f"{base}/storage/v1/object/public/{bucket}/{path}"
    return url


def update_exercise_audio_url(supabase, exercise_id: str, audio_url: str):
    """Set audio_url_ll on an exercise's content JSONB."""
    supabase.rpc('jsonb_set_audio_url', {
        'exercise_id': exercise_id,
        'url': audio_url,
    }).execute()


def update_exercise_audio_url_direct(supabase, exercise_id: str, content: dict, audio_url: str):
    """Fallback: update content JSONB directly via table update."""
    updated_content = {**content, 'audio_url_ll': audio_url}
    supabase.table('exercises').update(
        {'content': updated_content}
    ).eq('id', exercise_id).execute()


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Generate Polly audio for LinguaMold exercises")
    parser.add_argument('--dry-run', action='store_true', help='Estimate usage without generating audio')
    parser.add_argument('--limit', type=int, help='Process only N exercises')
    parser.add_argument('--module', type=str, help='Process only this module slug')
    parser.add_argument('--force', action='store_true', help='Override free-tier safety check')
    parser.add_argument('--skip-upload', action='store_true', help='Generate locally but do not upload or update DB')
    parser.add_argument('--json-file', type=str, help='Read exercises from JSON file instead of Supabase (bypasses RLS)')
    args = parser.parse_args()

    load_dotenv()

    # ── Validate credentials ────────────────────────────────────────────
    region = os.getenv('AWS_REGION', 'us-east-1')
    supabase_url = os.getenv('EXPO_PUBLIC_SUPABASE_URL')
    service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

    if not supabase_url:
        print("Error: EXPO_PUBLIC_SUPABASE_URL not set in .env")
        sys.exit(1)
    if not service_key and not args.skip_upload:
        print("Error: SUPABASE_SERVICE_ROLE_KEY not set in .env")
        print("  Required for uploading audio and updating exercises.")
        print("  Use --skip-upload to generate locally without DB access.")
        sys.exit(1)

    print("Validating AWS credentials...")
    arn = validate_credentials(region)
    print(f"  AWS: {arn}")

    supabase = create_client(supabase_url, service_key or os.getenv('EXPO_PUBLIC_SUPABASE_ANON_KEY', ''))
    print(f"  Supabase: {supabase_url}")

    # ── Fetch exercises ─────────────────────────────────────────────────
    print(f"\nFetching exercises{' for module ' + args.module if args.module else ''}...")
    exercises = fetch_exercises(supabase, args.module, args.json_file)

    # Detect per-module flashcard orientation (front=French or front=English)
    detect_module_orientation(exercises)

    # Filter out exercises that already have audio_url_ll
    pending = []
    skipped_has_audio = 0
    skipped_no_text = 0

    for ex in exercises:
        content = ex.get('content', {})
        if isinstance(content, str):
            content = json.loads(content)

        existing_url = content.get('audio_url_ll')
        if existing_url and str(existing_url) != 'null':
            skipped_has_audio += 1
            continue

        module_slug = ex.get('module_slug', '')
        text = extract_text(ex['mold_type'], content, module_slug)
        if not text:
            skipped_no_text += 1
            continue

        pending.append({
            'id': ex['id'],
            'mold_type': ex['mold_type'],
            'content': content,
            'text': text.strip(),
            'module_slug': module_slug,
        })

    if args.limit:
        pending = pending[:args.limit]

    print(f"  Total audio molds: {len(exercises)}")
    print(f"  Already have audio: {skipped_has_audio}")
    print(f"  No extractable text: {skipped_no_text}")
    print(f"  To generate: {len(pending)}")

    if not pending:
        print("\nNothing to generate.")
        return

    # ── Pre-flight estimate ─────────────────────────────────────────────
    usage = load_usage()
    estimate = {'standard': 0, 'neural': 0, 'generative': 0}

    for item in pending:
        clip_type = MOLD_CLIP_TYPE.get(item['mold_type'], 'word')
        gender = pick_gender(item['id'])
        voice = pick_voice(clip_type, gender, item['id'])
        tier = get_engine_tier(voice)
        estimate[tier] += len(item['text'])

    print(f"\n{'DRY RUN — ' if args.dry_run else ''}Character estimate for this batch:")
    for tier in ['standard', 'neural', 'generative']:
        current = usage.get(tier, 0)
        projected = current + estimate[tier]
        limit = 100_000 if tier == 'generative' else 1_000_000
        pct = projected / limit * 100
        print(f"  {tier:12s}: {estimate[tier]:6d} new + {current:6d} used = {projected:6d} ({pct:.1f}% of {limit:,} free)")

    total_chars = sum(estimate.values())
    print(f"  {'─' * 50}")
    print(f"  Total new characters: {total_chars:,}")

    if estimate.get('generative', 0) + usage.get('generative', 0) > 80_000 and not args.force:
        print("\nError: Generative tier would exceed 80% of free limit. Use --force to override.")
        sys.exit(1)

    if args.dry_run:
        print("\nDry run complete. No audio generated.")
        return

    # ── Generate, upload, update ────────────────────────────────────────
    polly = boto3.client("polly", region_name=region)
    LOCAL_AUDIO_DIR.mkdir(parents=True, exist_ok=True)

    generated = 0
    failed = 0
    total = len(pending)

    print(f"\nGenerating {total} audio clips...")
    print("-" * 70)

    for i, item in enumerate(pending, start=1):
        ex_id = item['id']
        mold = item['mold_type']
        text = item['text']
        clip_type = MOLD_CLIP_TYPE.get(mold, 'word')
        gender = pick_gender(ex_id)
        voice = pick_voice(clip_type, gender, ex_id)
        tier = get_engine_tier(voice)
        filename = sanitize_filename(text, ex_id)
        storage_path = f"{STORAGE_PATH_PREFIX}/{filename}"
        local_path = LOCAL_AUDIO_DIR / filename

        try:
            # Generate
            audio_bytes = generate_audio(polly, text, voice)

            if not validate_mp3(audio_bytes):
                print(f"  [{i:3d}/{total}] FAIL {filename}  — invalid MP3 data")
                failed += 1
                continue

            # Save locally
            local_path.write_bytes(audio_bytes)

            # Upload + update DB
            if not args.skip_upload:
                audio_url = upload_to_supabase(supabase, SUPABASE_BUCKET, storage_path, audio_bytes)
                update_exercise_audio_url_direct(supabase, ex_id, item['content'], audio_url)
            else:
                audio_url = f"(local) {local_path}"

            # Track usage only after success
            usage[tier] = usage.get(tier, 0) + len(text)
            save_usage(usage)

            generated += 1
            size_kb = len(audio_bytes) / 1024
            print(f"  [{i:3d}/{total}] OK   {filename:45s} {voice['VoiceId']:10s} {tier:9s} {size_kb:5.1f}KB  \"{text[:40]}{'…' if len(text) > 40 else ''}\"")

        except Exception as e:
            print(f"  [{i:3d}/{total}] FAIL {filename:45s}  — {e}")
            failed += 1

    # ── Summary ─────────────────────────────────────────────────────────
    print("-" * 70)
    print(f"Done. Generated: {generated} | Failed: {failed} | Skipped (had audio): {skipped_has_audio}")
    print()
    print("Cumulative usage this month:")
    for tier in ['standard', 'neural', 'generative']:
        val = usage.get(tier, 0)
        limit = 100_000 if tier == 'generative' else 1_000_000
        print(f"  {tier:12s}: {val:6d} / {limit:,} ({val / limit * 100:.1f}%)")

    if args.skip_upload:
        print(f"\nLocal files saved to: {LOCAL_AUDIO_DIR}/")
        print("Re-run without --skip-upload to upload and update DB.")

    if failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
