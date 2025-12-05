alter table public.routines enable row level security;
alter table public.history enable row level security;

create policy "Users can manage own routines" on public.routines
  for all using (auth.uid() = (select d.user_id from public.dogs d where d.id = routines.dog_id))
  with check (auth.uid() = (select d.user_id from public.dogs d where d.id = routines.dog_id));

create policy "Users can read own routines" on public.routines
  for select using (auth.uid() = (select d.user_id from public.dogs d where d.id = routines.dog_id));

create policy "Users can manage routine history" on public.history
  for all using (auth.uid() = (
    select d.user_id
    from public.dogs d
    join public.routines r on r.dog_id = d.id
    where r.id = history.routine_id
  ))
  with check (auth.uid() = (
    select d.user_id
    from public.dogs d
    join public.routines r on r.dog_id = d.id
    where r.id = history.routine_id
  ));

create policy "Users can read routine history" on public.history
  for select using (auth.uid() = (
    select d.user_id
    from public.dogs d
    join public.routines r on r.dog_id = d.id
    where r.id = history.routine_id
  ));
