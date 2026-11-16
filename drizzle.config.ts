import type { Config } from 'drizzle-kit'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DIRECT_URL!,
  },
  // Solo gestiona las tablas de la aplicación. Evita que `db:push` intente
  // borrar tablas ajenas al esquema (por ejemplo `keepalive`).
  tablesFilter: [
    'users',
    'sellers',
    'categories',
    'products',
    'product_offers',
    'chats',
    'messages',
    'favorites',
    'admin_settings',
  ],
  verbose: true,
  strict: true,
} satisfies Config
