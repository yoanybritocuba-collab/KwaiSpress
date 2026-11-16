-- =====================================================================
-- KwaiSpress · Endurecimiento de Supabase  (ejecutar en SQL Editor)
-- =====================================================================

-- 1) DAR ROL ADMIN DE FORMA SEGURA
--    app_metadata solo se puede modificar desde aquí (o con la service key);
--    user_metadata lo puede cambiar cualquier usuario, por eso ya no se usa.
--    Sustituye el email por el tuyo:
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'TU-EMAIL@EJEMPLO.COM';

-- 2) (RECOMENDADO) CERRAR EL ACCESO DIRECTO A LAS TABLAS DESDE EL NAVEGADOR
--    La web ya solo lee/escribe en la base de datos desde el servidor
--    (Drizzle, que no se ve afectado por RLS). Activar RLS sin políticas
--    impide que alguien use la clave anon pública para leer o borrar datos.
--    Hazlo DESPUÉS de desplegar esta versión.
alter table public.users          enable row level security;
alter table public.sellers        enable row level security;
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.product_offers enable row level security;
alter table public.chats          enable row level security;
alter table public.messages       enable row level security;
alter table public.favorites      enable row level security;
alter table public.admin_settings enable row level security;
-- La tabla keepalive (la usa el workflow de GitHub) necesita lectura pública:
-- alter table public.keepalive enable row level security;
-- create policy "keepalive lectura" on public.keepalive for select using (true);

-- 3) (OPCIONAL) CÓDIGO SECRETO DEL PANEL (segundo factor)
--    Requiere la extensión pgcrypto. Sustituye el código y el email.
-- create extension if not exists pgcrypto;
-- insert into public.admin_settings (user_id, panel_code_hash)
-- select id, crypt('TU-CODIGO-SECRETO', gen_salt('bf')) from auth.users where email = 'TU-EMAIL@EJEMPLO.COM'
-- on conflict (user_id) do update set panel_code_hash = excluded.panel_code_hash, failed_attempts = 0, locked_until = null;
