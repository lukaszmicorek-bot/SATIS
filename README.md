# Zeszyt aparatów

Lokalna aplikacja do prowadzenia ewidencji aparatów i dokumentów podobnej do tabeli z PDF.
W jednej aplikacji są dwa zeszyty: aparaty oraz naprawy i wkładki uszne.

## Supabase: wspólna baza przez internet

Supabase jest zalecanym trybem dla kilku użytkowników pracujących z różnych miejsc. Komputer główny nie musi być wtedy włączony. Każdy użytkownik loguje się własnym adresem e-mail i hasłem, a zmiany są synchronizowane automatycznie.

### Konfiguracja

1. Utwórz projekt na [supabase.com](https://supabase.com/).
2. Otwórz `SQL Editor`, wklej całą zawartość pliku `supabase-schema.sql` i uruchom zapytanie.
3. W `Authentication` / `Users` dodaj użytkowników, którzy mają mieć dostęp do zeszytu.
4. W `Project Settings` / `API` skopiuj:
   - `Project URL`,
   - klucz `Publishable key` albo starszy klucz `anon public`.
5. Wpisz je do pliku `supabase-config.js`:

```js
window.SUPABASE_CONFIG = {
  url: "https://twoj-projekt.supabase.co",
  publishableKey: "sb_publishable_..."
};
```

6. Umieść pliki aplikacji na hostingu statycznym, np. Cloudflare Pages, Netlify lub GitHub Pages.
7. Otwórz stronę i zaloguj się kontem utworzonym w kroku 3.

Nie wpisuj do `supabase-config.js` klucza `service_role`. Klucz publishable/anon może znajdować się w przeglądarce, ponieważ dostęp do danych jest zabezpieczony regułami RLS z pliku `supabase-schema.sql`.

### Pierwszy import danych

Po zalogowaniu użyj przycisku importu w każdym zeszycie i wybierz dotychczasowy eksport JSON lub CSV. Import zastępuje zawartość danego zeszytu w Supabase, dlatego przed importem warto wykonać eksport JSON jako kopię bezpieczeństwa.

Gdy pola w `supabase-config.js` pozostaną puste, aplikacja nadal działa w dotychczasowym trybie lokalnym albo przez `server.py`.

## Uruchomienie dla wielu użytkowników

Uruchom wspólny serwer na komputerze, na którym ma być zapisywana baza:

```text
python3 server.py --host 0.0.0.0 --port 5173
```

Z hasłem:

```text
python3 server.py --host 0.0.0.0 --port 5173 --user admin --password mocne-haslo
```

Na tym komputerze wejdź na:

```text
http://127.0.0.1:5173/
```

Inni użytkownicy w tej samej sieci wchodzą przez adres IP tego komputera, np.:

```text
http://192.168.1.25:5173/
```

Adres IP komputera można sprawdzić w ustawieniach sieci macOS albo poleceniem:

```text
ipconfig getifaddr en0
```

## Dostęp zdalny przez Cloudflare Tunnel

Cloudflare Tunnel pozwala pokazać zeszyt w internecie bez przekierowania portów na routerze. Cloudflare tworzy połączenie wychodzące z komputera z zeszytem do swojej sieci i kieruje ruch do lokalnego serwera.

### Szybki link testowy

1. Zainstaluj `cloudflared`.
2. Uruchom:

```text
ZESZYT_USER=admin ZESZYT_PASSWORD=mocne-haslo ./start-cloudflare-quick.sh
```

3. W terminalu pojawi się publiczny adres w domenie `trycloudflare.com`.
4. Udostępnij adres oraz login i hasło zaufanym osobom.

Ten tryb jest dobry na szybkie użycie i testy. Link może się zmienić po ponownym uruchomieniu tunelu.

### Stały adres pod domeną

Do stałego adresu, np. `https://zeszyt.twojadomena.pl`, potrzebujesz konta Cloudflare i domeny dodanej do Cloudflare.

1. W Cloudflare przejdź do `Zero Trust` / `Networks` / `Tunnels`.
2. Utwórz tunel, np. `zeszyt-aparatow`.
3. Dodaj aplikację/public hostname:
   - hostname: `zeszyt.twojadomena.pl`,
   - service: `http://localhost:5173`.
4. Na komputerze z zeszytem uruchom lokalny serwer:

```text
python3 server.py --host 0.0.0.0 --port 5173 --user admin --password mocne-haslo
```

5. Uruchom connector `cloudflared` zgodnie z komendą podaną w panelu Cloudflare.

Nie wystawiaj portu `5173` na routerze, jeżeli korzystasz z Cloudflare Tunnel.

## Inne opcje zdalne

Możesz też użyć Tailscale, ZeroTier albo firmowego VPN. Przekierowanie portu na routerze jest najmniej bezpieczną opcją i nie jest potrzebne przy Cloudflare Tunnel.

## Uruchomienie pojedyncze

Możesz też otworzyć `index.html` bez serwera, ale wtedy dane będą zapisane tylko w tej jednej przeglądarce.

## Funkcje

- dodawanie, edycja i usuwanie rekordów,
- osobny zeszyt napraw i wkładek usznych,
- wspólna baza dla kilku użytkowników w tej samej sieci,
- osobna zakładka z aktualną ilością aparatów na stanie,
- podpowiadanie nazwy aparatu na podstawie wcześniejszych rekordów,
- wyszukiwanie po nazwie, numerze seryjnym, kliencie, fakturze i uwagach,
- filtrowanie po typie: `NA STANIE`, `SPRZEDANY`, `REZERWACJA`, `ZWROT`,
- filtr FIFO: najstarsze pierwsze, `90+ dni`, `180+ dni`,
- kolor żółty dla rekordów starszych niż 90 dni i czerwony dla starszych niż 180 dni,
- sortowanie po kliknięciu nagłówka tabeli,
- eksport do CSV i JSON,
- import danych z JSON,
- drukowanie aktualnego widoku tabeli.

## Dane

Dane przy uruchomieniu przez `server.py` są zapisywane w `data/records.json` oraz `data/repair-records.json`. Eksport JSON jest dodatkową kopią zapasową bazy i można go później zaimportować.
