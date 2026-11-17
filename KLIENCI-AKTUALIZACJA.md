# Klienci - aktualizacja po audycie

## Wdrozenie

1. Zachowaj aktualna, prywatna, zaszyfrowana kopie bazy.
2. W SQL Editor produkcyjnego projektu SATIS uruchom caly plik
   `supabase-clients-audit.sql`. Wymaga juz zainstalowanych migracji
   `supabase-clients.sql`, `supabase-client-journey.sql` i audytu podstawowego.
   Jesli przebieg nie byl jeszcze instalowany, najpierw uruchom
   `supabase-client-journey.sql`, a dopiero pozniej nowy plik audytu.
3. Nie uruchamiaj ponownie starszych migracji Klientow ani harmonogramu po
   tej aktualizacji. Moglyby zastapic nowe funkcje ich starszymi wersjami.
4. Opublikowany kod sam nie uruchamia SQL. Do czasu aktualizacji stare
   karty nadal dzialaja; tworzenie odrebnych spraw i rezerwacje sa zablokowane.
   Wyszukiwanie podstawowe nadal dziala, a brak rozszerzonego wyszukiwania
   jest sygnalizowany komunikatem.

Skrypt jest transakcyjny i powtarzalny. Zachowuje kontakty, wizyty,
dotychczasowe przebiegi i zainstalowane zasady harmonogramu. Nie rezerwuje
aparatow i nie zmienia dokumentow klientow podczas instalacji. Zmienia
klucz tabeli przebiegu, zeby umozliwic wiele spraw jednej osoby, oraz usuwa
zbedne kopie przebiegow z bufora ponowien operacji. Nie jest to usuwanie
oryginalnych dokumentow ani kopii zapasowych.

## Obsluga

- Zapisz dane zapisuje kontakty. Zapisz przebieg zapisuje etapy sprawy.
  Niezapisane zmiany maja malinowe oznaczenie. Trwajacy zapis blokuje
  kolidujace operacje, a odswiezenie nie odblokowuje jego pol.
- Nowa sprawa tworzy osobny identyfikator. Dokumenty do niej wybiera sie
  w Ustawienia i dokumenty sprawy, sposrod juz potwierdzonych dokumentow
  tej osoby. Sam dzien ani zgodne nazwisko nie przypisuja dokumentu do nowej
  sprawy. Wybrane aparaty i wizyta tez naleza do konkretnego przebiegu.
- Poprzednie sprawy pozostaja na liscie do odczytu. Starszy przebieg
  zachowuje dotychczasowe reguly dopasowania, aby nie zmieniac historii.
- Na gorze przebiegu widac nastepny krok, wybrane aparaty i zaplanowana
  wizyte. Wykonane etapy sa zwiniete. Glowna historia laczy dokumenty i
  dzialania; techniczne zmiany etapow sa w osobnej rozwijanej sekcji.
- Dokumenty potwierdza sie pojedynczo albo po zaznaczeniu wlasciwych
  pozycji. Zapis kontaktu nie przypisuje juz zbiorczo wszystkich dokumentow
  z takim samym nazwiskiem. Przy zbieznosci osob sprawdz telefon i adres.
- Rezerwacja zapisuje aparaty, ich powiazania i przebieg razem w jednej
  transakcji. Konflikt nie pozostawia polowy operacji. Po utracie odpowiedzi
  ponowienie tej samej operacji uzywa tego samego identyfikatora.
- Wyszukiwanie po modelu lub numerze seryjnym prowadzi do istniejacych kart
  na podstawie dokumentow zaladowanych do aplikacji. Zbieznosc nazw nie
  oznacza automatycznego polaczenia kart ani potwierdzenia tozsamosci.
- Filtry listy obejmuja kontakt po powrocie produktu, zlecenie do uzyskania,
  wybrana zaplanowana wizyte, produkt do odbioru i zalegle terminy. Korzystaja
  z potwierdzonych powiazan i biezacej sprawy, nie z samego nazwiska.

## Ochrona i ograniczenia

Nowe funkcje nadal wymagaja zalogowanego wlasciciela SATIS. Gabinet i osoba
niezalogowana nie otrzymuja dostepu. Nie dodano zapisu kartoteki offline,
zewnetrznych uslug ani nowych danych identyfikacyjnych klienta.

Usuniecie karty usuwa jej przebiegi oraz powiazane potwierdzenia ponowien
zapisu. Ponowienie starego zadania nie zwraca usunietego przebiegu.
Nie usuwa to oryginalnych dokumentow Aparatow, Serwisu, formularzy, ich
audytu ani prywatnych kopii zapasowych. Wniosek o usuniecie danych nadal
wymaga sprawdzenia wszystkich zrodel i obowiazujacych zasad retencji.

## Kontrola bez produkcyjnych danych

- `node --test tests/*.test.cjs`
- `node --test tests/clients-audit.sqltest.cjs` - odizolowany PostgreSQL
  w PGlite, fikcyjne osoby, brak sieci i danych dostepowych.
- `node tests/clients-audit.browser.cjs` - prawdziwe moduly interfejsu,
  fikcyjne odpowiedzi API, blokada wszystkich zewnetrznych polaczen.
  Wymaga lokalnie zainstalowanej przegladarki Playwright.

Testy lokalne nie potwierdzaja wykonania migracji ani konfiguracji
uprawnien na produkcyjnym Supabase. Publikacja GitHub nie wykonuje migracji.
