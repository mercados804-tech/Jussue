drop policy if exists "Public can insert notification" on public.notifications;
create policy "Public can insert notification"
  on public.notifications for insert
  with check (true);