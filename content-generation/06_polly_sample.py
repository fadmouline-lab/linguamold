#!/usr/bin/env python3
"""
AWS Polly sample audio generator for LinguaMold.

Generates 10 test clips across all 6 candidate voices to validate
credentials, voice quality, and free-tier impact before full batch.

Usage:
    pip install boto3 python-dotenv
    python 06_polly_sample.py
"""

import os
import sys

try:
    import boto3
    from botocore.exceptions import ClientError, BotoCoreError
    from dotenv import load_dotenv
except ImportError:
    print("Error: missing dependencies. Run: pip install boto3 python-dotenv")
    sys.exit(1)


SAMPLES = [
    {"voice": "Salli",    "engine": "standard",   "text": "Hello"},
    {"voice": "Justin",   "engine": "standard",   "text": "Goodbye"},
    {"voice": "Salli",    "engine": "standard",   "text": "Thank you"},
    {"voice": "Emma",     "engine": "neural",     "text": "How do you feel today?"},
    {"voice": "Emma",     "engine": "neural",     "text": "Good morning, how are you?"},
    {"voice": "Danielle", "engine": "neural",     "text": "Thank you very much for your help."},
    {"voice": "Gregory",  "engine": "neural",     "text": "I am not feeling well. I am very tired."},
    {"voice": "Gregory",  "engine": "neural",     "text": "My brother and my sister are at school."},
    {"voice": "Stephen",  "engine": "generative", "text": "Great job!"},
    {"voice": "Stephen",  "engine": "generative", "text": "You did it!"},
]

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "audio-samples")


def validate_credentials(region: str) -> str:
    try:
        sts = boto3.client("sts", region_name=region)
        identity = sts.get_caller_identity()
        return identity["Arn"]
    except (ClientError, BotoCoreError) as e:
        print(f"Error: AWS credentials invalid or expired — {e}")
        sys.exit(1)


def generate_sample(polly, voice: str, engine: str, text: str, output_path: str) -> int:
    response = polly.synthesize_speech(
        Text=text,
        OutputFormat="mp3",
        VoiceId=voice,
        Engine=engine,
    )
    audio_stream = response["AudioStream"].read()

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "wb") as f:
        f.write(audio_stream)

    return len(audio_stream)


def main():
    load_dotenv()

    region = os.getenv("AWS_REGION", "us-east-1")

    print("Validating AWS credentials...")
    arn = validate_credentials(region)
    print(f"  Authenticated as: {arn}\n")

    polly = boto3.client("polly", region_name=region)
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    usage = {"standard": 0, "neural": 0, "generative": 0}
    total_bytes = 0

    print(f"Generating {len(SAMPLES)} sample clips to {OUTPUT_DIR}/")
    print("-" * 70)

    for i, sample in enumerate(SAMPLES, start=1):
        voice = sample["voice"]
        engine = sample["engine"]
        text = sample["text"]
        filename = f"{i:02d}_{voice.lower()}_{engine}.mp3"
        output_path = os.path.join(OUTPUT_DIR, filename)

        try:
            size = generate_sample(polly, voice, engine, text, output_path)
            usage[engine] += len(text)
            total_bytes += size
            print(f"  [{i:2d}/10] OK   {filename:40s} {voice:10s} {engine:12s} {size:6d} bytes  \"{text}\"")
        except (ClientError, BotoCoreError) as e:
            print(f"  [{i:2d}/10] FAIL {filename:40s} {voice:10s} {engine:12s}          \"{text}\"")
            print(f"         Error: {e}")

    print("-" * 70)
    print(f"Total audio size: {total_bytes:,} bytes ({total_bytes / 1024:.1f} KB)")
    print()
    print("Characters used per engine tier:")
    print(f"  Standard:   {usage['standard']:5d} chars  (free tier: 1,000,000/mo)")
    print(f"  Neural:     {usage['neural']:5d} chars  (free tier: 1,000,000/mo)")
    print(f"  Generative: {usage['generative']:5d} chars  (free tier:   100,000/mo)")
    print()
    print(f"Files saved to: {OUTPUT_DIR}/")
    print("Play them to verify voice quality before proceeding to full batch.")


if __name__ == "__main__":
    main()
