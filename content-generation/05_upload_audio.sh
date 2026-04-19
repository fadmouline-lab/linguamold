#!/usr/bin/env bash
# Upload audio files to Supabase Storage
#
# Usage:
#   ./05_upload_audio.sh [options]
#
# Options:
#   --bucket   Storage bucket name (default: audio)
#   --dir      Local directory containing .mp3 files (default: ./audio-output)
#   --help     Show this help message
#
# Required environment variable:
#   SUPABASE_PROJECT_REF   Your Supabase project reference (e.g. abcdefghijklmnop)
#
# Prerequisites:
#   - Supabase CLI installed: npm install -g supabase  or  brew install supabase/tap/supabase
#   - Logged in: supabase login
#   - Project linked: supabase link --project-ref $SUPABASE_PROJECT_REF
#
# Example:
#   SUPABASE_PROJECT_REF=abcdefghijklmnop ./05_upload_audio.sh --dir ./audio-output --bucket audio

set -euo pipefail

# ── Defaults ────────────────────────────────────────────────────────────────
BUCKET="audio"
DIR="./audio-output"

# ── Argument parsing ─────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --bucket)
      BUCKET="$2"
      shift 2
      ;;
    --dir)
      DIR="$2"
      shift 2
      ;;
    --help|-h)
      sed -n '2,20p' "$0" | sed 's/^# \?//'
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

# ── Validation ───────────────────────────────────────────────────────────────
if [[ -z "${SUPABASE_PROJECT_REF:-}" ]]; then
  echo "Error: SUPABASE_PROJECT_REF environment variable is required."
  echo "Example: SUPABASE_PROJECT_REF=abcdefghijklmnop ./05_upload_audio.sh"
  exit 1
fi

if ! command -v supabase &>/dev/null; then
  echo "Error: Supabase CLI not found. Install with: npm install -g supabase"
  exit 1
fi

if [[ ! -d "$DIR" ]]; then
  echo "Error: Directory not found: $DIR"
  exit 1
fi

# ── Count files ───────────────────────────────────────────────────────────────
MP3_FILES=("$DIR"/**/*.mp3 "$DIR"/*.mp3)
# Filter to only existing files
EXISTING=()
for f in "${MP3_FILES[@]}"; do
  [[ -f "$f" ]] && EXISTING+=("$f")
done

if [[ ${#EXISTING[@]} -eq 0 ]]; then
  echo "No .mp3 files found in $DIR"
  exit 0
fi

echo "Found ${#EXISTING[@]} .mp3 files in $DIR"
echo "Uploading to bucket: $BUCKET"
echo "Project: $SUPABASE_PROJECT_REF"
echo "------------------------------------------------------------"

# ── Get list of already-uploaded files ───────────────────────────────────────
echo "Fetching existing files in bucket (for skip check)…"
EXISTING_REMOTE=$(supabase storage ls "ss:///$BUCKET" --project-ref "$SUPABASE_PROJECT_REF" 2>/dev/null || echo "")

# ── Upload loop ───────────────────────────────────────────────────────────────
UPLOADED=0
SKIPPED=0
FAILED=0
ERRORS=()

for LOCAL_PATH in "${EXISTING[@]}"; do
  # Derive the storage path relative to DIR
  RELATIVE="${LOCAL_PATH#$DIR/}"
  STORAGE_PATH="ss:///$BUCKET/$RELATIVE"

  # Skip check: see if filename appears in remote listing
  BASENAME=$(basename "$LOCAL_PATH")
  if echo "$EXISTING_REMOTE" | grep -qF "$BASENAME"; then
    echo "SKIP  $RELATIVE (already exists)"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  # Upload
  if supabase storage cp "$LOCAL_PATH" "$STORAGE_PATH" --project-ref "$SUPABASE_PROJECT_REF" 2>/dev/null; then
    echo "OK    $RELATIVE"
    UPLOADED=$((UPLOADED + 1))
  else
    echo "FAIL  $RELATIVE"
    ERRORS+=("$RELATIVE")
    FAILED=$((FAILED + 1))
  fi
done

# ── Summary ───────────────────────────────────────────────────────────────────
echo "------------------------------------------------------------"
TOTAL=$((UPLOADED + SKIPPED + FAILED))
echo "Done. Total: $TOTAL | Uploaded: $UPLOADED | Skipped: $SKIPPED | Failed: $FAILED"

if [[ ${#ERRORS[@]} -gt 0 ]]; then
  echo ""
  echo "Failed files:"
  for e in "${ERRORS[@]}"; do
    echo "  - $e"
  done
  exit 1
fi
