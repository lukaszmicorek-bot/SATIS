# SATIS: kopia i odtworzenie

## Harmonogram

Co 2 dni (co 48 godzin), zadanie w aplikacji Codex: "Kopia zapasowa SATIS co 2 dni".
Zadanie harmonogramu moze wykonac kopie dopiero po jednorazowej
konfiguracji dostepu i klucza szyfrujacego. Mac i Codex musza byc dostepne, zadanie
musi miec pozwolenie na wykonanie programu i dostep do Pek kluczy oraz Internet.
Nie nazywamy samego uruchomienia zadania wykonana kopia.

Folder prywatny: `/Users/luka/SATIS-kopie` (poza projektem i GitHub).
Program: `scripts/recovery_backup.py --run`.
Nie usuwa starych kopii. Proponowana retencja po uzgodnieniu: ostatnie 15 kopii
oraz jedna miesieczna przez rok. Nie wlaczono automatycznego kasowania.

## Zawartosc jednej paczki

- `database.dump`: baza PostgreSQL, schematy, dane, funkcje, ograniczenia, indeksy,
  polityki i uprawnienia; rowniez Auth, urlopy, platnosci, historia zmian,
  liczniki i klucze dokumentow, powiazania i wspolna kolejnosc wierszy.
- `roles.sql`: definicje rol i ich zaleznosci, bez hasel rol.
- `storage/objects`: faktyczne pliki zalacznikow ze wszystkich bucketow,
  `buckets.json` i `objects.json`: ustawienia, sciezki, rozmiary i sumy SHA-256.
- `source`: aktualny kod, wyglad, loga, formularze, reguly, filtry, walidacje,
  testy, migracje SQL, instrukcje, zaleznosci i workflow oraz istniejacy PDF
  zalozen programu. PDF jest dokumentem historycznym; aktualny kod ma pierwszenstwo.
- `project-settings.json`: recznie zatwierdzona konfiguracja projektu.
- `manifest.json`: wykaz plikow i sumy kontrolne.

Paczka jest szyfrowana GPG dla pelnego fingerprintu odbiorcy. Harmonogram potrzebuje
tylko klucza publicznego; prywatny klucz i haslo do niego sa potrzebne do odzyskania.
Wyeksportuj klucz prywatny i przechowuj go osobno, w bezpiecznym miejscu.
Nie publikuj kopii, kluczy prywatnych ani hasel w repozytorium.

Kopia bazy nie zawiera samych plikow Storage:
https://supabase.com/docs/guides/platform/backups
pg_dump nie kopiuje rol calego klastra; zapisujemy je dodatkowo:
https://www.postgresql.org/docs/current/app-pgdump.html

## Czego nie udaje sie skopiowac automatycznie

- Ustawienia panelu Supabase, SMTP, OAuth, Edge Functions/secrets, DNS i konta
  dostawcow wymagaja uzupelnienia w konfiguracji lub oddzielnego eksportu.
- Stanowisko zapisane na danym komputerze, aktualnie wybrane filtry i niezapisane
  szkice offline nie sa danymi wspolnej bazy. Szkice najpierw zsynchronizuj.
  Definicje filtrow, reguly dzialania i kolejnosc zapisana w Supabase sa w kopii.
- Nie kopiuje calego profilu przegladarki ani aktywnych sesji logowania.
- Nie kopiuje calego katalogu `dist`, Git ani `node_modules`: starych wydań
  nie potrzeba do odtworzenia obecnego programu, a zaleznosci odtwarza lockfile.
- Nie odtwarza samoczynnie produkcji. Zadanie wykonuje wylacznie odczyty.

## Jednorazowa konfiguracja

1. Zachowaj odzyskiwalny klucz GPG. Mozna uzyc istniejacego klucza; sprawdz jego
   pelny fingerprint i zrob osobna kopie klucza prywatnego.
2. Zapisz w macOS Pek kluczy dwa hasla, bez umieszczania ich w czacie ani pliku:
   `satis-backup-database`: haslo bazy produkcyjnej;
   `satis-backup-storage`: administracyjny klucz API Storage (secret/service_role,
   nie publishable/anon). Hasel nie dodawaj jako argumentow polecen w historii.
3. W `/Users/luka/SATIS-kopie/harmonogram.json` zapisz konfiguracje ponizej.
   Plik nie zawiera hasel. Certyfikat musi byc certyfikatem projektu pozwalajacym
   na `sslmode=verify-full`. Nie obnizaj sprawdzania SSL przy bledzie.

```json
{
  "project_ref": "xfzfhzyzmtcxqqyjpzfw",
  "gpg_recipient": "PELNY_FINGERPRINT_KLUCZA_GPG",
  "ssl_root_cert": "/Users/luka/Downloads/prod-ca-2021.crt",
  "second_copy_directory": "",
  "project_settings_reviewed": true,
  "project_settings": {
    "site_url": "https://satis.pracowniasluchu.pl/",
    "redirect_urls": [],
    "auth_notes": "Uzupelnij aktualne ustawienia i sposob odtworzenia kont.",
    "smtp_notes": "Uzupelnij dostawce i ustawienia; hasla osobno w menedzerze hasel.",
    "realtime_notes": "Uzupelnij aktualne publikacje i ustawienia.",
    "integration_notes": "Uzupelnij DNS, integracje, funkcje i miejsca przechowywania sekretow."
  }
}
```

4. Uruchom `python3 scripts/recovery_backup.py` (kontrola konfiguracji bez pobrania).
5. Uruchom `python3 scripts/recovery_backup.py --run`. To pierwszy pelny odczyt.
   Narzedzia: PostgreSQL 17 z dotychczasowej kopii i GPG z Homebrew.
6. Sprawdz odczyt zaszyfrowanej paczki i wykonaj probe odtworzenia na odizolowanym
   projekcie. Dopiero to potwierdzi odzyskiwalnosc, nie samo istnienie archiwum.

Zrzut bazy jest transakcyjnie spojny. Pliki Storage sa pobierane osobno; program
porownuje ich metadane przed i po kopii i odrzuca zmieniony lub niepelny zestaw.
Najlepiej wykonywac kopie poza edycja zalacznikow. Pliki robocze sa przez czas
operacji nieszyfrowane w prywatnym katalogu 0700, a nastepnie usuwane. Na Macu
powinien byc wlaczony FileVault. Log zadania nie zawiera hasel ani tresci rekordow.

## Wielkosc

Pomiar 13.10.2026: ostatni istniejacy zrzut zaszyfrowany z 28.09 ma ok. 505 KB;
aktualne pliki wydania ok. 3,7 MB; wybrany komplet zrodel, SQL, testow i instrukcji
ok. 13,8 MB przed kompresja. To nie jest pomiar obecnej bazy ani zalacznikow.
Probna kompresja samych zrodel dala ok. 7,3 MB. Wraz z ostatnia znana baza
to orientacyjnie ok. 8 MB na paczke bez zalacznikow i aktualnego wzrostu bazy.
Pelna paczka ma dodatkowo aktualne zrodla, testy, SQL i instrukcje. Jej rzeczywisty
rozmiar program zapisuje w `.receipt.json` po pierwszej kopii.

Co 2 dni powstaje ok. 15 paczek miesiecznie. Miesieczny przyrost = rozmiar jednej
paczki x 15; druga lokalizacja podwaja laczna ilosc danych. Zdjecia/PDF zwykle
kompresuja sie slabo. Na czas operacji potrzebne jest dodatkowe miejsce robocze
na baze i zalaczniki. Nie zakladamy, ze cale 404 MB folderu projektu trzeba
kopiowac: wiekszosc to poprzednie wydania, Git i instalowane zaleznosci.

## Odtworzenie na innym serwerze

1. W prywatnym katalogu sprawdz SHA-256 zaszyfrowanej paczki, odszyfruj ja swoim
   kluczem GPG i sprawdz sumy plikow wedlug `manifest.json`.
2. Przygotuj NOWY odizolowany projekt Supabase lub kompatybilna instalacje
   Supabase. Zwykly MySQL nie jest zamiennikiem: program uzywa PostgreSQL,
   Auth, Storage, RPC, RLS i Realtime.
3. Przejrzyj role i wlascicieli w `roles.sql`; nie odtwarzaj bezmyslnie systemowych
   rol dostawcy. Odtwarzaj dump z `--exit-on-error`, zgodnie z metoda dobrana do
   docelowego projektu. Nie uzywaj `--clean` na dzialajacej bazie.
4. Odtworz buckety i pliki Storage pod tymi samymi sciezkami. Same metadane
   `storage.objects` nie przywracaja plikow.
5. Przywroc ustawienia projektu, nowe sekrety i adresy przekierowan logowania.
   W `supabase-config.js` ustaw URL i publiczny klucz NOWEGO projektu.
6. Zbuduj/udostepnij pliki aplikacji i skieruj `satis.pracowniasluchu.pl` na nowe
   miejsce. Zadbanie o HTTPS i DNS jest oddzielnym krokiem.
7. Przed przelaczeniem sprawdz logowania SATIS/gabinet, uprawnienia platnosci
   i urlopow, rekordy, zalaczniki, numeracje, formularze, RLS i wspolna kolejnosc.
   Porownaj liczniki i zawartosc z kopia. Do tego czasu nie kasuj starego projektu.

To instrukcja odzyskania, nie potwierdzenie wykonanej proby odtworzenia.
