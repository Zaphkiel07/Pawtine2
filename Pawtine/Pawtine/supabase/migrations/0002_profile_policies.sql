alter table public.users enable row level security;
alter table public.dogs enable row level security;

create policy "Users can read own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can upsert own profile" on public.users
  for all using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can read own dogs" on public.dogs
  for select using (auth.uid() = user_id);

create policy "Users can manage own dogs" on public.dogs
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
