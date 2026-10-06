#!/usr/bin/env python3
"""Check or publish SATIS from this one Git working directory.

Usage: python3 scripts/release_satis.py check|publish
The publish command pushes to GitHub; GitHub Pages updates asynchronously.
"""

import argparse
import datetime
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from build_dist import build_dist, validate_config, verify_dist
from public_assets import MANIFEST_NAME, PUBLIC_ASSETS


ROOT = Path(__file__).resolve().parents[1]
EXPECTED_REMOTE = "https://github.com/lukaszmicorek-bot/SATIS.git"
EXPECTED_SUPABASE = "https://xfzfhzyzmtcxqqyjpzfw.supabase.co"
SCHEMA_VERSION = "audit-security-1"
MIGRATIONS = [
    "supabase-schema.sql",
    "supabase-security-hardening.sql",
    "supabase-private-payments.sql",
    "supabase-audit-log.sql",
    "supabase-document-write-guards.sql",
    "supabase-audit-core.sql",
    "supabase-audit-vacation.sql",
]
EXTRA_PUBLIC_FILES = {
    ".gitignore", "CNAME", "README.md", "supabase-attendance.sql", "supabase-work-time.sql",
    "supabase-work-time-pin.sql", "scripts/release_satis.py",
    ".github/workflows/quality.yml", "ci/verify-release.cjs", "ci/stage-pages.cjs",
    "tests/apd-norms.test.cjs", "tests/automatic-document-number.test.cjs",
    "tests/customer-phone-tooltip.test.cjs",
    "tests/current-date-widget.test.cjs",
    "tests/data-layer.test.cjs", "tests/document-navigation.test.cjs",
    "tests/offline-vault.test.cjs", "tests/print-font-readiness.test.cjs",
    "tests/sync-layer.test.cjs",
}
VERSION_PATTERN = re.compile(r'(?m)^const VERSION = "(\d{8}-\d+)";')


def run(*args, capture=False):
    return subprocess.run(args, cwd=ROOT, check=True, text=True,
                          stdout=subprocess.PIPE if capture else None)


def node_binary():
    candidate = os.environ.get("SATIS_NODE") or shutil.which("node")
    if candidate and Path(candidate).is_file():
        return candidate
    bundled = Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
    if bundled.is_file():
        return str(bundled)
    raise ValueError("Nie znaleziono Node.js. Ustaw SATIS_NODE na sciezke do programu node.")


def check_source():
    node = node_binary()
    for name in ("app.js", "data-layer.js", "sync-layer.js", "offline-vault.js", "offline-forms.js", "offline-sw.js"):
        run(node, "--check", str(ROOT / name))
    tests = sorted((ROOT / "tests").glob("*.test.cjs"))
    if not tests:
        raise ValueError("Brak testow jednostkowych; publikacja zostala wstrzymana.")
    run(node, "--test", "--test-reporter=dot", *(str(test) for test in tests))
    validate_config((ROOT / "supabase-config.js").read_bytes(), EXPECTED_SUPABASE)


def current_version():
    source = (ROOT / "offline-sw.js").read_text(encoding="utf-8")
    match = VERSION_PATTERN.search(source)
    if not match:
        raise ValueError("Nie znaleziono wersji w offline-sw.js.")
    return source, match


def next_version(previous):
    today = datetime.datetime.now().strftime("%Y%m%d")
    old_date, old_number = previous.split("-", 1)
    number = int(old_number) + 1 if old_date == today else 1
    while (ROOT / "dist" / f"{today}-{number}-ready").exists():
        number += 1
    return f"{today}-{number}"


def build_release(version, output):
    fingerprint = build_dist(ROOT, output, version, SCHEMA_VERSION,
                             ROOT / "supabase-config.js", EXPECTED_SUPABASE,
                             [ROOT / name for name in MIGRATIONS])
    verify_dist(output, version, SCHEMA_VERSION, fingerprint)
    return fingerprint


def check_release():
    check_source()
    _, match = current_version()
    with tempfile.TemporaryDirectory(prefix="satis-check-", dir=ROOT / "dist") as temporary:
        build_release(match.group(1), Path(temporary) / "release")
    print("OK: testy i kontrola paczki. Nic nie wyslano.")


def require_publish_target():
    branch = run("git", "branch", "--show-current", capture=True).stdout.strip()
    remote = run("git", "remote", "get-url", "origin", capture=True).stdout.strip()
    staged = run("git", "diff", "--cached", "--name-only", capture=True).stdout.strip()
    if branch != "main" or remote != EXPECTED_REMOTE:
        raise ValueError("Publikacja wymaga galezi main i zatwierdzonego repozytorium SATIS.")
    if staged:
        raise ValueError("Najpierw rozstrzygnij juz przygotowane zmiany Git; niczego nie dodano.")


def stage_public_files():
    allowed = PUBLIC_ASSETS | {MANIFEST_NAME} | EXTRA_PUBLIC_FILES
    tracked = set(run("git", "ls-files", capture=True).stdout.splitlines())
    paths = sorted(name for name in allowed if (ROOT / name).is_file() or name in tracked)
    run("git", "add", "-A", "--", *paths)
    staged = set(run("git", "diff", "--cached", "--name-only", capture=True).stdout.splitlines())
    if not staged or not staged <= allowed:
        raise ValueError("Lista zmian Git nie zgadza sie z lista publicznych plikow.")
    run("git", "diff", "--cached", "--check")


def publish():
    require_publish_target()
    check_source()
    source, match = current_version()
    version = next_version(match.group(1))
    service_worker = ROOT / "offline-sw.js"
    service_worker.write_text(VERSION_PATTERN.sub(f'const VERSION = "{version}";', source, count=1), encoding="utf-8")
    output = ROOT / "dist" / f"{version}-ready"
    try:
        build_release(version, output)
    except (OSError, ValueError):
        service_worker.write_text(source, encoding="utf-8")
        raise
    shutil.copy2(output / "index.html", ROOT / "index.html")
    shutil.copy2(output / MANIFEST_NAME, ROOT / MANIFEST_NAME)
    stage_public_files()
    run("git", "commit", "-m", f"Publish SATIS {version}")
    try:
        run("git", "push", "origin", "main")
    except subprocess.CalledProcessError:
        print("Commit jest lokalny. Po rozwiazaniu problemu z siecia uruchom: git push origin main", file=sys.stderr)
        raise
    print(f"Wyslano SATIS {version}. GitHub Pages opublikuje zmiane asynchronicznie.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=("check", "publish"))
    args = parser.parse_args()
    try:
        if args.action == "check":
            check_release()
        else:
            publish()
    except (OSError, ValueError, subprocess.CalledProcessError) as error:
        parser.exit(1, f"Wstrzymano: {error}\n")


if __name__ == "__main__":
    main()
