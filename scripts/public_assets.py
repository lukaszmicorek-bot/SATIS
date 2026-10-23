"""Exact public asset policy shared by HTTP serving and release tooling."""

import os
import stat
from contextlib import contextmanager
from pathlib import Path, PurePosixPath
from urllib.parse import unquote


POLICY_VERSION = 1
REQUIRED_ASSETS = frozenset({
    "index.html", "app.js", "data-layer.js", "sync-layer.js", "styles.css", "supabase-config.js",
    "offline-vault.js", "offline-forms.js", "offline-sw.js",
    "repair-returns.js", "traffic-meter.js",
    "stock-audit.js",
    "InterVariable.woff2", "InterVariable-Italic.woff2", "Inter-LICENSE.txt",
    "satis-monogram.png", "favicon-32.png", "favicon.png", "favicon.svg",
    "apple-touch-icon.png",
    "manufacturer-logos/audio-service.png", "manufacturer-logos/audibel.png",
    "manufacturer-logos/audibel-offer.jpeg",
    "manufacturer-logos/beltone.png", "manufacturer-logos/bernafon.png",
    "manufacturer-logos/bernafon-offer.svg", "manufacturer-logos/oticon.png",
    "manufacturer-logos/philips.svg", "manufacturer-logos/phonak.png",
    "manufacturer-logos/resound.png", "manufacturer-logos/resound-offer.png",
    "manufacturer-logos/signia.png", "manufacturer-logos/sonic.png",
    "manufacturer-logos/sonic-offer.png", "manufacturer-logos/starkey.png",
    "manufacturer-logos/starkey-offer.svg",
})
# Explicit reservations for the ongoing module extraction; no JS wildcard.
OPTIONAL_ASSETS = frozenset({
    "vacation.js", "vacation-module.js", "vacation-domain.js", "vacation-rules.js",
})
PUBLIC_ASSETS = REQUIRED_ASSETS | OPTIONAL_ASSETS
MANIFEST_NAME = "security-manifest.json"


def valid_relative_path(name):
    return (isinstance(name, str) and bool(name)
            and not any(char in name for char in "\\%\x00")
            and not any(ord(char) < 32 or ord(char) == 127 for char in name)
            and all(part not in {"", ".", ".."} for part in name.split("/")))


def request_asset(request_path):
    """Decode once and reject ambiguous/traversing paths instead of normalizing."""
    try:
        decoded = unquote(request_path, errors="strict")
    except (UnicodeError, ValueError):
        return None
    if decoded == "/":
        return "index.html"
    if not decoded.startswith("/"):
        return None
    name = decoded[1:]
    return name if valid_relative_path(name) else None


@contextmanager
def open_regular_file(root, name):
    """Walk from an open root descriptor; never follow symlinks, including races."""
    if not valid_relative_path(name):
        raise ValueError("Invalid relative path")
    parts = PurePosixPath(name).parts
    directory = os.open(root, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        for part in parts[:-1]:
            child = os.open(part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW,
                            dir_fd=directory)
            os.close(directory)
            directory = child
        descriptor = os.open(parts[-1], os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK,
                             dir_fd=directory)
        with os.fdopen(descriptor, "rb") as stream:
            info = os.fstat(stream.fileno())
            if not stat.S_ISREG(info.st_mode) or info.st_nlink != 1:
                raise ValueError("Public and backup inputs must be regular, unlinked files")
            yield stream
    finally:
        os.close(directory)


def read_regular_file(root, name):
    with open_regular_file(root, name) as stream:
        return stream.read()


def safe_public_path(root, path, allow_manifest=False):
    try:
        root = Path(root).absolute()
        relative = Path(path).absolute().relative_to(root)
        name = relative.as_posix()
        allowed = PUBLIC_ASSETS | ({MANIFEST_NAME} if allow_manifest else set())
        if name not in allowed or not valid_relative_path(name):
            return False
        current = root
        for part in relative.parts:
            current /= part
            if current.is_symlink():
                return False
        return current.is_file() and current.stat().st_nlink == 1
    except (OSError, ValueError):
        return False
