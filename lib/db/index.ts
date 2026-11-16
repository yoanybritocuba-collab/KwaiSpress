import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(
    'DATABASE_URL no está definida. Copia .env.example a .env.local y rellénala.',
  )
}

/**
 * Reutiliza una única conexión entre recargas de desarrollo (HMR) y entre
 * invocaciones en caliente. Sin esto, cada recarga abre un pool nuevo y se
 * agotan las conexiones del pooler de Supabase.
 */
const globalForDb = globalThis as unknown as {
  __kwaispressPg?: ReturnType<typeof postgres>
}

const client =
  globalForDb.__kwaispressPg ??
  postgres(connectionString, {
    prepare: false, // necesario con el pooler de transacciones de Supabase
    ssl: 'require', // <--- AÑADIDO PARA SUPABASE
    max: process.env.NODE_ENV === 'production' ? 5 : 3,
    idle_timeout: 20,
    connect_timeout: 15,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__kwaispressPg = client
}

export const db = drizzle(client, { schema })