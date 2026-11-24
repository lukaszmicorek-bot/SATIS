-- Uruchom w Supabase -> SQL Editor. Nie usuwa wpisow ani tabel.
-- Pozwala aktywnemu, autoryzowanemu kontu gabinet usuwac tylko liste PCPR.
begin;

drop policy if exists "gabinet can delete pcpr list" on public.pcpr_list;
create policy "gabinet can delete pcpr list"
  on public.pcpr_list for delete
  to authenticated
  using (
    auth.uid() is not null
    and public.is_satis_app_user() is true
    and lower(auth.jwt() ->> 'email') = 'gabinet@pracowniasluchu.pl'
  );

notify pgrst, 'reload schema';
commit;
