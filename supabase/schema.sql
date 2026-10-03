create extension if not exists pgcrypto;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  notes text,
  whatsapp_consent boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  duration_minutes integer not null default 60,
  price numeric(10,2) not null default 0,
  is_active boolean not null default true,
  is_bookable boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  scheduled_start timestamptz not null,
  scheduled_end timestamptz not null,
  status text not null default 'pendiente',
  notes text,
  source text not null default 'publico',
  hold_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointment_status_history (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  previous_status text not null,
  new_status text not null,
  changed_by_admin_id text,
  note text,
  changed_at timestamptz not null default now()
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  unit text not null,
  quantity_available integer not null default 0,
  minimum_threshold integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references public.inventory_items(id) on delete cascade,
  movement_type text not null check (movement_type in ('entrada', 'consumo', 'correccion')),
  quantity integer not null,
  reason text not null,
  admin_id text,
  allows_negative_stock boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text,
  created_at timestamptz not null default now()
);

create index if not exists idx_appointments_status on public.appointments(status);
create index if not exists idx_appointments_scheduled_start on public.appointments(scheduled_start);
create index if not exists idx_inventory_items_active on public.inventory_items(active);
create index if not exists idx_inventory_movements_item on public.inventory_movements(inventory_item_id);

alter table public.clients enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_status_history enable row level security;
alter table public.inventory_items enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.admin_users enable row level security;

create policy "Allow public read of services" on public.services for select using (true);
create policy "Allow public read of active services" on public.services for select using (is_active = true);
create policy "Allow public read of clients" on public.clients for select using (true);
create policy "Allow public insert of clients" on public.clients for insert with check (true);
create policy "Allow public read of appointments" on public.appointments for select using (true);
create policy "Allow public insert of appointments" on public.appointments for insert with check (true);
create policy "Allow public read of inventory items" on public.inventory_items for select using (true);
create policy "Allow public read of inventory movements" on public.inventory_movements for select using (true);
create policy "Allow public read of admin users" on public.admin_users for select using (true);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger clients_updated_at
before update on public.clients
for each row execute procedure public.handle_updated_at();

create trigger services_updated_at
before update on public.services
for each row execute procedure public.handle_updated_at();

create trigger appointments_updated_at
before update on public.appointments
for each row execute procedure public.handle_updated_at();

create trigger inventory_items_updated_at
before update on public.inventory_items
for each row execute procedure public.handle_updated_at();

-- Seeds iniciales
insert into public.admin_users (code, name)
values ('spa-admin', 'Administrador principal')
on conflict (code) do nothing;

insert into public.services (name, duration_minutes, price, is_active, is_bookable)
values
  ('Masaje relajante', 60, 120000, true, true),
  ('Facial terapéutico', 50, 98000, true, true),
  ('Limpieza facial', 45, 85000, true, true);
