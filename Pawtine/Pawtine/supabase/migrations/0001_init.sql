create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  timezone text default 'UTC',
  created_at timestamptz not null default now()
);

create table if not exists public.dogs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  breed text,
  age_months integer,
  created_at timestamptz not null default now()
);

create type routine_type as enum ('feed', 'walk', 'water', 'custom');
create type routine_status as enum ('active', 'paused');

create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid not null references public.dogs(id) on delete cascade,
  type routine_type not null,
  label text not null,
  scheduled_time timestamptz not null,
  status routine_status not null default 'active',
  created_at timestamptz not null default now(),
  last_completed_at timestamptz
);

create type history_status as enum ('done', 'missed', 'snoozed');

create table if not exists public.history (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines(id) on delete cascade,
  occurred_on date not null,
  status history_status not null default 'done',
  notes text,
  created_at timestamptz not null default now(),
  unique (routine_id, occurred_on)
);

drop function if exists public.get_weekly_routine_summary(uuid, date);
create or replace function public.get_weekly_routine_summary(
  p_dog_id uuid,
  p_week_start date
)
returns table (
  routine_id uuid,
  label text,
  type routine_type,
  day date,
  status history_status
)
language sql
as $$
  select
    r.id as routine_id,
    r.label,
    r.type,
    h.occurred_on as day,
    h.status
  from public.routines r
  left join public.history h on h.routine_id = r.id
  where r.dog_id = p_dog_id
    and h.occurred_on between p_week_start and (p_week_start + interval '6 day')
  order by h.occurred_on asc;
$$;
