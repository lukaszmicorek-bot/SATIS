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

### Zapis wizyty z kalendarza

- W widoku Dzien, 3 dni lub Tydzien wybierz gabinet i przeciagnij mysza
  po wolnych godzinach jednego dnia. Przedzial podswietla sie co 15 minut.
  Mozesz zaznaczac w dol albo w gore, do 4 godzin. Klikniecie pojedynczej
  godziny lub Enter otwiera domyslnie 30 minut (krocej przy zamknieciu).
- W oknie Nowa wizyta wybierz zapisanego klienta oraz aktywna usluge.
  Wyszukiwarka przeszukuje kartoteke po nazwisku lub telefonie, niezaleznie
  od aktualnego filtra listy klientow. Zgodnosc nazwiska nie zatwierdza
  osoby automatycznie; wybierz ja z wynikow. Ostatnio otwarta karta moze
  byc wstepnie wybrana, z mozliwoscia zmiany.
- Godziny Od i Do mozna poprawic. Wybor uslugi pokazuje cene i standardowy
  czas, ale nie nadpisuje przedzialu zaznaczonego mysza.
- Pod polami Od i Do sa przewijane listy godzin co 5 minut. Wybrana
  godzina jest podswietlona; mozna tez wpisac ja recznie. Lista Do
  uwzglednia poczatek, limit 4 godzin i godzine zamkniecia gabinetu.
  Listy obsluguja kolko myszy, dotyk i klawisze strzalek.
- Dopiero Zapisz wizyte zapisuje dzialanie w historii wybranego klienta
  i kalendarzu. Nadal obowiazuja godziny otwarcia, dni robocze, limity uslug,
  kontrola kolizji i ochrona przed podwojnym wyslaniem. Brak polaczenia
  pozostawia okno i dane do ponowienia, bez nowego identyfikatora wizyty.
- Ta zmiana nie wymaga nowego SQL. Korzysta z istniejacego zapisu wizyt
  i konfiguracji `supabase-client-schedule.sql`.

### RODO i kontakt po wypozyczeniu

Po aktualizacji audytu uruchom w SQL Editor `supabase-clients-follow-up.sql`.
Jest powtarzalny, zachowuje dotychczasowe dane i nie wymaga nowych tabel.
Bez niego dziala podstawowe ostrzezenie o braku potwierdzenia RODO i zapis
rezygnacji, ale odroczenie kontaktu jest zablokowane. Nie uruchamiaj
starszych migracji kartoteki po tej aktualizacji.

- RODO jest potwierdzane recznie. Po migracji uwzgledniane jest tez
  potwierdzenie w innej sprawie tej samej karty. Nie wnioskujemy podpisu
  z wydruku dokumentu ani z samej zgodnosci nazwisk.
- Potwierdzenia dokumentow pokazuja date i godzine zapisu na serwerze.
  Ponowny zapis innych pol nie zmienia tej daty. Cofniecie potwierdzenia
  i ponowne zaznaczenie zapisuje nowy moment. Starszych dat bez historii
  nie odtwarzamy z dzisiejszego zegara. Aby odczytywac daty z pelnej
  historii, uruchom zaktualizowany `supabase-clients-follow-up.sql`, nawet
  jesli poprzednia wersja tego pliku byla juz wykonana. Bez aktualizacji
  dostepne sa tylko daty mozliwe do ustalenia z wczytanej historii.
- Usunieto klienta demonstracyjnego z aplikacji. Byl podgladem lokalnym,
  bez zapisu do bazy; rzeczywiste karty i dokumenty pozostaly bez zmian.
- Po 14 dniach od rozpoczecia wypozyczenia (okres od z umowy; przy jego
  braku data umowy) pojawia sie przypomnienie, jesli po tej dacie nie ma
  powiazanej oferty ani sprzedazy aparatu z faktura i data odbioru.
- Rezygnacja zapisuje decyzje o zakupie. Nie zamyka niezwróconej umowy.
  Umowic pozniej zapisuje date kontaktu; przypomnienie wraca w tym dniu.
  Data jest wspolna dla komputerow, chroniona wersjonowaniem i zapisana
  w historii sprawy. Wpisywanie daty jest chronione przed utrata przy
  zamykaniu okna.
- Przypomnienia sa widoczne na karcie klienta po jej otwarciu. Nie
  wysylaja SMS ani wiadomosci przy zamknietej aplikacji.

- Karta klienta otwiera sie w osobnym, przewijanym oknie. Dane kontaktowe
  sa domyslnie zwiniete; przy dodawaniu klienta formularz danych jest otwarty.
  Zamkniecie pyta o niezapisane zmiany, a trwajacy zapis blokuje zamkniecie.
- Karta ma trzy sekcje: Sprawa, Historia i Dane. Przelaczanie sekcji nie
  zapisuje ani nie usuwa wpisywanych zmian. Widok Sprawa pokazuje aktualna
  czynnosc i aparaty, a rzadziej uzywane ustawienia i wybor starszych spraw
  sa pod Szczegoly i ustawienia sprawy. Historia dokumentow i dzialan jest
  osobno, podobnie jak kontakty i administracyjne przyciski karty.
- Nowy klient nie ma obowiazkowej listy wszystkich etapow. Wypozyczenie
  prowadzi do zwrotu i decyzji, zakup do doboru i wydania aparatow, serwis
  do wyslania, powrotu, kontaktu i odbioru. Oferta, wizyta i zlecenie NFZ
  pojawiaja sie wtedy, gdy dotycza sprawy. Wszystkie czynnosci mozna wybrac
  recznie. Otwarcie formularza nie potwierdza wykonania ani podpisania.

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
