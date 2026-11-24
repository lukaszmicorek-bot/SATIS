# Formularze offline

## Pierwsze włączenie

1. Na zaufanym komputerze wejdź na stronę SATIS i zaloguj się online.
2. Kliknij **Formularze offline** i poczekaj na otwarcie formularzy. Nie ustawiasz osobnego hasła.
3. Sprawdź przed użyciem: rozłącz internet i otwórz ten sam adres w tym samym profilu przeglądarki. Nie używaj trybu prywatnego.

Tylko przy przenoszeniu szkiców ze starej wersji zabezpieczonej hasłem aplikacja może poprosić o tamto hasło. To jednorazowe przeniesienie istniejących danych.

## Bez internetu

- **Oferta, Umowa, Zamówienie i Reklamacja:** zapisuj robocze szkice na komputerze. Niekompletny formularz można zapisać, ale wydruk wymaga uzupełnienia wymaganych danych. Nowe wydruki są oznaczone jako robocze, bez zatwierdzonej numeracji.
- **RODO, Odbiór aparatu, Pielęgnacja, THI i TRQ:** możesz wypełnić i wydrukować. Nie mają lokalnej historii szkiców.
- Po kliknięciu **Zapisz szkic** poczekaj na potwierdzenie. Usunięcie szkicu nie usuwa dokumentu z historii online.

## Powrót online

Po przywróceniu połączenia zaloguj się na to samo konto i sprawdź stan **Synchronizuj**. Numer dokumentu, duplikaty, bieżąca dostępność sprzętu i konflikty edycji są sprawdzane online. Szkic, którego nie udało się zapisać, pozostaje lokalnie z komunikatem; nie zastępuje nowszej wersji na serwerze.

## Bezpieczeństwo

Dane szkiców i niewyeksportowany klucz szyfrowania są przechowywane w profilu przeglądarki. Osoba korzystająca z tego samego odblokowanego profilu może otworzyć szkice bez hasła. Korzystaj z szyfrowania dysku, blokuj komputer i nie włączaj trybu offline na publicznych stanowiskach. Usunięcie danych witryny może skasować niezapisane na serwerze szkice. Wydruki i pliki PDF przechowuj osobno w bezpiecznym miejscu.

Tryb offline nie przyznaje uprawnień do Supabase ani dostępu do bazy klientów. Pamięć podręczna Service Workera obejmuje wyłącznie zasoby aplikacji. Gdy dostępna jest aktualizacja, zapisz formularze i zamknij wszystkie karty SATIS, aby nowa wersja mogła się włączyć.

## Test

W katalogu projektu uruchom `node --test tests/*.test.cjs`. Test przeglądarkowy: `npm install --no-save --package-lock=false playwright`, `npx playwright install chromium`, następnie `node tests/priority-offline.browser.cjs`. Używa wyłącznie fikcyjnych rekordów oraz lokalnego serwera; nie zapisuje niczego do produkcji.
