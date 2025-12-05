insert into public.users (id, email, name, timezone)
values
  ('11111111-1111-1111-1111-111111111111', 'demo@pawtine.dev', 'Demo Human', 'America/Los_Angeles'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'eastcoast@pawtine.dev', 'East Coast Pal', 'America/New_York')
on conflict (id) do nothing;

insert into public.dogs (id, user_id, name, breed, age_months)
values
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Luna', 'Corgi', 24),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Milo', 'Beagle', 18)
on conflict (id) do nothing;

insert into public.routines (id, dog_id, type, label, scheduled_time, status)
values
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'feed', 'Luna breakfast', (now() at time zone 'America/Los_Angeles')::date + time '07:30', 'active'),
  ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'feed', 'Luna dinner', (now() at time zone 'America/Los_Angeles')::date + time '18:30', 'active'),
  ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'water', 'Luna water refresh', (now() at time zone 'America/Los_Angeles')::date + time '09:00', 'active'),
  ('66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'walk', 'Luna walk #1', (now() at time zone 'America/Los_Angeles')::date + time '08:00', 'active'),
  ('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', 'walk', 'Luna walk #2', (now() at time zone 'America/Los_Angeles')::date + time '19:00', 'active'),
  ('88888888-8888-8888-8888-888888888888', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'feed', 'Milo breakfast', (now() at time zone 'America/New_York')::date + time '07:00', 'active'),
  ('99999999-9999-9999-9999-999999999999', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'walk', 'Milo walk', (now() at time zone 'America/New_York')::date + time '17:30', 'active')
on conflict (id) do nothing;

insert into public.history (id, routine_id, occurred_on, status, notes, created_at)
values
  ('aaaa1111-2222-3333-4444-555555555555', '33333333-3333-3333-3333-333333333333', (now() at time zone 'America/Los_Angeles')::date - 1, 'done', null, now() - interval '1 day'),
  ('bbbb1111-2222-3333-4444-555555555555', '33333333-3333-3333-3333-333333333333', (now() at time zone 'America/Los_Angeles')::date - 2, 'done', null, now() - interval '2 day'),
  ('cccc1111-2222-3333-4444-555555555555', '66666666-6666-6666-6666-666666666666', (now() at time zone 'America/Los_Angeles')::date - 1, 'done', null, now() - interval '1 day'),
  ('dddd1111-2222-3333-4444-555555555555', '77777777-7777-7777-7777-777777777777', (now() at time zone 'America/Los_Angeles')::date - 1, 'missed', 'Rainy day', now() - interval '1 day'),
  ('eeee1111-2222-3333-4444-555555555555', '88888888-8888-8888-8888-888888888888', (now() at time zone 'America/New_York')::date - 1, 'done', null, now() - interval '1 day'),
  ('ffff1111-2222-3333-4444-555555555555', '99999999-9999-9999-9999-999999999999', (now() at time zone 'America/New_York')::date - 1, 'done', null, now() - interval '1 day')
on conflict (id) do nothing;
