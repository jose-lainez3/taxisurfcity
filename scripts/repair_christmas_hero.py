#!/usr/bin/env python3
"""Validate an original generated Christmas hero WebP against its expected Git SHA.

A transfer of the asset into GitHub introduced a single extra base64 digit.
Recover from the binary Git blob by restoring the original base64 stream,
then verify the exact expected Git blob checksum. Never publish unverified art.
"""
from pathlib import Path
import base64
import hashlib

PATH = Path("assets/img/christmas-beach-new.webp")
EXPECTED = "e7c610cb58f0c528a62348471d9a603fa2984f24"
EXPECTED_BYTES = 9308

def sha(data: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()

data = PATH.read_bytes()
if sha(data) == EXPECTED:
    print("Verified original hero image", len(data))
    raise SystemExit(0)

b64 = base64.b64encode(data).decode("ascii").rstrip("=")
print("Repairing transport mismatch:", len(data), "bytes", len(b64), "base64 digits")
recovered = None
for pos in range(len(b64)):
    candidate = b64[:pos] + b64[pos+1:]
    candidate += "=" * (-len(candidate) % 4)
    try:
        raw = base64.b64decode(candidate, validate=True)
    except Exception:
        continue
    if len(raw) == EXPECTED_BYTES and sha(raw) == EXPECTED:
        recovered = raw
        print("Recovered original byte-for-byte at position", pos)
        break
if recovered is None:
    raise SystemExit("Recovery failed; source blob unchanged")
if not recovered.startswith(b"RIFF") or recovered[8:12] != b"WEBP":
    raise SystemExit("Recovery candidate is not WebP")
PATH.write_bytes(recovered)
print("Verified WebP ready:", len(recovered), "bytes", sha(recovered))
