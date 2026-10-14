#!/usr/bin/env python3
"""Encrypted recovery set. Read-only source access; no restore or migration commands."""
import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import tarfile
import tempfile
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parents[1]
HOME = Path.home()
BASE = HOME / 'SATIS-kopie'
CONFIG = BASE / 'harmonogram.json'
PROJECT = 'xfzfhzyzmtcxqqyjpzfw'
PG = Path('/opt/homebrew/opt/libpq@17/bin')
GPG = '/opt/homebrew/bin/gpg'


def private_directory(path):
    if path.is_symlink():
        raise ValueError('Folder nie moze byc dowiazaniem symbolicznym.')
    path.mkdir(parents=True, exist_ok=True, mode=0o700)
    path.chmod(0o700)


def read_config():
    if not CONFIG.is_file() or CONFIG.is_symlink():
        raise ValueError('Brak konfiguracji: SATIS-kopie/harmonogram.json. Patrz KOPIE-I-ODTWORZENIE.md.')
    config = json.loads(CONFIG.read_text())
    if config.get('project_ref') != PROJECT:
        raise ValueError('Nieprawidlowy projekt zrodlowy.')
    if not re.fullmatch(r'[0-9A-Fa-f]{40}|[0-9A-Fa-f]{64}', config.get('gpg_recipient', '')) or not Path(config.get('ssl_root_cert', '')).is_file():
        raise ValueError('Podaj odbiorce GPG i istniejacy certyfikat SSL projektu.')
    if not config.get('project_settings_reviewed'):
        raise ValueError('Uzupelnij ustawienia projektu i instrukcje odtworzenia przed aktywacja.')
    required = {'site_url', 'redirect_urls', 'auth_notes', 'smtp_notes', 'realtime_notes', 'integration_notes'}
    if not required <= set(config.get('project_settings', {})):
        raise ValueError('Brak zapisanych ustawien Auth, poczty, Realtime lub integracji.')
    return config


def secret(service):
    result = subprocess.run(['/usr/bin/security', 'find-generic-password', '-s', service, '-w'],
                            capture_output=True, text=True, timeout=30)
    if result.returncode or not result.stdout.strip():
        raise ValueError('Brak dostepu do hasla w Pek kluczy: ' + service)
    return result.stdout.rstrip('\n')


def command(args, env=None):
    result = subprocess.run([str(a) for a in args], env=env, capture_output=True, timeout=1200)
    if result.returncode:
        # Database/Storage diagnostics may include personal paths. Never print them.
        raise ValueError('Niepowodzenie narzedzia: ' + Path(str(args[0])).name)
    return result.stdout


def request(method, endpoint, key, payload=None):
    url = 'https://' + PROJECT + '.supabase.co/storage/v1/' + endpoint
    body = None if payload is None else json.dumps(payload).encode()
    headers = {'apikey': key, 'Content-Type': 'application/json'}
    if key.startswith('eyJ'):
        headers['Authorization'] = 'Bearer ' + key
    req = urllib.request.Request(url, data=body, method=method, headers=headers)
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            return None
    return urllib.request.build_opener(NoRedirect).open(req, timeout=60)


def safe_object_path(bucket, name):
    parts = [bucket, *name.split('/')]
    if any(not part or part in ('.', '..') or '\\' in part or '\x00' in part for part in parts):
        raise ValueError('Niebezpieczna sciezka zalacznika.')
    return PurePosixPath(*parts)


def download_storage(target, key):
    with request('GET', 'bucket', key) as response:
        buckets = json.load(response)
    (target / 'buckets.json').write_text(json.dumps(buckets, ensure_ascii=False))
    objects = []
    for bucket in buckets:
        bucket_id = bucket['id']
        prefixes = ['']
        seen = set()
        while prefixes:
            prefix = prefixes.pop()
            if prefix in seen:
                raise ValueError('Powtarzajacy sie katalog Storage.')
            seen.add(prefix)
            offset = 0
            while True:
                with request('POST', 'object/list/' + urllib.parse.quote(bucket_id, safe=''), key,
                             {'prefix': prefix, 'limit': 100, 'offset': offset,
                              'sortBy': {'column': 'name', 'order': 'asc'}}) as response:
                    entries = json.load(response)
                if not entries:
                    break
                for item in entries:
                    name = prefix + item['name']
                    relative = safe_object_path(bucket_id, name)
                    if item.get('id') is None:
                        prefixes.append(name + '/')
                        continue
                    path = target / 'objects' / Path(str(relative))
                    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
                    if path.exists():
                        raise ValueError('Podwojny klucz Storage.')
                    endpoint = 'object/' + urllib.parse.quote(str(relative), safe='/')
                    with request('GET', endpoint, key) as response, path.open('xb') as output:
                        shutil.copyfileobj(response, output)
                    expected_size = (item.get('metadata') or {}).get('size')
                    if expected_size is not None and int(expected_size) != path.stat().st_size:
                        raise ValueError('Niepelny plik zalacznika.')
                    objects.append({'path': str(relative), 'metadata': item,
                                    'bytes': path.stat().st_size, 'sha256': file_hash(path)})
                offset += len(entries)
    (target / 'objects.json').write_text(json.dumps(objects, ensure_ascii=False))
    return len(objects)


def file_hash(path):
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def source_files():
    ignored = {'.git', 'dist', 'output', 'node_modules', '__pycache__', '.codex', '.agents'}
    extensions = {'.js', '.cjs', '.css', '.html', '.sql', '.py', '.md', '.sh', '.command',
                  '.png', '.jpeg', '.jpg', '.svg', '.woff2', '.yml', '.yaml'}
    exact = {'CNAME', '.gitignore', 'package.json', 'package-lock.json', 'pnpm-lock.yaml',
             'security-manifest.json', 'Inter-LICENSE.txt'}
    for path in ROOT.rglob('*'):
        relative = path.relative_to(ROOT)
        if str(relative) == 'output/pdf/zeszyt_aparatow_2026_zalozenia_programu.pdf' and path.is_file() and not path.is_symlink():
            yield path, relative
            continue
        if any(part in ignored for part in relative.parts) or path.is_symlink() or not path.is_file():
            continue
        if path.suffix in extensions or str(relative) in exact:
            yield path, relative


def run_backup(config):
    private_directory(BASE)
    command([GPG, '--batch', '--no-options', '--list-keys', config['gpg_recipient']])
    lock = BASE / '.harmonogram.lock'
    # Do not steal a lock: a stale one needs manual inspection, not parallel dumps.
    fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    os.close(fd)
    try:
        name = 'PELNA-' + datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')
        destination = BASE / (name + '.tar.gpg')
        partial = BASE / (name + '.partial')
        with tempfile.TemporaryDirectory(prefix='.robocza-', dir=BASE) as folder:
            work = Path(folder)
            env = dict(os.environ, PGHOST='aws-1-eu-central-1.pooler.supabase.com', PGPORT='5432',
                       PGUSER='postgres.' + PROJECT, PGDATABASE='postgres', PGSSLMODE='verify-full',
                       PGSSLROOTCERT=config['ssl_root_cert'], PGCONNECT_TIMEOUT='20',
                       PGPASSWORD=secret('satis-backup-database'))
            metadata_sql = "SELECT jsonb_build_object('buckets', (SELECT COALESCE(jsonb_agg(t ORDER BY id), '[]') FROM storage.buckets t), 'objects', (SELECT COALESCE(jsonb_agg(t ORDER BY id), '[]') FROM storage.objects t));"
            before_storage = json.loads(command([PG / 'psql', '-X', '-w', '-qAt', '-v', 'ON_ERROR_STOP=1', '-c', metadata_sql], env))
            command([PG / 'pg_dump', '--no-password', '--format=custom', '--lock-wait-timeout=30000',
                     '--file', work / 'database.dump'], env)
            command([PG / 'pg_restore', '--list', work / 'database.dump'])
            command([PG / 'pg_restore', '--file=/dev/null', work / 'database.dump'])
            (work / 'roles.sql').write_bytes(command([PG / 'pg_dumpall', '--roles-only', '--no-role-passwords', '--no-password'], env))
            storage = work / 'storage'
            storage.mkdir(mode=0o700)
            object_count = download_storage(storage, secret('satis-backup-storage'))
            after_storage = json.loads(command([PG / 'psql', '-X', '-w', '-qAt', '-v', 'ON_ERROR_STOP=1', '-c', metadata_sql], env))
            if before_storage != after_storage:
                raise ValueError('Storage zmienilo sie podczas kopii. Powtorz poza godzinami pracy.')
            actual_objects = json.loads((storage / 'objects.json').read_text())
            expected = {(item['bucket_id'] + '/' + item['name'], item['id']) for item in before_storage['objects']}
            actual = {(item['path'], item['metadata']['id']) for item in actual_objects}
            if expected != actual:
                raise ValueError('Lista pobranych zalacznikow nie zgadza sie z baza. Kopia nie jest kompletna.')
            source = work / 'source'
            for path, relative in source_files():
                target = source / relative
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(path, target)
            (work / 'project-settings.json').write_text(json.dumps(config.get('project_settings', {}), ensure_ascii=False))
            manifest = {str(path.relative_to(work)): {'bytes': path.stat().st_size, 'sha256': file_hash(path)}
                        for path in work.rglob('*') if path.is_file()}
            (work / 'manifest.json').write_text(json.dumps({'created_at': datetime.now(timezone.utc).isoformat(),
                'project': PROJECT, 'objects': object_count, 'files': manifest}, ensure_ascii=False))
            with command_sink(partial, config['gpg_recipient']) as stream:
                with tarfile.open(fileobj=stream, mode='w|gz') as archive:
                    for path in sorted(work.iterdir()):
                        archive.add(path, arcname=path.name)
            os.replace(partial, destination)
            receipt = {'file': destination.name, 'bytes': destination.stat().st_size,
                       'sha256': file_hash(destination), 'created_at': datetime.now(timezone.utc).isoformat(),
                       'storage_objects': object_count, 'restore_tested': False}
            destination.with_suffix('.receipt.json').write_text(json.dumps(receipt))
            second = config.get('second_copy_directory')
            if second:
                second = Path(second)
                if not second.is_dir() or second.is_symlink():
                    raise ValueError('Kopia lokalna jest gotowa, ale drugi nosnik nie jest dostepny.')
                shutil.copy2(destination, second / destination.name)
                if file_hash(second / destination.name) != receipt['sha256']:
                    raise ValueError('Niepoprawna suma kontrolna drugiej kopii.')
                shutil.copy2(destination.with_suffix('.receipt.json'), second)
            (BASE / 'ostatnia-pelna.json').write_text(json.dumps(receipt))
            print('PELNA KOPIA ZAPISANA: ' + destination.name)
            print('Rozmiar: ' + str(receipt['bytes']) + ' bajtow. Odtworzenie wymaga osobnej proby.')
    finally:
        lock.unlink(missing_ok=True)


class command_sink:
    def __init__(self, path, recipient):
        self.path, self.recipient = path, recipient

    def __enter__(self):
        self.proc = subprocess.Popen([GPG, '--batch', '--no-options', '--trust-model', 'always',
            '--encrypt', '--recipient', self.recipient, '--output', str(self.path)],
            stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return self.proc.stdin

    def __exit__(self, kind, value, traceback):
        try:
            self.proc.stdin.close()
        except BrokenPipeError:
            pass
        try:
            result = self.proc.wait(timeout=120)
        except subprocess.TimeoutExpired:
            self.proc.kill()
            self.proc.wait()
            self.path.unlink(missing_ok=True)
            raise ValueError('Szyfrowanie przekroczylo limit czasu.')
        if kind or result:
            self.path.unlink(missing_ok=True)
            if not kind:
                raise ValueError('Szyfrowanie nie powiodlo sie.')


def main():
    os.umask(0o077)
    parser = argparse.ArgumentParser()
    parser.add_argument('--run', action='store_true')
    args = parser.parse_args()
    try:
        config = read_config()
        if args.run:
            run_backup(config)
        else:
            print('Konfiguracja kompletna. Nie pobrano danych ani nie utworzono kopii.')
    except Exception as error:
        # Never print HTTP error bodies, subprocess stderr, credentials or object keys.
        print('KOPIA NIEUKONCZONA: ' + (str(error) if isinstance(error, ValueError) else type(error).__name__))
        raise SystemExit(1)


if __name__ == '__main__':
    main()
