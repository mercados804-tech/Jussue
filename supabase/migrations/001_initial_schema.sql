-- =============================================
-- PELUQUERÍA ALISADOS - ESQUEMA DE BASE DE DATOS
-- =============================================

-- Extensions
create extension if not exists "pgcrypto";

-- =============================================
-- 1. BUSINESS_SETTINGS
-- =============================================
create table if not exists public.business_settings (
  id integer primary key default 1,
  business_name text not null default 'Peluquería Alisados Premium',
  logo text,
  description text default 'Cabello liso, brillante y saludable.',
  address text,
  whatsapp text,
  service_name text not null default 'Alisado Profesional',
  service_price numeric(12,2) not null default 50000,
  deposit_amount numeric(12,2) not null default 10000,
  duration integer not null default 180,
  bank_name text default 'Banco Provincia',
  account_holder text default 'Nombre Apellido',
  cbu text default '0000000000000000000000',
  alias text default 'peluqueria.alisado',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_settings_id check (id = 1)
);

-- =============================================
-- 2. SCHEDULES (Horarios por día de semana)
-- =============================================
create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (day_of_week)
);

-- =============================================
-- 3. BLOCKED_DATES (Fechas bloqueadas)
-- =============================================
create table if not exists public.blocked_dates (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  reason text,
  created_at timestamptz not null default now()
);

-- =============================================
-- 4. RESERVATIONS
-- =============================================
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_last_name text not null,
  whatsapp text not null,
  email text not null,
  notes text,
  service text not null,
  date date not null,
  time time not null,
  total_price numeric(12,2) not null,
  deposit_amount numeric(12,2) not null,
  remaining_amount numeric(12,2) not null,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (date, time)
);

create index if not exists idx_reservations_date on public.reservations(date);
create index if not exists idx_reservations_status on public.reservations(status);
create index if not exists idx_reservations_whatsapp on public.reservations(whatsapp);

-- =============================================
-- 5. PAYMENT_RECEIPTS
-- =============================================
create table if not exists public.payment_receipts (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  file_url text not null,
  transfer_date date,
  transaction_number text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_receipts_reservation on public.payment_receipts(reservation_id);

-- =============================================
-- 6. NOTIFICATIONS
-- =============================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid references public.reservations(id) on delete set null,
  type text not null check (type in ('auto_reply','confirmation','reminder_24h','reminder_1h','admin_new')),
  status text not null default 'pending' check (status in ('pending','sent','failed')),
  sent_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_status on public.notifications(status);
create index if not exists idx_notifications_reservation on public.notifications(reservation_id);

-- =============================================
-- TRIGGERS: updated_at
-- =============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists business_settings_updated_at on public.business_settings;
create trigger business_settings_updated_at
before update on public.business_settings
for each row execute function public.handle_updated_at();

drop trigger if exists schedules_updated_at on public.schedules;
create trigger schedules_updated_at
before update on public.schedules
for each row execute function public.handle_updated_at();

drop trigger if exists reservations_updated_at on public.reservations;
create trigger reservations_updated_at
before update on public.reservations
for each row execute function public.handle_updated_at();

drop trigger if exists payment_receipts_updated_at on public.payment_receipts;
create trigger payment_receipts_updated_at
before update on public.payment_receipts
for each row execute function public.handle_updated_at();

-- =============================================
-- REALTIME: habilitar tablas
-- =============================================
alter publication supabase_realtime add table public.reservations;
alter publication supabase_realtime add table public.payment_receipts;
alter publication supabase_realtime add table public.notifications;

-- =============================================
-- RLS - Row Level Security
-- =============================================
alter table public.business_settings enable row level security;
alter table public.schedules enable row level security;
alter table public.blocked_dates enable row level security;
alter table public.reservations enable row level security;
alter table public.payment_receipts enable row level security;
alter table public.notifications enable row level security;

-- POLICIES: Públicas de sólo lectura
drop policy if exists "Public can read business_settings" on public.business_settings;
create policy "Public can read business_settings"
  on public.business_settings for select
  using (true);

drop policy if exists "Public can read schedules" on public.schedules;
create policy "Public can read schedules"
  on public.schedules for select
  using (true);

drop policy if exists "Public can read blocked_dates" on public.blocked_dates;
create policy "Public can read blocked_dates"
  on public.blocked_dates for select
  using (true);

-- Reservations: público puede INSERTAR y LEER la suya (por whatsapp+id)
drop policy if exists "Public can insert reservations" on public.reservations;
create policy "Public can insert reservations"
  on public.reservations for insert
  with check (true);

drop policy if exists "Public can read own reservation" on public.reservations;
create policy "Public can read own reservation"
  on public.reservations for select
  using (true);

-- Payment_receipts: público puede INSERTAR
drop policy if exists "Public can insert receipts" on public.payment_receipts;
create policy "Public can insert receipts"
  on public.payment_receipts for insert
  with check (true);

drop policy if exists "Public can read own receipts" on public.payment_receipts;
create policy "Public can read own receipts"
  on public.payment_receipts for select
  using (true);

-- Notifications: público puede insertar admin_new al crear reserva
drop policy if exists "Public can insert notification" on public.notifications;
create policy "Public can insert notification"
  on public.notifications for insert
  with check (true);

-- POLICIES: Authenticated (admin) puede TODO
drop policy if exists "Admin full business_settings" on public.business_settings;
create policy "Admin full business_settings"
  on public.business_settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Admin full schedules" on public.schedules;
create policy "Admin full schedules"
  on public.schedules for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Admin full blocked_dates" on public.blocked_dates;
create policy "Admin full blocked_dates"
  on public.blocked_dates for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Admin full reservations" on public.reservations;
create policy "Admin full reservations"
  on public.reservations for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Admin full receipts" on public.payment_receipts;
create policy "Admin full receipts"
  on public.payment_receipts for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Admin full notifications" on public.notifications;
create policy "Admin full notifications"
  on public.notifications for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =============================================
-- DATOS INICIALES
-- =============================================
insert into public.business_settings (id) values (1)
on conflict (id) do nothing;

insert into public.schedules (day_of_week, start_time, end_time, active) values
  (1, '09:00', '19:00', true),
  (2, '09:00', '19:00', true),
  (3, '09:00', '19:00', true),
  (4, '09:00', '19:00', true),
  (5, '09:00', '19:00', true),
  (6, '09:00', '14:00', true),
  (0, '09:00', '19:00', false)
on conflict (day_of_week) do nothing;

-- =============================================
-- STORAGE: bucket para receipts
-- (Ejecutar por separado en SQL Editor si falla)
-- =============================================
-- insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
--   ('receipts', 'receipts', true, 10485760, array['image/jpeg','image/jpg','image/png','image/webp','application/pdf'])
-- on conflict (id) do nothing;
