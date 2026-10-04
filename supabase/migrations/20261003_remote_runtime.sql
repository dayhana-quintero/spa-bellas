alter table public.services add column if not exists local_id text;
alter table public.services add column if not exists category text not null default 'general';
alter table public.services add column if not exists description text not null default '';
alter table public.services add column if not exists price_display text;
create unique index if not exists idx_services_local_id on public.services(local_id);

alter table public.admin_users add column if not exists email text;
alter table public.admin_users add column if not exists role text not null default 'admin';
alter table public.admin_users add column if not exists active boolean not null default true;

create table if not exists public.availability_settings (
  id text primary key default 'default' check (id = 'default'),
  spa_capacity integer not null default 1,
  buffer_between_appointments integer not null default 15,
  default_hold_duration integer not null default 15,
  working_days text[] not null default array['lunes','martes','miercoles','jueves','viernes','sabado'],
  non_working_days text[] not null default '{}',
  opening_hours jsonb not null default '{}'::jsonb,
  admin_blocks jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.availability_settings (id, opening_hours)
values ('default', '{"lunes":{"opensAt":540,"closesAt":1020},"martes":{"opensAt":540,"closesAt":1020},"miercoles":{"opensAt":540,"closesAt":1020},"jueves":{"opensAt":540,"closesAt":1020},"viernes":{"opensAt":540,"closesAt":1020},"sabado":{"opensAt":540,"closesAt":840}}'::jsonb)
on conflict (id) do nothing;

create table if not exists public.whatsapp_communications (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  message_text text not null,
  outcome text not null check (outcome in ('prepared','sent-by-admin','failed','client-confirmed','manually-recorded')),
  outcome_note text,
  admin_id text,
  created_at timestamptz not null default now()
);

alter table public.availability_settings enable row level security;
alter table public.whatsapp_communications enable row level security;
