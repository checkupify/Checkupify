-- ═══════════════════════════════════════════
-- CHECKUPIFY — Complete Supabase Schema
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── PROFILES (extends Supabase auth.users) ───
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  phone       text unique,
  name        text,
  email       text,
  dob         date,
  gender      text,
  role        text default 'patient' check (role in ('patient','doctor','lab','hospital','pharmacy','admin')),
  city        text default 'Hyderabad',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── BOOKINGS ───
create table if not exists public.bookings (
  id              bigserial primary key,
  user_id         uuid references public.profiles(id) on delete cascade,
  item_type       text not null check (item_type in ('test','package','doctor')),
  item_id         text not null,
  item_name       text not null,
  patient_name    text not null,
  patient_age     int,
  patient_gender  text,
  collection_type text default 'walkin' check (collection_type in ('walkin','home')),
  address         text,
  date            date not null,
  slot            text not null,
  amount          numeric(10,2) not null,
  payment_method  text,
  promo_code      text,
  status          text default 'pending' check (status in ('pending','confirmed','sample_collected','processing','completed','cancelled','refunded')),
  booking_ref     text unique default ('CHK-' || upper(substr(md5(random()::text), 1, 6))),
  lab_id          uuid,
  notes           text,
  report_url      text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── FAMILY MEMBERS ───
create table if not exists public.family_members (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade,
  name        text not null,
  dob         date,
  gender      text,
  relation    text,
  created_at  timestamptz default now()
);

-- ─── LABS (Partner Centres) ───
create table if not exists public.labs (
  id          uuid default uuid_generate_v4() primary key,
  name        text not null,
  address     text,
  city        text,
  pincode     text,
  lat         numeric,
  lng         numeric,
  nabl        boolean default false,
  iso         boolean default false,
  rating      numeric(3,1) default 4.5,
  review_count int default 0,
  tat_hours   int default 6,
  is_active   boolean default true,
  owner_id    uuid references public.profiles(id),
  phone       text,
  email       text,
  created_at  timestamptz default now()
);

-- ─── DOCTORS ───
create table if not exists public.doctors (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id),
  name        text not null,
  speciality  text,
  qualification text,
  experience  int,
  fee         numeric(8,2),
  available   boolean default true,
  rating      numeric(3,1) default 4.5,
  consult_count int default 0,
  bio         text,
  created_at  timestamptz default now()
);

-- ─── TESTS CATALOGUE ───
create table if not exists public.tests (
  id          text primary key,
  name        text not null,
  params      text,
  tags        text[],
  price       numeric(8,2),
  mrp         numeric(8,2),
  disc_pct    int,
  tat_hours   int default 6,
  prep        text,
  category    text,
  is_active   boolean default true
);

-- ─── REPORTS ───
create table if not exists public.reports (
  id          uuid default uuid_generate_v4() primary key,
  booking_id  bigint references public.bookings(id),
  user_id     uuid references public.profiles(id),
  file_url    text,
  file_name   text,
  password    text,
  uploaded_by uuid references public.profiles(id),
  uploaded_at timestamptz default now()
);

-- ─── NOTIFICATIONS ───
create table if not exists public.notifications (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id),
  title       text,
  body        text,
  type        text,
  read        boolean default false,
  created_at  timestamptz default now()
);

-- ════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ════════════════════════════

alter table public.profiles       enable row level security;
alter table public.bookings        enable row level security;
alter table public.family_members  enable row level security;
alter table public.labs            enable row level security;
alter table public.doctors         enable row level security;
alter table public.tests           enable row level security;
alter table public.reports         enable row level security;
alter table public.notifications   enable row level security;

-- PROFILES
create policy "Users see own profile"      on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile"   on public.profiles for update using (auth.uid() = id);
create policy "Users insert own profile"   on public.profiles for insert with check (auth.uid() = id);

-- BOOKINGS
create policy "Users see own bookings"     on public.bookings for select using (auth.uid() = user_id);
create policy "Users create bookings"      on public.bookings for insert with check (auth.uid() = user_id);
create policy "Users update own bookings"  on public.bookings for update using (auth.uid() = user_id);

-- FAMILY MEMBERS
create policy "Users manage family"        on public.family_members for all using (auth.uid() = user_id);

-- LABS — public read
create policy "Labs public read"           on public.labs for select using (true);
create policy "Lab owners manage own"      on public.labs for all using (auth.uid() = owner_id);

-- DOCTORS — public read
create policy "Doctors public read"        on public.doctors for select using (true);

-- TESTS — public read
create policy "Tests public read"          on public.tests for select using (true);

-- REPORTS
create policy "Users see own reports"      on public.reports for select using (auth.uid() = user_id);
create policy "Labs upload reports"        on public.reports for insert with check (true);

-- NOTIFICATIONS
create policy "Users see own notifs"       on public.notifications for all using (auth.uid() = user_id);

-- ════════════════════════
-- AUTO-CREATE PROFILE
-- ════════════════════════
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, phone, role)
  values (new.id, new.phone, 'patient')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ════════════════════════
-- UPDATED_AT TRIGGER
-- ════════════════════════
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger set_bookings_updated_at  before update on public.bookings  for each row execute procedure public.set_updated_at();
create trigger set_profiles_updated_at  before update on public.profiles  for each row execute procedure public.set_updated_at();

-- ════════════════════════
-- SEED: INSERT TESTS
-- ════════════════════════
insert into public.tests (id, name, params, tags, price, mrp, disc_pct, tat_hours, prep, category) values
('t1','Complete Blood Count (CBC)','22 parameters',array['No fasting','Home collection'],299,499,40,6,'No fasting required','blood'),
('t2','Thyroid Panel (TSH, T3, T4)','3 parameters',array['Fasting 8hrs','Home collection'],399,699,43,6,'Fast for 8 hours','thyroid'),
('t3','HbA1c + Fasting Sugar','2 parameters',array['Fasting 12hrs','Home collection'],449,799,44,8,'Fast for 10-12 hours','diabetes'),
('t4','Lipid Profile','8 parameters',array['Fasting 12hrs','Home collection'],349,599,42,6,'Fast for 12 hours','cardiac'),
('t5','Vitamin D3 (25-OH)','1 parameter',array['No fasting','Home collection'],599,1100,45,12,'No fasting required','vitamins'),
('t6','Liver Function Test (LFT)','12 parameters',array['Fasting 8hrs','Home collection'],499,899,44,8,'Fast for 8 hours','liver'),
('t7','Kidney Function Test (KFT)','11 parameters',array['Fasting 8hrs','Home collection'],449,799,44,6,'Fast for 8 hours','kidney'),
('t8','Vitamin B12','1 parameter',array['No fasting','Home collection'],499,850,41,12,'No fasting required','vitamins')
on conflict (id) do nothing;
