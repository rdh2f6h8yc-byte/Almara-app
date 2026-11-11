-- ALMARA · parte 2: contactos de la web y aceptación online de presupuestos
-- Pegar entero en Supabase → SQL Editor → New query → Run

-- 1) Contactos que llegan desde el formulario de la web
create table if not exists public.contactos (
  id uuid primary key default gen_random_uuid(),
  creado timestamptz not null default now(),
  nombre text not null check (char_length(nombre) between 1 and 120),
  telefono text check (char_length(telefono) <= 40),
  email text check (char_length(email) <= 160),
  localidad text check (char_length(localidad) <= 120),
  servicio text check (char_length(servicio) <= 80),
  mensaje text check (char_length(mensaje) <= 2000),
  origen text check (char_length(origen) <= 300),
  estado text not null default 'nuevo' check (estado in ('nuevo','contactado','cliente','descartado'))
);
alter table public.contactos enable row level security;
drop policy if exists "la web puede enviar" on public.contactos;
drop policy if exists "yo los gestiono" on public.contactos;
-- Cualquiera puede ENVIAR un contacto (no leerlo)
create policy "la web puede enviar" on public.contactos for insert to anon, authenticated
  with check (estado = 'nuevo');
-- Solo tú (usuario con sesión; el registro está cerrado) puedes verlos y cambiarlos
create policy "yo los gestiono" on public.contactos for all to authenticated
  using (true) with check (true);

-- 2) Presupuestos enviados por enlace para que el cliente los acepte
create table if not exists public.presupuestos_publicos (
  token uuid primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  numero text not null,
  datos jsonb not null,
  estado text not null default 'enviado' check (estado in ('enviado','aceptado','rechazado')),
  creado timestamptz not null default now(),
  visto timestamptz,
  respondido timestamptz,
  firma_nombre text,
  firma_dni text,
  firma_png text,
  comentario text
);
alter table public.presupuestos_publicos enable row level security;
drop policy if exists "mis enlaces" on public.presupuestos_publicos;
create policy "mis enlaces" on public.presupuestos_publicos for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- El cliente solo puede VER su presupuesto con el código del enlace…
create or replace function public.ver_presupuesto(p_token uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r public.presupuestos_publicos;
begin
  select * into r from public.presupuestos_publicos where token = p_token;
  if not found then return null; end if;
  update public.presupuestos_publicos set visto = coalesce(visto, now()) where token = p_token;
  return jsonb_build_object('numero', r.numero, 'datos', r.datos, 'estado', r.estado,
    'respondido', r.respondido, 'firma_nombre', r.firma_nombre);
end $$;

-- …y aceptarlo (con firma) o rechazarlo, una sola vez
create or replace function public.responder_presupuesto(p_token uuid, p_acepta boolean, p_nombre text, p_dni text, p_firma text, p_comentario text) returns text
language plpgsql security definer set search_path = public as $$
begin
  if p_acepta and (p_firma is null or length(p_firma) < 100 or length(p_firma) > 400000) then
    raise exception 'Falta la firma';
  end if;
  update public.presupuestos_publicos
     set estado = case when p_acepta then 'aceptado' else 'rechazado' end,
         respondido = now(), firma_nombre = left(p_nombre, 120), firma_dni = left(p_dni, 30),
         firma_png = case when p_acepta then p_firma end, comentario = left(p_comentario, 1000)
   where token = p_token and estado = 'enviado';
  if not found then return 'ya_respondido'; end if;
  return 'ok';
end $$;

revoke all on function public.ver_presupuesto(uuid) from public;
revoke all on function public.responder_presupuesto(uuid, boolean, text, text, text, text) from public;
grant execute on function public.ver_presupuesto(uuid) to anon, authenticated;
grant execute on function public.responder_presupuesto(uuid, boolean, text, text, text, text) to anon, authenticated;
