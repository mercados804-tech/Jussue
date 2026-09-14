drop policy if exists "Public can update reservation status" on public.reservations;
create policy "Public can update reservation status"
  on public.reservations for update
  using (true)
  with check (true);