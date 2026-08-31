-- Uruchom raz w Supabase SQL Editor. Nie zmienia ani nie usuwa istniejacych umow.
-- Blokada obejmuje rowniez rownoczesne zapisy na roznych komputerach.
begin;

create or replace function public.loan_serial_key(value text)
returns text language sql immutable set search_path = pg_catalog as $$
  select regexp_replace(regexp_replace(upper(coalesce(value, '')), '[[:space:]-]+', '', 'g'), '^21(.+)$', '\1');
$$;

create or replace function public.loan_guard_date(value text)
returns date language plpgsql immutable set search_path = pg_catalog as $$
begin
  if value !~ '^\d{4}-\d{2}-\d{2}$' then return null; end if;
  return value::date;
exception when others then return null;
end;
$$;

create or replace function public.check_loan_handover()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public as $$
declare
  serials text[];
  right_serial text := public.loan_serial_key(new.data #>> '{rightDevice,serial}');
  left_serial text := public.loan_serial_key(new.data #>> '{leftDevice,serial}');
  started date := public.loan_guard_date(coalesce(nullif(new.data->>'periodFrom', ''), new.data->>'date'));
  returned date := public.loan_guard_date(new.data->>'returnDate');
  other record;
  other_start date;
  other_end date;
begin
  -- Wspolny zamek transakcyjny: drugi zapis sprawdza stan po zakonczeniu pierwszego.
  perform pg_advisory_xact_lock(731826, 1);
  if started is null then
    raise exception 'Podaj prawidlowa date rozpoczecia wypozyczenia.' using errcode = '23514';
  end if;
  if nullif(new.data->>'returnDate', '') is not null and returned is null then
    raise exception 'Nieprawidlowa data zwrotu.' using errcode = '23514';
  end if;
  if returned < started or returned > (now() at time zone 'Europe/Warsaw')::date then
    raise exception 'Data faktycznego zwrotu musi byc miedzy rozpoczeciem wypozyczenia a dzisiaj.' using errcode = '23514';
  end if;
  if right_serial <> '' and right_serial = left_serial then
    raise exception 'Ten sam numer seryjny wpisano dla obu aparatow.' using errcode = '23514';
  end if;
  serials := array_remove(array[right_serial, left_serial], '');
  for other in
    select id, data from public.loan_contracts
    where id <> new.id and (
      public.loan_serial_key(data #>> '{rightDevice,serial}') = any(serials)
      or public.loan_serial_key(data #>> '{leftDevice,serial}') = any(serials)
    )
  loop
    other_start := public.loan_guard_date(coalesce(nullif(other.data->>'periodFrom', ''), other.data->>'date'));
    other_end := public.loan_guard_date(other.data->>'returnDate');
    if coalesce(new.data->>'date', '') = coalesce(other.data->>'date', '')
      and started = other_start
      and coalesce(new.data->>'periodTo', '') = coalesce(other.data->>'periodTo', '')
      and lower(regexp_replace(trim(coalesce(new.data->>'customer', '')), '\s+', ' ', 'g'))
        = lower(regexp_replace(trim(coalesce(other.data->>'customer', '')), '\s+', ' ', 'g'))
      and serials @> array_remove(array[
        public.loan_serial_key(other.data #>> '{rightDevice,serial}'),
        public.loan_serial_key(other.data #>> '{leftDevice,serial}')], '')
      and serials <@ array_remove(array[
        public.loan_serial_key(other.data #>> '{rightDevice,serial}'),
        public.loan_serial_key(other.data #>> '{leftDevice,serial}')], '') then
      raise exception 'Duplikat umowy %. Otworz istniejaca umowe.', coalesce(other.data->>'number', other.id) using errcode = '23514';
    end if;
    if other_end <= started or returned <= other_start then continue; end if;
    if other_end is null then
      raise exception 'Umowa % nie ma daty zwrotu tego aparatu. Najpierw zapisz rzeczywisty zwrot.', coalesce(other.data->>'number', other.id) using errcode = '23514';
    end if;
    raise exception 'Okres wypozyczenia nachodzi na umowe %. Sprawdz daty zwrotu i wydania.', coalesce(other.data->>'number', other.id) using errcode = '23514';
  end loop;
  return new;
end;
$$;

revoke all on function public.check_loan_handover() from public;
drop trigger if exists loan_handover_guard on public.loan_contracts;
create trigger loan_handover_guard before insert or update on public.loan_contracts
for each row execute function public.check_loan_handover();

commit;
