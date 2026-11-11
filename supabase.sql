-- ALMARA · pegar entero en Supabase → SQL Editor → New query → Run

-- 1) Tabla donde se guardan clientes, planos, presupuestos y datos de empresa
create table if not exists public.datos (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  clave text not null,
  valor jsonb not null,
  actualizado timestamptz not null default now(),
  primary key (user_id, clave)
);
alter table public.datos enable row level security;
drop policy if exists "solo mis datos" on public.datos;
create policy "solo mis datos" on public.datos for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 2) Carpeta privada para las fotos (trabajos y planos de fondo)
insert into storage.buckets (id, name, public) values ('fotos', 'fotos', false)
  on conflict (id) do nothing;
drop policy if exists "fotos leer" on storage.objects;
drop policy if exists "fotos subir" on storage.objects;
drop policy if exists "fotos cambiar" on storage.objects;
drop policy if exists "fotos borrar" on storage.objects;
create policy "fotos leer" on storage.objects for select to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "fotos subir" on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "fotos cambiar" on storage.objects for update to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "fotos borrar" on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);
