create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  brand text,
  category text not null check (category in ('sneakers', 'cloth')),
  price numeric(10,2) not null default 0,
  image_url text,
  description text,
  sizes text[] default '{}',
  stock_by_size jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products add column if not exists stock_by_size jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists sizes text[] default '{}';

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  product_id text,
  product_name text not null,
  category text,
  size text,
  price numeric(10,2) not null default 0,
  full_name text not null,
  phone text not null,
  city text not null,
  address text not null,
  note text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.orders enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Authenticated manage products" on public.products;
create policy "Authenticated manage products"
on public.products
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public create orders" on public.orders;
create policy "Public create orders"
on public.orders
for insert
to anon, authenticated
with check (true);

drop policy if exists "Authenticated read orders" on public.orders;
create policy "Authenticated read orders"
on public.orders
for select
to authenticated
using (true);

drop policy if exists "Authenticated update orders" on public.orders;
create policy "Authenticated update orders"
on public.orders
for update
to authenticated
using (true)
with check (true);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
on storage.objects
for select
to public
using (bucket_id = 'product-images');

drop policy if exists "Authenticated upload product images" on storage.objects;
create policy "Authenticated upload product images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'product-images');

drop policy if exists "Authenticated update product images" on storage.objects;
create policy "Authenticated update product images"
on storage.objects
for update
to authenticated
using (bucket_id = 'product-images')
with check (bucket_id = 'product-images');

drop policy if exists "Authenticated delete product images" on storage.objects;
create policy "Authenticated delete product images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'product-images');


alter table public.products add column if not exists cost_price numeric(10,2) not null default 0;
alter table public.orders add column if not exists cost_price numeric(10,2) not null default 0;
alter table public.orders add column if not exists profit numeric(10,2) not null default 0;


-- Notification-ready fields
alter table public.products add column if not exists cost_price numeric(10,2) not null default 0;
alter table public.orders add column if not exists cost_price numeric(10,2) not null default 0;
alter table public.orders add column if not exists profit numeric(10,2) not null default 0;
