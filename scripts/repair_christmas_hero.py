#!/usr/bin/env python3
"""Assemble and verify original Christmas beach scene from checked text segments."""
from pathlib import Path
import base64
import hashlib

ROOT = Path("assets/img")
CHUNKS = sorted((ROOT / "christmas-b64").glob("part-*.txt"))
OUTPUT = ROOT / "christmas-beach-new.webp"
EXPECTED_SHA = "e7c610cb58f0c528a62348471d9a603fa2984f24"
EXPECTED_SIZES = [2000, 2000, 2000, 2000, 2000, 2000, 412]
assert len(CHUNKS) == 7, f"Expected 7 chunks, got {len(CHUNKS)}"
segments = [p.read_text(encoding="ascii").strip() for p in CHUNKS]
assert [len(x) for x in segments] == EXPECTED_SIZES
encoded = "".join(segments)
assert len(encoded) == 12412
raw = base64.b64decode(encoded, validate=True)
def git_sha(data):
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()
assert len(raw) == 9308, (len(raw), "invalid length")
assert git_sha(raw) == EXPECTED_SHA, (git_sha(raw), "asset failed integrity check")
assert raw[:4] == b"RIFF" and raw[8:12] == b"WEBP"
OUTPUT.write_bytes(raw)
print("Verified Christmas background",len(raw),"bytes; git SHA",git_sha(raw))
