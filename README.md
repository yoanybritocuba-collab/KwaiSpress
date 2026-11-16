# KwaiSpress

Marketplace con Next.js 16, Supabase (auth + storage), Drizzle ORM y Tailwind 4.

## Puesta en marcha (Windows / PowerShell)

Requisitos: **Node 20.9 o superior** y **pnpm 12.21** (`corepack enable` o `npm i -g pnpm@12.21.0`).

```powershell
# 1) Borra instalaciones antiguas (el node_modules anterior mezclaba npm y pnpm)
Remove-Item -Recurse -Force node_modules, .next -ErrorAction SilentlyContinue

# 2) Variables de entorno
Copy-Item .env.example .env.local     # y rellénalo (ver más abajo)

# 3) Instalar y arrancar. Usa SOLO pnpm (no npm ni yarn).
pnpm install
pnpm dev                              # http://localhost:3000
pnpm typecheck                        # comprobación de tipos
pnpm build                            # compilación de producción
```

> No copies `node_modules` entre ordenadores o sistemas: contiene binarios de tu
> sistema operativo (en tu zip eran de Windows). Se regenera con `pnpm install`.

## Variables de entorno

Ver `.env.example`. Las imprescindibles: `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ADMIN_PANEL_PASSWORD`. En Vercel, añádelas en
*Settings → Environment Variables*.

## Panel de administración

1. Ejecuta `supabase/hardening.sql` (paso 1) para darte rol admin con tu email
   (alternativa rápida: pon tu email en `ADMIN_EMAILS`).
2. Entra con tu cuenta y abre `/admin`: te pedirá la contraseña `ADMIN_PANEL_PASSWORD`
   (y el código secreto si lo configuras). La sesión del panel dura 8 h y va en una
   cookie HttpOnly firmada.
3. Desde el panel: dashboard real, productos (moderación), vendedores
   (aprobar/suspender/verificar), categorías, tu tienda oficial y seguridad.

## Vendedores

`/vender` envía una solicitud (estado *pendiente*). Un admin la aprueba en
`/admin/vendedores`; después el vendedor gestiona sus productos en
`/vendedor/<su-slug>/panel`.

## GitHub Actions (keepalive)

Añade los secretos `SUPABASE_URL` y `SUPABASE_ANON_KEY` en
*GitHub → Settings → Secrets and variables → Actions*.
