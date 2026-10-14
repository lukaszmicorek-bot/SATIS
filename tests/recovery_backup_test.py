import io
import json
import os
import subprocess
import sys
import tarfile
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from scripts import recovery_backup as backup


class RecoveryBackupTests(unittest.TestCase):
    def test_rejects_unsafe_attachment_paths(self):
        for bucket, name in [('demo', '../secret'), ('demo', '/secret'), ('..', 'file'), ('demo', 'a\\b')]:
            with self.assertRaises(ValueError):
                backup.safe_object_path(bucket, name)
        self.assertEqual(str(backup.safe_object_path('demo', 'a/b.pdf')), 'demo/a/b.pdf')

    def test_sources_exclude_secrets_old_releases_and_symlinks(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            for name in ['app.js', '.env', 'passwords.json', 'docs/restore.md', 'dist/old/app.js', 'node_modules/lib/app.js']:
                path = root / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text('synthetic')
            (root / 'linked.js').symlink_to(root / 'app.js')
            with patch.object(backup, 'ROOT', root):
                included = {str(relative) for path, relative in backup.source_files()}
            self.assertEqual(included, {'app.js', 'docs/restore.md'})

    def test_storage_paginates_and_downloads_folders(self):
        with tempfile.TemporaryDirectory() as folder:
            count = {}
            def request(method, endpoint, key, payload=None):
                if endpoint == 'bucket':
                    return io.BytesIO(json.dumps([{'id': 'demo'}]).encode())
                if endpoint.startswith('object/list/'):
                    prefix = payload['prefix']
                    count[prefix] = count.get(prefix, 0) + 1
                    rows = [] if payload['offset'] else ([{'id': None, 'name': 'nested'}] if not prefix else
                        [{'id': 'one', 'name': 'image.png', 'metadata': {'size': 3}}])
                    return io.BytesIO(json.dumps(rows).encode())
                return io.BytesIO(b'abc')
            with patch.object(backup, 'request', request):
                self.assertEqual(backup.download_storage(Path(folder), 'fake'), 1)
            self.assertEqual((Path(folder) / 'objects/demo/nested/image.png').read_bytes(), b'abc')
            self.assertEqual(count, {'': 2, 'nested/': 2})

    def test_incomplete_storage_file_fails(self):
        with tempfile.TemporaryDirectory() as folder:
            def request(method, endpoint, key, payload=None):
                if endpoint == 'bucket':
                    return io.BytesIO(b'[{"id":"demo"}]')
                if endpoint.startswith('object/list/'):
                    return io.BytesIO(b'[{"id":"one","name":"a.pdf","metadata":{"size":9}}]')
                return io.BytesIO(b'abc')
            with patch.object(backup, 'request', request), self.assertRaises(ValueError):
                backup.download_storage(Path(folder), 'fake')

    def test_encrypted_archive_can_be_decrypted_and_read_with_synthetic_data(self):
        if not Path(backup.GPG).is_file():
            self.skipTest('GPG not installed')
        with tempfile.TemporaryDirectory() as folder:
            home = Path(folder) / 'gpg'
            home.mkdir(mode=0o700)
            with patch.dict(os.environ, {'GNUPGHOME': str(home)}):
                subprocess.run([backup.GPG, '--batch', '--pinentry-mode', 'loopback', '--passphrase', '',
                    '--quick-generate-key', 'SATIS test <backup@example.invalid>', 'rsa2048', 'encr', '1d'],
                    check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=30)
                encrypted = Path(folder) / 'test.gpg'
                with backup.command_sink(encrypted, 'backup@example.invalid') as stream:
                    with tarfile.open(fileobj=stream, mode='w|gz') as archive:
                        entry = tarfile.TarInfo('synthetic.txt')
                        entry.size = 3
                        archive.addfile(entry, io.BytesIO(b'abc'))
                decrypted = subprocess.run([backup.GPG, '--batch', '--decrypt', str(encrypted)],
                    capture_output=True, check=True, timeout=30).stdout
                with tarfile.open(fileobj=io.BytesIO(decrypted), mode='r:gz') as archive:
                    self.assertEqual(archive.extractfile('synthetic.txt').read(), b'abc')


if __name__ == '__main__':
    unittest.main()
