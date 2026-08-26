"""Pull the raw source tables from data.gov.in into data/raw/.

The key is read from the environment. It is never committed and never printed.
Set it once:

    export DATA_GOV_KEY=...        # or a .env.local the shell sources

Per-resource calls on this API are slow and occasionally drop the connection,
so every request gets a long timeout and retries. That is not paranoia, it is
what the endpoint actually does.

Transport is curl, not urllib. urllib fails against this host on at least one
developer machine (WinError 10060) where curl on the same box succeeds on every
attempt, most likely a proxy or TLS handling difference. Rather than reimplement
what curl already gets right, shell out to it.
"""
import json
import os
import shutil
import subprocess
import sys
import urllib.parse
from pathlib import Path

RAW = Path(__file__).resolve().parents[1] / "data" / "raw"
BASE = "https://api.data.gov.in/resource/"

# Resource ids are pinned so a refresh is reproducible and reviewable in a diff.
RESOURCES = {
    "ists_delays": "2341d1d1-34bd-4471-88b5-815d45a919d0",
}

TIMEOUT = 90
RETRIES = 3


def key() -> str:
    k = os.environ.get("DATA_GOV_KEY")
    if not k:
        sys.exit(
            "DATA_GOV_KEY is not set.\n"
            "Get a key at https://data.gov.in and export it before running.\n"
            "Do not paste it into a source file."
        )
    return k


def fetch(resource_id: str, limit: int = 1000) -> dict:
    if not shutil.which("curl"):
        sys.exit("curl is required and was not found on PATH.")
    qs = urllib.parse.urlencode(
        {"api-key": key(), "format": "json", "limit": limit, "offset": 0}
    )
    # The key rides in the query string, so keep it out of any printed command.
    proc = subprocess.run(
        [
            "curl", "-sS", "--fail",
            "--max-time", str(TIMEOUT),
            "--retry", str(RETRIES),
            "--retry-delay", "2",
            f"{BASE}{resource_id}?{qs}",
        ],
        capture_output=True,
    )
    if proc.returncode != 0:
        raise RuntimeError(
            f"{resource_id} failed (curl exit {proc.returncode}): "
            f"{proc.stderr.decode(errors='replace').strip()}"
        )
    return json.loads(proc.stdout)


def main() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    for name, rid in RESOURCES.items():
        payload = fetch(rid)
        out = RAW / f"{name}.json"
        out.write_text(json.dumps(payload, indent=2))
        print(f"{name}: {payload.get('count')} records -> {out.relative_to(RAW.parents[1])}")


if __name__ == "__main__":
    main()
