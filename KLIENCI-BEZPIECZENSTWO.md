# Klienci - wdrozenie i ochrona danych

## Wdrozenie

### Godziny otwarcia, uslugi i zmiana czasu myszka

Po podstawowym `supabase-clients.sql` uruchom **`supabase-client-schedule.sql`**. Ta dodatkowa migracja tworzy wspolne godziny otwarcia i katalog uslug, dodaje wskazanie uslugi przy wizycie oraz obejmuje zapisy kontrola limitow. Nie uruchamiaj ponownie samej starszej migracji podstawowej bez ponownego uruchomienia migracji harmonogramu, poniewaz podstawowa wersja funkcji zapisu nie zna nowych zasad.

- Miejsce harmonogramu to kafelki Wszystkie/T12/P63/P50 we wspolnych kolorach.
- Godziny otwarcia ustawia sie dla kazdego gabinetu i dnia tygodnia. Brak zapisanych godzin oznacza brak ograniczenia; pokazana propozycja 09:00-17:00 nie obowiazuje do zapisu. Dni oznaczone Zamkniete nie przyjmuja nowych planowanych wizyt. Zmiana godzin nie zmienia ani nie usuwa starszych wizyt.
- Usluga ma nazwe, domyslny czas i opcjonalne maksima dzienne, tygodniowe, miesieczne oraz roczne. Limity sa **wspolne dla wszystkich gabinetow**, liczone wedlug kalendarza w strefie Europe/Warsaw; tydzien zaczyna sie w poniedzialek. Wliczane sa wizyty zaplanowane i odbyte, nie anulowane lub oznaczone Nieobecnosc. Puste pole/zero w bazie oznacza brak limitu. Starsze nieprzypisane wizyty nie sa automatycznie zaliczane do uslugi.
- Po utworzeniu aktywnych uslug zapis nowej planowanej wizyty wymaga wyboru uslugi. Usluge mozna dezaktywowac, nie usuwa to historii. Limity sa sprawdzane po stronie PostgreSQL dla wszystkich terminow, nie tylko 500 pobranych do widoku. Transakcyjna blokada serializuje wspolne zmiany limitow i zapis wizyt, zeby dwa komputery nie zajely ostatniego miejsca rownoczesnie.
- Dolna krawedz bloku wizyty pozwala zmienic czas co 5 minut (5-240 minut). Puszczenie myszy zapisuje zmiane, strzalki klawiatury na uchwycie zmieniaja czas o 5 minut. Zachowywane sa notatki, usluga i pozostale dane. Konflikt rewizji, przekroczenie godzin albo limitu odrzuca zapis; blok wraca do czasu potwierdzonego w bazie. Nakladanie wizyt nadal wymaga dodatkowego potwierdzenia.
- Stara wewnetrzna funkcja zapisu jest niedostepna bezposrednio dla rol aplikacji. Wszystkie zapisy przechodza przez autoryzowany wrapper. RLS i dostep tylko SATIS pozostaja bez zmian. Bez nowej migracji karty klientow i zwykly harmonogram dzialaja, a nowe ustawienia/uslugi i uchwyty zmiany czasu pozostaja niedostepne z komunikatem o potrzebnym SQL.

1. Zachowaj aktualna, zaszyfrowana kopie bazy. Dotychczasowy pelny `pg_dump` obejmuje tez nowe tabele po ich utworzeniu; nie ma nowego magazynu zalacznikow.
2. W SQL Editor tego samego projektu Supabase, z ktorego korzysta SATIS, uruchom caly plik `supabase-clients.sql`. Wymaga on istniejacych migracji audytu i funkcji `is_satis_app_user()` oraz `is_satis_owner()`.
3. Opublikuj kod zwyklym procesem wydania SATIS. Nowy plik `clients.js` jest uwzgledniony w liscie dozwolonych zasobow i paczce offline.
4. Zweryfikuj zalogowane konto SATIS, gabinet oraz brak sesji. Gabinet i niezalogowana osoba nie moga odczytac ani zmienic kartoteki nawet bezposrednim wywolaniem RPC. Nie wlaczaj dostepu gabinetowi przez sama zmiane interfejsu.

Migracja tworzy nowe tabele i funkcje. Nie importuje, nie usuwa ani nie zmienia rekordow Aparatow, Serwisu i historii formularzy. Nie jest wykonywana automatycznie przy otwieraniu strony. Brak migracji pokazuje komunikat w Klientach, nie blokuje pozostalych zakladek.

## Obsluga

- Wyszukanie nazwiska, telefonu, modelu lub numeru seryjnego pokazuje propozycje z aktualnie zaladowanych danych Aparatow, Serwisu i formularzy. Zapisane karty przeszukiwane sa po nazwisku i telefonie; propozycje dokumentow rowniez po modelach i numerach.
- Zapisz karte kontaktowa, a nastepnie potwierdz powiazania z jej dokumentami. Zbieznosc nazwiska nie jest potwierdzeniem tozsamosci. Przy roznych telefonach/adresach nie wybieramy automatycznie jednego z nich.
- Historia dokumentow odczytuje aktualne rekordy zrodlowe przez potwierdzone identyfikatory. Nie kopiuje opisow medycznych ani dokumentow do nowej tabeli. Historia wypozyczen jest oparta na umowach, nie na zmiennym polu aktualnego uzytkownika Demo.
- Karta nie aktualizuje automatycznie danych kontaktowych w starych dokumentach. Zmiana umowy lub wpisu serwisowego pozostaje osobna operacja.
- Dane kontaktowe stosuja reguly formularzy: wielkie litery w nazwach po opuszczeniu pola, prefiks ulicy, rozdzielenie nazwy i numeru, kod `00-000`, rozwiniecie Bielsko do Bielsko-Biala oraz grupowanie cyfr telefonu. Mozna wkleic caly adres w pole ulicy. Miasto wynika z jednoznacznych lokalnych danych o kodzie; przy kilku mozliwosciach wymaga wyboru, a recznie wpisanej miejscowosci nie nadpisujemy. Nie ma zapytan adresowych do zewnetrznych uslug.
- Wizyty maja termin, czas trwania, gabinet oraz status: zaplanowana, odbyta, anulowana, nieobecnosc. Nakladanie terminow wymaga dodatkowego potwierdzenia. Odbyte wizyty i notatki pozostaja w historii.
- Harmonogram oferuje dzien, 3 dni, tydzien od poniedzialku i miesiac. Pokazuje przedzialy godzin oraz gabinety we wspolnych kolorach. Nakladajace sie wpisy sa obok siebie; klikniecie godziny uzupelnia termin dla wybranego klienta i gabinetu, ale nie zapisuje wizyty. Przelaczanie widokow korzysta z juz pobranych danych, bez kolejnych zapytan API. Dni poza pobranym zakresem maja oznaczenie braku danych, nie wolnego terminu. Limit 500 wizyt jest sygnalizowany, gdy zostanie osiagniety. Harmonogram nie jest dodatkowa kopia danych offline; jest czyszczony przy wylogowaniu.
- Kalendarz naglowka pokazuje wizyty SATIS z uwzglednieniem filtra gabinetu. Przycisk Wizyty przypomina o zaplanowanych wizytach dzisiejszych i zaleglych, maksymalnie z ostatnich 30 dni. Lista zawiera tez najblizsze 90 dni, maksymalnie 500 wizyt. Odswiezanie co 5 minut podczas pracy aplikacji; mozna odswiezyc recznie. **Nie wysyla SMS, e-maili ani powiadomien przy zamknietej aplikacji.**
- Na karcie pokazywane jest 200 ostatnich dzialan, 50 ostatnich operacji dostepu i potwierdzone dokumenty z aktualnie zaladowanego zbioru. Limity sa opisane w interfejsie; nie usuwaja danych z bazy.
- Archiwizacja ukrywa karte pod filtrem Archiwum. Usuniecie karty usuwa jej kontakty, notatki, wizyty i powiazania, ale nie oryginalne dokumenty ani minimalny rejestr operacji. Najpierw trzeba zakonczyc/anulowac planowane wizyty. Usuniecie jest nieodwracalne z interfejsu.

## Zabezpieczenia

- Kontrola autoryzowanego, aktywnego konta wlasciciela po stronie PostgreSQL w kazdej funkcji. RLS i odebranie bezposrednich uprawnien do tabel, lacznie z tabela audytu i rejestrem ponowien.
- Minimalny zakres: dane kontaktowe, powiazania, terminy i ustalenia organizacyjne. Brak nowych pol PESEL, dowodu, platnosci, wynikow APD i zalacznikow. Nie wpisuj danych zdrowotnych w polach notatek/tematu wizyty. Techniczny filtr numerow 11-cyfrowych nie zastepuje tej zasady.
- Nowa kartoteka nie zapisuje swoich danych w localStorage, sessionStorage, IndexedDB, adresie URL ani cache service workera. Offline dostepny jest tylko kod interfejsu, nie kartoteka. Dokumenty zrodlowe nadal podlegaja istniejacym zasadom przechowywania aplikacji; to nie jest zmiana calej polityki offline.
- Czyszczenie pamieci i elementow interfejsu przy wylogowaniu; odpowiedzi ze starej sesji sa odrzucane. Teksty wyswietlane przez `textContent`, bez interpretacji HTML.
- Zapisy przez RPC z identyfikatorem ponowienia, blokada podwojnego klikniecia, kontrola rewizji i transakcja. Odpowiedz rejestru ponowien zawiera tylko identyfikator/rewizje, a nie kopie danych klienta.
- Rejestr dostepu i zmian przechowuje czas, identyfikator konta, rodzaj operacji oraz identyfikator obiektu. Bez starych wartosci kontaktow i tresci notatek. Jest widoczny tylko wlascicielowi.
- Brak zewnetrznych uslug AI, analityki, map, poczty czy kalendarzy w tej funkcji. Polaczenie produkcyjne przez HTTPS do istniejacego Supabase.

## Co pozostaje po stronie administratora danych

Te zabezpieczenia nie sa certyfikatem zgodnosci calej aplikacji z RODO. Trzeba ustalic i udokumentowac cel oraz podstawe przetwarzania, zakres informacji dla klienta, upowaznienia, umowy powierzenia, czas przechowywania i obsluge praw osob. Powiazania z serwisem moga ujawniac informacje o zdrowiu, wiec nalezy ocenic rowniez art. 9 RODO, nie tylko dane kontaktowe.

Ustal osobne okresy retencji dla kontaktow, wizyt, dokumentow, rejestru operacji, rejestru ponowien i kopii zapasowych. Nie dodano automatycznego kasowania bez tych ustalen. Usuniecie karty nie oznacza automatycznego usuniecia dokumentow z innych zakladek, zapisow w starym audycie ani kopii zapasowych. Wnioski o usuniecie/eksport wymagaja sprawdzenia wszystkich zrodel. Karta nie ma zbiorczego eksportu, aby nie rozszerzac niepotrzebnie powierzchni wycieku.

Konta, dostep do komputera, MFA, blokada ekranu, bezpieczna przegladarka oraz testowane zaszyfrowane kopie nadal sa konieczne. Odblokowanie gabinetu w przyszlosci powinno obejmowac indywidualna identyfikacje osob i ograniczenie zakresu rekordow, a nie tylko wspolne konto.

Podstawa projektowa: [RODO - tekst rozporzadzenia, w szczegolnosci art. 5, 9, 25 i 32](https://eur-lex.europa.eu/eli/reg/2016/679/oj).

## Weryfikacja techniczna

- `node --test tests/clients.test.cjs`: propozycje osob bez automatycznego laczenia, sortowanie, daty lokalne, walidacja, brak dostepu gabinetu/anonimowego, odpowiedzi po wylogowaniu, podwojny zapis i ponowienie tego samego zadania.
- `node --test tests/clients.sqltest.cjs`: statyczna polityka SQL oraz izolowany PostgreSQL 17, jezeli dostepny lokalnie w `/opt/homebrew/opt/postgresql@17/bin`. Tworzy jednorazowy klaster tylko na fikcyjnych danych, bez polaczenia z produkcja; sprawdza uprawnienia rol, zapis/ponowienie, konflikt wersji, powiazanie, nakladanie wizyt i usuniecie karty bez usuniecia zrodla.
- Pelne testy aplikacji: `python3 scripts/release_satis.py check`.
- Po wdrozeniu nadal nalezy sprawdzic interfejs w przegladarce i uprawnienia z prawdziwymi rolami Supabase, uzywajac fikcyjnej karty. Lokalny test nie potwierdza ustawien serwera produkcyjnego.
